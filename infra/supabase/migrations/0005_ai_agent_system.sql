-- 0005_ai_agent_system.sql
-- AI Agent & Knowledge Base System

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =========================
-- KNOWLEDGE BASE
-- =========================
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'methodology', 'questionnaire_design', 'data_analysis', 'banner_tips', 'spss', 'general'
  tags TEXT[] DEFAULT '{}',

  -- Vector search (configurable dimensions)
  -- BGE: 1024, OpenAI ada-002: 1536, nomic-embed-text: 768
  embedding vector(1024), -- Default: BGE embeddings (1024 dimensions)

  -- Source tracking
  source_type TEXT, -- 'manual', 'imported', 'generated', 'example'
  source_reference TEXT,

  -- Metadata
  author_id UUID REFERENCES people(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX ON knowledge_base USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Full-text search index
CREATE INDEX knowledge_base_content_fts ON knowledge_base
  USING gin(to_tsvector('english', title || ' ' || content));

-- =========================
-- CHAT HISTORY
-- =========================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,

  title TEXT, -- Auto-generated or user-provided
  context_snapshot JSONB DEFAULT '{}', -- Snapshot of project state when chat started

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,

  -- Message content
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,

  -- RAG metadata
  retrieved_contexts JSONB DEFAULT '[]', -- Array of knowledge base IDs used
  tool_calls JSONB DEFAULT '[]', -- Tools the agent called

  -- Tokens & cost tracking
  tokens_used INTEGER,
  model TEXT, -- e.g., 'gpt-4', 'claude-sonnet-3.5'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system'))
);

-- =========================
-- AI-GENERATED TASKS
-- =========================
CREATE TABLE IF NOT EXISTS ai_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,

  -- Task details
  task_title TEXT NOT NULL,
  task_description TEXT,
  task_type TEXT, -- 'validation', 'design_improvement', 'data_check', 'banner_setup', 'custom'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'

  -- Assignment
  assigned_to UUID REFERENCES people(id) ON DELETE SET NULL,

  -- Status tracking
  status TEXT DEFAULT 'suggested', -- 'suggested', 'accepted', 'in_progress', 'completed', 'dismissed'
  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- AI context
  ai_reasoning TEXT, -- Why the AI suggested this task
  related_questions TEXT[], -- Question IDs this task relates to

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT valid_status CHECK (status IN ('suggested', 'accepted', 'in_progress', 'completed', 'dismissed'))
);

-- =========================
-- AI USAGE ANALYTICS
-- =========================
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Usage details
  operation_type TEXT NOT NULL, -- 'chat', 'questionnaire_generation', 'banner_suggestion', 'task_creation'
  model TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6), -- Estimated cost

  -- Performance tracking
  latency_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- SEED DATA: Market Research Knowledge Base
