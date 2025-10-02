-- Create project_templates table for the Q-Gen application
-- This table stores reusable project templates

CREATE TABLE IF NOT EXISTS project_templates (
    id TEXT PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    is_public BOOLEAN NOT NULL DEFAULT false,
    template_data JSONB NOT NULL, -- Stores the full project structure (project, questions, globals)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS project_templates_organization_id_idx ON project_templates(organization_id);
CREATE INDEX IF NOT EXISTS project_templates_category_idx ON project_templates(category);
CREATE INDEX IF NOT EXISTS project_templates_is_public_idx ON project_templates(is_public);
CREATE INDEX IF NOT EXISTS project_templates_created_at_idx ON project_templates(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view public templates and their organization's templates
CREATE POLICY "View templates" ON project_templates
    FOR SELECT
    USING (
        is_public = true OR
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

-- Users can insert templates for their organization
CREATE POLICY "Insert templates" ON project_templates
    FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

-- Users can update their organization's templates
CREATE POLICY "Update templates" ON project_templates
    FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

-- Users can delete their organization's templates
CREATE POLICY "Delete templates" ON project_templates
    FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

-- Add some sample templates (optional)
INSERT INTO project_templates (id, organization_id, name, description, category, is_public, template_data)
VALUES
(
    'template_sample_brand_tracker',
    (SELECT id FROM organizations LIMIT 1), -- Use the first organization for demo
    'Brand Tracker Template',
    'A comprehensive brand tracking study template with key brand metrics and competitor analysis questions.',
    'Brand Tracker',
    true,
    '{
        "project": {
            "name": "Brand Tracker Study",
            "project_type": "Brand Tracker",
            "tags": ["brand", "tracking", "awareness"],
            "roles": [
                {"role": "Project Manager", "person": ""},
                {"role": "Project Director", "person": ""}
            ],
            "important_dates": [
                {"what": "Questionnaire", "when": "", "who": "", "status": "Not Started"},
                {"what": "Fielding", "when": "", "who": "", "status": "Not Started"},
                {"what": "Reporting", "when": "", "who": "", "status": "Not Started"}
            ]
        },
        "questions": [
            {
                "type": "single_choice",
                "question_text": "How familiar are you with [BRAND]?",
                "required": true,
                "options": [
                    {"text": "Very familiar", "value": "very_familiar"},
                    {"text": "Somewhat familiar", "value": "somewhat_familiar"},
                    {"text": "Not very familiar", "value": "not_familiar"},
                    {"text": "Never heard of it", "value": "never_heard"}
                ]
            }
        ],
        "globals": {
            "default_base_verbiage": "Total (qualified respondents)",
            "default_base_definition": "",
            "scale_buckets": {},
            "rules": {},
            "banners": []
        }
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;