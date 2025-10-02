-- BANNER SYSTEM CLEAN MIGRATION
-- Complete replacement with optimal schema
-- RUN THIS IN SUPABASE SQL EDITOR

-- =========================
-- STEP 1: BACKUP EXISTING DATA (Optional)
-- =========================

-- Uncomment if you want to backup existing data before migration
-- CREATE TABLE banner_definitions_backup AS SELECT * FROM banner_definitions;
-- CREATE TABLE banner_columns_backup AS SELECT * FROM banner_columns;
-- CREATE TABLE banner_conditions_backup AS SELECT * FROM banner_conditions;
-- CREATE TABLE banner_crosstab_specs_backup AS SELECT * FROM banner_crosstab_specs;

-- =========================
-- STEP 2: DROP OLD BANNER SYSTEM (Clean Slate)
-- =========================

-- Drop in correct order (children first, then parents)
DROP TABLE IF EXISTS banner_conditions CASCADE;
DROP TABLE IF EXISTS banner_crosstab_specs CASCADE;
DROP TABLE IF EXISTS banner_columns CASCADE;
DROP TABLE IF EXISTS banner_groups CASCADE;  -- if it exists
DROP TABLE IF EXISTS banner_dimensions CASCADE;  -- if it exists
DROP TABLE IF EXISTS banner_definitions CASCADE;

-- Drop any old views
DROP VIEW IF EXISTS banner_structure CASCADE;

-- =========================
-- STEP 3: CREATE NEW OPTIMAL SCHEMA
-- =========================

-- 1. BANNER DEFINITIONS (Main Banner)
CREATE TABLE banner_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_project_banner_name UNIQUE(project_id, name)
);

-- 2. BANNER GROUPS (H1 Categories)
CREATE TABLE banner_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banner_id UUID NOT NULL REFERENCES banner_definitions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_banner_group_name UNIQUE(banner_id, name)
);

-- 3. BANNER COLUMNS (H2 Columns - The Core Table)
CREATE TABLE banner_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships (Proper Foreign Keys)
    banner_group_id UUID NOT NULL REFERENCES banner_groups(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,

    -- Column Definition
    name TEXT NOT NULL, -- User-defined column name
    display_order INTEGER DEFAULT 0,

    -- SPSS Export
    spss_variable_name TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_group_question UNIQUE(banner_group_id, question_id)
);

-- 4. BANNER COLUMN OPTIONS (Selected Options for Each Column)
CREATE TABLE banner_column_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships (Proper Foreign Keys)
    banner_column_id UUID NOT NULL REFERENCES banner_columns(id) ON DELETE CASCADE,
    question_option_id UUID NOT NULL REFERENCES question_options(id) ON DELETE CASCADE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_column_option UNIQUE(banner_column_id, question_option_id)
);

-- =========================
-- STEP 4: CREATE PERFORMANCE INDEXES
-- =========================

-- Banner groups by banner
CREATE INDEX idx_banner_groups_banner_id ON banner_groups(banner_id, display_order);

-- Banner columns by group (most common query)
CREATE INDEX idx_banner_columns_group_id ON banner_columns(banner_group_id, display_order);

-- Banner columns by question (for validation)
CREATE INDEX idx_banner_columns_question_id ON banner_columns(question_id);

-- Column options by column (for option retrieval)
CREATE INDEX idx_banner_column_options_column_id ON banner_column_options(banner_column_id);

-- Column options by question option (for reverse lookups)
CREATE INDEX idx_banner_column_options_option_id ON banner_column_options(question_option_id);

-- Composite index for efficient hierarchy queries
CREATE INDEX idx_banner_hierarchy ON banner_columns(banner_group_id, question_id, display_order);

-- =========================
-- STEP 5: CREATE OPTIMIZED VIEW
-- =========================

-- Complete banner structure with all data (single query efficiency)
CREATE VIEW banner_structure AS
SELECT
    bd.id as banner_id,
    bd.name as banner_name,
    bd.description as banner_description,
    bd.project_id,

    bg.id as group_id,
    bg.name as group_name,
    bg.display_order as group_order,

    bc.id as column_id,
    bc.name as column_name,
    bc.display_order as column_order,
    bc.spss_variable_name,

    q.id as question_uuid,
    q.question_id as question_code,
    q.question_text,
    q.question_type,
    q.question_mode,

    -- Aggregated selected options (JSON for easy consumption)
    COALESCE(
        json_agg(
            json_build_object(
                'option_id', qo.id,
                'option_code', qo.option_code,
                'option_label', qo.option_label,
                'order_index', qo.order_index
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

GROUP BY
    bd.id, bd.name, bd.description, bd.project_id,
    bg.id, bg.name, bg.display_order,
    bc.id, bc.name, bc.display_order, bc.spss_variable_name,
    q.id, q.question_id, q.question_text, q.question_type, q.question_mode

ORDER BY bg.display_order, bc.display_order;

-- =========================
-- STEP 6: CREATE TRIGGERS FOR AUTOMATION
-- =========================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_banner_definitions_updated_at
    BEFORE UPDATE ON banner_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banner_columns_updated_at
    BEFORE UPDATE ON banner_columns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================
-- STEP 7: ADD HELPFUL COMMENTS
-- =========================

COMMENT ON TABLE banner_definitions IS 'Main banner definitions linked to projects';
COMMENT ON TABLE banner_groups IS 'H1 category groups within banners (e.g., "Demographics", "Brand Usage")';
COMMENT ON TABLE banner_columns IS 'H2 columns within groups, each linked to a specific question';
COMMENT ON TABLE banner_column_options IS 'Selected options for each banner column (e.g., which answer choices to include)';
COMMENT ON VIEW banner_structure IS 'Complete denormalized view of banner hierarchy with all related data';

COMMENT ON COLUMN banner_columns.question_id IS 'Foreign key to questions table - ensures data integrity';
COMMENT ON COLUMN banner_column_options.question_option_id IS 'Foreign key to question_options table - ensures option validity';

-- =========================
-- STEP 8: GRANT PERMISSIONS (if needed)
-- =========================

-- Grant permissions to your application role
-- GRANT ALL ON banner_definitions TO your_app_role;
-- GRANT ALL ON banner_groups TO your_app_role;
-- GRANT ALL ON banner_columns TO your_app_role;
-- GRANT ALL ON banner_column_options TO your_app_role;
-- GRANT SELECT ON banner_structure TO your_app_role;

-- =========================
-- VERIFICATION QUERIES
-- =========================

-- Check that all tables were created successfully
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename LIKE 'banner_%'
ORDER BY tablename;

-- Check that indexes were created
SELECT
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE tablename LIKE 'banner_%'
ORDER BY tablename, indexname;

-- Check that view was created
SELECT
    viewname,
    definition
FROM pg_views
WHERE viewname = 'banner_structure';

-- Success message
SELECT 'Banner system migration completed successfully! 🎉' as status;