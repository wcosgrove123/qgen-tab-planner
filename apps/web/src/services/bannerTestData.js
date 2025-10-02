/**
 * Banner Test Data and Validation
 * Tests the new banner data layer with sample data
 */

import bannerManager from './bannerManager.js';
import bannerSync from './bannerSync.js';

// =========================
// TEST DATA CREATION
// =========================

/**
 * Create sample banner with test data
 */
export async function createTestBanner(projectId) {
  try {
    console.log('🧪 Creating test banner for project:', projectId);

    // 1. Create banner definition
    const bannerResult = await bannerManager.createBannerDefinition({
      projectId: projectId,
      bannerName: 'Demographics_Test',
      bannerLabel: 'Demographics & Behavior',
      description: 'Test banner for demographics and behavior analysis',
      spssPrefix: 'DEMO_',
      orderIndex: 1,
      isActive: true
    });

    if (!bannerResult.success) {
      throw new Error(`Failed to create banner: ${bannerResult.error}`);
    }

    const bannerId = bannerResult.data.id;
    console.log('✅ Created test banner:', bannerId);

    return {
      success: true,
      bannerId,
      data: bannerResult.data
    };
  } catch (error) {
    console.error('❌ Error creating test banner:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add sample columns to test banner
 */
export async function addTestColumns(bannerId) {
  try {
    console.log('🧪 Adding test columns to banner:', bannerId);

    // Get available questions
    const questions = bannerSync.getAvailableQuestions();
    console.log('Available questions for testing:', questions.length);

    if (questions.length === 0) {
      console.warn('⚠️ No questions available for testing');
      return { success: true, columns: [], message: 'No questions available' };
    }

    const createdColumns = [];

    // Try to create columns from first few questions
    for (let i = 0; i < Math.min(3, questions.length); i++) {
      const question = questions[i];
      console.log(`Testing question ${i + 1}:`, question.id, question.text?.substring(0, 50));

      // Get options for this question
      const optionsResult = bannerSync.getQuestionOptionsForBanner(question.id);
      if (!optionsResult.success) {
        console.warn(`⚠️ Could not get options for ${question.id}:`, optionsResult.error);
        continue;
      }

      const options = optionsResult.data.options;
      if (options.length === 0) {
        console.warn(`⚠️ No options found for ${question.id}`);
        continue;
      }

      // Create column with first option
      const firstOption = options[0];
      const columnResult = await bannerSync.createColumnFromOptions({
        bannerId,
        questionId: question.id,
        selectedCodes: [firstOption.code],
        columnLabel: `${question.id}_${firstOption.label}`.substring(0, 30),
        columnId: `TEST_${question.id}_${firstOption.code}`
      });

      if (columnResult.success) {
        createdColumns.push(columnResult.data);
        console.log('✅ Created test column:', columnResult.data.column_id);
      } else {
        console.warn(`⚠️ Failed to create column for ${question.id}:`, columnResult.error);
      }
    }

    return {
      success: true,
      columns: createdColumns,
      message: `Created ${createdColumns.length} test columns`
    };
  } catch (error) {
    console.error('❌ Error adding test columns:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add test conditions to columns
 */
export async function addTestConditions(columnId, targetQuestionId) {
  try {
    console.log('🧪 Adding test condition to column:', columnId);

    // Get target question options
    const optionsResult = bannerSync.getQuestionOptionsForBanner(targetQuestionId);
    if (!optionsResult.success) {
      return { success: false, error: 'Target question not found' };
    }

    const options = optionsResult.data.options;
    if (options.length === 0) {
      return { success: false, error: 'No options in target question' };
    }

    // Create a simple condition using the first option
    const conditionResult = await bannerManager.createBannerCondition({
      columnId,
      conditionGroup: 'AND_1',
      conditionOrder: 0,
      targetQuestionId,
      targetType: 'codes',
      targetCodes: [options[0].code],
      targetNetIds: [],
      targetRangeMin: null,
      targetRangeMax: null,
      targetOperator: 'in'
    });

    if (conditionResult.success) {
      console.log('✅ Created test condition:', conditionResult.data);
    }

    return conditionResult;
  } catch (error) {
    console.error('❌ Error adding test condition:', error);
    return { success: false, error: error.message };
  }
}

// =========================
// VALIDATION FUNCTIONS
// =========================

/**
 * Validate banner data layer functionality
 */
export async function validateDataLayer(projectId) {
  console.log('🔍 Validating banner data layer...');

  const results = {
    projectId,
    timestamp: new Date().toISOString(),
    tests: [],
    passed: 0,
    failed: 0,
    summary: ''
  };

  // Test 1: Question Integration
  try {
    const questions = bannerSync.getAvailableQuestions();
    results.tests.push({
      name: 'Question Integration',
      status: questions.length > 0 ? 'PASS' : 'WARN',
      message: `Found ${questions.length} available questions`,
      data: { questionCount: questions.length }
    });
    if (questions.length > 0) results.passed++;
  } catch (error) {
    results.tests.push({
      name: 'Question Integration',
      status: 'FAIL',
      message: error.message,
      error: error
    });
    results.failed++;
  }

  // Test 2: Options Resolution
  try {
    const questions = bannerSync.getAvailableQuestions();
    if (questions.length > 0) {
      const testQuestion = questions[0];
      const optionsResult = bannerSync.getQuestionOptionsForBanner(testQuestion.id);

      results.tests.push({
        name: 'Options Resolution',
        status: optionsResult.success ? 'PASS' : 'FAIL',
        message: optionsResult.success
          ? `Resolved ${optionsResult.data.options.length} options for ${testQuestion.id}`
          : optionsResult.error,
        data: optionsResult.success ? optionsResult.data : null
      });

      if (optionsResult.success) results.passed++;
      else results.failed++;
    } else {
      results.tests.push({
        name: 'Options Resolution',
        status: 'SKIP',
        message: 'No questions available to test'
      });
    }
  } catch (error) {
    results.tests.push({
      name: 'Options Resolution',
      status: 'FAIL',
      message: error.message,
      error: error
    });
    results.failed++;
  }

  // Test 3: Nets Integration
  try {
    const questions = bannerSync.getAvailableQuestions();
    const questionsWithNets = questions.filter(q => q.hasNets);

    if (questionsWithNets.length > 0) {
      const testQuestion = questionsWithNets[0];
      const netsResult = await bannerSync.getAllQuestionNets(testQuestion.id);

      results.tests.push({
        name: 'Nets Integration',
        status: netsResult.success ? 'PASS' : 'FAIL',
        message: netsResult.success
          ? `Found ${netsResult.data.totalCount} nets for ${testQuestion.id}`
          : netsResult.error,
        data: netsResult.success ? netsResult.data : null
      });

      if (netsResult.success) results.passed++;
      else results.failed++;
    } else {
      results.tests.push({
        name: 'Nets Integration',
        status: 'SKIP',
        message: 'No questions with nets found'
      });
    }
  } catch (error) {
    results.tests.push({
      name: 'Nets Integration',
      status: 'FAIL',
      message: error.message,
      error: error
    });
    results.failed++;
  }

  // Test 4: Database Operations
  try {
    // Test banner creation
    const testBannerResult = await createTestBanner(projectId);

    if (testBannerResult.success) {
      // Test column creation
      const testColumnsResult = await addTestColumns(testBannerResult.bannerId);

      results.tests.push({
        name: 'Database Operations',
        status: testColumnsResult.success ? 'PASS' : 'FAIL',
        message: testColumnsResult.success
          ? `Created test banner with ${testColumnsResult.columns.length} columns`
          : testColumnsResult.error,
        data: {
          bannerId: testBannerResult.bannerId,
          columnCount: testColumnsResult.columns?.length || 0
        }
      });

      if (testColumnsResult.success) results.passed++;
      else results.failed++;

      // Cleanup test data
      await bannerManager.deleteBannerDefinition(testBannerResult.bannerId);
      console.log('🧹 Cleaned up test banner');
    } else {
      results.tests.push({
        name: 'Database Operations',
        status: 'FAIL',
        message: testBannerResult.error
      });
      results.failed++;
    }
  } catch (error) {
    results.tests.push({
      name: 'Database Operations',
      status: 'FAIL',
      message: error.message,
      error: error
    });
    results.failed++;
  }

  // Generate summary
  const total = results.passed + results.failed;
  results.summary = `${results.passed}/${total} tests passed`;

  console.log('🔍 Validation Results:', results.summary);
  results.tests.forEach(test => {
    const emoji = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${test.name}: ${test.message}`);
  });

  return results;
}

/**
 * Test banner data layer with current project
 */
export async function testWithCurrentProject() {
  const projectId = bannerManager.getCurrentProjectId();

  if (!projectId) {
    console.error('❌ No active project found');
    return { success: false, error: 'No active project' };
  }

  console.log('🧪 Testing banner data layer with project:', projectId);

  // Run validation
  const validationResults = await validateDataLayer(projectId);

  // Test sync functionality
  console.log('🔄 Testing sync functionality...');
  const syncResults = await bannerSync.syncBannersWithQuestions(projectId);

  return {
    success: true,
    projectId,
    validation: validationResults,
    sync: syncResults
  };
}

// =========================
// EXPORT DEFAULT
// =========================
export default {
  createTestBanner,
  addTestColumns,
  addTestConditions,
  validateDataLayer,
  testWithCurrentProject
};