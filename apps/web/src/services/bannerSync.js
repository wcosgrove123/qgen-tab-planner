/**
 * Banner Sync Service
 * Integrates banner system with existing questions and nets data
 * Provides sync functions between new banner schema and legacy question data
 */

import bannerManager from './bannerManager.js';
import { getQuestionOptions, getAllQuestionOptions } from '../lib/tabPlanNets.js';

// =========================
// QUESTION INTEGRATION
// =========================

/**
 * Find question by ID from current state
 */
export function findQuestionById(qid) {
  if (!window.state?.questions) return null;
  return window.state.questions.find(q => (q.id || "").toUpperCase() === (qid || "").toUpperCase());
}

/**
 * Get all available questions for banner creation
 */
export function getAvailableQuestions() {
  const questions = window.state?.questions || [];

  // Filter questions that can be used in banners
  return questions.filter(q => {
    if (!q.id || !q.text) return false;

    // Check if question has options or nets
    const options = getQuestionOptions(q);
    const nets = getQuestionNets(q);

    return options.length > 0 || nets.length > 0;
  }).map(q => ({
    id: q.id,
    text: q.text,
    type: q.type,
    mode: q.mode,
    optionCount: getQuestionOptions(q).length,
    netCount: getQuestionNets(q).length,
    hasNets: getQuestionNets(q).length > 0
  }));
}

/**
 * Get question options with enhanced metadata
 */
