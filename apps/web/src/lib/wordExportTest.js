/**
 * wordExportTest.js
 *
 * Test script to validate Word export functionality with sample data
 * This helps ensure the export system works correctly before production use
 */

import { exportToWord, downloadWordDocument } from './wordExporter.js';

// Sample test data matching your template examples
const SAMPLE_PROJECT = {
    id: 'test_project_001',
    name: 'Healthcare Provider Study',
    version: '1.0',
    status: 'Draft',
    client: 'Healthcare Research Inc.',
    notes: 'Study examining healthcare provider communication patterns regarding GLP-1 medication usage and side effects.'
};

const SAMPLE_QUESTIONS = [
    // Screener Questions
    {
        id: 'db_001',
        question_id: 'S1',
        question_text: 'What is your age?',
        question_mode: 'numeric',
        question_type: 'numeric_age',
        order_index: 1,
        numeric_enhanced_config: {
            type: 'dropdown',
            min: 18,
            max: 99
        },
        validation: {
            terminate_conditions: [{ operator: '<', value: 18 }]
        }
    },
    {
        id: 'db_002',
        question_id: 'S2',
        question_text: 'What is your gender? (Select one)',
        question_mode: 'list',
        question_type: 'single',
        order_index: 2,
        options: [
            { option_code: '1', option_label: 'Male', is_terminate: false },
            { option_code: '2', option_label: 'Female', is_terminate: false },
            { option_code: '3', option_label: 'Other', is_terminate: false },
            { option_code: '4', option_label: 'Prefer not to respond', is_terminate: true }
        ],
        validation: {
            terminate_conditions: [{ operator: 'in', values: ['1', '2'] }]
        }
    },
    {
        id: 'db_003',
        question_id: 'S3',
        question_text: 'Are you currently using any prescription medication to treat any of the following conditions? (Select all that apply)',
        question_mode: 'list',
        question_type: 'multi',
        order_index: 3,
        options: [
            { option_code: '1', option_label: 'Weight loss', is_terminate: false },
            { option_code: '2', option_label: 'Diabetes', is_terminate: false },
            { option_code: '3', option_label: 'Blood pressure', is_terminate: false },
            { option_code: '4', option_label: 'Cholesterol', is_terminate: false },
            { option_code: '5', option_label: 'Sleep disorders', is_terminate: false },
            { option_code: '6', option_label: 'None of the above (Exclusive, and anchor to bottom)', is_exclusive: true, anchor_position: 'bottom', is_terminate: true }
        ],
        randomization: {
            randomize_options: true,
            anchor_last: true
        },
        validation: {
            terminate_conditions: [{ operator: 'in', values: ['1', '2'] }]
        }
    },

    // Main Survey Questions
    {
        id: 'db_004',
        question_id: 'Q1a',
        question_text: 'How often are you seeing/talking to each of the following healthcare providers regarding your usage of GLP-1 medication, including any related side effects?',
        question_mode: 'table',
        question_type: 'single',
        order_index: 4,
        grid_config: {
            rows: [
                'HCP 1',
                'HCP 2',
                'HCP 3',
                'Etc.'
            ],
            cols: [
                'Once a week or more',
                '2-3 times a month',
                'Once a month',
                'Once every few months',
                'Less often'
            ]
        },
        conditions: {
            mode: 'show_if',
            logic: 'AND',
            rules: [{
                source_qid: 'S7_13',
                operator: '==',
                values: ['13']
            }, {
                source_qid: 'S7_14',
                operator: '==',
                values: ['14']
            }]
        }
    },
    {
        id: 'db_005',
        question_id: 'Q2',
        question_text: 'When discussing your GLP-1 medication with healthcare providers, what are the topics you discuss with each type of provider? (Select all that apply for each provider)',
        question_mode: 'table',
        question_type: 'multi',
        order_index: 5,
        grid_config: {
            columnSource: {
                qid: 'Q1',
                exclude: 'other'
            },
            rows: [
                'Writes GLP-1 scripts for me',
                'Generally manages follow ups with me after initial GLP-1 script is given',
                'Answers my questions regarding GLP-1 medication, including questions about side effects',
                'Discusses management of GLP-1 side effects/symptoms with me',
                'Recommends treatment options to me for side effect management of GLP-1s',
                'None of the above (ANCHOR, EXCLUSIVE)'
            ]
        },
        options: [
            { option_code: '6', option_label: 'None of the above', is_exclusive: true, anchor_position: 'bottom' }
        ]
    },

    // Text question example
    {
        id: 'db_006',
        question_id: 'Q4',
        question_text: 'You mentioned that you experienced <pipe in S7_13 and S7_14 based on what was selected> as a side effect from using <pipe in S4 1-14 response>. Where did you notice <pipe in S7_13 and S7_14 based on what was selected>, and how did you know it was related to using <pipe in S4 1-14 response>?',
        question_mode: 'open',
        question_type: 'text_area',
        order_index: 6,
        open_config: {
            limit_kind: 'characters',
            max: 1000
        },
        conditions: {
            mode: 'show_if',
            logic: 'OR',
            rules: [{
                source_qid: 'S7',
                operator: '==',
                values: ['13', '14']
            }]
        }
    }
];