-- =========================
INSERT INTO knowledge_base (title, content, category, tags, source_type) VALUES
(
  'Survey Question Best Practices',
  'When designing survey questions:
  1. Keep questions clear and concise
  2. Avoid leading or loaded questions
  3. Use simple, everyday language
  4. Avoid double-barreled questions (asking two things at once)
  5. Provide mutually exclusive response options
  6. Consider scale direction (positive to negative or vice versa)
  7. Test questions with target audience before fielding',
  'questionnaire_design',
  ARRAY['best_practices', 'survey_design', 'question_writing'],
  'manual'
),
(
  'Banner Design Fundamentals',
  'Banners define subgroups for cross-tabulation:
  - H1 categories are major demographic/behavioral splits (Gender, Age, Usage)
  - H2 categories are subcategories within H1 (Male/Female within Gender)
  - Use equations for conditions (e.g., S7=2 for a specific response)
  - Common banner types: Demographics, Product Usage, Attitudes, Behaviors
  - Keep banner count manageable (typically 5-15 H1 categories)
  - Ensure sufficient base sizes for statistical validity',
  'banner_tips',
  ARRAY['banners', 'crosstabs', 'data_tables', 'analysis'],
  'manual'
),
(
  'Tab Sheet Structure',
  'Tab sheets define the table plan for data analysis:
  - Each row typically represents one data table
  - Specify base definition (who is included in percentages)
  - Define nets (grouped responses) for summary analysis
  - Include special instructions (means, medians, statistical testing)
  - Banners form the columns of each table
  - Clear labeling prevents analyst confusion during programming',
  'data_analysis',
  ARRAY['tab_sheets', 'data_tables', 'reporting', 'analysis_plan'],
  'manual'
),
(
  'Statistical Significance Testing',
  'When conducting market research analysis:
  - Use 90%, 95%, or 99% confidence levels (90% most common in MR)
  - Compare subgroups using appropriate tests (z-test for proportions, t-test for means)
  - Account for multiple comparisons (Bonferroni correction if needed)
  - Ensure adequate base sizes (n≥30 minimum for most tests)
  - Report statistically significant differences clearly
  - Consider practical significance alongside statistical significance',
  'data_analysis',
  ARRAY['statistics', 'significance_testing', 'analysis', 'reporting'],
  'manual'
),
(
  'Conditional Logic Patterns',
  'Common conditional logic use cases:
  - Display questions only to relevant respondents
  - Skip patterns based on screening criteria
  - Pipe text from previous responses
  - Randomize order while maintaining exclusivity
  - Show follow-up questions based on previous answers
  - Use operators: = (equals), != (not equals), > (greater than), < (less than)
  - Combine conditions with AND/OR logic for complex scenarios',
  'questionnaire_design',
  ARRAY['conditional_logic', 'skip_patterns', 'survey_flow', 'programming'],
  'manual'
),
(
  'SPSS Data File Best Practices',
  'When working with SPSS data:
  - Use variable names that match question IDs (Q1, S1, etc.)
  - Set proper variable labels (full question text)
  - Define value labels for all coded responses
  - Set measurement level correctly (nominal, ordinal, scale)
  - Use numeric codes for categorical data
  - Store dates in SPSS date format
  - Document recodes and computed variables
  - Save metadata alongside data file',
  'spss',
  ARRAY['spss', 'data_management', 'coding', 'metadata'],
  'manual'
);

-- =========================
-- HELPER FUNCTIONS
-- =========================

-- Function to search knowledge base using vector similarity
-- NOTE: Update vector dimension to match your embedding model
-- BGE: vector(1024), OpenAI: vector(1536), nomic: vector(768)
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1024),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.category,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE kb.is_active = TRUE
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get project context for AI
CREATE OR REPLACE FUNCTION get_project_context(project_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  context JSONB;
BEGIN
  SELECT jsonb_build_object(
    'project', (SELECT row_to_json(p.*) FROM projects p WHERE p.id = project_uuid),
    'question_count', (SELECT COUNT(*) FROM questions WHERE project_id = project_uuid),
    'questions', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', q.question_id,
          'text', q.question_text,
          'type', q.question_type,
          'mode', q.question_mode,
          'option_count', (SELECT COUNT(*) FROM question_options WHERE question_id = q.id)
        )
      )
      FROM questions q
      WHERE q.project_id = project_uuid
      ORDER BY q.order_index
    ),
    'banners', (SELECT pg.default_banners FROM project_globals pg WHERE pg.project_id = project_uuid)
  ) INTO context;

  RETURN context;
END;
$$;

-- =========================
-- INDEXES FOR PERFORMANCE
-- =========================
CREATE INDEX idx_chat_sessions_project ON chat_sessions(project_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_ai_tasks_project ON ai_tasks(project_id);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX idx_ai_usage_log_org ON ai_usage_log(organization_id);

-- =========================
-- ROW LEVEL SECURITY (RLS)
-- =========================
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

-- Policies (basic - expand based on your auth setup)
CREATE POLICY "Users can view org knowledge" ON knowledge_base
  FOR SELECT USING (TRUE); -- Adjust based on your auth

CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR ALL USING (person_id = auth.uid()::uuid);

CREATE POLICY "Users can view session messages" ON chat_messages
  FOR SELECT USING (
    session_id IN (SELECT id FROM chat_sessions WHERE person_id = auth.uid()::uuid)
  );