export function getQuestionOptionsForBanner(questionId) {
  const question = findQuestionById(questionId);
  if (!question) return { success: false, error: 'Question not found' };

  try {
    const options = getQuestionOptions(question);
    const enhancedOptions = options.map(opt => ({
      code: opt.code,
      label: opt.label || opt.text,
      text: opt.text || opt.label,
      type: 'option',
      sourceType: 'options'
    }));

    return {
      success: true,
      data: {
        question: {
          id: question.id,
          text: question.text,
          type: question.type,
          mode: question.mode
        },
        options: enhancedOptions,
        totalCount: enhancedOptions.length
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// =========================
// NETS INTEGRATION
// =========================

/**
 * Get nets for a specific question
 */
export function getQuestionNets(question) {
  if (!question?.tab?.nets) return [];

  return question.tab.nets.map((net, index) => ({
    id: `net_${question.id}_${index}`, // Temporary ID for legacy nets
    uuid: null, // Will be populated if stored in question_nets table
    label: net.label || `Net ${index + 1}`,
    kind: net.kind,
    codes: net.codes || [],
    operator: net.operator,
    value1: net.value1,
    value2: net.value2,
    min: net.min,
    max: net.max,
    sourceType: 'nets'
  }));
}

/**
 * Get nets from question_nets table (if available)
 */
export async function getQuestionNetsFromDB(questionId) {
  try {
    // Import Supabase client
    const supabaseModule = await import('../lib/supa.js');
    const supabase = supabaseModule.default;

    // First, get the question UUID from questions table
    // Use limit(1) instead of single() to handle multiple rows gracefully
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('id')
      .eq('question_id', questionId)
      .limit(1);

    if (questionError) {
      console.log('Question lookup failed, using legacy nets only:', questionError);
      return { success: false, error: `Question lookup failed: ${questionError.message}` };
    }

    if (!questionData || questionData.length === 0) {
      console.log('Question not found in DB, using legacy nets');
      return { success: false, error: 'Question not found in database' };
    }

    // Get the first question if multiple found
    const question = Array.isArray(questionData) ? questionData[0] : questionData;

    // Get nets for this question
    const { data: nets, error: netsError } = await supabase
      .from('question_nets')
      .select('*')
      .eq('question_id', question.id)
      .order('order_index');

    if (netsError) throw netsError;

    const enhancedNets = (nets || []).map(net => ({
      id: net.id,
      uuid: net.id,
      label: net.net_label || `${net.net_type} Net`,
      kind: net.net_type,
      config: net.net_config,
      sourceType: 'nets'
    }));

    return { success: true, data: enhancedNets };
  } catch (error) {
    console.error('Error loading nets from DB:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get both legacy and DB nets for a question
 */
export async function getAllQuestionNets(questionId) {
  const question = findQuestionById(questionId);
  const legacyNets = question ? getQuestionNets(question) : [];

  const dbNetsResult = await getQuestionNetsFromDB(questionId);
  const dbNets = dbNetsResult.success ? dbNetsResult.data : [];

  return {
    success: true,
    data: {
      legacy: legacyNets,
      database: dbNets,
      combined: [...dbNets, ...legacyNets],
      totalCount: dbNets.length + legacyNets.length
    }
  };
}

// =========================
// BANNER COLUMN CREATION
// =========================

/**
 * Create banner column from question options
 */
export async function createColumnFromOptions({
  bannerId,
  questionId,
  selectedCodes,
  columnLabel,
  columnId = null
}) {
  try {
    const question = findQuestionById(questionId);
    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    // Validate selected codes exist
    const options = getQuestionOptions(question);
    const validCodes = options.map(opt => opt.code);
    const invalidCodes = selectedCodes.filter(code => !validCodes.includes(code));

    if (invalidCodes.length > 0) {
      return { success: false, error: `Invalid option codes: ${invalidCodes.join(', ')}` };
    }

    // Generate column ID if not provided
    if (!columnId) {
      columnId = bannerManager.generateColumnId(questionId, columnLabel);
    }

    // Create the column
    const result = await bannerManager.createBannerColumn({
      bannerId,
      columnId,
      columnLabel,
      sourceQuestionId: questionId,
      sourceType: 'options',
      includedCodes: selectedCodes,
      includedNetIds: [],
      orderIndex: await getNextColumnOrder(bannerId)
    });

    if (result.success) {
      console.log('✅ Created banner column from options:', result.data);
    }

    return result;
  } catch (error) {
    console.error('❌ Error creating column from options:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create banner column from question nets
 */
export async function createColumnFromNets({
  bannerId,
  questionId,
  selectedNetIds,
  columnLabel,
  columnId = null
}) {
  try {
    const question = findQuestionById(questionId);
    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    // Validate selected nets exist
    const allNets = await getAllQuestionNets(questionId);
    const validNetIds = allNets.data.combined.map(net => net.id);
    const invalidNetIds = selectedNetIds.filter(id => !validNetIds.includes(id));

    if (invalidNetIds.length > 0) {
      return { success: false, error: `Invalid net IDs: ${invalidNetIds.join(', ')}` };
    }

    // Generate column ID if not provided
    if (!columnId) {
      columnId = bannerManager.generateColumnId(questionId, columnLabel);
    }

    // Convert legacy net IDs to UUIDs where possible
    const dbNetIds = selectedNetIds.filter(id => id.length > 20); // UUIDs are longer
    const legacyNetIds = selectedNetIds.filter(id => id.length <= 20);

    // Create the column
    const result = await bannerManager.createBannerColumn({
      bannerId,
      columnId,
      columnLabel,
      sourceQuestionId: questionId,
      sourceType: 'nets',
      includedCodes: [],
      includedNetIds: dbNetIds,
      orderIndex: await getNextColumnOrder(bannerId)
    });

    if (result.success) {
      console.log('✅ Created banner column from nets:', result.data);

      // If there are legacy nets, store them in metadata for now
      if (legacyNetIds.length > 0) {
        console.log('⚠️ Legacy nets detected:', legacyNetIds, '- consider migrating to question_nets table');
      }
    }

    return result;
  } catch (error) {
    console.error('❌ Error creating column from nets:', error);
    return { success: false, error: error.message };
  }
}

// =========================
// HELPER FUNCTIONS
// =========================

/**
 * Get next order index for banner columns
 */
async function getNextColumnOrder(bannerId) {
  const columnsResult = await bannerManager.getBannerColumns(bannerId);
  if (!columnsResult.success) return 0;

  const maxOrder = columnsResult.data.reduce((max, col) =>
    Math.max(max, col.order_index || 0), 0
  );

  return maxOrder + 1;
}

/**
 * Resolve banner column data for display
 */
export async function resolveBannerColumnData(column) {
  try {
    const question = findQuestionById(column.source_question_id);
    if (!question) {
      return {
        ...column,
        resolved: false,
        error: 'Source question not found'
      };
    }

    let resolvedItems = [];

    if (column.source_type === 'options' && column.included_codes?.length) {
      const options = getQuestionOptions(question);
      resolvedItems = column.included_codes.map(code => {
        const option = options.find(opt => opt.code === code);
        return {
          type: 'option',
          code: code,
          label: option?.label || option?.text || code,
          found: !!option
        };
      });
    } else if (column.source_type === 'nets' && column.included_net_ids?.length) {
      const allNets = await getAllQuestionNets(column.source_question_id);
      resolvedItems = column.included_net_ids.map(netId => {
        const net = allNets.data.combined.find(n => n.id === netId || n.uuid === netId);
        return {
          type: 'net',
          id: netId,
          label: net?.label || `Net ${netId}`,
          kind: net?.kind,
          found: !!net
        };
      });
    }

    return {
      ...column,
      resolved: true,
      question: {
        id: question.id,
        text: question.text,
        type: question.type
      },
      items: resolvedItems,
      itemCount: resolvedItems.length,
      validItems: resolvedItems.filter(item => item.found).length
    };
  } catch (error) {
    return {
      ...column,
      resolved: false,
      error: error.message
    };
  }
}

/**
 * Sync banner data with questions (check for deleted questions/options)
 */
export async function syncBannersWithQuestions(projectId) {
  try {
    console.log('🔄 Syncing banners with questions...');

    const bannersResult = await bannerManager.getBannerDefinitions(projectId);
    if (!bannersResult.success) return bannersResult;

    let syncCount = 0;
    let issueCount = 0;

    for (const banner of bannersResult.data) {
      for (const column of banner.banner_columns || []) {
        const question = findQuestionById(column.source_question_id);

        if (!question) {
          console.warn(`⚠️ Question ${column.source_question_id} not found for column ${column.column_id}`);
          issueCount++;

          // Optionally deactivate column
          await bannerManager.updateBannerColumn(column.id, { is_active: false });
          continue;
        }

        if (column.source_type === 'options') {
          const options = getQuestionOptions(question);
          const validCodes = options.map(opt => opt.code);
          const invalidCodes = column.included_codes?.filter(code => !validCodes.includes(code)) || [];

          if (invalidCodes.length > 0) {
            console.warn(`⚠️ Invalid codes in column ${column.column_id}:`, invalidCodes);
            issueCount++;

            // Remove invalid codes
            const validIncludedCodes = column.included_codes?.filter(code => validCodes.includes(code)) || [];
            await bannerManager.updateBannerColumn(column.id, {
              included_codes: validIncludedCodes
            });
            syncCount++;
          }
        }
      }
    }

    console.log(`✅ Banner sync complete: ${syncCount} updates, ${issueCount} issues found`);
    return { success: true, syncCount, issueCount };
  } catch (error) {
    console.error('❌ Error syncing banners:', error);
    return { success: false, error: error.message };
  }
}

// =========================
// EXPORT DEFAULT
// =========================
export default {
  // Question Integration
  findQuestionById,
  getAvailableQuestions,
  getQuestionOptionsForBanner,

  // Nets Integration
  getQuestionNets,
  getQuestionNetsFromDB,
  getAllQuestionNets,

  // Column Creation
  createColumnFromOptions,
  createColumnFromNets,

  // Utilities
  resolveBannerColumnData,
  syncBannersWithQuestions
};