/**
 * Tests the Word export functionality with sample data
 */
export async function testWordExport() {
    try {
        console.log('🧪 Starting Word export test...');

        // Load export templates
        const templateModule = await import('./wordExportTemplates.js');
        window.WordExportTemplates = {
            INSTRUCTION_TEMPLATES: templateModule.INSTRUCTION_TEMPLATES,
            QUESTION_TYPE_PROCESSORS: templateModule.QUESTION_TYPE_PROCESSORS,
            formatResponseOptions: templateModule.formatResponseOptions,
            formatConditionalLogic: templateModule.formatConditionalLogic,
            formatTableStructure: templateModule.formatTableStructure
        };

        // Generate the Word document
        const wordBlob = await exportToWord(SAMPLE_PROJECT, SAMPLE_QUESTIONS, {
            includeMetadata: true,
            includeConditionalLogic: true,
            includeValidation: true
        });

        // Generate test filename
        const filename = `test_questionnaire_export_${new Date().toISOString().slice(0, 10)}.rtf`;

        // Download the test file
        downloadWordDocument(wordBlob, filename);

        console.log('✅ Word export test completed successfully!');
        console.log(`📄 Test file downloaded as: ${filename}`);

        return {
            success: true,
            filename: filename,
            projectName: SAMPLE_PROJECT.name,
            questionCount: SAMPLE_QUESTIONS.length,
            screenerCount: SAMPLE_QUESTIONS.filter(q => q.question_id.startsWith('S')).length,
            mainCount: SAMPLE_QUESTIONS.filter(q => q.question_id.startsWith('Q')).length
        };

    } catch (error) {
        console.error('❌ Word export test failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Tests individual question type rendering
 */
export function testQuestionTypeRendering() {
    const results = {};

    SAMPLE_QUESTIONS.forEach(question => {
        try {
            const { QUESTION_TYPE_PROCESSORS } = window.WordExportTemplates || {};

            if (QUESTION_TYPE_PROCESSORS && QUESTION_TYPE_PROCESSORS[question.question_mode]) {
                const processor = QUESTION_TYPE_PROCESSORS[question.question_mode];
                const result = processor(question);

                results[question.question_id] = {
                    success: true,
                    mode: question.question_mode,
                    type: question.question_type,
                    instructions: result.instructions,
                    specialNotes: result.specialNotes
                };
            } else {
                results[question.question_id] = {
                    success: false,
                    error: 'No processor found for mode: ' + question.question_mode
                };
            }
        } catch (error) {
            results[question.question_id] = {
                success: false,
                error: error.message
            };
        }
    });

    console.log('🔍 Question type rendering test results:', results);
    return results;
}

/**
 * Runs all Word export tests
 */
export async function runAllWordExportTests() {
    console.log('🚀 Running complete Word export test suite...');

    // Test 1: Question type rendering
    console.log('\n📝 Testing question type rendering...');
    const renderingResults = testQuestionTypeRendering();

    // Test 2: Full Word export
    console.log('\n📄 Testing full Word document export...');
    const exportResult = await testWordExport();

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');

    const renderingSuccesses = Object.values(renderingResults).filter(r => r.success).length;
    const renderingTotal = Object.keys(renderingResults).length;

    console.log(`Question Rendering: ${renderingSuccesses}/${renderingTotal} passed`);
    console.log(`Word Export: ${exportResult.success ? 'PASSED' : 'FAILED'}`);

    if (exportResult.success) {
        console.log(`✅ Successfully exported ${exportResult.questionCount} questions`);
        console.log(`   - ${exportResult.screenerCount} screener questions`);
        console.log(`   - ${exportResult.mainCount} main survey questions`);
        console.log(`📁 File: ${exportResult.filename}`);
    } else {
        console.log(`❌ Export failed: ${exportResult.error}`);
    }

    return {
        renderingResults,
        exportResult,
        overall: renderingSuccesses === renderingTotal && exportResult.success
    };
}

// Export for console testing
window.testWordExport = testWordExport;
window.runAllWordExportTests = runAllWordExportTests;