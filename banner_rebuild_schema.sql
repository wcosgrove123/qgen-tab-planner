-- SIMPLE BANNER SCHEMA REBUILD
-- Just delete old tables and create new optimal structure

-- =========================
-- STEP 1: DELETE OLD TABLES
-- =========================

DROP TABLE IF EXISTS banner_conditions CASCADE;
DROP TABLE IF EXISTS banner_crosstab_specs CASCADE;
DROP TABLE IF EXISTS banner_columns CASCADE;
DROP TABLE IF EXISTS banner_groups CASCADE;
DROP TABLE IF EXISTS banner_dimensions CASCADE;
DROP TABLE IF EXISTS banner_definitions CASCADE;

-- =========================
-- STEP 2: CREATE NEW OPTIMAL SCHEMA
-- =========================

-- 1. Main banner definitions
CREATE TABLE banner_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_project_banner_name UNIQUE(project_id, name)
);

-- 2. H1 Groups (Categories)
CREATE TABLE banner_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banner_id UUID NOT NULL REFERENCES banner_definitions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_banner_group_name UNIQUE(banner_id, name)
);

-- 3. H2 Columns (Questions)
CREATE TABLE banner_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banner_group_id UUID NOT NULL REFERENCES banner_groups(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    spss_variable_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_group_question UNIQUE(banner_group_id, question_id)
);

-- 4. Selected Options for Columns
CREATE TABLE banner_column_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banner_column_id UUID NOT NULL REFERENCES banner_columns(id) ON DELETE CASCADE,
    question_option_id UUID NOT NULL REFERENCES question_options(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_column_option UNIQUE(banner_column_id, question_option_id)
);

-- =========================
-- STEP 3: PERFORMANCE INDEXES
-- =========================

CREATE INDEX idx_banner_groups_banner_id ON banner_groups(banner_id, display_order);
CREATE INDEX idx_banner_columns_group_id ON banner_columns(banner_group_id, display_order);
CREATE INDEX idx_banner_column_options_column_id ON banner_column_options(banner_column_id);

-- =========================
-- STEP 4: COMPLETE VIEW
-- =========================

CREATE VIEW banner_structure AS
SELECT
    bd.id as banner_id,
    bd.name as banner_name,
    bd.project_id,
    bg.id as group_id,
    bg.name as group_name,
    bg.display_order as group_order,
    bc.id as column_id,
    bc.name as column_name,
    bc.display_order as column_order,
    q.id as question_uuid,
    q.question_id as question_code,
    q.question_text,
    COALESCE(
        json_agg(
            json_build_object(
                'option_id', qo.id,
                'option_code', qo.option_code,
                'option_label', qo.option_label
            )
            ORDER BY qo.order_index
        ) FILTER (WHERE qo.id IS NOT NULL),
        '[]'::json
    ) as selected_options
FROM banner_definitions bd
JOIN banner_groups bg ON bg.banner_id = bd.id
JOIN banner_columns bc ON bc.banner_group_id = bg.id
JOIN questions q ON q.id = bc.question_id
LEFT JOIN banner_column_options bco ON bco.banner_column_id = bc.id
LEFT JOIN question_options qo ON qo.id = bco.question_option_id
GROUP BY bd.id, bd.name, bd.project_id, bg.id, bg.name, bg.display_order,
         bc.id, bc.name, bc.display_order, q.id, q.question_id, q.question_text
ORDER BY bg.display_order, bc.display_order;

-- Success!
SELECT 'New optimal banner schema created! 🎉' as status;