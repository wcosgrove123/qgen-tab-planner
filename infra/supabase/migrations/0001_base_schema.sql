-- 0001_base_schema.sql
-- QGEN base schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =========================
-- CORE ENTITIES
-- =========================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  contact_info JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- PROJECTS
-- =========================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  version TEXT DEFAULT '0.1.0',
  status TEXT DEFAULT 'Draft',
  project_type TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  favorite BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('Draft','Pre-Field','Fielding','Reporting','Waiting for Approval','Active','Closed','Archived'))
);

CREATE TABLE IF NOT EXISTS project_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, person_id, role_name)
);

CREATE TABLE IF NOT EXISTS project_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'Not Started',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_status CHECK (status IN ('Not Started','In Progress','Draft','Approved','Done'))
);

CREATE TABLE IF NOT EXISTS project_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_globals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  default_base_verbiage TEXT DEFAULT 'Total (qualified respondents)',
  default_base_definition TEXT,
  default_banners JSONB DEFAULT '[]',
  scale_buckets JSONB DEFAULT '{}',
  rules JSONB DEFAULT '{}',
  banners JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- QUESTIONS
-- =========================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT,
  question_type TEXT DEFAULT 'single',
  question_mode TEXT DEFAULT 'list',
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  is_required BOOLEAN DEFAULT TRUE,
  base JSONB DEFAULT '{}',
  randomization JSONB DEFAULT '{}',
  conditions JSONB DEFAULT '{}',
  validation JSONB DEFAULT '{}',
  repeated_measures JSONB DEFAULT '{}',
  numeric_config JSONB DEFAULT '{}',
  open_config JSONB DEFAULT '{}',
  scale_config JSONB DEFAULT '{}',
  grid_config JSONB DEFAULT '{}',
  exports JSONB DEFAULT '{}',
  tab_plan JSONB DEFAULT '{}',
  termination_logic JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_question_mode CHECK (question_mode IN ('list','numeric','table','open','repeated','advanced_table')),
  CONSTRAINT unique_project_question UNIQUE(project_id, question_id)
);

CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_code TEXT NOT NULL,
  option_label TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_exclusive BOOLEAN DEFAULT FALSE,
  is_terminate BOOLEAN DEFAULT FALSE,
  anchor_position TEXT,
  lock_randomize BOOLEAN DEFAULT FALSE,
  custom_code TEXT,
  custom_label TEXT,
  nested_dropdown JSONB DEFAULT '{}',
  validation_range JSONB DEFAULT '{}',
  medication_group TEXT,
  input_type TEXT DEFAULT 'number',
  preferred_name BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_anchor_position CHECK (anchor_position IN ('top','bottom') OR anchor_position IS NULL),
  CONSTRAINT unique_question_option UNIQUE(question_id, option_code)
);

CREATE TABLE IF NOT EXISTS question_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  statement_text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_nets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  net_type TEXT NOT NULL,
  net_label TEXT,
  net_config JSONB NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_net_type CHECK (net_type IN ('codes','range'))
);

-- =========================
-- LIBRARY / TEMPLATES
-- =========================
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  created_by UUID REFERENCES people(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  question_data JSONB NOT NULL,
  source_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES people(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS custom_scales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  scale_name TEXT NOT NULL,
  point_count INTEGER NOT NULL,
  scale_labels TEXT[] NOT NULL,
  description TEXT,
  created_by UUID REFERENCES people(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_org_scale UNIQUE(organization_id, scale_name, point_count)
);

-- =========================
-- SNAPSHOTS
-- =========================
CREATE TABLE IF NOT EXISTS project_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  snapshot_name TEXT,
  description TEXT,
  snapshot_data JSONB NOT NULL,
  created_by UUID REFERENCES people(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- BANNERS
-- =========================
CREATE TABLE IF NOT EXISTS banner_dimensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  banner_id TEXT NOT NULL,
  dimension_id TEXT NOT NULL,
  dimension_label TEXT NOT NULL,
  source_config JSONB NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_project_banner_dimension UNIQUE(project_id, banner_id, dimension_id)
);

CREATE TABLE IF NOT EXISTS banner_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dimension_id UUID REFERENCES banner_dimensions(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL,
  group_label TEXT,
  reference_config JSONB NOT NULL,
  include_in_banner BOOLEAN DEFAULT TRUE,
  conditions JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_dimension_group UNIQUE(dimension_id, group_id)
);

-- =========================
-- ANALYTICS / LOGS
-- =========================
CREATE TABLE IF NOT EXISTS project_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_data JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- TAGS
-- =========================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_category TEXT,
  color_hex TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_org_tag UNIQUE(organization_id, tag_name)
);

CREATE TABLE IF NOT EXISTS tag_associations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_tag_entity UNIQUE(tag_id, entity_type, entity_id)
);

