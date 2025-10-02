/**
 * Banner Manager for New Optimal Schema
 * Uses proper foreign keys and normalized structure
 */

import { createClient } from '@supabase/supabase-js';

// Import Supabase client (same pattern as original bannerManager.js)
let supabase;
try {
  const supabaseModule = await import('../lib/supa.js');
  supabase = supabaseModule.default;
} catch (error) {
  console.error('Failed to import Supabase client:', error);
}

// =========================
// BANNER DEFINITIONS
// =========================

/**
 * Create a new banner definition
 */
export async function createBannerDefinition({
  projectId,
  name,
  description = null
}) {
  try {
    const { data, error } = await supabase
      .from('banner_definitions')
      .insert({
        project_id: projectId,
        name: name,
        description: description
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Created banner definition:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error creating banner definition:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get banner definitions for a project
 */
export async function getBannerDefinitions(projectId) {
  try {
    const { data, error } = await supabase
      .from('banner_definitions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');

    if (error) throw error;
    console.log('✅ Loaded banner definitions:', data?.length || 0);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error loading banner definitions:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// =========================
// BANNER GROUPS (H1 Categories)
// =========================

/**
 * Create a new banner group (H1)
 */
export async function createBannerGroup({
  bannerId,
  name,
  displayOrder = 0
}) {
  try {
    const { data, error } = await supabase
      .from('banner_groups')
      .insert({
        banner_id: bannerId,
        name: name,
        display_order: displayOrder
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Created banner group:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error creating banner group:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get banner groups for a banner
 */
export async function getBannerGroups(bannerId) {
  try {
    const { data, error } = await supabase
      .from('banner_groups')
      .select('*')
      .eq('banner_id', bannerId)
      .order('display_order');

    if (error) throw error;
    console.log('✅ Loaded banner groups:', data?.length || 0);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error loading banner groups:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Update banner group
 */
export async function updateBannerGroup(groupId, updates) {
  try {
    const { data, error } = await supabase
      .from('banner_groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Updated banner group:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error updating banner group:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete banner group
 */
export async function deleteBannerGroup(groupId) {
  try {
    const { error } = await supabase
      .from('banner_groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
    console.log('✅ Deleted banner group:', groupId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting banner group:', error);
    return { success: false, error: error.message };
  }
}

// =========================
// BANNER COLUMNS (H2 Columns)
// =========================

/**
 * Create a new banner column (H2)
 */
export async function createBannerColumn({
  bannerGroupId,
  questionId,
  name,
  displayOrder = 0,
  spssVariableName = null
}) {
  try {
    const { data, error } = await supabase
      .from('banner_columns')
      .insert({
        banner_group_id: bannerGroupId,
        question_id: questionId,
        name: name,
        display_order: displayOrder,
        spss_variable_name: spssVariableName
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Created banner column:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error creating banner column:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get banner columns for a group
 */
export async function getBannerColumns(bannerGroupId) {
  try {
    const { data, error } = await supabase
      .from('banner_columns')
      .select(`
        *,
        question:questions(*),
        banner_column_options(
          id,
          question_option:question_options(*)
        )
      `)
      .eq('banner_group_id', bannerGroupId)
      .order('display_order');

    if (error) throw error;
    console.log('✅ Loaded banner columns:', data?.length || 0);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error loading banner columns:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Delete banner column
 */
export async function deleteBannerColumn(columnId) {
  try {
    const { error } = await supabase
      .from('banner_columns')
      .delete()
      .eq('id', columnId);

    if (error) throw error;
    console.log('✅ Deleted banner column:', columnId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting banner column:', error);
    return { success: false, error: error.message };
  }
}

// =========================
// BANNER COLUMN OPTIONS
// =========================

/**
 * Add option to banner column
 */
export async function addColumnOption({
  bannerColumnId,
  questionOptionId
}) {
  try {
    const { data, error } = await supabase
      .from('banner_column_options')
      .insert({
        banner_column_id: bannerColumnId,
        question_option_id: questionOptionId
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Added column option:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error adding column option:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove option from banner column
 */
export async function removeColumnOption(bannerColumnId, questionOptionId) {
  try {
    const { error } = await supabase
      .from('banner_column_options')
      .delete()
      .eq('banner_column_id', bannerColumnId)
      .eq('question_option_id', questionOptionId);

    if (error) throw error;
    console.log('✅ Removed column option');
    return { success: true };
  } catch (error) {
    console.error('❌ Error removing column option:', error);
    return { success: false, error: error.message };
  }
}

// =========================
// OPTIMIZED HIERARCHY LOADING
// =========================

/**
 * Get complete banner structure (single optimized query)
 */
export async function getBannerStructure(bannerId) {
  try {
    const { data, error } = await supabase
      .from('banner_structure')
      .select('*')
      .eq('banner_id', bannerId);

    if (error) throw error;

    // Group the flat result into hierarchical structure
    const groups = new Map();

    data.forEach(row => {
      if (!groups.has(row.group_id)) {
        groups.set(row.group_id, {
          id: row.group_id,
          name: row.group_name,
          displayOrder: row.group_order,
          columns: []
        });
      }

      const group = groups.get(row.group_id);
      group.columns.push({
        id: row.column_id,
        name: row.column_name,
        displayOrder: row.column_order,
        question: {
          id: row.question_uuid,
          questionId: row.question_code,
          questionText: row.question_text
        },
        selectedOptions: row.selected_options || []
      });
    });

    const result = {
      bannerId: bannerId,
      groups: Array.from(groups.values()).sort((a, b) => a.displayOrder - b.displayOrder)
    };

    console.log('✅ Loaded complete banner structure:', result.groups.length, 'groups');
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error loading banner structure:', error);
    return { success: false, error: error.message, data: null };
  }
}

// =========================
// HELPER FUNCTIONS
// =========================

/**
 * Get project ID from current state
 */
function getProjectId() {
  return window.state?.project?.id || null;
}

/**
 * Get available questions for banner creation
 */
export async function getAvailableQuestions(projectId) {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        question_id,
        question_text,
        question_type,
        question_mode,
        question_options(
          id,
          option_code,
          option_label,
          order_index
        )
      `)
      .eq('project_id', projectId)
      .order('order_index');

    if (error) throw error;
    console.log('✅ Loaded available questions:', data?.length || 0);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error loading questions:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// =========================
// EXPORTS
// =========================

export default {
  // Banner Definitions
  createBannerDefinition,
  getBannerDefinitions,

  // Banner Groups (H1)
  createBannerGroup,
  getBannerGroups,
  updateBannerGroup,
  deleteBannerGroup,

  // Banner Columns (H2)
  createBannerColumn,
  getBannerColumns,
  deleteBannerColumn,

  // Column Options
  addColumnOption,
  removeColumnOption,

  // Optimized Loading
  getBannerStructure,
  getAvailableQuestions,

  // Helpers
  getProjectId
};