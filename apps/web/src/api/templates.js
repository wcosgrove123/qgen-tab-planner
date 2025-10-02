import supabase from '../lib/supa.js';

/**
 * Template API - handles project template CRUD operations using Supabase
 */

/**
 * Fetches all project templates for the current user/organization
 */
export async function getProjectTemplates() {
  try {
    // For now, get all public templates + user's organization templates
    // Later we can filter by organization_id when user management is implemented
    const { data: templates, error } = await supabase
      .from('project_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return templates || [];
  } catch (error) {
    console.error('Failed to fetch project templates:', error);
    // Return empty array instead of crashing the app
    return [];
  }
}

/**
 * Creates a new project template from an existing project
 */
export async function createProjectTemplate(templateData) {
  try {
    const templateId = 'template_' + Math.random().toString(36).substr(2, 9);

    // Get organization_id (using same pattern as projects.js)
    let organizationId = window.ui_state?.organization_id;
    if (!organizationId) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: 'Default Organization' })
        .select()
        .single();
      if (orgError) throw orgError;
      organizationId = org.id;
      if (window.ui_state) window.ui_state.organization_id = organizationId;
    }

    const template = {
      id: templateId,
      organization_id: organizationId,
      name: templateData.name,
      description: templateData.description || '',
      template_data: templateData.template_data,
      category: templateData.category || 'General',
      is_public: templateData.is_public || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('project_templates')
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to create project template:', error);
    throw error;
  }
}

/**
 * Updates an existing project template
 */
export async function updateProjectTemplate(templateId, updates) {
  try {
    const { data, error } = await supabase
      .from('project_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to update project template:', error);
    throw error;
  }
}

/**
 * Deletes a project template
 */
export async function deleteProjectTemplate(templateId) {
  try {
    const { error } = await supabase
      .from('project_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to delete project template:', error);
    throw error;
  }
}

/**
 * Creates a new project from a template
 */
export function createProjectFromTemplate(template, customizations = {}) {
  const templateData = template.template_data;

  // Generate new IDs
  const newProjectId = 'proj_' + Math.random().toString(36).substr(2, 9);

  // Create new project from template data
  const newProject = {
    ...templateData.project,
    id: newProjectId,
    name: customizations.name || `${templateData.project.name} Copy`,
    client: customizations.client || templateData.project.client || '',
    status: customizations.status || 'Draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Regenerate IDs for dates and roles
    important_dates: (templateData.project.important_dates || []).map(date => ({
      ...date,
      id: 'date_' + Math.random().toString(36).substr(2, 9)
    })),
    roles: templateData.project.roles || []
  };

  // Copy questions with new IDs
  const newQuestions = (templateData.questions || []).map(q => ({
    ...q,
    id: 'q_' + Math.random().toString(36).substr(2, 9),
    project_id: newProjectId
  }));

  return {
    project: newProject,
    questions: newQuestions,
    globals: templateData.globals || {
      default_base_verbiage: "Total (qualified respondents)",
      default_base_definition: "",
      scale_buckets: {},
      rules: {},
      banners: []
    }
  };
}

/**
 * Gets template usage statistics
 */
export async function getTemplateStats(templateId) {
  try {
    // This would count how many projects were created from this template
    // For now, we'll return a placeholder
    return {
      usage_count: 0,
      last_used: null
    };
  } catch (error) {
    console.error('Failed to get template stats:', error);
    return { usage_count: 0, last_used: null };
  }
}