-- =========================
-- APP PREFERENCES
-- =========================
CREATE TABLE IF NOT EXISTS app_prefs (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE,
  last_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = TRUE)
);

-- Insert default row
INSERT INTO app_prefs (id) VALUES (TRUE) ON CONFLICT (id) DO NOTHING;

-- =========================
-- INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);

CREATE INDEX IF NOT EXISTS idx_questions_project_id ON questions(project_id);
CREATE INDEX IF NOT EXISTS idx_questions_question_id ON questions(question_id);
CREATE INDEX IF NOT EXISTS idx_questions_order_index ON questions(order_index);
CREATE INDEX IF NOT EXISTS idx_questions_question_type ON questions(question_type);

CREATE INDEX IF NOT EXISTS idx_projects_name_gin ON projects USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_questions_text_gin ON questions USING gin (question_text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_name_gin ON clients USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_projects_tags_gin ON projects USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_project_globals_rules_gin ON project_globals USING gin (rules);
CREATE INDEX IF NOT EXISTS idx_questions_conditions_gin ON questions USING gin (conditions);

CREATE INDEX IF NOT EXISTS idx_activity_log_organization_id ON activity_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_project_id ON activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_person_id ON activity_log(person_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

CREATE INDEX IF NOT EXISTS idx_question_options_medication_group ON question_options(medication_group) WHERE medication_group IS NOT NULL;

-- =========================
-- VIEWS
-- =========================
CREATE OR REPLACE VIEW project_summary AS
SELECT p.*,
       c.name AS client_name,
       (SELECT COUNT(*) FROM questions q WHERE q.project_id = p.id) AS question_count,
       (SELECT COUNT(*) FROM project_roles pr WHERE pr.project_id = p.id) AS team_member_count,
       (SELECT COUNT(*) FROM project_dates pd WHERE pd.project_id = p.id AND pd.due_date < CURRENT_DATE AND pd.status != 'Done') AS overdue_count,
       CASE WHEN p.updated_at > NOW() - INTERVAL '7 days' THEN 'recent'
            WHEN p.updated_at > NOW() - INTERVAL '30 days' THEN 'active'
            ELSE 'stale'
       END AS activity_status
FROM projects p
LEFT JOIN clients c ON p.client_id = c.id;

CREATE OR REPLACE VIEW question_analysis AS
SELECT q.*,
       p.name AS project_name,
       (SELECT COUNT(*) FROM question_options qo WHERE qo.question_id = q.id) AS option_count,
       (SELECT COUNT(*) FROM question_statements qs WHERE qs.question_id = q.id) AS statement_count,
       (SELECT COUNT(*) FROM question_nets qn WHERE qn.question_id = q.id) AS net_count
FROM questions q
JOIN projects p ON q.project_id = p.id;

-- =========================
-- TRIGGERS / FUNCTIONS
-- =========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_globals_updated_at ON project_globals;
CREATE TRIGGER update_project_globals_updated_at
  BEFORE UPDATE ON project_globals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_prefs_updated_at ON app_prefs;
CREATE TRIGGER update_app_prefs_updated_at
  BEFORE UPDATE ON app_prefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION log_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO project_status_history (project_id, old_status, new_status, changed_at)
    VALUES (NEW.id, OLD.status, NEW.status, NOW());
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_status_change_trigger ON projects;
CREATE TRIGGER project_status_change_trigger
  AFTER UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION log_project_status_change();

-- Unified activity logger (param order is stable)
CREATE OR REPLACE FUNCTION log_activity(
  p_organization_id UUID,
  p_activity_type TEXT,
  p_project_id UUID DEFAULT NULL,
  p_person_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE activity_id UUID;
BEGIN
  INSERT INTO activity_log (organization_id, project_id, person_id, activity_type, description, metadata)
  VALUES (p_organization_id, p_project_id, p_person_id, p_activity_type, p_description, p_metadata)
  RETURNING id INTO activity_id;
  RETURN activity_id;
END; $$ LANGUAGE plpgsql;
