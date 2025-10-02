-- 0002_ingest_function.sql
CREATE OR REPLACE FUNCTION qgen_ingest_questionnaire(p JSONB)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
  v_client_id UUID;
  v_project_id UUID;
  v_q JSONB;
  v_idx INT := 0;
  v_q_row_id UUID;
  v_opt JSONB;
  v_stmt TEXT;
  v_net JSONB;
BEGIN
  -- Ensure an org exists (or create a default one)
  SELECT id INTO v_org_id FROM organizations ORDER BY created_at LIMIT 1;
  IF v_org_id IS NULL THEN
    INSERT INTO organizations (name) VALUES ('Default Org') RETURNING id INTO v_org_id;
  END IF;

  -- Optional client upsert from project.client (if present)
  IF (p->'project'->>'client') IS NOT NULL THEN
    INSERT INTO clients (organization_id, name)
    VALUES (v_org_id, p->'project'->>'client')
    ON CONFLICT DO NOTHING;
    SELECT id INTO v_client_id FROM clients WHERE organization_id = v_org_id AND name = p->'project'->>'client' LIMIT 1;
  END IF;

  -- Project upsert (by name + version for idempotency in dev)
  INSERT INTO projects (
    organization_id, client_id, name, version, status, project_type, notes, tags, favorite, metadata
  ) VALUES (
    v_org_id,
    v_client_id,
    COALESCE(p->'project'->>'name','Untitled'),
    COALESCE(p->'project'->>'version','0.1.0'),
    COALESCE(p->'project'->>'status','Draft'),
    p->'project'->>'project_type',
    p->'project'->>'notes',
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p->'project'->'tags')), '{}'),
    COALESCE((p->'project'->>'favorite')::boolean, false),
    COALESCE(p->'project'->'metadata','{}'::jsonb)
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_project_id;

  IF v_project_id IS NULL THEN
    -- find existing by name+version under org
    SELECT id INTO v_project_id FROM projects
    WHERE organization_id = v_org_id
      AND name = p->'project'->>'name'
      AND version = COALESCE(p->'project'->>'version','0.1.0')
    LIMIT 1;
  END IF;

  -- Project globals
  INSERT INTO project_globals (project_id, default_base_verbiage, default_base_definition, scale_buckets, rules, banners, settings)
  VALUES (
    v_project_id,
    COALESCE(p->'globals'->>'default_base_verbiage','Total (qualified respondents)'),
    p->'globals'->>'default_base_definition',
    COALESCE(p->'globals'->'scale_buckets','{}'::jsonb),
    COALESCE(p->'globals'->'rules','{}'::jsonb),
    COALESCE(p->'globals'->'banners','[]'::jsonb),
    '{}'
  )
  ON CONFLICT (project_id) DO UPDATE
    SET default_base_verbiage = EXCLUDED.default_base_verbiage,
        default_base_definition = EXCLUDED.default_base_definition,
        scale_buckets = EXCLUDED.scale_buckets,
        rules = EXCLUDED.rules,
        banners = EXCLUDED.banners,
        updated_at = NOW();

  -- Questions
  FOR v_idx IN 0 .. COALESCE(jsonb_array_length(p->'questions') - 1, -1) LOOP
    v_q := (p->'questions')->v_idx;

    INSERT INTO questions (
      project_id, question_id, question_text, question_type, question_mode, order_index, notes, is_required,
      base, randomization, conditions, validation, repeated_measures,
      numeric_config, open_config, scale_config, grid_config, exports, tab_plan
    ) VALUES (
      v_project_id,
      v_q->>'id',
      v_q->>'text',
      COALESCE(v_q->>'type','single'),
      COALESCE(v_q->>'mode','list'),
      v_idx,
      v_q->>'notes',
      COALESCE((v_q->>'is_required')::boolean, true),
      COALESCE(v_q->'base','{}'::jsonb),
      COALESCE(v_q->'randomization','{}'::jsonb),
      COALESCE(v_q->'conditions','{}'::jsonb),
      COALESCE(v_q->'validation','{}'::jsonb),
      COALESCE(v_q->'repeated_measures','{}'::jsonb),
      COALESCE(v_q->'numeric','{}'::jsonb),
      COALESCE(v_q->'open','{}'::jsonb),
      COALESCE(v_q->'scale','{}'::jsonb),
      COALESCE(v_q->'grid','{}'::jsonb),
      COALESCE(v_q->'exports','{}'::jsonb),
      COALESCE(v_q->'tab','{}'::jsonb)
    )
    ON CONFLICT (project_id, question_id) DO UPDATE
      SET question_text = EXCLUDED.question_text,
          question_type = EXCLUDED.question_type,
          question_mode = EXCLUDED.question_mode,
          order_index   = EXCLUDED.order_index,
          notes         = EXCLUDED.notes,
          is_required   = EXCLUDED.is_required,
          base          = EXCLUDED.base,
          randomization = EXCLUDED.randomization,
          conditions    = EXCLUDED.conditions,
          validation    = EXCLUDED.validation,
          repeated_measures = EXCLUDED.repeated_measures,
          numeric_config = EXCLUDED.numeric_config,
          open_config    = EXCLUDED.open_config,
          scale_config   = EXCLUDED.scale_config,
          grid_config    = EXCLUDED.grid_config,
          exports        = EXCLUDED.exports,
          tab_plan       = EXCLUDED.tab_plan,
          updated_at     = NOW()
    RETURNING id INTO v_q_row_id;

    -- Options
    IF jsonb_typeof(v_q->'options') = 'array' THEN
      -- wipe & reinsert to preserve order cleanly
      DELETE FROM question_options WHERE question_id = v_q_row_id;
      FOR v_opt IN SELECT * FROM jsonb_array_elements(v_q->'options') LOOP
        INSERT INTO question_options (
          question_id, option_code, option_label, order_index,
          is_exclusive, is_terminate, anchor_position, lock_randomize,
          custom_code, custom_label, nested_dropdown, validation_range
        )
        VALUES (
          v_q_row_id,
          v_opt->>'code',
          v_opt->>'label',
          COALESCE((v_opt->>'order_index')::int, 0),
          COALESCE((v_opt->>'exclusive')::boolean, false),
          COALESCE((v_opt->>'terminate')::boolean, false),
          NULLIF(v_opt->>'anchor',''),
          COALESCE((v_opt->>'lock_randomize')::boolean, false),
          v_opt->>'custom_code',
          v_opt->>'custom_label',
          COALESCE(v_opt->'nested_dropdown','{}'::jsonb),
          COALESCE(v_opt->'validation_range','{}'::jsonb)
        );
      END LOOP;
    END IF;

    -- Statements (for grids)
    IF jsonb_typeof(v_q->'statements') = 'array' THEN
      DELETE FROM question_statements WHERE question_id = v_q_row_id;
      WITH s AS (
        SELECT row_number() OVER ()-1 AS i, s_txt
        FROM jsonb_array_elements_text(v_q->'statements') AS s(s_txt)
        WHERE COALESCE(s_txt,'') <> ''
      )
      INSERT INTO question_statements (question_id, statement_text, order_index)
      SELECT v_q_row_id, s_txt, i FROM s;
    END IF;

    -- Nets
    IF jsonb_typeof((v_q->'tab')->'nets') = 'array' THEN
      DELETE FROM question_nets WHERE question_id = v_q_row_id;
      FOR v_opt IN SELECT * FROM jsonb_array_elements((v_q->'tab')->'nets') LOOP
        -- Support your present shapes: kind:'range' with value1/value2/operator, or future 'codes'
        INSERT INTO question_nets (question_id, net_type, net_label, net_config, order_index)
        VALUES (
          v_q_row_id,
          COALESCE(v_opt->>'kind','range'),
          v_opt->>'label',
          v_opt,
          COALESCE((v_opt->>'order_index')::int, 0)
        );
      END LOOP;
    END IF;

  END LOOP;

  RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;
