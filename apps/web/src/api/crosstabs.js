/**
 * Cross-tabs API endpoints
 * Fetch banner plans from Supabase for cross-tab generation
 */

import supabase from '../lib/supa-node.js';

/**
 * Get all banner plans for a project
 * Returns in format suitable for cross-tab generation
 */
export async function getBannerPlansForProject(projectId) {
  try {
    const { data, error } = await supabase
      .from('banner_definitions')
      .select(`
        id,
        name,
        description,
        banner_groups (
          id,
          name,
          display_order,
          banner_columns (
            id,
            name,
            logic_equation,
            display_order
          )
        )
      `)
      .eq('project_id', projectId)
      .order('created_at');

    if (error) throw error;

    // Transform to cross-tab engine format
    const bannerPlans = data.map(banner => ({
      id: banner.id,
      name: banner.name,
      description: banner.description || '',
      groups: (banner.banner_groups || [])
        .sort((a, b) => a.display_order - b.display_order)
        .map(group => ({
          name: group.name,
          columns: (group.banner_columns || [])
            .sort((a, b) => a.display_order - b.display_order)
            .map(col => ({
              id: col.id,
              name: col.name,
              equation: col.logic_equation || ''  // Use logic_equation field from schema
            }))
        }))
    }));

    return { success: true, data: bannerPlans };
  } catch (error) {
    console.error('Error fetching banner plans:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get questions from project for auto-configuration
 */
export async function getQuestionsForProject(projectId) {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('id, question_id, question_text, question_mode, question_type')
      .eq('project_id', projectId)
      .order('order_index');

    if (error) throw error;

    // Map to cross-tab format
    const questions = data.map(q => {
      // Determine question type from mode
      let type = 'categorical';

      if (q.question_mode === 'numeric_simple' || q.question_mode === 'numeric_dropdown') {
        type = 'numeric';
      } else if (q.question_mode === 'likert' || q.question_mode === 'grid_single' || q.question_mode === 'grid_multi') {
        type = 'likert';
      }

      return {
        id: q.question_id,
        text: q.question_text || `Question ${q.question_id}`,
        type: type
      };
    });

    return { success: true, data: questions };
  } catch (error) {
    console.error('Error fetching questions:', error);
    return { success: false, error: error.message };
  }
}