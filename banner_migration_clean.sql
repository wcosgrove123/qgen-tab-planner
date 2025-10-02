-- 0003_banner_redesign.sql
-- Redesign banner system for SPSS data manipulation

-- DROP OLD BANNER TABLES
DROP TABLE IF EXISTS banner_groups CASCADE;
DROP TABLE IF EXISTS banner_dimensions CASCADE;

-- NEW BANNER SYSTEM FOR SPSS

-- Main banner definition
CREATE TABLE banner_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  banner_name TEXT NOT NULL,
  banner_label TEXT,
  description TEXT,
  spss_prefix TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_project_banner_name UNIQUE(project_id, banner_name)
);

-- Banner columns (what you see across the top)
CREATE TABLE banner_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  banner_id UUID NOT NULL REFERENCES banner_definitions(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL,
  column_label TEXT NOT NULL,

  -- Links to existing questions table
  source_question_id TEXT NOT NULL,
  source_type TEXT NOT NULL,

  -- What to include from source
  included_codes TEXT[] DEFAULT '{}',
  included_net_ids UUID[] DEFAULT '{}',

  -- SPSS specifics
  spss_variable_name TEXT,
  spss_value_labels JSONB DEFAULT '{}',

  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_source_type CHECK (source_type IN ('options', 'nets', 'custom')),
  CONSTRAINT unique_banner_column UNIQUE(banner_id, column_id)
);

-- Complex conditional logic
CREATE TABLE banner_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID NOT NULL REFERENCES banner_columns(id) ON DELETE CASCADE,
  condition_group TEXT NOT NULL,
  condition_order INTEGER DEFAULT 0,

  target_question_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_codes TEXT[] DEFAULT '{}',
  target_net_ids UUID[] DEFAULT '{}',
  target_range_min NUMERIC,
  target_range_max NUMERIC,
  target_operator TEXT,
  target_text_value TEXT,
  target_text_operator TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_target_type CHECK (target_type IN ('codes', 'nets', 'range', 'text')),
  CONSTRAINT valid_operator CHECK (target_operator IN ('=', '!=', '>', '<', '>=', '<=', 'in', 'not_in', 'between'))
);

-- SPSS cross-tab specifications
CREATE TABLE banner_crosstab_specs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  banner_id UUID NOT NULL REFERENCES banner_definitions(id) ON DELETE CASCADE,

  row_questions TEXT[] DEFAULT '{}',
  row_grouping TEXT DEFAULT 'individual',
  sig_testing BOOLEAN DEFAULT FALSE,
  test_types TEXT[] DEFAULT '{}',
  confidence_level NUMERIC DEFAULT 0.95,

  spss_table_format TEXT DEFAULT 'standard',
  spss_export_path TEXT,
  include_base_sizes BOOLEAN DEFAULT TRUE,
  include_percentages BOOLEAN DEFAULT TRUE,
  include_counts BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_banner_definitions_project_id ON banner_definitions(project_id);
CREATE INDEX idx_banner_columns_banner_id ON banner_columns(banner_id);
CREATE INDEX idx_banner_columns_source_question_id ON banner_columns(source_question_id);
CREATE INDEX idx_banner_conditions_column_id ON banner_conditions(column_id);
CREATE INDEX idx_banner_crosstab_specs_banner_id ON banner_crosstab_specs(banner_id);

-- TRIGGERS
CREATE TRIGGER update_banner_definitions_updated_at
  BEFORE UPDATE ON banner_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banner_columns_updated_at
  BEFORE UPDATE ON banner_columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banner_crosstab_specs_updated_at
  BEFORE UPDATE ON banner_crosstab_specs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();