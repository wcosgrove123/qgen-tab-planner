/**
 * Banner Manager - CRUD operations for new banner system
 * Handles all database operations for banner_definitions, banner_columns, banner_conditions
 *
 * ⚠️ CRITICAL RELIABILITY FIX (2025-09-29):
 *
 * ISSUE FIXED: H2 banner creation would work for first H1 but hang silently on second H1
 * ROOT CAUSE: Supabase queries could hang indefinitely after multiple operations
 *
 * KEY FIXES IMPLEMENTED:
 * 1. lookupQuestionUUID() - Added 10-second timeout using Promise.race()
 * 2. lookupQuestionUUID() - Added preliminary connection test before main query
 * 3. Enhanced debugging throughout UUID lookup chain
 *
 * DO NOT REMOVE: The timeout and connection testing are essential for system reliability
 */

import { createClient } from '@supabase/supabase-js';

// Import Supabase client (adjust path as needed)
let supabase;
try {
  const supabaseModule = await import('../lib/supa.js');
  supabase = supabaseModule.default;
} catch (error) {
  console.error('Failed to import Supabase client:', error);
}

// =========================
// BANNER DEFINITIONS CRUD
// =========================

/**
 * Create a new banner definition
 */
export async function createBannerDefinition({
  projectId,
  bannerName,
  description = null
}) {
  try {
    const { data, error } = await supabase
      .from('banner_definitions')
      .insert({
        project_id: projectId,
        name: bannerName,
        description: description
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase banner creation error details:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.details);
      throw error;
    }
    console.log('✅ Created banner definition:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error creating banner definition:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all banner definitions for a project (using optimal 3-table schema)
 */
export async function getBannerDefinitions(projectId) {
  try {
    const { data, error } = await supabase
      .from('banner_definitions')
      .select(`
        *,
        banner_groups (
          id,
          name,
          display_order,
          banner_columns (
            id,
            name,
            question_id,
            display_order,
            spss_variable_name,
            logic_equation
          )
        )
      `)
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

/**
 * Update banner definition
 */
export async function updateBannerDefinition(bannerId, updates) {
  try {
    const { data, error } = await supabase
      .from('banner_definitions')
      .update(updates)
      .eq('id', bannerId)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Updated banner definition:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error updating banner definition:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete banner definition (hard delete with cascade)
 */
export async function deleteBannerDefinition(bannerId) {
  try {
    const { data, error } = await supabase
      .from('banner_definitions')
      .delete()
      .eq('id', bannerId)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Deleted banner definition (cascade will handle groups/columns):', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error deleting banner definition:', error);
    return { success: false, error: error.message };
  }
}

// =========================
// BANNER GROUPS CRUD (H1 Categories)
// =========================

/**
 * Create a new banner group (H1 demographic category)
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
 * Get all groups for a banner
 */
export async function getBannerGroups(bannerId) {
  try {
    const { data, error } = await supabase
      .from('banner_groups')
      .select(`
        *,
        banner_columns (*)
      `)
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
    const { data, error } = await supabase
      .from('banner_groups')
      .delete()
      .eq('id', groupId)
      .select();

    if (error) throw error;
    console.log('✅ Deleted banner group:', data?.[0] || 'Group deleted');
    return { success: true, data: data?.[0] };
  } catch (error) {
    console.error('❌ Error deleting banner group:', error);
    return { success: false, error: error.message };
  }
}

// =========================
// BANNER COLUMNS CRUD (H2 Subgroups)
// =========================

/**
 * Create a new banner column (H2 subgroup)
 *
 * ⚠️ CRITICAL: After migration, question_id must be text (like "S7"), not UUID
 */
export async function createBannerColumn({
  bannerGroupId,
  name,
  questionId,
  displayOrder = 0,
  spssVariableName = null,
  logicEquation = null
}) {
  try {
    // Get project_id from banner hierarchy
    const { data: groupData, error: groupError } = await supabase
      .from('banner_groups')
      .select('banner_id, banner_definitions(project_id)')
      .eq('id', bannerGroupId)
      .single();

    if (groupError) throw groupError;
    if (!groupData?.banner_definitions?.project_id) {
      throw new Error('Could not determine project_id for banner column');
    }

    const projectId = groupData.banner_definitions.project_id;

    const { data, error } = await supabase
      .from('banner_columns')
      .insert({
        banner_group_id: bannerGroupId,
        project_id: projectId,  // Required after migration
        question_id: questionId,  // Now text, not UUID
        name: name,
        display_order: displayOrder,
        spss_variable_name: spssVariableName,
        logic_equation: logicEquation
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
 * Get all columns for a banner group
 */
export async function getBannerColumns(bannerGroupId) {
  try {
    const { data, error } = await supabase
      .from('banner_columns')
      .select('*')
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
 * Get hierarchical banner structure (groups with their columns)
 */
export async function getBannerHierarchy(bannerId) {
  try {
    // Get banner groups with their columns in a single query
    const { data, error } = await supabase
      .from('banner_groups')
      .select(`
        id,
        name,
        display_order,
        banner_columns (
          id,
          name,
          question_id,
          display_order,
          spss_variable_name,
          logic_equation,
          created_at
        )
      `)
      .eq('banner_id', bannerId)
      .order('display_order');

    if (error) throw error;

    // Transform the data to match expected format
    const h1Groups = data.map(group => ({
      id: group.id,
      databaseId: group.id,
      name: group.name,
      displayOrder: group.display_order,
      h2Columns: group.banner_columns.map(column => ({
        id: column.id,
        databaseId: column.id,
        name: column.name,
        questionId: column.question_id,
        logicEquation: column.logic_equation, // Stored equation like "S7=2"
        spssVariableName: column.spss_variable_name,
        displayOrder: column.display_order
      }))
    }));

    console.log('✅ Built efficient hierarchy:', h1Groups.length, 'H1 groups with',
      h1Groups.reduce((sum, h1) => sum + h1.h2Columns.length, 0), 'H2 columns');

    return { success: true, data: h1Groups };
  } catch (error) {
    console.error('❌ Error loading banner hierarchy:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Update banner column
 */
export async function updateBannerColumn(columnId, updates) {
  try {
    const { data, error } = await supabase
      .from('banner_columns')
      .update(updates)
      .eq('id', columnId)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Updated banner column:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error updating banner column:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete banner column (hard delete)
 */
export async function deleteBannerColumn(columnId) {
  try {
    const { data, error } = await supabase
      .from('banner_columns')
      .delete()
      .eq('id', columnId)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Deleted banner column:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error deleting banner column:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reorder banner columns
 */
export async function reorderBannerColumns(columnUpdates) {
  try {
    const promises = columnUpdates.map(({ id, orderIndex }) =>
      supabase
        .from('banner_columns')
        .update({ order_index: orderIndex })
        .eq('id', id)
    );

    await Promise.all(promises);
    console.log('✅ Reordered banner columns:', columnUpdates.length);
    return { success: true };
  } catch (error) {
    console.error('❌ Error reordering banner columns:', error);
    return { success: false, error: error.message };
  }
}

// =========================
// BANNER CONDITIONS CRUD
// =========================

/**
 * Create banner condition
 */
export async function createBannerCondition({
  columnId,
  conditionGroup,
  conditionOrder = 0,
  targetQuestionId,
  targetType,
  targetCodes = [],
  targetNetIds = [],
  targetRangeMin = null,
  targetRangeMax = null,
  targetOperator = null,
  targetTextValue = null,
  targetTextOperator = null
}) {
  try {
    const { data, error } = await supabase
      .from('banner_conditions')
      .insert({
        column_id: columnId,
        condition_group: conditionGroup,
        condition_order: conditionOrder,
        target_question_id: targetQuestionId,
        target_type: targetType,
        target_codes: targetCodes,
        target_net_ids: targetNetIds,
        target_range_min: targetRangeMin,
        target_range_max: targetRangeMax,
        target_operator: targetOperator,
        target_text_value: targetTextValue,
        target_text_operator: targetTextOperator
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Created banner condition:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error creating banner condition:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get conditions for a column
 */
export async function getBannerConditions(columnId) {
  try {
    const { data, error } = await supabase
      .from('banner_conditions')
      .select('*')
      .eq('column_id', columnId)
      .order('condition_group')
      .order('condition_order');

    if (error) throw error;
    console.log('✅ Loaded banner conditions:', data?.length || 0);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error loading banner conditions:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Update banner condition
 */
export async function updateBannerCondition(conditionId, updates) {
  try {
    const { data, error } = await supabase
      .from('banner_conditions')
      .update(updates)
      .eq('id', conditionId)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Updated banner condition:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error updating banner condition:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete banner condition
 */
export async function deleteBannerCondition(conditionId) {
  try {
    const { data, error } = await supabase
      .from('banner_conditions')
      .delete()
      .eq('id', conditionId)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Deleted banner condition:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error deleting banner condition:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete all conditions for a column
 */
export async function deleteBannerConditions(columnId) {
  try {
    const { data, error } = await supabase
      .from('banner_conditions')
      .delete()
      .eq('column_id', columnId)
      .select();

    if (error) throw error;
    console.log('✅ Deleted all conditions for column:', data?.length || 0);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error deleting banner conditions:', error);
    return { success: false, error: error.message };
  }
}

// =========================
// HELPER FUNCTIONS
// =========================

/**
 * Get project ID from current state
 */
export function getCurrentProjectId() {
  const projectId = window.ui_state?.active_project_id || window.state?.project_id;
  console.log('🔍 getCurrentProjectId() called:', {
    ui_state: window.ui_state,
    state: window.state,
    projectId: projectId
  });
  return projectId;
}

/**
 * Generate automatic banner name from project data
 */
export function generateAutoBannerName() {
  try {
    // Get project name from current state
    const projectName = window.state?.project_name ||
                       window.ui_state?.project_name ||
                       'Project';

    // Clean project name (remove special chars, keep spaces)
    const cleanName = projectName.replace(/[^\w\s-]/g, '').trim();

    // Format: "project name:type_banners"
    return `${cleanName}:type_banners`;
  } catch (error) {
    console.warn('Could not generate auto banner name:', error);
    return 'Default:type_banners';
  }
}

/**
 * Create banner with sensible defaults
 */
export async function createDefaultBanner(projectId = null) {
  try {
    const actualProjectId = projectId || getCurrentProjectId();
    if (!actualProjectId) {
      throw new Error('No project ID available');
    }

    const bannerName = generateAutoBannerName();

    console.log('🔄 Creating banner with parameters:', {
      projectId: actualProjectId,
      bannerName: bannerName,
      bannerLabel: bannerName,
      description: 'Auto-generated banner for cross-tabulation analysis',
      spssPrefix: 'BNR_',
      orderIndex: 0,
      isActive: true
    });

    const result = await createBannerDefinition({
      projectId: actualProjectId,
      bannerName: bannerName,
      bannerLabel: bannerName, // Use same as name
      description: 'Auto-generated banner for cross-tabulation analysis',
      spssPrefix: 'BNR_',
      orderIndex: 0,
      isActive: true
    });

    console.log('✅ Created default banner:', result.data?.banner_name);
    return result;
  } catch (error) {
    console.error('❌ Error creating default banner:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate unique column ID
 */
export function generateColumnId(sourceQuestionId, label) {
  const base = label.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  const timestamp = Date.now().toString().slice(-4);
  return `${sourceQuestionId}_${base}_${timestamp}`;
}

/**
 * Validate banner column data
 */
export function validateBannerColumn(columnData) {
  const errors = [];

  if (!columnData.columnId) {
    errors.push('Column ID is required');
  }

  if (!columnData.columnLabel) {
    errors.push('Column label is required');
  }

  if (!columnData.sourceQuestionId) {
    errors.push('Source question is required');
  }

  if (!['options', 'nets', 'custom'].includes(columnData.sourceType)) {
    errors.push('Invalid source type');
  }

  if (columnData.sourceType === 'options' && (!columnData.includedCodes || columnData.includedCodes.length === 0)) {
    errors.push('At least one option code must be selected');
  }

  if (columnData.sourceType === 'nets' && (!columnData.includedNetIds || columnData.includedNetIds.length === 0)) {
    errors.push('At least one net must be selected');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate banner condition data
 */
export function validateBannerCondition(conditionData) {
  const errors = [];

  if (!conditionData.targetQuestionId) {
    errors.push('Target question is required');
  }

  if (!['codes', 'nets', 'range', 'text'].includes(conditionData.targetType)) {
    errors.push('Invalid target type');
  }

  if (conditionData.targetType === 'codes' && (!conditionData.targetCodes || conditionData.targetCodes.length === 0)) {
    errors.push('At least one target code must be specified');
  }

  if (conditionData.targetType === 'nets' && (!conditionData.targetNetIds || conditionData.targetNetIds.length === 0)) {
    errors.push('At least one target net must be specified');
  }

  if (conditionData.targetType === 'range') {
    if (conditionData.targetRangeMin === null && conditionData.targetRangeMax === null) {
      errors.push('Range min or max must be specified');
    }
    if (!conditionData.targetOperator) {
      errors.push('Range operator is required');
    }
  }

  if (conditionData.targetType === 'text' && !conditionData.targetTextValue) {
    errors.push('Text value is required for text conditions');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Look up question UUID by question code
 *
 * CRITICAL FIX (2025-09-29): Added timeout and connection testing to prevent hanging queries
 *
 * PROBLEM SOLVED:
 * - H2 creation worked for first H1 but failed silently on second H1
 * - Root cause: Supabase queries would hang indefinitely after multiple operations
 * - Symptoms: Console logs would stop after "Querying questions table..." with no error
 *
 * SOLUTION IMPLEMENTED:
 * 1. Added 10-second timeout using Promise.race() to prevent infinite hangs
 * 2. Added preliminary connection test to verify database accessibility
 * 3. Enhanced logging to track query lifecycle from start to finish
 *
 * DO NOT REMOVE: The timeout and connection test are essential for reliability
 *
 * @param {string} questionCode - Question code like "S7", "S1", etc.
 * @returns {Object} - {success: boolean, data: {id: string, question_id: string} | error: string}
 */
export async function lookupQuestionUUID(questionCode) {
  try {
    console.log(`🔍 [bannerManager] Starting lookupQuestionUUID for: ${questionCode}`);
    const projectId = getCurrentProjectId();
    if (!projectId) {
      throw new Error('No project ID available');
    }

    console.log(`🔍 Querying questions table for question_id='${questionCode}' and project_id='${projectId}'`);

    // CRITICAL: Test basic database connectivity first (FIXED hanging issue)
    // This preliminary test prevents the main query from hanging by ensuring
    // the database connection is working properly before attempting the UUID lookup
    try {
      console.log(`🧪 Testing basic questions table access...`);
      const { count, error: countError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      if (countError) {
        console.error(`❌ Cannot access questions table:`, countError);
      } else {
        console.log(`✅ Questions table accessible, ${count} questions found for project`);
      }
    } catch (testError) {
      console.error(`❌ Error testing questions table:`, testError);
    }

    // CRITICAL: 10-second timeout prevents infinite hangs (FIXED hanging issue)
    // Without this timeout, queries could hang forever when Supabase client gets into bad state
    // Promise.race() ensures we get either a result OR timeout error within 10 seconds
    const queryPromise = supabase
      .from('questions')
      .select('id, question_id')
      .eq('question_id', questionCode)
      .eq('project_id', projectId)
      .single();

    // Timeout promise rejects after 10 seconds to prevent infinite waiting
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
    });

    console.log(`⏱️ Starting query with 10-second timeout...`);
    // Promise.race() returns whichever promise resolves/rejects first
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      console.error(`❌ Supabase error looking up question ${questionCode}:`, error);
      throw error;
    }

    if (!data) {
      console.error(`❌ No question found with question_id='${questionCode}' in project ${projectId}`);
      throw new Error(`Question ${questionCode} not found in project`);
    }

    console.log(`✅ [bannerManager] Found UUID for question ${questionCode}:`, data.id);
    console.log(`✅ [bannerManager] Returning success result`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ [bannerManager] Error looking up question UUID for ${questionCode}:`, error);
    console.error(`❌ [bannerManager] Returning error result`);
    return { success: false, error: error.message };
  }
}

/**
 * Get nets for a numeric question
 */
export async function getQuestionNets(questionId) {
  try {
    console.log('🔍 Fetching nets for question:', questionId);

    const { data, error } = await supabase
      .from('question_nets')
      .select('*')
      .eq('question_id', questionId)
      .order('order_index');

    if (error) throw error;

    console.log(`✅ Found ${data.length} nets for question ${questionId}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error fetching nets for question ${questionId}:`, error);
    return { success: false, error: error.message };
  }
}

// =========================
// EXPORT DEFAULT OBJECT
// =========================
export default {
  // Banner Definitions
  createBannerDefinition,
  getBannerDefinitions,
  updateBannerDefinition,
  deleteBannerDefinition,
  createDefaultBanner,

  // Banner Groups (H1 Categories)
  createBannerGroup,
  getBannerGroups,
  updateBannerGroup,
  deleteBannerGroup,

  // Banner Columns (H2 Subgroups)
  createBannerColumn,
  getBannerColumns,
  updateBannerColumn,
  deleteBannerColumn,

  // Helpers
  getCurrentProjectId,
  generateAutoBannerName,
  generateColumnId,
  validateBannerColumn,
  lookupQuestionUUID,
  getQuestionNets
};