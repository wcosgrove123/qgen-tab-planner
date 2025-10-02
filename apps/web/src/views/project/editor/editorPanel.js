/**
 * editorPanel.js
 * This module renders the main right-hand panel for editing a selected question,
 * fully replicating the functionality from the legacy index.html.
 */

// Add CSS for preset dropdown and utilities
if (!document.querySelector('style[data-editor-panel-styles]')) {
    const style = document.createElement('style');
    style.setAttribute('data-editor-panel-styles', 'true');
    style.textContent = `
        .is-hidden {
            display: none !important;
        }

        /* Advanced Options Panel - Modern & Professional */
        .advanced-options {
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                        opacity 0.3s ease,
                        padding 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                        margin 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 0 16px;
            margin-top: 0;
        }

        .advanced-options.is-hidden {
            max-height: 0 !important;
            opacity: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            border: none !important;
        }

        .advanced-options:not(.is-hidden) {
            max-height: 1000px;
            opacity: 1;
            padding: 20px;
            margin-top: 12px;
            background: var(--surface-0, white);
            border-radius: 12px;
            border: 1px solid var(--line, #e0e0e0);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        /* Option Settings Container */
        .option-settings-container {
            display: grid;
            gap: 24px;
        }

        .option-group-label-section,
        .option-behaviors-section {
            background: var(--surface-1, #fafafa);
            padding: 16px;
            border-radius: 8px;
            border: 1px solid var(--line, #e8e8e8);
        }

        .option-group-label-section label,
        .option-behaviors-section > label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: var(--fg, #333);
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Behavior Toggle Grid */
        .behavior-toggle-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }

        .behavior-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: var(--surface-0, white);
            border: 2px solid var(--line, #e0e0e0);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 13px;
            font-weight: 500;
        }

        .behavior-toggle:hover {
            border-color: var(--cue-primary, #212161);
            background: var(--surface-0, white);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .behavior-toggle.checked {
            background: var(--cue-gradient, linear-gradient(135deg, #FFE47A 0%, #F2B800 100%));
            border-color: var(--cue-primary, #212161);
            color: var(--cue-primary, #212161);
            font-weight: 600;
        }

        .behavior-toggle.compact-preferred {
            grid-column: span 1;
        }

        .behavior-toggle .icon {
            font-size: 16px;
        }

        /* Option Position Section */
        .option-position-section {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--line, #e8e8e8);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .option-position-section label {
            font-size: 13px;
            font-weight: 600;
            color: var(--fg, #666);
            margin-bottom: 0;
            text-transform: none;
        }

        /* Preset Dropdown Styles */
        .preset-dropdown {
            position: relative;
            display: inline-block;
        }

        .preset-menu {
            position: fixed;
            background: var(--surface-1);
            border: 1px solid var(--line);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            padding: 16px;
            min-width: 320px;
            max-width: 400px;
            max-height: 70vh;
            overflow-y: auto;
            z-index: 10000;
            opacity: 1;
            transform: translateY(0);
            transition: all 0.2s ease;
        }

        .preset-menu.is-hidden {
            opacity: 0;
            transform: translateY(-8px);
            pointer-events: none;
        }

        .preset-section {
            margin-bottom: 20px;
        }

        .preset-section:last-child {
            margin-bottom: 0;
        }

        .preset-section-header {
            font-size: 13px;
            font-weight: 600;
            color: var(--fg);
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--line);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .scale-points-selector {
            background: var(--surface-1);
            border: 1px solid var(--line);
            border-radius: 4px;
            color: var(--fg);
            font-size: 11px;
            padding: 2px 6px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .scale-points-selector:hover {
            border-color: var(--accent);
        }

        .scale-points-selector:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 2px var(--accent-weak);
        }

        .preset-quick-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 8px;
            margin-bottom: 12px;
        }

        .preset-quick-item {
            padding: 10px 12px;
            border: 1px solid var(--line);
            border-radius: 6px;
            background: var(--surface-1);
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 12px;
            text-align: center;
            min-height: 50px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }

        .preset-quick-item:hover {
            background: var(--accent-weak);
            border-color: var(--accent);
        }

        .preset-quick-item.selected {
            background: var(--accent-weak);
            border-color: var(--accent);
            color: var(--accent);
        }

        .preset-quick-item .checkbox {
            width: 14px;
            height: 14px;
            border: 1px solid var(--line);
            border-radius: 3px;
            margin-bottom: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
        }

        .preset-quick-item.selected .checkbox {
            background: var(--accent);
            border-color: var(--accent);
            color: white;
        }

        .preset-scale-item {
            padding: 12px;
            border: 1px solid var(--line);
            border-radius: 6px;
            background: var(--surface-1);
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .preset-scale-item:hover {
            background: var(--accent-weak);
            border-color: var(--accent);
        }

        .preset-scale-item.selected {
            background: var(--accent-weak);
            border-color: var(--accent);
        }

        .preset-scale-radio {
            width: 16px;
            height: 16px;
            border: 1px solid var(--line);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .preset-scale-item.selected .preset-scale-radio {
            border-color: var(--accent);
        }

        .preset-scale-item.selected .preset-scale-radio::after {
            content: '';
            width: 8px;
            height: 8px;
            background: var(--accent);
            border-radius: 50%;
        }

        .preset-scale-info {
            flex: 1;
        }

        .preset-scale-name {
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 4px;
        }

        .preset-scale-preview {
            font-size: 11px;
            color: var(--muted);
            line-height: 1.3;
        }

        .preset-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }

        .preset-count {
            background: var(--accent);
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: 600;
            margin-left: 4px;
        }

        /* Button States */
        .preset-actions .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .preset-actions .btn:not(:disabled):hover {
            background: var(--accent);
            color: white;
        }

        /* Scroll Behavior */
        .preset-menu::-webkit-scrollbar {
            width: 8px;
        }

        .preset-menu::-webkit-scrollbar-track {
            background: var(--surface-2, #f5f5f5);
            border-radius: 4px;
        }

        .preset-menu::-webkit-scrollbar-thumb {
            background: var(--line, #ccc);
            border-radius: 4px;
        }

        .preset-menu::-webkit-scrollbar-thumb:hover {
            background: var(--muted, #999);
        }

        /* Ensure content is scrollable */
        .preset-menu {
            -webkit-overflow-scrolling: touch; /* iOS smooth scrolling */
            scrollbar-width: thin; /* Firefox */
        }
    `;
    document.head.appendChild(style);
}

// Preset Data Structure
const presetData = {
    simple: {
        other: {
            code: 'other',
            label: 'Other (please specify)',
            short: 'Other\\n(specify)',
            anchor: 'bottom'
        },
        na: {
            code: 'na',
            label: 'N/A',
            short: 'N/A',
            exclusive: true
        },
        pns: {
            code: 'pns',
            label: 'Prefer not to say',
            short: 'Prefer not\\nto say',
            exclusive: true
        },
        dk: {
            code: 'dk',
            label: "I don't know",
            short: "I don't\\nknow",
            exclusive: true
        },
        all: {
            code: 'all',
            label: 'All of the above',
            short: 'All of the\\nabove',
            exclusive: true
        },
        none: {
            code: 'none',
            label: 'None of the above',
            short: 'None of the\\nabove',
            exclusive: true
        }
    },
    scaleTypes: {
        agreement: {
            name: 'Agreement Scale',
            description: 'Disagree to Agree scale',
            points: {
                3: [
                    { code: '1', label: 'Disagree' },
                    { code: '2', label: 'Neither' },
                    { code: '3', label: 'Agree' }
                ],
                5: [
                    { code: '1', label: 'Strongly Disagree' },
                    { code: '2', label: 'Disagree' },
                    { code: '3', label: 'Neither' },
                    { code: '4', label: 'Agree' },
                    { code: '5', label: 'Strongly Agree' }
                ],
                7: [
                    { code: '1', label: 'Strongly Disagree' },
                    { code: '2', label: 'Disagree' },
                    { code: '3', label: 'Somewhat Disagree' },
                    { code: '4', label: 'Neither' },
                    { code: '5', label: 'Somewhat Agree' },
                    { code: '6', label: 'Agree' },
                    { code: '7', label: 'Strongly Agree' }
                ],
                10: [
                    { code: '1', label: '1 - Strongly Disagree' },
                    { code: '2', label: '2' },
                    { code: '3', label: '3' },
                    { code: '4', label: '4' },
                    { code: '5', label: '5' },
                    { code: '6', label: '6' },
                    { code: '7', label: '7' },
                    { code: '8', label: '8' },
                    { code: '9', label: '9' },
                    { code: '10', label: '10 - Strongly Agree' }
                ]
            }
        },
        satisfaction: {
            name: 'Satisfaction Scale',
            description: 'Dissatisfied to Satisfied scale',
            points: {
                3: [
                    { code: '1', label: 'Dissatisfied' },
                    { code: '2', label: 'Neither' },
                    { code: '3', label: 'Satisfied' }
                ],
                5: [
                    { code: '1', label: 'Very Dissatisfied' },
                    { code: '2', label: 'Dissatisfied' },
                    { code: '3', label: 'Neither' },
                    { code: '4', label: 'Satisfied' },
                    { code: '5', label: 'Very Satisfied' }
                ],
                7: [
                    { code: '1', label: 'Very Dissatisfied' },
                    { code: '2', label: 'Dissatisfied' },
                    { code: '3', label: 'Somewhat Dissatisfied' },
                    { code: '4', label: 'Neither' },
                    { code: '5', label: 'Somewhat Satisfied' },
                    { code: '6', label: 'Satisfied' },
                    { code: '7', label: 'Very Satisfied' }
                ],
                10: [
                    { code: '1', label: '1 - Very Dissatisfied' },
                    { code: '2', label: '2' },
                    { code: '3', label: '3' },
                    { code: '4', label: '4' },
                    { code: '5', label: '5' },
                    { code: '6', label: '6' },
                    { code: '7', label: '7' },
                    { code: '8', label: '8' },
                    { code: '9', label: '9' },
                    { code: '10', label: '10 - Very Satisfied' }
                ]
            }
        },
        frequency: {
            name: 'Frequency Scale',
            description: 'Never to Always frequency scale',
            points: {
                3: [
                    { code: '1', label: 'Never' },
                    { code: '2', label: 'Sometimes' },
                    { code: '3', label: 'Always' }
                ],
                5: [
                    { code: '1', label: 'Never' },
                    { code: '2', label: 'Rarely' },
                    { code: '3', label: 'Sometimes' },
                    { code: '4', label: 'Often' },
                    { code: '5', label: 'Always' }
                ],
                7: [
                    { code: '1', label: 'Never' },
                    { code: '2', label: 'Very Rarely' },
                    { code: '3', label: 'Rarely' },
                    { code: '4', label: 'Sometimes' },
                    { code: '5', label: 'Often' },
                    { code: '6', label: 'Very Often' },
                    { code: '7', label: 'Always' }
                ],
                10: [
                    { code: '1', label: '1 - Never' },
                    { code: '2', label: '2' },
                    { code: '3', label: '3' },
                    { code: '4', label: '4' },
                    { code: '5', label: '5' },
                    { code: '6', label: '6' },
                    { code: '7', label: '7' },
                    { code: '8', label: '8' },
                    { code: '9', label: '9' },
                    { code: '10', label: '10 - Always' }
                ]
            }
        },
        importance: {
            name: 'Importance Scale',
            description: 'Not Important to Very Important scale',
            points: {
                3: [
                    { code: '1', label: 'Not Important' },
                    { code: '2', label: 'Somewhat Important' },
                    { code: '3', label: 'Very Important' }
                ],
                5: [
                    { code: '1', label: 'Not at all Important' },
                    { code: '2', label: 'Slightly Important' },
                    { code: '3', label: 'Moderately Important' },
                    { code: '4', label: 'Very Important' },
                    { code: '5', label: 'Extremely Important' }
                ],
                7: [
                    { code: '1', label: 'Not at all Important' },
                    { code: '2', label: 'Low Importance' },
                    { code: '3', label: 'Slightly Important' },
                    { code: '4', label: 'Moderately Important' },
                    { code: '5', label: 'Very Important' },
                    { code: '6', label: 'High Importance' },
                    { code: '7', label: 'Extremely Important' }
                ],
                10: [
                    { code: '1', label: '1 - Not Important' },
                    { code: '2', label: '2' },
                    { code: '3', label: '3' },
                    { code: '4', label: '4' },
                    { code: '5', label: '5' },
                    { code: '6', label: '6' },
                    { code: '7', label: '7' },
                    { code: '8', label: '8' },
                    { code: '9', label: '9' },
                    { code: '10', label: '10 - Very Important' }
                ]
            }
        }
    }
};

// Import conditional logic components
import { renderConditionalLogicPanel, setupConditionalLogicHandlers } from '../../../components/conditionalLogicPanel.js';
import { createDefaultConditions, createEmptyConditionRule } from '../../../lib/conditionalLogic.js';
// Import sidebar update utility
import { updateSidebarQuestionText } from './questionList.js';
// Import tab plan components
import { renderTabPlanPanel } from './tabPlanPanel.js';

// Import validation utilities
import { validateField, runQuestionValidation, buildMockResponses } from '../../../lib/validation.js';

// Import Supabase for direct group operations
import supabase from '../../../lib/supa.js';
import { renderFieldValidation } from '../validation/validationPanel.js';

// Import library functionality

import { showSaveQuestionModal } from '../library/saveQuestionModal.js';

// Import table modules
import { syncTableFacets, getTableVariationName, updateTableVariation, ensureTableGrid } from './modules/tableCore.js';
import { getTableActions, setupLegacyTableHelpers } from './modules/tableActions.js';
import { validateTableQuestion, getTableValidationSummary } from './modules/tableValidation.js';

// Import termination logic modules
import { renderGlobalTermination, renderGlobalMustSelect } from './modules/terminationBuilder.js';
import { getTerminationActions } from './modules/terminationActions.js';

// --- PRESET RENDERING FUNCTIONS ---

function renderPresetMenu() {
    return `
        <div class="preset-menu is-hidden" data-preset-menu>
            <!-- Quick Options Section -->
            <div class="preset-section">
                <div class="preset-section-header">Quick Options</div>
                <div class="preset-quick-grid">
                    ${Object.entries(presetData.simple).map(([key, preset]) => `
                        <div class="preset-quick-item" data-action="toggle-simple-preset" data-preset-key="${key}">
                            <div class="checkbox"></div>
                            <div style="white-space: pre-line;">${preset.short}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="preset-actions">
                    <button class="btn ghost" data-action="add-selected-presets" style="padding: 6px 12px; font-size: 12px; opacity: 0.6;" disabled>
                        + Add Selected<span class="preset-count is-hidden">0</span>
                    </button>
                </div>
            </div>

            <!-- Rating Scales Section -->
            <div class="preset-section">
                <div class="preset-section-header">
                    <span>Rating Scales</span>
                    <select class="scale-points-selector" data-action="change-scale-points" style="margin-left: 8px; padding: 2px 6px; font-size: 11px;">
                        <option value="3">3 pt</option>
                        <option value="5" selected>5 pt</option>
                        <option value="7">7 pt</option>
                        <option value="10">10 pt</option>
                    </select>
                </div>
                <div class="scale-types-container">
                    ${Object.entries(presetData.scaleTypes).map(([typeKey, scaleType]) => `
                        <div class="preset-scale-type" data-scale-type="${typeKey}">
                            <div class="preset-scale-item" data-action="select-scale-preset" data-scale-type="${typeKey}" data-points="5">
                                <div class="preset-scale-radio"></div>
                                <div class="preset-scale-info">
                                    <div class="preset-scale-name">${scaleType.name}</div>
                                    <div class="preset-scale-preview">${scaleType.points[5] ? scaleType.points[5].map(option => option.label).join(' • ') : 'No 5pt scale available'}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="preset-actions">
                    <button class="btn" data-action="apply-selected-scale" style="padding: 6px 12px; font-size: 12px; opacity: 0.6;" disabled>
                        Replace All Options
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- UTILITY & HELPER FUNCTIONS ---

/**
 * Detects Likert scale type from column labels
 */
function detectLikertType(cols) {
    if (!cols || cols.length === 0) return 'custom';

    const colText = cols.join(' ').toLowerCase();

    // Agreement patterns
    if (colText.includes('disagree') && colText.includes('agree')) {
        return 'agreement';
    }

    // Satisfaction patterns
    if (colText.includes('dissatisfied') && colText.includes('satisfied')) {
        return 'satisfaction';
    }

    // Frequency patterns
    if ((colText.includes('never') && colText.includes('always')) ||
        (colText.includes('rarely') && colText.includes('frequently'))) {
        return 'frequency';
    }

    // Importance patterns
    if (colText.includes('important')) {
        return 'importance';
    }

    return 'custom';
}

/**
 * Detects if columns follow a Likert scale pattern
 */
function detectLikertColumnPattern(cols) {
    if (!cols || cols.length < 3) return false;

    const colText = cols.join(' ').toLowerCase();

    // Common Likert patterns
    const likertPatterns = [
        ['disagree', 'agree'],
        ['dissatisfied', 'satisfied'],
        ['never', 'always'],
        ['rarely', 'frequently'],
        ['poor', 'excellent'],
        ['important'],
        ['likely'],
        ['neither', 'neutral']
    ];

    return likertPatterns.some(pattern =>
        pattern.every(keyword => colText.includes(keyword))
    );
}

/**
 * Detects and updates hybrid table combinations
 */
function detectAndUpdateHybridTable(question, questionIndex, actions) {
    const advTable = question.advancedTable || {};
    const hasRowSource = advTable.rowSource?.qid;
    const hasColSource = advTable.colSource?.qid;
    const hasLikertCols = detectLikertColumnPattern(advTable.cols || []);
    const hasLikertRows = detectLikertColumnPattern(advTable.rows || []);

    let hybridType = null;
    let metadata = null;

    // Case 1: Row source + Likert columns
    if (hasRowSource && hasLikertCols) {
        const scalePoints = advTable.cols.length;
        const likertType = detectLikertType(advTable.cols);
        const sourceMode = advTable.rowSource.mode || 'selected';

        hybridType = `hybrid_rows_${sourceMode}_likert_${likertType}_${scalePoints}`;
        metadata = {
            base_type: 'hybrid',
            hybrid_type: `rows_${sourceMode}_likert`,
            likert_subtype: likertType,
            scale_points: scalePoints,
            auto_nets: scalePoints === 3 ? [] :
                      scalePoints === 5 ? ['T2B', 'B2B'] : ['T3B', 'B3B'],
            spss_variable_type: 'ordinal',
            source_config: {
                rows: { mode: sourceMode, source_qid: advTable.rowSource.qid },
                columns: { mode: 'preset', preset_id: `${likertType}_${scalePoints}pt` }
            }
        };
    }

    // Case 2: Column source + Likert rows (future expansion)
    else if (hasColSource && hasLikertRows) {
        const scalePoints = advTable.rows.length;
        const likertType = detectLikertType(advTable.rows);
        const sourceMode = advTable.colSource.mode || 'selected';

        hybridType = `hybrid_cols_${sourceMode}_likert_${likertType}_${scalePoints}`;
        metadata = {
            base_type: 'hybrid',
            hybrid_type: `cols_${sourceMode}_likert`,
            likert_subtype: likertType,
            scale_points: scalePoints,
            auto_nets: scalePoints === 3 ? [] :
                      scalePoints === 5 ? ['T2B', 'B2B'] : ['T3B', 'B3B'],
            spss_variable_type: 'ordinal',
            source_config: {
                rows: { mode: 'preset', preset_id: `${likertType}_${scalePoints}pt` },
                columns: { mode: sourceMode, source_qid: advTable.colSource.qid }
            }
        };
    }

    // Case 3: Multi-Matrix (Both row and column sources, no Likert)
    else if (hasRowSource && hasColSource && !hasLikertCols && !hasLikertRows) {
        const rowMode = advTable.rowSource.mode || 'selected';
        const colMode = advTable.colSource.mode || 'selected';

        hybridType = `multimatrix_${rowMode}_${colMode}`;
        metadata = {
            base_type: 'multimatrix',
            multi_type: `${rowMode}_${colMode}`,
            spss_variable_type: 'nominal',
            source_config: {
                rows: { mode: rowMode, source_qid: advTable.rowSource.qid },
                columns: { mode: colMode, source_qid: advTable.colSource.qid }
            }
        };
    }

    // Apply hybrid classification if detected
    if (hybridType) {
        question.question_type = 'table';  // Always table
        question.question_mode = 'advanced_table';  // Hybrid tables are advanced
        question.table_type = hybridType;  // Complex hybrid code goes in table_type
        question.table_metadata = metadata;  // Rich metadata for SPSS integration

        // Save to database
        actions.onUpdateQuestion(questionIndex, 'question_type', question.question_type);
        actions.onUpdateQuestion(questionIndex, 'question_mode', question.question_mode);
        actions.onUpdateQuestion(questionIndex, 'table_type', question.table_type);
        actions.onUpdateQuestion(questionIndex, 'table_metadata', question.table_metadata);

        console.log('🔗 Detected and classified hybrid table:', {
            questionId: question.id,
            table_type: hybridType
        });

        return true; // Hybrid detected and applied
    }

    return false; // No hybrid detected
}

/**
 * Gets the symbol for terminate conditions
 */
function getTerminateSymbol(condition) {
    switch (condition) {
        case 'gt': return '>';
        case 'lt': return '<';
        case 'gte': return '≥';
        case 'lte': return '≤';
        case 'equals': return '=';
        case 'between': return 'between';
        default: return '';
    }
}

/**
 * Creates a collapsible section component
 * @param {Object} options - Section configuration
 * @returns {string} HTML for the collapsible section
 */
function createCollapsibleSection({
    id,
    title,
    content,
    expanded = false,
    alwaysExpanded = false,
    statusBadge = null,
    icon = null,
    headerActions = null
}) {
    const expandedClass = expanded || alwaysExpanded ? 'expanded' : '';
    const alwaysExpandedClass = alwaysExpanded ? 'always-expanded' : '';

    return `
        <div class="collapsible-section ${expandedClass} ${alwaysExpandedClass}" data-section-id="${id}">
            <div class="collapsible-header" ${!alwaysExpanded ? 'data-action="toggle-section"' : ''}>
                <div class="collapsible-title">
                    ${!alwaysExpanded ? '<span class="collapsible-arrow">▶</span>' : ''}
                    ${icon ? `<span class="section-icon">${icon}</span>` : ''}
                    <span>${title}</span>
                    ${statusBadge ? `<span class="section-status-badge ${statusBadge.count > 0 ? '' : 'empty'}">${statusBadge.count}</span>` : ''}
                </div>
                ${headerActions ? `<div class="collapsible-header-actions" onclick="event.stopPropagation()">${headerActions}</div>` : ''}
            </div>
            <div class="collapsible-content">
                <div class="collapsible-inner">
                    ${content}
                </div>
            </div>
        </div>
    `;
}

/**
 * Gets status information for different sections
 */
function getSectionStatus(question, sectionType) {
    switch (sectionType) {
        case 'logic':
            const hasConditions = question.conditions?.mode !== 'none' && question.conditions?.rules?.length > 0;
            return {
                count: hasConditions ? question.conditions.rules.length : 0,
                text: hasConditions ? `${question.conditions.rules.length} rule${question.conditions.rules.length > 1 ? 's' : ''}` : 'No rules'
            };

        case 'settings':
            let settingsCount = 0;
            if (question.notes) settingsCount++;
            if (question.required) settingsCount++;
            if (question.randomization?.mode !== 'none') settingsCount++;
            return {
                count: settingsCount,
                text: settingsCount > 0 ? `${settingsCount} setting${settingsCount > 1 ? 's' : ''}` : 'Default settings'
            };

        case 'advanced':
            let advancedCount = 0;
            if (question.numeric?.globalTerminate?.enabled) advancedCount++;
            if (question.terminationLogic?.enabled) advancedCount++;
            if (question.validation) advancedCount++;
            return {
                count: advancedCount,
                text: advancedCount > 0 ? `${advancedCount} feature${advancedCount > 1 ? 's' : ''}` : 'No advanced features'
            };

        default:
            return { count: 0, text: '' };
    }
}

/**
 * Toggles advanced panel and sets up proper click-outside-to-close behavior
 */
function toggleAdvancedPanel(targetId) {
    const panel = document.getElementById(targetId);
    if (!panel) return;

    const isCurrentlyHidden = panel.classList.contains('is-hidden');
    console.log('Toggle advanced panel:', targetId, 'Currently hidden?', isCurrentlyHidden);

    // Close all other advanced panels first
    document.querySelectorAll('.advanced-options').forEach(p => {
        if (p !== panel) p.classList.add('is-hidden');
    });

    // Toggle the target panel (CSS handles smooth animation via max-height/opacity)
    if (isCurrentlyHidden) {
        console.log('Opening panel with smooth animation');
        panel.classList.remove('is-hidden');
        // Force reflow to ensure animation plays
        void panel.offsetHeight;
    } else {
        console.log('Closing panel with smooth animation');
        panel.classList.add('is-hidden');
    }

    // If we just opened the panel, set up click-outside-to-close
    if (isCurrentlyHidden && !panel.classList.contains('is-hidden')) {
        // Remove any existing listeners to prevent duplicates
        if (window.currentAdvancedCloseHandler) {
            document.removeEventListener('click', window.currentAdvancedCloseHandler);
        }

        // Create new click-outside handler
        window.currentAdvancedCloseHandler = (e) => {
            // Don't close if clicking inside the panel, its children, OR the toggle button
            const isToggleButton = e.target.closest('[data-action="toggle-advanced"]');
            const isInsidePanel = panel.contains(e.target);
            const isInsideAnyAdvancedPanel = e.target.closest('.advanced-options');

            if (!isInsidePanel && !isToggleButton && !isInsideAnyAdvancedPanel) {
                console.log('Closing panel due to click outside');
                panel.classList.add('is-hidden');
                document.removeEventListener('click', window.currentAdvancedCloseHandler);
                window.currentAdvancedCloseHandler = null;
            }
        };

        // Add the handler on next tick to avoid catching the current click
        setTimeout(() => {
            if (window.currentAdvancedCloseHandler) {
                document.addEventListener('click', window.currentAdvancedCloseHandler);
                console.log('Click-outside handler attached');
            }
        }, 0);
    }
}

/**
 * Cleans bulk text by removing common numbering patterns
 */
function cleanBulkText(text) {
    return text.split('\n')
        .map(line => {
            let cleaned = line.trim();

            // Remove common numbering patterns:
            // 1), 2), 3)...
            // 1., 2., 3....
            // A), B), C)...
            // A., B., C....
            // a), b), c)...
            // a., b., c....
            // 1 - option, 2 - option...
            // • option, - option, * option (bullet points)

            cleaned = cleaned.replace(/^(\d+[\)\.]\s*)/, '');        // 1) or 1.
            cleaned = cleaned.replace(/^([A-Z][\)\.]\s*)/, '');      // A) or A.
            cleaned = cleaned.replace(/^([a-z][\)\.]\s*)/, '');      // a) or a.
            cleaned = cleaned.replace(/^(\d+\s*[-–—]\s*)/, '');      // 1 - or 1 –
            cleaned = cleaned.replace(/^([A-Za-z]\s*[-–—]\s*)/, ''); // A - or a -
            cleaned = cleaned.replace(/^[•\-\*]\s*/, '');            // bullet points
            cleaned = cleaned.replace(/^(\(\d+\)\s*)/, '');         // (1) format
            cleaned = cleaned.replace(/^(\([A-Za-z]\)\s*)/, '');    // (A) or (a) format

            return cleaned;
        })
        .filter(line => line.length > 0)  // Remove empty lines
        .join('\n');
}

/**
 * Shows bulk add options modal
 */
function showBulkAddModal(questionIndex, actions) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div class="modal-content" style="background: var(--surface-1); border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--line);">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Bulk Add Options</h3>
                <button class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--muted); padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px;" title="Close">×</button>
            </div>

            <div class="modal-body">
                <label style="display: block; font-weight: 500; margin-bottom: 8px; color: var(--text-1);">Enter options (one per line):</label>
                <textarea id="bulk-options-input"
                    placeholder="Type or paste your options here:&#10;1) Option 1&#10;2) Option 2&#10;3) Option 3&#10;&#10;Numbering will be automatically removed!"
                    style="width: 100%; height: 200px; padding: 12px; border: 1px solid var(--line); border-radius: 8px; font-family: inherit; font-size: 14px; line-height: 1.5; resize: vertical; background: var(--surface-2);"
                ></textarea>
                <div style="margin-top: 8px; font-size: 12px; color: var(--muted);">
                    💡 Tip: Paste from surveys, Excel, Word, etc. Numbering like "1)", "A.", "•" will be automatically removed.
                </div>
            </div>

            <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line);">
                <button class="btn ghost modal-cancel" style="padding: 8px 16px;">Cancel</button>
                <button class="btn modal-add" style="padding: 8px 16px;">Add Options</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const textarea = modal.querySelector('#bulk-options-input');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');
    const addBtn = modal.querySelector('.modal-add');

    // Focus the textarea
    setTimeout(() => textarea.focus(), 100);

    // Close handlers
    const closeModal = () => modal.remove();
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    modal.onclick = (e) => e.target === modal && closeModal();

    // Add options handler
    addBtn.onclick = () => {
        const text = textarea.value.trim();
        if (text) {
            // Clean the text by removing common numbering patterns
            const cleanedText = cleanBulkText(text);
            actions.onBulkAddOptions(questionIndex, cleanedText);
            closeModal();
        }
    };

    // Allow Ctrl/Cmd+Enter to submit
    textarea.onkeydown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            addBtn.click();
        }
    };
}

/**
 * Shows bulk add modal for advanced table rows or columns (reuses the same modal as item/list bulk add)
 */
function showAdvancedTableBulkModal(questionIndex, actions, type) {
    const isRows = type === 'rows';
    const title = isRows ? 'Bulk Add Rows' : 'Bulk Add Columns';
    const placeholder = isRows
        ? 'Type or paste your row statements here:\n1) Row statement 1\n2) Row statement 2\n3) Row statement 3\n\nNumbering will be automatically removed!'
        : 'Type or paste your column headers here:\n1) Column header 1\n2) Column header 2\n3) Column header 3\n\nNumbering will be automatically removed!';

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div class="modal-content" style="background: var(--surface-1); border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--line);">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${title}</h3>
                <button class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--muted); padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px;" title="Close">×</button>
            </div>

            <div class="modal-body">
                <label style="display: block; font-weight: 500; margin-bottom: 8px; color: var(--text-1);">Enter ${isRows ? 'rows' : 'columns'} (one per line):</label>
                <textarea id="bulk-advanced-input"
                    placeholder="${placeholder}"
                    style="width: 100%; height: 200px; padding: 12px; border: 1px solid var(--line); border-radius: 8px; font-family: inherit; font-size: 14px; line-height: 1.5; resize: vertical; background: var(--surface-2);"
                ></textarea>
                <div style="margin-top: 8px; font-size: 12px; color: var(--muted);">
                    💡 Tip: Paste from surveys, Excel, Word, etc. Numbering like "1)", "A.", "•" will be automatically removed.
                </div>
            </div>

            <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line);">
                <button class="btn ghost modal-cancel" style="padding: 8px 16px;">Cancel</button>
                <button class="btn modal-add" style="padding: 8px 16px;">Add ${isRows ? 'Rows' : 'Columns'}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const textarea = modal.querySelector('#bulk-advanced-input');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');
    const addBtn = modal.querySelector('.modal-add');

    // Focus the textarea
    setTimeout(() => textarea.focus(), 100);

    const closeModal = () => {
        document.body.removeChild(modal);
    };

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    modal.onclick = (e) => e.target === modal && closeModal();

    // Add handler
    addBtn.onclick = () => {
        const text = textarea.value.trim();
        if (text) {
            // Clean the text by removing common numbering patterns
            const cleanedText = cleanBulkText(text);
            const question = window.state.questions[questionIndex];

            if (!question.advancedTable) question.advancedTable = { rows: [], cols: [] };

            const lines = cleanedText.split('\n').filter(line => line.trim());
            const cleanedLines = lines.map(line => line.trim()).filter(line => line.length > 0);

            if (isRows) {
                question.advancedTable.rows.push(...cleanedLines);
            } else {
                question.advancedTable.cols.push(...cleanedLines);
            }

            // Update the question
            actions.onUpdateQuestion(questionIndex, 'advancedTable', question.advancedTable);
            closeModal();
        }
    };

    // Allow Ctrl/Cmd+Enter to submit
    textarea.onkeydown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            addBtn.click();
        }
    };
}

/**
 * Shows medication group setup modal for complex medication questions
 */
function showMedicationGroupSetup(questionIndex, actions) {
    // Store for use in helper functions
    window.currentQuestionIndex = questionIndex;
    window.medicationGroupActions = actions;

    const question = window.state?.questions?.[questionIndex];
    if (!question) {
        console.error('Question not found at index:', questionIndex);
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';

    // Get existing groups - use stored groups array, fallback to scanning options
    const existingGroups = {};

    console.log('=== GROUP LOADING DEBUG ===');
    console.log('Question object:', question);
    console.log('Question groups array:', question?.groups);
    console.log('Question options with groups:', question?.options?.filter(opt => opt.medicationGroup));
    console.log('All options medication groups:', question?.options?.map(opt => ({ label: opt.label, medicationGroup: opt.medicationGroup })));

    // First, load groups from the stored groups array (preserves empty groups)
    if (question.groups && question.groups.length > 0) {
        question.groups.forEach(group => {
            existingGroups[group.name] = [];
            console.log(`Loaded stored group: "${group.name}" (created: ${group.created})`);
        });
        console.log('Loaded groups from stored array:', Object.keys(existingGroups));
    } else {
        console.log('No stored groups found in question.groups array');
    }

    // Then populate with current options (handles legacy data)
    if (question.options) {
        question.options.forEach(option => {
            if (option.medicationGroup) {
                if (!existingGroups[option.medicationGroup]) {
                    existingGroups[option.medicationGroup] = [];
                    console.log(`Created group from option: "${option.medicationGroup}"`);
                }
                existingGroups[option.medicationGroup].push(option);
                console.log(`Added option "${option.label}" to group "${option.medicationGroup}"`);
            }
        });
    }

    console.log('Final existing groups:', Object.keys(existingGroups));
    console.log('=== END GROUP LOADING DEBUG ===');

    modal.innerHTML = `
        <div class="modal-panel" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3>Setup Option Groups</h3>
                <button class="icon-btn" onclick="this.closest('.modal').remove()" aria-label="Close">✕</button>
            </div>
            <div class="modal-body">
                <p>Group related options together (e.g., generic and brand name medications). Respondents can select multiple options from the same group without triggering termination.</p>

                <div class="groups-container" id="groups-container" data-needs-cleanup>
                    ${Object.keys(existingGroups).map(groupName => renderGroupEditor(groupName, existingGroups[groupName], question.options)).join('')}
                </div>

                <div class="add-group-section" style="margin-top: 16px; padding: 12px; border: 1px dashed var(--line); border-radius: 8px; text-align: center;">
                    <button class="btn ghost" onclick="addNewGroup()">Add New Group</button>
                </div>

                <div class="termination-settings" style="margin-top: 16px; padding: 12px; background: var(--surface-3); border-radius: 8px;">
                    <h4>Termination Logic</h4>
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="enable-termination" ${question.terminationLogic?.enabled ? 'checked' : ''}>
                        Enable termination if multiple groups selected
                    </label>
                    <div id="termination-details" style="margin-top: 8px; ${question.terminationLogic?.enabled ? '' : 'display: none;'}">
                        <label style="font-size: 13px;">Apply to options:
                            <input type="number" id="termination-start" value="${question.terminationLogic?.glp1OptionRange?.[0] || 1}" min="1" style="width: 60px;">
                            to
                            <input type="number" id="termination-end" value="${question.terminationLogic?.glp1OptionRange?.[1] || 14}" min="1" style="width: 60px;">
                        </label>
                        <p style="font-size: 12px; color: var(--muted); margin-top: 4px;">
                            Respondents will be terminated if they select options from multiple groups within this range.
                        </p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn ghost" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn primary" onclick="applyMedicationGroups(${questionIndex}); this.closest('.modal').remove();">Apply Groups</button>
            </div>
        </div>
        <div class="modal-backdrop" onclick="this.closest('.modal').remove()"></div>
    `;

    document.body.appendChild(modal);
    console.log('Modal created and added to DOM:', modal);
    console.log('Modal classes:', modal.className);

    // 🔍 DEBUG: Try to find and directly attach listeners to buttons
    setTimeout(() => {
        const addButtons = modal.querySelectorAll('.add-to-group-btn');
        console.log('🔍 DIRECT BUTTON TEST: Found', addButtons.length, 'add buttons');

        addButtons.forEach((btn, i) => {
            console.log(`🔍 Button ${i}: text="${btn.textContent}", groupId="${btn.dataset.groupId}"`);

            // Add direct click handler to bypass event delegation issues
            btn.addEventListener('click', (e) => {
                console.log('🔥🔥🔥 DIRECT BUTTON CLICK DETECTED!', e.target);
                e.preventDefault();
                e.stopPropagation();

                const groupId = e.target.dataset.groupId;
                const selectElement = e.target.previousElementSibling;
                const optionLabel = selectElement?.value;

                console.log('Direct button click data:', { groupId, optionLabel });

                if (optionLabel && optionLabel.trim() !== '') {
                    const groupEditor = e.target.closest('.group-editor');
                    const currentGroupName = groupEditor?.dataset.groupName || groupId;
                    console.log('Calling addToGroup directly:', currentGroupName, optionLabel);
                    window.addToGroup(currentGroupName, optionLabel);
                } else {
                    console.log('❌ No option selected in dropdown');
                }
            });
        });
    }, 500);

    // Set up termination toggle
    modal.querySelector('#enable-termination').addEventListener('change', (e) => {
        const details = modal.querySelector('#termination-details');
        details.style.display = e.target.checked ? 'block' : 'none';
    });

    // Add real-time saving for group name inputs using debounced pattern
    let groupNameTimeouts = {};
    modal.addEventListener('input', (e) => {
        if (e.target.classList.contains('group-name-input')) {
            const input = e.target;
            const groupEditor = input.closest('.group-editor');
            const oldGroupName = groupEditor.dataset.groupName;
            const newGroupName = input.value.trim();

            // Update the group editor data attribute immediately for UI consistency
            groupEditor.dataset.groupName = newGroupName || oldGroupName;

            // Only process if there's a meaningful change
            if (newGroupName && newGroupName !== oldGroupName && newGroupName.length > 0) {
                // Update data immediately (no re-render)
                const question = window.state.questions[questionIndex];

                // Update all options with this group name
                question.options.forEach(option => {
                    if (option.medicationGroup === oldGroupName) {
                        option.medicationGroup = newGroupName;
                    }
                });

                // Update the groups array
                if (question.groups) {
                    const group = question.groups.find(g => g.name === oldGroupName);
                    if (group) {
                        group.name = newGroupName;
                    }
                }

                // Debounce save operation (2 second delay) - use current group name as key
                const timeoutKey = `groupName-${newGroupName}`;

                // Clear any existing timeout for this group
                Object.keys(groupNameTimeouts).forEach(key => {
                    if (key.startsWith('groupName-')) {
                        clearTimeout(groupNameTimeouts[key]);
                        delete groupNameTimeouts[key];
                    }
                });

                groupNameTimeouts[timeoutKey] = setTimeout(() => {
                    // Save to Supabase
                    if (actions && actions.onUpdateQuestion) {
                        console.log('Saving group name change to database...', newGroupName);
                        actions.onUpdateQuestion(questionIndex, 'options', question.options);
                        actions.onUpdateQuestion(questionIndex, 'groups', question.groups);
                    }
                    delete groupNameTimeouts[timeoutKey];
                }, 2000);
            }
        }
    });

    // Event delegation for groups modal buttons (following CLAUDE.md patterns)
    console.log('Setting up click event listener on modal:', modal);
    console.log('Modal element type:', modal.tagName, 'Classes:', modal.className);

    // Add a test click handler to see if ANY clicks work
    modal.addEventListener('click', (e) => {
        console.log('🔥🔥🔥 ANY MODAL CLICK DETECTED:', e.target.tagName, e.target.textContent.substring(0, 50), 'Classes:', e.target.className);
        console.log('🔥🔥🔥 Event details:', { target: e.target, currentTarget: e.currentTarget, type: e.type });

        if (e.target.classList.contains('add-to-group-btn')) {
            e.preventDefault();
            e.stopPropagation();

            console.log('🎯 ADD BUTTON DETECTED! About to call addToGroup...');

            const groupId = e.target.dataset.groupId;
            const selectElement = e.target.previousElementSibling;
            const optionLabel = selectElement?.value;

            console.log('Button data:', { groupId, optionLabel, selectElement });

            if (optionLabel && optionLabel.trim() !== '') {
                // Get the current group name from the group editor's dataset
                const groupEditor = e.target.closest('.group-editor');
                const currentGroupName = groupEditor?.dataset.groupName || groupId;

                console.log('Add to group clicked:', { currentGroupName, optionLabel, groupEditor });
                window.addToGroup(currentGroupName, optionLabel);

                // Clear the dropdown after adding
                if (selectElement) {
                    selectElement.value = '';
                }
            } else {
                console.log('No option selected or empty option label');
            }
        } else if (e.target.classList.contains('remove-from-group-btn')) {
            e.preventDefault();
            e.stopPropagation();

            const groupId = e.target.dataset.groupId;
            const optionLabel = e.target.dataset.optionLabel;

            // Get the current group name from the group editor's dataset
            const groupEditor = e.target.closest('.group-editor');
            const currentGroupName = groupEditor?.dataset.groupName || groupId;

            console.log('Remove from group clicked:', { currentGroupName, optionLabel });
            window.removeFromGroup(currentGroupName, optionLabel);
        }
    });

    // Event delegation for preferred option checkboxes
    modal.addEventListener('change', (e) => {
        if (e.target.classList.contains('preferred-toggle')) {
            const groupId = e.target.dataset.groupId;
            const optionLabel = e.target.dataset.optionLabel;
            const isChecked = e.target.checked;

            // Get the current group name from the group editor's dataset
            const groupEditor = e.target.closest('.group-editor');
            const currentGroupName = groupEditor?.dataset.groupName || groupId;

            console.log('Preferred toggle clicked:', { currentGroupName, optionLabel, isChecked });
            window.togglePreferred(currentGroupName, optionLabel, isChecked);
        }
    });
}

/**
 * Renders a group editor section
 */
function renderGroupEditor(groupName, groupOptions, allOptions) {
    const ungroupedOptions = allOptions.filter(opt => !opt.medicationGroup);

    console.log('Rendering group editor:', { groupName, groupOptionsCount: groupOptions.length, ungroupedCount: ungroupedOptions.length });

    return `
        <div class="group-editor" data-group-name="${groupName}" style="margin-bottom: 16px; padding: 12px; border: 1px solid var(--line); border-radius: 8px;">
            <div class="group-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <input type="text" class="group-name-input" value="${groupName}" placeholder="Group name" style="flex: 1; padding: 4px 8px; border: 1px solid var(--line); border-radius: 4px;">
                <button class="btn danger" onclick="removeGroup('${groupName}')" style="padding: 4px 8px; font-size: 12px;">Remove Group</button>
            </div>

            <div class="group-options">
                <h5 style="font-size: 13px; margin: 0 0 8px 0;">Options in this group:</h5>
                <div class="grouped-options" data-needs-cleanup style="margin-bottom: 12px;">
                    ${groupOptions.map(option => `
                        <div class="grouped-option" style="display: flex; align-items: center; gap: 8px; padding: 4px 8px; background: var(--surface-1); border-radius: 4px; margin-bottom: 4px;">
                            <span style="flex: 1;">${option.code}: ${option.label}</span>
                            <label style="font-size: 12px;">
                                <input type="checkbox" class="preferred-toggle" data-group-id="${groupName}" data-option-label="${option.label}" ${option.preferredName ? 'checked' : ''}> Preferred
                            </label>
                            <button class="btn ghost remove-from-group-btn" data-group-id="${groupName}" data-option-label="${option.label}" style="padding: 2px 6px; font-size: 11px;">Remove</button>
                        </div>
                    `).join('')}
                </div>

                ${ungroupedOptions.length > 0 ? `
                    <div class="add-to-group">
                        <select class="add-option-select" style="margin-right: 8px; padding: 4px 8px;">
                            <option value="">Add option to group...</option>
                            ${ungroupedOptions.map(opt => `<option value="${opt.label}">${opt.code}: ${opt.label}</option>`).join('')}
                        </select>
                        <button class="btn ghost add-to-group-btn" data-group-id="${groupName}" style="padding: 8px 16px; font-size: 14px; min-width: 60px; cursor: pointer;">Add</button>
                    </div>
                ` : '<p style="font-size: 12px; color: var(--muted);">All options are already grouped.</p>'}
            </div>
        </div>
    `;
}

/**
 * Adds a new empty group within the existing modal
 */
window.addNewGroup = function() {
    console.log('addNewGroup called');

    const container = document.getElementById('groups-container');
    if (!container) {
        console.error('groups-container not found');
        return;
    }

    const groupCount = container.children.length;
    const newGroupName = `group${groupCount + 1}`;

    const question = window.state.questions[window.currentQuestionIndex];

    // Initialize groups array if it doesn't exist
    if (!question.groups) {
        question.groups = [];
    }

    // Add the new group to the question's groups array
    question.groups.push({
        name: newGroupName,
        options: [],
        created: new Date().toISOString()
    });

    console.log('Created new group:', newGroupName, 'Total groups:', question.groups.length);

    const ungroupedOptions = question.options?.filter(opt => !opt.medicationGroup) || [];

    // Add the new group editor to the existing modal
    console.log('About to render group editor with:', { newGroupName, optionCount: question.options.length });
    const groupHTML = renderGroupEditor(newGroupName, [], question.options);
    console.log('Generated HTML length:', groupHTML.length);
    container.insertAdjacentHTML('beforeend', groupHTML);
    console.log('Added group editor to DOM');

    // ✅ CRITICAL FIX: Attach event listeners to the newly created Add button
    setTimeout(() => {
        const newlyAddedButtons = container.querySelectorAll('.add-to-group-btn');
        console.log('🔄 Attaching listeners to', newlyAddedButtons.length, 'newly added buttons');

        newlyAddedButtons.forEach((btn, i) => {
            // Remove any existing listeners to avoid duplicates
            btn.replaceWith(btn.cloneNode(true));
            const cleanBtn = container.querySelectorAll('.add-to-group-btn')[i];

            cleanBtn.addEventListener('click', (e) => {
                console.log('🔥 NEWLY ATTACHED BUTTON CLICKED!', e.target);
                e.preventDefault();
                e.stopPropagation();

                const groupId = e.target.dataset.groupId;
                const selectElement = e.target.previousElementSibling;
                const optionLabel = selectElement?.value;

                console.log('New button click data:', { groupId, optionLabel });

                if (optionLabel && optionLabel.trim() !== '') {
                    const groupEditor = e.target.closest('.group-editor');
                    const currentGroupName = groupEditor?.dataset.groupName || groupId;
                    console.log('🚀 Calling addToGroup from new button:', currentGroupName, optionLabel);
                    window.addToGroup(currentGroupName, optionLabel);
                } else {
                    console.log('❌ No option selected in dropdown');
                }
            });

            console.log('✅ Attached click listener to button', i, 'for group:', cleanBtn.dataset.groupId);
        });
    }, 100);

    // Trigger autosave to persist the group
    if (window.queueAutosave) {
        window.queueAutosave();
    }
};

// Helper functions for group management
window.removeGroup = function(groupName) {
    const question = window.state.questions[window.currentQuestionIndex];

    // Remove group from options
    if (question.options) {
        question.options.forEach(option => {
            if (option.medicationGroup === groupName) {
                delete option.medicationGroup;
                delete option.preferredName;
            }
        });
    }

    // Remove group from groups array
    if (question.groups) {
        question.groups = question.groups.filter(group => group.name !== groupName);
        console.log('Removed group:', groupName, 'Remaining groups:', question.groups.length);
    }

    // Remove from UI
    const groupEditor = document.querySelector(`[data-group-name="${groupName}"]`);
    if (groupEditor) groupEditor.remove();

    // Trigger autosave to persist the change
    if (window.queueAutosave) {
        window.queueAutosave();
    }
};

window.addToGroup = function(groupName, optionLabel) {
    console.log('🚨 addToGroup FUNCTION CALLED!', { groupName, optionLabel });

    if (!optionLabel) {
        console.log('❌ ERROR: No option label provided');
        return;
    }

    const question = window.state.questions[window.currentQuestionIndex];
    console.log('🔍 Current question:', question?.id, 'Options count:', question?.options?.length);

    const option = question.options?.find(opt => opt.label === optionLabel);
    console.log('🔍 Found option:', option ? `${option.code}: ${option.label}` : 'NOT FOUND');

    if (option) {
        console.log('✅ Adding option to group:', option.label, '→', groupName);

        // Update the option's group assignment IMMEDIATELY (no re-render)
        option.medicationGroup = groupName;
        console.log('Set medicationGroup on option:', option);

        // Also maintain the groups array
        if (!question.groups) {
            question.groups = [];
        }

        // Find or create the group in the groups array
        let group = question.groups.find(g => g.name === groupName);
        if (!group) {
            group = {
                name: groupName,
                options: [],
                created: new Date().toISOString()
            };
            question.groups.push(group);
            console.log('Created group in array:', groupName);
        }

        // Add option to group's options array if not already there
        if (!group.options.includes(optionLabel)) {
            group.options.push(optionLabel);
            console.log('Added option to group array:', optionLabel, '→', groupName);
        }

        // ✅ CRITICAL FIX: Update UI elements directly without full re-render
        // This prevents the dropdown disappearing issue mentioned in CLAUDE.md

        // 1. Update the grouped options list for this group
        console.log('🔍 Looking for group editor with name:', groupName);
        const groupEditor = document.querySelector(`[data-group-name="${groupName}"]`);
        console.log('🔍 Group editor found:', !!groupEditor);

        if (groupEditor) {
            const groupedOptionsContainer = groupEditor.querySelector('.grouped-options');
            console.log('🔍 Grouped options container found:', !!groupedOptionsContainer);

            if (groupedOptionsContainer) {
                // Add the new option to the grouped options display
                const newOptionHTML = `
                    <div class="grouped-option" style="display: flex; align-items: center; gap: 8px; padding: 4px 8px; background: var(--surface-1); border-radius: 4px; margin-bottom: 4px;">
                        <span style="flex: 1;">${option.code}: ${option.label}</span>
                        <label style="font-size: 12px;">
                            <input type="checkbox" class="preferred-toggle" data-group-id="${groupName}" data-option-label="${option.label}" ${option.preferredName ? 'checked' : ''}> Preferred
                        </label>
                        <button class="btn ghost remove-from-group-btn" data-group-id="${groupName}" data-option-label="${option.label}" style="padding: 2px 6px; font-size: 11px;">Remove</button>
                    </div>
                `;
                console.log('📝 Adding option HTML to DOM');
                groupedOptionsContainer.insertAdjacentHTML('beforeend', newOptionHTML);
                console.log('✅ Successfully added option HTML to DOM');
            } else {
                console.error('❌ ERROR: Could not find .grouped-options container inside group editor');
            }
        } else {
            console.error('❌ ERROR: Could not find group editor with data-group-name="' + groupName + '"');
            // Debug: Let's see what group editors exist
            const allGroupEditors = document.querySelectorAll('.group-editor');
            console.log('🔍 All group editors found:', allGroupEditors.length);
            allGroupEditors.forEach((editor, i) => {
                console.log(`Group editor ${i}:`, editor.dataset.groupName);
            });
        }

        // 2. Update ALL dropdowns to remove the newly assigned option
        updateGroupDropdowns(question.options);

        // 3. Clear the current dropdown selection
        const currentDropdown = document.querySelector(`[data-group-id="${groupName}"] .add-option-select`);
        if (currentDropdown) {
            currentDropdown.value = '';
        }

        // 4. Debounce save operation (2 second delay following CLAUDE.md pattern)
        if (window.groupUpdateTimeout) {
            clearTimeout(window.groupUpdateTimeout);
        }
        window.groupUpdateTimeout = setTimeout(() => {
            if (window.queueAutosave) {
                window.queueAutosave();
            }
            delete window.groupUpdateTimeout;
        }, 2000);

        console.log('✅ Successfully added option to group without re-render');

    } else {
        console.error('Option not found:', optionLabel);
    }
};

// Update a specific group editor without recreating the whole modal
function updateGroupEditor(groupName, allOptions) {
    // Try to find by the passed group name first
    let groupEditor = document.querySelector(`[data-group-name="${groupName}"]`);

    // If not found, might be a renamed group - find by matching options
    if (!groupEditor) {
        const groupEditors = document.querySelectorAll('.group-editor');
        groupEditor = Array.from(groupEditors).find(editor => {
            const currentName = editor.dataset.groupName;
            return allOptions.some(opt => opt.medicationGroup === currentName && opt.medicationGroup === groupName);
        });
    }

    if (!groupEditor) {
        console.warn('Could not find group editor for:', groupName);
        return;
    }

    // Use the current group name from the DOM (handles renames correctly)
    const currentGroupName = groupEditor.dataset.groupName;
    const groupOptions = allOptions.filter(opt => opt.medicationGroup === currentGroupName);
    const ungroupedOptions = allOptions.filter(opt => !opt.medicationGroup);

    console.log('Updating group editor:', { oldName: groupName, currentName: currentGroupName, optionCount: groupOptions.length });

    // Update the group editor content with the current group name
    groupEditor.outerHTML = renderGroupEditor(currentGroupName, groupOptions, allOptions);
}

// Update all the "Add option to group" dropdowns
function updateGroupDropdowns(allOptions) {
    const ungroupedOptions = allOptions.filter(opt => !opt.medicationGroup);

    document.querySelectorAll('.add-option-select').forEach(select => {
        const currentValue = select.value;
        select.innerHTML = `
            <option value="">Add option to group...</option>
            ${ungroupedOptions.map(opt => `<option value="${opt.label}">${opt.code}: ${opt.label}</option>`).join('')}
        `;
        select.value = ''; // Reset selection after adding
    });
}

window.removeFromGroup = function(groupName, optionLabel) {
    const question = window.state.questions[window.currentQuestionIndex];
    const option = question.options?.find(opt => opt.label === optionLabel);

    if (option) {
        // Remove from option IMMEDIATELY (no re-render)
        delete option.medicationGroup;
        delete option.preferredName;

        // Remove from groups array
        if (question.groups) {
            const group = question.groups.find(g => g.name === groupName);
            if (group && group.options) {
                group.options = group.options.filter(opt => opt !== optionLabel);
                console.log('Removed option from group array:', optionLabel, 'from', groupName);
            }
        }

        // ✅ CRITICAL FIX: Update UI elements directly without full re-render
        // Find and remove the specific option element from the DOM
        const groupEditor = document.querySelector(`[data-group-name="${groupName}"]`);
        if (groupEditor) {
            const optionElement = groupEditor.querySelector(`[data-option-label="${optionLabel}"]`);
            if (optionElement) {
                // Remove the entire grouped-option div (parent of the button)
                const groupedOptionDiv = optionElement.closest('.grouped-option');
                if (groupedOptionDiv) {
                    groupedOptionDiv.remove();
                }
            }
        }

        // Update ALL dropdowns to add the newly unassigned option back
        updateGroupDropdowns(question.options);

        // Debounce save operation (2 second delay following CLAUDE.md pattern)
        if (window.groupUpdateTimeout) {
            clearTimeout(window.groupUpdateTimeout);
        }
        window.groupUpdateTimeout = setTimeout(() => {
            if (window.queueAutosave) {
                window.queueAutosave();
            }
            delete window.groupUpdateTimeout;
        }, 2000);

        console.log('✅ Successfully removed option from group without re-render');
    }
};

window.togglePreferred = function(groupName, optionLabel, isPreferred) {
    const question = window.state.questions[window.currentQuestionIndex];
    const option = question.options?.find(opt => opt.label === optionLabel);

    if (option) {
        if (isPreferred) {
            option.preferredName = true;
        } else {
            delete option.preferredName;
        }
    }
};

/**
 * Applies medication group settings to question options
 */
window.applyMedicationGroups = function(questionIndex) {
    const modal = document.querySelector('.modal');
    const question = window.state.questions[questionIndex];

    if (!question.options) return;

    // Update group names from inputs
    const groupEditors = modal.querySelectorAll('.group-editor');
    groupEditors.forEach(editor => {
        const oldGroupName = editor.dataset.groupName;
        const newGroupName = editor.querySelector('.group-name-input').value.trim();

        if (newGroupName && newGroupName !== oldGroupName) {
            // Update all options with this group name
            question.options.forEach(option => {
                if (option.medicationGroup === oldGroupName) {
                    option.medicationGroup = newGroupName;
                }
            });

            // ALSO UPDATE THE GROUPS ARRAY - this was missing!
            if (question.groups) {
                const group = question.groups.find(g => g.name === oldGroupName);
                if (group) {
                    group.name = newGroupName;
                    console.log(`Updated group name: "${oldGroupName}" → "${newGroupName}"`);
                }
            }
        }
    });

    // Set up termination logic if enabled
    const enableTermination = modal.querySelector('#enable-termination').checked;
    if (enableTermination) {
        const startRange = parseInt(modal.querySelector('#termination-start').value) || 1;
        const endRange = parseInt(modal.querySelector('#termination-end').value) || 14;

        question.terminationLogic = {
            enabled: true,
            maxGLP1Selections: 1,
            glp1OptionRange: [startRange, endRange],
            allowGroupPairs: true
        };
    } else {
        delete question.terminationLogic;
    }

    // Save the updated question to Supabase using the proper action
    // Find the actions from the stored window object (set during modal creation)
    if (window.medicationGroupActions && window.medicationGroupActions.onUpdateQuestion) {
        console.log('Saving group changes to database...');
        window.medicationGroupActions.onUpdateQuestion(questionIndex, 'options', question.options);
        // Also save the groups array
        window.medicationGroupActions.onUpdateQuestion(questionIndex, 'groups', question.groups);
    } else {
        console.warn('Editor actions not available, changes may not be saved');
    }
};

function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[m]));
}

// renderGlobalTermination and renderGlobalMustSelect now imported from modules/terminationBuilder.js

function findQuestionById(qid) {
    return window.state.questions.find(q => (q.id || "").toUpperCase() === (qid || "").toUpperCase());
}

/**
 * Debounced group save helpers (following CLAUDE.md patterns)
 */
let groupChangeTimeouts = {};

window.saveGroupChange = async function(questionIndex, groupId, changeType, data) {
    const timeoutKey = `group-${groupId}-${changeType}`;

    if (groupChangeTimeouts[timeoutKey]) {
        clearTimeout(groupChangeTimeouts[timeoutKey]);
    }

    groupChangeTimeouts[timeoutKey] = setTimeout(async () => {
        try {
            if (changeType === 'name') {
                await supabase.from('question_groups')
                    .update({
                        group_name: data.name,
                        group_code: data.name.toLowerCase().replace(/\s+/g, '_'),
                        updated_at: 'now()'
                    })
                    .eq('id', groupId);
                console.log('✅ Group name saved:', data.name);
            } else if (changeType === 'add_option') {
                await supabase.from('group_option_assignments').insert({
                    group_id: groupId,
                    option_id: data.optionId,
                    is_preferred: false
                });
                console.log('✅ Option added to group:', data.optionCode);
            } else if (changeType === 'remove_option') {
                await supabase.from('group_option_assignments')
                    .delete()
                    .eq('group_id', groupId)
                    .eq('option_id', data.optionId);
                console.log('✅ Option removed from group:', data.optionCode);
            } else if (changeType === 'toggle_preferred') {
                await supabase.from('group_option_assignments')
                    .update({ is_preferred: data.isPreferred })
                    .eq('group_id', groupId)
                    .eq('option_id', data.optionId);
                console.log('✅ Option preferred status updated:', data.isPreferred);
            }
        } catch (error) {
            console.error('❌ Group save failed:', error);
        }
        delete groupChangeTimeouts[timeoutKey];
    }, 2000); // 2 second debounce following CLAUDE.md patterns
};

function getPriorQuestions(currentIndex) {
    return window.state.questions.filter((q, i) => i < currentIndex);
}

function getQuestionOptions(q) {
    if (!q) return [];
    if (Array.isArray(q.options) && q.options.length) {
        return q.options.map((o, i) => ({ code: String(o.code ?? (i + 1)), label: String(o.label ?? '') }));
    }
    if (Array.isArray(q.grid?.cols) && q.grid.cols.length) {
        return q.grid.cols.map((lab, i) => ({ code: String(i + 1), label: String(lab ?? '') }));
    }
    return [];
}

// --- Text Piping Functions (from old.index.html) ---


function parsePipedText(text, responses = {}) {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\\{([^}]+)\\}/g, (match, expression) => {
        // This is a simplified version. A full implementation would require
        // porting the entire evaluatePipeExpression logic from old.index.html
        const parts = expression.split(':');
        const qid = parts[0];
        const format = parts[1];
        if (format === 'label') {
            const q = findQuestionById(qid);
            const opt = q?.options?.find(o => String(o.code) === String(responses[qid]));
            return opt?.label || `[${qid}:label]`;
        }
        return responses[qid] || `[${qid}]`;
    });
}


// --- PIPING FUNCTIONALITY ---

/**
 * Placeholder modal functions for advanced table features (to be implemented)
 */

function showAdvancedColumnsModal(questionIndex, actions) {
    // For now, reuse the existing column headers modal
    showColumnHeadersModal(questionIndex, actions);
}

function showAdvancedRowsModal(questionIndex, actions) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-panel" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3>📋 Use Previous Question as Row Headers</h3>
                <button class="icon-btn" onclick="this.closest('.modal').remove()" aria-label="Close">✕</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 16px; color: var(--muted);">
                    Select a previous question to use its answer options as row headers in your table.
                </p>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Source Question:</label>
                    <select id="source-question-rows" style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: 4px;">
                        <option value="">Choose a question...</option>
                        ${window.state.questions.map((q, idx) => {
                            if (idx >= questionIndex) return ''; // Only show previous questions
                            if (!q.id) return '';

                            // Check if question has selectable options
                            const hasOptions = q.options?.length > 0;
                            const hasGridCols = q.grid?.cols?.length > 0;
                            const hasScaleLabels = q.scale?.labels?.length > 0;

                            if (!hasOptions && !hasGridCols && !hasScaleLabels) return '';

                            return `<option value="${q.id}">${q.id}: ${(q.text || '').replace(/<[^>]*>/g, '').substring(0, 60)}${(q.text || '').length > 60 ? '...' : ''}</option>`;
                        }).filter(Boolean).join('')}
                    </select>
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Exclude Options (optional):</label>
                    <input type="text" id="exclude-options-rows" placeholder="e.g., 99, 98, other"
                           style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: 4px;">
                    <small style="color: var(--muted); font-size: 12px;">
                        Comma-separated list of option codes to exclude from rows
                    </small>
                </div>

                <div id="preview-rows" style="margin: 16px 0; padding: 12px; background: var(--surface-2); border-radius: 4px; display: none;">
                    <strong>Preview Rows:</strong>
                    <div id="preview-rows-list" style="margin-top: 8px; font-size: 13px;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn-primary" id="apply-row-source">Apply Row Source</button>
            </div>
        </div>
    `;

    // Preview functionality
    const sourceSelect = modal.querySelector('#source-question-rows');
    const excludeInput = modal.querySelector('#exclude-options-rows');
    const previewDiv = modal.querySelector('#preview-rows');
    const previewList = modal.querySelector('#preview-rows-list');

    const updatePreview = () => {
        const sourceQid = sourceSelect.value;
        if (!sourceQid) {
            previewDiv.style.display = 'none';
            return;
        }

        const sourceQuestion = window.state.questions.find(q => q.id === sourceQid);
        if (!sourceQuestion) return;

        const exclude = new Set(excludeInput.value.split(',').map(s => s.trim()).filter(Boolean));

        // Get options from source question
        let options = [];
        if (sourceQuestion.options?.length > 0) {
            options = sourceQuestion.options.map(opt => ({ code: opt.code, label: opt.label }));
        } else if (sourceQuestion.grid?.cols?.length > 0) {
            options = sourceQuestion.grid.cols.map((label, idx) => ({ code: String(idx + 1), label }));
        } else if (sourceQuestion.scale?.labels?.length > 0) {
            options = sourceQuestion.scale.labels.map((label, idx) => ({ code: String(idx + 1), label }));
        }

        const filteredOptions = options.filter(opt => !exclude.has(opt.code));

        if (filteredOptions.length > 0) {
            previewList.innerHTML = filteredOptions.map(opt =>
                `<div style="padding: 2px 0;">• ${opt.label}</div>`
            ).join('');
            previewDiv.style.display = 'block';
        } else {
            previewDiv.style.display = 'none';
        }
    };

    sourceSelect.addEventListener('change', updatePreview);
    excludeInput.addEventListener('input', updatePreview);

    // Apply button functionality
    modal.querySelector('#apply-row-source').addEventListener('click', () => {
        const sourceQid = sourceSelect.value;
        if (!sourceQid) {
            alert('Please select a source question.');
            return;
        }

        const sourceQuestion = window.state.questions.find(q => q.id === sourceQid);
        if (!sourceQuestion) {
            alert('Source question not found.');
            return;
        }

        const question = window.state.questions[questionIndex];
        if (!question.grid) {
            question.grid = { rows: [], cols: [] };
        }

        // Set up dynamic row source in unified structure
        const exclude = new Set(excludeInput.value.split(',').map(s => s.trim()).filter(Boolean));
        let options = [];
        if (sourceQuestion.options?.length > 0) {
            options = sourceQuestion.options.map(opt => ({ code: opt.code, label: opt.label }));
        } else if (sourceQuestion.grid?.cols?.length > 0) {
            options = sourceQuestion.grid.cols.map((label, idx) => ({ code: String(idx + 1), label }));
        } else if (sourceQuestion.scale?.labels?.length > 0) {
            options = sourceQuestion.scale.labels.map((label, idx) => ({ code: String(idx + 1), label }));
        }

        const filteredOptions = options.filter(opt => !exclude.has(opt.code));

        // Set up dynamic row source for advanced table
        if (!question.advancedTable) question.advancedTable = { rows: [], cols: [] };

        question.advancedTable.rows = filteredOptions.map(opt => opt.label);
        question.advancedTable.rowSource = {
            qid: sourceQid,
            exclude: excludeInput.value.trim()
        };
        question.advancedTable.tableVariation = 'Dynamic Row Matrix';

        // Ensure we have some default columns if none exist
        if (!question.advancedTable.cols || question.advancedTable.cols.length === 0) {
            question.advancedTable.cols = ['Column 1', 'Column 2', 'Column 3'];
        }

        // NEW: Set proper table classification after setting row source
        const hasLikertCols = detectLikertColumnPattern(question.advancedTable.cols || []);

        if (hasLikertCols) {
            // Hybrid: row source + Likert columns
            const isHybrid = detectAndUpdateHybridTable(question, questionIndex, actions);
            if (isHybrid) {
                console.log('🔗 Row source created hybrid table classification');
            }
        } else {
            // Pure dynamic rows table
            const sourceMode = 'all'; // This function creates "all options" row source
            question.question_type = 'table';  // Always table
            question.question_mode = 'advanced_table';  // Dynamic tables are advanced
            question.table_type = `dynamic_rows_${sourceMode}`;  // Complex hybrid code
            question.table_metadata = {
                base_type: 'dynamic',
                dynamic_type: `rows_${sourceMode}`,
                spss_variable_type: 'nominal',
                source_config: {
                    rows: { mode: sourceMode, source_qid: questionId },
                    columns: { mode: 'manual' }
                }
            };

            // Update taxonomy in database
            actions.onUpdateQuestion(questionIndex, 'question_type', question.question_type);
            actions.onUpdateQuestion(questionIndex, 'question_mode', question.question_mode);
            actions.onUpdateQuestion(questionIndex, 'table_type', question.table_type);
            actions.onUpdateQuestion(questionIndex, 'table_metadata', question.table_metadata);

            console.log('📊 Classified as dynamic rows table:', question.table_type);
        }

        // Close modal first, then save with small delay to prevent re-render race
        modal.remove();

        setTimeout(() => {
            console.log('🔧 Modal save executing for question:', questionIndex, question.id);
            actions.onUpdateQuestion(questionIndex, 'advancedTable', question.advancedTable);
        }, 100);

        // Show success message
        setTimeout(() => {
            const statusEl = document.querySelector('.status-message');
            if (statusEl) {
                statusEl.textContent = `Applied dynamic rows from ${sourceQid}`;
                statusEl.style.color = 'var(--accent)';
                setTimeout(() => statusEl.textContent = '', 3000);
            }
        }, 100);
    });

    // Close modal when clicking outside
    modal.addEventListener('click', () => modal.remove());

    document.body.appendChild(modal);
}

function showColumnSelectedModal(questionIndex, actions) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-panel" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3>📋 Use Selected Items as Column Headers</h3>
                <button class="icon-btn" onclick="this.closest('.modal').remove()" aria-label="Close">✕</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 16px; color: var(--muted);">
                    This will show columns for only the items selected by respondents in the previous question.
                </p>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Source Question:</label>
                    <select id="source-question-selected-cols" style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: 4px;">
                        <option value="">Choose a question...</option>
                        ${window.state.questions.map((q, idx) => {
                            if (idx >= questionIndex) return ''; // Only show previous questions
                            if (!q.id) return '';

                            // Check if question has selectable options
                            const hasOptions = q.options?.length > 0;
                            const hasGridCols = q.grid?.cols?.length > 0;
                            const hasScaleLabels = q.scale?.labels?.length > 0;

                            if (!hasOptions && !hasGridCols && !hasScaleLabels) return '';

                            return `<option value="${q.id}">${q.id}: ${(q.text || '').replace(/<[^>]*>/g, '').substring(0, 60)}${(q.text || '').length > 60 ? '...' : ''}</option>`;
                        }).filter(Boolean).join('')}
                    </select>
                </div>

                <div id="preview-selected-cols" style="margin: 16px 0; padding: 12px; background: var(--surface-2); border-radius: 4px; display: none;">
                    <strong>Preview Columns:</strong>
                    <div id="preview-selected-cols-list" style="margin-top: 8px; font-size: 13px;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn-primary" id="apply-selected-column-source">Apply Selected Columns</button>
            </div>
        </div>
    `;

    // Preview functionality
    const sourceSelect = modal.querySelector('#source-question-selected-cols');
    const previewDiv = modal.querySelector('#preview-selected-cols');
    const previewList = modal.querySelector('#preview-selected-cols-list');

    const updatePreview = () => {
        const sourceQid = sourceSelect.value;
        if (!sourceQid) {
            previewDiv.style.display = 'none';
            return;
        }

        const sourceQuestion = window.state.questions.find(q => q.id === sourceQid);
        if (!sourceQuestion) return;

        // Show simplified preview
        previewList.innerHTML = `
            <div style="padding: 2px 0;">• Selection 1 from ${sourceQid}</div>
            <div style="padding: 2px 0;">• Selection 2 from ${sourceQid}</div>
            <div style="padding: 2px 0;">• Etc...</div>
        `;
        previewDiv.style.display = 'block';
    };

    sourceSelect.addEventListener('change', updatePreview);

    // Apply button functionality
    modal.querySelector('#apply-selected-column-source').addEventListener('click', () => {
        const sourceQid = sourceSelect.value;
        if (!sourceQid) {
            alert('Please select a source question.');
            return;
        }

        const question = window.state.questions[questionIndex];
        if (!question.advancedTable) {
            question.advancedTable = { rows: [], cols: [] };
        }

        // Set up selected items column source with simplified display
        question.advancedTable.columnSource = {
            qid: sourceQid,
            mode: 'selected_only'
        };
        question.advancedTable.tableVariation = 'Dynamic Selected Columns';

        // Set simplified column labels for display (read-only placeholders)
        question.advancedTable.cols = [
            `Selection 1 from ${sourceQid}`,
            `Selection 2 from ${sourceQid}`,
            'Etc...'
        ];
        // Mark these as non-editable placeholders
        question.advancedTable.colsReadOnly = true;

        // Ensure we have some default rows if none exist
        if (!question.advancedTable.rows || question.advancedTable.rows.length === 0) {
            question.advancedTable.rows = ['Row 1', 'Row 2', 'Row 3'];
        }

        // NEW: Set proper table classification after setting selected column source
        const hasLikertRows = detectLikertColumnPattern(question.advancedTable.rows || []);

        if (hasLikertRows) {
            // Hybrid: selected column source + Likert rows
            const isHybrid = detectAndUpdateHybridTable(question, questionIndex, actions);
            if (isHybrid) {
                console.log('🔗 Selected column source created hybrid table classification');
            }
        } else {
            // MAP TO YOUR 3-COLUMN SYSTEM FOR DYNAMIC TABLES
            const sourceMode = 'selected';
            question.question_type = 'table';  // Always table
            question.question_mode = 'advanced_table';  // Dynamic tables are advanced
            question.table_type = `dynamic_cols_${sourceMode}`;  // Complex hybrid code
            question.table_metadata = {
                base_type: 'dynamic',
                dynamic_type: `cols_${sourceMode}`,
                spss_variable_type: 'nominal',
                source_config: {
                    rows: { mode: 'manual' },
                    columns: { mode: sourceMode, source_qid: sourceQid }
                }
            };

            // Save to your 3-column system
            actions.onUpdateQuestion(questionIndex, 'question_type', question.question_type);
            actions.onUpdateQuestion(questionIndex, 'question_mode', question.question_mode);
            actions.onUpdateQuestion(questionIndex, 'table_type', question.table_type);
            actions.onUpdateQuestion(questionIndex, 'table_metadata', question.table_metadata);

            console.log('📊 Classified as dynamic selected columns table:', question.table_type);
        }

        // Close modal first, then save with small delay to prevent re-render race
        modal.remove();

        setTimeout(() => {
            console.log('🔧 Modal save executing for question:', questionIndex, question.id);
            actions.onUpdateQuestion(questionIndex, 'advancedTable', question.advancedTable);
        }, 100);

        // Show success message
        setTimeout(() => {
            const statusEl = document.querySelector('.status-message');
            if (statusEl) {
                statusEl.textContent = `Applied selected columns from ${sourceQid}`;
                statusEl.style.color = 'var(--accent)';
                setTimeout(() => statusEl.textContent = '', 3000);
            }
        }, 100);
    });

    // Close modal when clicking outside
    modal.addEventListener('click', () => modal.remove());

    document.body.appendChild(modal);
}

function showRowSelectedModal(questionIndex, actions) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-panel" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3>📋 Use Selected Items as Row Headers</h3>
                <button class="icon-btn" onclick="this.closest('.modal').remove()" aria-label="Close">✕</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 16px; color: var(--muted);">
                    This will show rows for only the items selected by respondents in the previous question.
                </p>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Source Question:</label>
                    <select id="source-question-selected-rows" style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: 4px;">
                        <option value="">Choose a question...</option>
                        ${window.state.questions.map((q, idx) => {
                            if (idx >= questionIndex) return ''; // Only show previous questions
                            if (!q.id) return '';

                            // Check if question has selectable options
                            const hasOptions = q.options?.length > 0;
                            const hasGridCols = q.grid?.cols?.length > 0;
                            const hasScaleLabels = q.scale?.labels?.length > 0;

                            if (!hasOptions && !hasGridCols && !hasScaleLabels) return '';

                            return `<option value="${q.id}">${q.id}: ${(q.text || '').replace(/<[^>]*>/g, '').substring(0, 60)}${(q.text || '').length > 60 ? '...' : ''}</option>`;
                        }).filter(Boolean).join('')}
                    </select>
                </div>

                <div id="preview-selected-rows" style="margin: 16px 0; padding: 12px; background: var(--surface-2); border-radius: 4px; display: none;">
                    <strong>Preview Rows:</strong>
                    <div id="preview-selected-rows-list" style="margin-top: 8px; font-size: 13px;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn-primary" id="apply-selected-row-source">Apply Selected Rows</button>
            </div>
        </div>
    `;

    // Preview functionality
    const sourceSelect = modal.querySelector('#source-question-selected-rows');
    const previewDiv = modal.querySelector('#preview-selected-rows');
    const previewList = modal.querySelector('#preview-selected-rows-list');

    const updatePreview = () => {
        const sourceQid = sourceSelect.value;
        if (!sourceQid) {
            previewDiv.style.display = 'none';
            return;
        }

        const sourceQuestion = window.state.questions.find(q => q.id === sourceQid);
        if (!sourceQuestion) return;

        // Show simplified preview
        previewList.innerHTML = `
            <div style="padding: 2px 0;">• Selection 1 from ${sourceQid}</div>
            <div style="padding: 2px 0;">• Selection 2 from ${sourceQid}</div>
            <div style="padding: 2px 0;">• Etc...</div>
        `;
        previewDiv.style.display = 'block';
    };

    sourceSelect.addEventListener('change', updatePreview);

    // Apply button functionality
    modal.querySelector('#apply-selected-row-source').addEventListener('click', () => {
        const sourceQid = sourceSelect.value;
        if (!sourceQid) {
            alert('Please select a source question.');
            return;
        }

        const question = window.state.questions[questionIndex];
        if (!question.advancedTable) {
            question.advancedTable = { rows: [], cols: [] };
        }

        // Set up selected items row source with simplified display
        question.advancedTable.rowSource = {
            qid: sourceQid,
            mode: 'selected_only'
        };
        question.advancedTable.tableVariation = 'Dynamic Selected Rows';

        // Set simplified row labels for display (read-only placeholders)
        question.advancedTable.rows = [
            `Selection 1 from ${sourceQid}`,
            `Selection 2 from ${sourceQid}`,
            'Etc...'
        ];
        // Mark these as non-editable placeholders
        question.advancedTable.rowsReadOnly = true;

        // Ensure we have some default columns if none exist
        if (!question.advancedTable.cols || question.advancedTable.cols.length === 0) {
            question.advancedTable.cols = ['Column 1', 'Column 2', 'Column 3'];
        }

        // NEW: Set proper table classification after setting selected row source
        const hasLikertCols = detectLikertColumnPattern(question.advancedTable.cols || []);

        if (hasLikertCols) {
            // Hybrid: selected row source + Likert columns
            const isHybrid = detectAndUpdateHybridTable(question, questionIndex, actions);
            if (isHybrid) {
                console.log('🔗 Selected row source created hybrid table classification');
            }
        } else {
            // Pure dynamic selected rows table
            const sourceMode = 'selected';
            question.question_type = 'table';  // Always table
            question.question_mode = 'advanced_table';  // Dynamic tables are advanced
            question.table_type = `dynamic_rows_${sourceMode}`;  // Complex hybrid code
            question.table_metadata = {
                base_type: 'dynamic',
                dynamic_type: `rows_${sourceMode}`,
                spss_variable_type: 'nominal',
                source_config: {
                    rows: { mode: sourceMode, source_qid: sourceQid },
                    columns: { mode: 'manual' }
                }
            };

            // Update taxonomy in database
            actions.onUpdateQuestion(questionIndex, 'question_type', question.question_type);
            actions.onUpdateQuestion(questionIndex, 'question_mode', question.question_mode);
            actions.onUpdateQuestion(questionIndex, 'table_type', question.table_type);
            actions.onUpdateQuestion(questionIndex, 'table_metadata', question.table_metadata);

            console.log('📊 Classified as dynamic selected rows table:', question.table_type);
        }

        // Close modal first, then save with small delay to prevent re-render race
        modal.remove();

        setTimeout(() => {
            console.log('🔧 Modal save executing for question:', questionIndex, question.id);
            actions.onUpdateQuestion(questionIndex, 'advancedTable', question.advancedTable);
        }, 100);

        // Show success message
        setTimeout(() => {
            const statusEl = document.querySelector('.status-message');
            if (statusEl) {
                statusEl.textContent = `Applied selected rows from ${sourceQid}`;
                statusEl.style.color = 'var(--accent)';
                setTimeout(() => statusEl.textContent = '', 3000);
            }
        }, 100);
    });

    // Close modal when clicking outside
    modal.addEventListener('click', () => modal.remove());

    document.body.appendChild(modal);
}

function showPresetLibraryModal(questionIndex, actions) {
    // Define preset categories and their presets (organized by user-friendliness and common usage)
    const presetLibrary = {
        'recommended': {
            name: '⭐ Recommended for Market Research',
            description: 'Most commonly used table types for professional market research - start here for typical survey needs',
            isHighlight: true,
            presets: {
                'agreement': {
                    name: '📈 Agreement Scale',
                    description: 'The gold standard for attitude measurement. Measures agreement/disagreement with statements.',
                    examples: '"How much do you agree with these statements about our brand?"',
                    whenToUse: 'Use for: Brand perception, attitude measurement, opinion polling',
                    type: 'grid_single',
                    rows: ['Statement placeholder - edit to customize'],
                    variation: 'Agreement Scale',
                    hasScaleSelector: true,
                    difficulty: 'Easy',
                    scaleOptions: {
                        3: ['Disagree', 'Neither Agree nor Disagree', 'Agree'],
                        5: ['Strongly Disagree', 'Disagree', 'Neither Agree nor Disagree', 'Agree', 'Strongly Agree'],
                        7: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neither Agree nor Disagree', 'Somewhat Agree', 'Agree', 'Strongly Agree']
                    }
                },
                'satisfaction': {
                    name: '😊 Satisfaction Scale',
                    description: 'Industry standard for measuring satisfaction with products, services, or experiences.',
                    examples: '"How satisfied are you with the following aspects of our service?"',
                    whenToUse: 'Use for: Customer satisfaction, service quality, product evaluation',
                    type: 'grid_single',
                    rows: ['Service/product placeholder - edit to customize'],
                    variation: 'Satisfaction Scale',
                    hasScaleSelector: true,
                    difficulty: 'Easy',
                    scaleOptions: {
                        3: ['Dissatisfied', 'Neither Satisfied nor Dissatisfied', 'Satisfied'],
                        5: ['Very Dissatisfied', 'Dissatisfied', 'Neither Satisfied nor Dissatisfied', 'Satisfied', 'Very Satisfied'],
                        7: ['Very Dissatisfied', 'Dissatisfied', 'Somewhat Dissatisfied', 'Neither Satisfied nor Dissatisfied', 'Somewhat Satisfied', 'Satisfied', 'Very Satisfied']
                    }
                },
                'applies': {
                    name: '✅ Applies/Does Not Apply',
                    description: 'Simple yes/no classification for multiple items. Clean and straightforward.',
                    examples: '"Which of the following apply to your household?"',
                    whenToUse: 'Use for: Screening questions, applicability checks, binary classifications',
                    type: 'grid_single',
                    rows: ['Item placeholder - edit to customize'],
                    cols: ['Applies', 'Does Not Apply'],
                    variation: 'Applies/Does Not Apply',
                    difficulty: 'Easy'
                }
            }
        },
        'likert': {
            name: '📊 Professional Rating Scales',
            description: 'Research-grade standardized scales with automatic reporting calculations',
            presets: {
                'frequency': {
                    name: '🔄 Frequency Scale',
                    description: 'Measures how often behaviors or events occur.',
                    examples: '"How often do you use the following features?"',
                    whenToUse: 'Use for: Usage patterns, behavior frequency, habit tracking',
                    type: 'grid_single',
                    rows: ['Activity placeholder - edit to customize'],
                    variation: 'Frequency Scale',
                    hasScaleSelector: true,
                    difficulty: 'Easy',
                    scaleOptions: {
                        3: ['Never', 'Sometimes', 'Always'],
                        5: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
                        7: ['Never', 'Almost Never', 'Rarely', 'Sometimes', 'Often', 'Almost Always', 'Always']
                    }
                },
                'importance': {
                    name: '🎯 Importance Scale',
                    description: 'Ranks priority and importance of different factors.',
                    examples: '"How important are these factors when choosing a product?"',
                    whenToUse: 'Use for: Feature prioritization, needs assessment, decision drivers',
                    type: 'grid_single',
                    rows: ['Factor placeholder - edit to customize'],
                    variation: 'Importance Scale',
                    hasScaleSelector: true,
                    difficulty: 'Easy',
                    scaleOptions: {
                        3: ['Not Important', 'Somewhat Important', 'Very Important'],
                        5: ['Not at all Important', 'Not Very Important', 'Somewhat Important', 'Important', 'Very Important'],
                        7: ['Not at all Important', 'Not Very Important', 'Slightly Important', 'Somewhat Important', 'Important', 'Very Important', 'Extremely Important']
                    }
                }
            }
        },
        'patterns': {
            name: '🔧 Simple Patterns',
            description: 'Basic table layouts for straightforward questions',
            presets: {
                'yes_no_maybe': {
                    name: '🤔 Yes/No/Maybe',
                    description: 'Three-option decision matrix for intention or likelihood questions.',
                    examples: '"Are you likely to purchase these products?"',
                    whenToUse: 'Use for: Purchase intention, likelihood studies, tentative decisions',
                    type: 'grid_single',
                    rows: ['Question placeholder - edit to customize'],
                    cols: ['Yes', 'No', 'Maybe'],
                    variation: 'Standard Table',
                    difficulty: 'Easy'
                },
                'multi_select_matrix': {
                    name: '☑️ Multi-Select Table',
                    description: 'Allows multiple selections per row - "select all that apply" format.',
                    examples: '"Which channels do you use for each type of purchase?"',
                    whenToUse: 'Use for: Multi-option selections, channel usage, behavior mapping',
                    type: 'grid_multi',
                    rows: ['Item placeholder - edit to customize'],
                    cols: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                    variation: 'Multi-Select Table',
                    difficulty: 'Easy'
                },
                'ranking_3': {
                    name: '🥇 3-Item Ranking',
                    description: 'Rank top 3 preferences in order of priority.',
                    examples: '"Rank your top 3 preferred features in order of importance"',
                    whenToUse: 'Use for: Priority ranking, preference ordering, top-of-mind analysis',
                    type: 'ranking',
                    rows: ['Option placeholder - edit to customize'],
                    cols: ['1st Choice', '2nd Choice', '3rd Choice'],
                    variation: 'Ranking Table',
                    difficulty: 'Medium'
                }
            }
        },
        'dynamic': {
            name: '🔄 Dynamic Tables (Advanced)',
            description: 'Tables that automatically pull content from previous questions - requires setup',
            needsPreviousQuestions: true,
            presets: {
                'cols_from_prev': {
                    name: '📋 Dynamic Columns (All Options)',
                    description: 'Columns automatically filled from a previous question.',
                    examples: '"Rate each brand mentioned in Q1" (columns = all brands from Q1)',
                    whenToUse: 'Use when: You want to rate/evaluate all options from a previous question',
                    type: 'grid_single',
                    action: 'show_column_modal',
                    variation: 'Dynamic Column Matrix',
                    difficulty: 'Advanced'
                },
                'cols_from_selected': {
                    name: '📋 Dynamic Columns (Selected Only)',
                    description: 'Columns filled only with respondent\'s previous selections.',
                    examples: '"Rate brands you selected in Q1" (columns = only selected brands)',
                    whenToUse: 'Use when: You want to follow up only on items they chose',
                    type: 'grid_single',
                    action: 'show_column_selected_modal',
                    variation: 'Dynamic Selected Columns',
                    difficulty: 'Advanced'
                },
                'rows_from_prev': {
                    name: '📝 Dynamic Rows (All Options)',
                    description: 'Rows automatically filled from a previous question.',
                    examples: '"For each feature from Q2, rate importance" (rows = all features)',
                    whenToUse: 'Use when: You want to evaluate all items from a previous list',
                    type: 'grid_single',
                    action: 'show_row_modal',
                    variation: 'Dynamic Row Matrix',
                    difficulty: 'Advanced'
                },
                'rows_from_selected': {
                    name: '📝 Dynamic Rows (Selected Only)',
                    description: 'Rows filled only with respondent\'s previous selections.',
                    examples: '"Rate features you use" (rows = only features they selected)',
                    whenToUse: 'Use when: You want to follow up only on their relevant choices',
                    type: 'grid_single',
                    action: 'show_row_selected_modal',
                    variation: 'Dynamic Selected Rows',
                    difficulty: 'Advanced'
                }
            }
        },
        'enterprise': {
            name: '🏢 Enterprise Multi-Matrix (Expert)',
            description: 'Most complex tables requiring two previous questions - for sophisticated research',
            needsPreviousQuestions: true,
            isExpert: true,
            presets: {
                'multimatrix_all_all': {
                    name: '🎯 Multi-Matrix (All × All)',
                    description: 'Ultimate complexity: Rows from Question A, Columns from Question B.',
                    examples: '"Rate each brand (Q1) on each attribute (Q2)"',
                    whenToUse: 'Use when: You need comprehensive cross-analysis of two question sets',
                    type: 'grid_single',
                    action: 'show_multimatrix_modal',
                    variation: 'Multi-Matrix All×All',
                    complexity: 'enterprise'
                },
                'multimatrix_selected_selected': {
                    name: '🎯 Multi-Matrix (Selected × Selected)',
                    description: 'Most personalized: Only selected items from both questions.',
                    examples: '"Rate familiar brands on important attributes"',
                    whenToUse: 'Use when: Maximum personalization - only items they care about',
                    type: 'grid_single',
                    action: 'show_multimatrix_selected_modal',
                    variation: 'Multi-Matrix Selected×Selected',
                    difficulty: 'Expert'
                }
            }
        },
        'hybrid': {
            name: '🔀 Hybrid Tables (Expert)',
            description: 'Combines dynamic sourcing with professional scales - the ultimate in sophistication',
            needsPreviousQuestions: true,
            isExpert: true,
            presets: {
                'hybrid_rows_all_likert': {
                    name: '📊 Dynamic Rows + Rating Scale',
                    description: 'Rows from previous question combined with professional rating scales.',
                    examples: '"Rate agreement with each statement from Q1"',
                    whenToUse: 'Use when: You want to rate/measure items from a previous question',
                    type: 'grid_single',
                    action: 'show_hybrid_rows_likert_modal',
                    variation: 'Hybrid Rows+Likert',
                    difficulty: 'Expert'
                },
                'hybrid_rows_selected_likert': {
                    name: '📊 Selected Rows + Rating Scale',
                    description: 'Only selected rows combined with professional rating scales.',
                    examples: '"Rate satisfaction with services you\'ve used"',
                    whenToUse: 'Use when: You want to rate only the relevant items they chose',
                    type: 'grid_single',
                    action: 'show_hybrid_selected_likert_modal',
                    variation: 'Hybrid Selected+Likert',
                    difficulty: 'Expert'
                }
            }
        }
    };

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-panel" onclick="event.stopPropagation()" style="max-width: 1000px; max-height: 85vh;">
            <div class="modal-header">
                <h3>📚 Table Preset Library</h3>
                <button class="icon-btn" onclick="this.closest('.modal').remove()" aria-label="Close">✕</button>
            </div>
            <div class="modal-body" style="overflow-y: auto; padding: 24px;">
                <!-- Intro Section -->
                <div style="background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%); padding: 20px; border-radius: 12px; margin-bottom: 32px; border-left: 4px solid var(--accent);">
                    <h4 style="margin: 0 0 8px 0; color: var(--accent); font-size: 16px;">💡 How to Choose the Right Table</h4>
                    <p style="margin: 0 0 12px 0; color: var(--text); line-height: 1.5;">Start with <strong>⭐ Recommended</strong> for most market research needs. Need dynamic content? Try <strong>🔄 Advanced</strong>. All presets are fully customizable after applying.</p>
                    <div style="display: flex; gap: 16px; margin-top: 12px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--muted);">
                            <span style="background: #e8f5e8; color: #2d5016; padding: 2px 6px; border-radius: 3px; font-weight: 600;">Easy</span>
                            <span>Ready to use</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--muted);">
                            <span style="background: #fff3cd; color: #856404; padding: 2px 6px; border-radius: 3px; font-weight: 600;">Advanced</span>
                            <span>Requires setup</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--muted);">
                            <span style="background: #f8d7da; color: #721c24; padding: 2px 6px; border-radius: 3px; font-weight: 600;">Expert</span>
                            <span>Complex configuration</span>
                        </div>
                    </div>
                </div>

                <div class="preset-categories" style="display: grid; gap: 32px;">
                    ${Object.entries(presetLibrary).map(([categoryKey, category]) => `
                        <div class="preset-category" style="border: 1px solid var(--line); border-radius: 12px; overflow: hidden; ${category.isHighlight ? 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 2px solid var(--accent);' : ''}">
                            <!-- Category Header -->
                            <div class="category-header" style="padding: 20px; background: ${category.isHighlight ? 'linear-gradient(135deg, #f0f7ff 0%, #e8f2ff 100%)' : category.isExpert ? '#fef7f0' : 'var(--surface-2)'}; border-bottom: 1px solid var(--line);">
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                    <h4 style="margin: 0; font-size: 18px; font-weight: 600; color: ${category.isHighlight ? 'var(--accent)' : 'var(--text)'};">${category.name}</h4>
                                    ${category.needsPreviousQuestions ? '<span style="background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Requires Previous Questions</span>' : ''}
                                    ${category.isExpert ? '<span style="background: #f8d7da; color: #721c24; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Expert Level</span>' : ''}
                                </div>
                                <p style="margin: 0; font-size: 14px; color: var(--muted); line-height: 1.4;">${category.description}</p>
                            </div>
                            <!-- Presets Grid -->
                            <div class="preset-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1px; background: var(--line);">
                                ${Object.entries(category.presets).map(([presetKey, preset]) => `
                                    <div class="preset-item" style="padding: 20px; background: var(--surface-1); cursor: pointer; transition: all 0.2s; position: relative;"
                                         ${preset.hasScaleSelector ? `onclick="event.stopPropagation()"` : `onclick="applyPreset('${categoryKey}', '${presetKey}')"`}
                                         onmouseenter="this.style.background='var(--surface-2)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)'"
                                         onmouseleave="this.style.background='var(--surface-1)'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">

                                        <!-- Header with name and badges -->
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                            <h5 style="margin: 0; font-size: 15px; font-weight: 600; color: var(--accent); line-height: 1.3;">${preset.name}</h5>
                                            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                                                ${preset.difficulty ? `<span style="font-size: 10px; padding: 2px 6px; border-radius: 3px; font-weight: 600; ${
                                                    preset.difficulty === 'Easy' ? 'background: #e8f5e8; color: #2d5016;' :
                                                    preset.difficulty === 'Medium' ? 'background: #fff3cd; color: #856404;' :
                                                    preset.difficulty === 'Advanced' ? 'background: #fff3cd; color: #856404;' :
                                                    'background: #f8d7da; color: #721c24;'
                                                }">${preset.difficulty}</span>` : ''}
                                                <span style="font-size: 10px; padding: 2px 6px; background: var(--surface-3); border-radius: 3px; color: var(--muted); font-weight: 500;">
                                                    ${preset.type === 'grid_single' ? 'Single Select' : preset.type === 'grid_multi' ? 'Multi Select' : 'Ranking'}</span>
                                            </div>
                                        </div>

                                        <!-- Description -->
                                        <p style="margin: 0 0 12px 0; font-size: 13px; color: var(--muted); line-height: 1.4;">${preset.description}</p>

                                        <!-- Example (if provided) -->
                                        ${preset.examples ? `
                                            <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; margin-bottom: 12px; border-left: 3px solid var(--accent);">
                                                <div style="font-size: 11px; font-weight: 600; color: var(--muted); margin-bottom: 4px;">💬 EXAMPLE</div>
                                                <div style="font-size: 12px; color: var(--text); font-style: italic;">${preset.examples}</div>
                                            </div>
                                        ` : ''}

                                        <!-- When to use -->
                                        ${preset.whenToUse ? `
                                            <div style="margin-bottom: 16px;">
                                                <div style="font-size: 11px; font-weight: 600; color: var(--muted); margin-bottom: 4px;">🎯 WHEN TO USE</div>
                                                <div style="font-size: 12px; color: var(--text);">${preset.whenToUse}</div>
                                            </div>
                                        ` : ''}

                                        <!-- Scale Selector or Action Button -->
                                        ${preset.hasScaleSelector ? `
                                            <div style="margin-bottom: 12px;">
                                                <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 4px; color: var(--text);">Scale Points:</label>
                                                <select onchange="applyPresetWithScale('${categoryKey}', '${presetKey}', this.value)"
                                                        style="width: 100%; padding: 4px 8px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface-1); font-size: 11px;">
                                                    <option value="">Choose scale...</option>
                                                    ${Object.keys(preset.scaleOptions).map(points => `
                                                        <option value="${points}">${points}-Point Scale</option>
                                                    `).join('')}
                                                </select>
                                            </div>
                                            <div style="font-size: 11px; color: var(--muted);">
                                                <div style="margin-bottom: 4px;"><strong>Rows:</strong> ${preset.rows ? preset.rows.length : 0} statements</div>
                                                <div><strong>Columns:</strong> Based on selected scale</div>
                                            </div>
                                        ` : preset.action !== 'show_column_modal' ? `
                                            <div style="font-size: 11px; color: var(--muted);">
                                                <div style="margin-bottom: 4px;"><strong>Rows:</strong> ${preset.rows ? preset.rows.length : 0} statements</div>
                                                <div><strong>Columns:</strong> ${preset.cols ? preset.cols.join(', ').substring(0, 40) + (preset.cols.join(', ').length > 40 ? '...' : '') : 'Dynamic'}</div>
                                            </div>
                                        ` : `
                                            <div style="font-size: 11px; color: var(--accent); font-weight: 600;">
                                                🔗 Opens column selection dialog
                                            </div>
                                        `}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top: 24px; padding: 16px; background: var(--surface-2); border-radius: 8px; border-left: 4px solid var(--accent);">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">💡 Pro Tip</h4>
                    <p style="margin: 0; font-size: 13px; color: var(--muted);">
                        Presets are starting points! After applying a preset, you can edit row statements, column headers, add/remove items,
                        and change the table type. Use "💾 Save Preset" to save your customized tables for future use.
                    </p>
                </div>
            </div>
        </div>
    `;

    // Add preset application functions to window
    // Map preset variations to database-compatible question modes
    function getQuestionModeFromPreset(categoryKey, presetKey, variation) {
        // Likert scale mappings
        if (categoryKey === 'likert') {
            if (presetKey === 'agreement') return 'likert_agreement';
            if (presetKey === 'satisfaction') return 'likert_sentiment';
            if (presetKey === 'frequency' || presetKey === 'importance') return 'likert_custom';
        }

        // Dynamic sourcing mappings
        if (categoryKey === 'dynamic') {
            if (presetKey === 'cols_from_prev') return 'dynamic_simple_columns';
            if (presetKey === 'cols_from_selected') return 'dynamic_selected_columns';
            if (presetKey === 'rows_from_prev') return 'dynamic_simple_rows';
            if (presetKey === 'rows_from_selected') return 'dynamic_selected_rows';
            if (presetKey === 'multi_select_matrix') return 'multi_matrix';
        }

        // Standard patterns mappings
        if (categoryKey === 'patterns') {
            if (presetKey === 'applies') return 'table';
            if (presetKey === 'yes_no_maybe') return 'table';
            if (presetKey === 'ranking_3') return 'table';
        }

        // Default fallback to advanced_table for other presets
        return 'advanced_table';
    }

    window.applyPreset = function(categoryKey, presetKey) {
        const preset = presetLibrary[categoryKey].presets[presetKey];
        const question = window.state.questions[questionIndex];

        // Handle special actions
        if (preset.action === 'show_column_modal') {
            modal.remove();
            showAdvancedColumnsModal(questionIndex, actions);
            return;
        }
        if (preset.action === 'show_column_selected_modal') {
            modal.remove();
            showColumnSelectedModal(questionIndex, actions);
            return;
        }
        if (preset.action === 'show_row_modal') {
            modal.remove();
            showAdvancedRowsModal(questionIndex, actions);
            return;
        }
        if (preset.action === 'show_row_selected_modal') {
            modal.remove();
            showRowSelectedModal(questionIndex, actions);
            return;
        }
        if (preset.action === 'show_hybrid_rows_likert_modal') {
            modal.remove();
            showHybridRowsLikertModal(questionIndex, actions);
            return;
        }
        if (preset.action === 'show_hybrid_selected_likert_modal') {
            modal.remove();
            showHybridSelectedLikertModal(questionIndex, actions);
            return;
        }
        if (preset.action === 'show_multimatrix_modal') {
            modal.remove();
            showMultimatrixModal(questionIndex, actions);
            return;
        }
        if (preset.action === 'show_multimatrix_selected_modal') {
            modal.remove();
            showMultimatrixSelectedModal(questionIndex, actions);
            return;
        }

        // Apply the preset to the question
        if (!question.advancedTable) {
            question.advancedTable = { rows: [], cols: [] };
        }

        question.advancedTable.rows = [...preset.rows];
        question.advancedTable.cols = [...preset.cols];
        question.advancedTable.tableVariation = preset.variation;
        question.type = preset.type;

        // MAP TO 3-COLUMN SYSTEM based on category and preset
        if (categoryKey === 'patterns' || (categoryKey === 'recommended' && !preset.hasScaleSelector)) {
            question.question_type = 'table';  // Always table

            // Determine question_mode based on preset type
            if (preset.type === 'ranking') {
                question.question_mode = 'simple_table';  // Ranking is still simple
                question.table_type = 'ranking_3';  // Specific ranking type
            } else if (preset.type === 'grid_multi') {
                question.question_mode = 'simple_table';  // Multi-select is simple
                question.table_type = 'multi_select_matrix';  // Specific multi-select type
            } else {
                question.question_mode = 'simple_table';  // Basic patterns are simple
                question.table_type = null;  // Simple tables don't need complex hybrid codes
            }

            question.table_metadata = {
                base_type: 'simple',
                spss_variable_type: preset.type === 'ranking' ? 'ordinal' : 'nominal',
                source_config: {
                    rows: { mode: 'manual' },
                    columns: { mode: 'manual' }
                }
            };

            // Save to database
            actions.onUpdateQuestion(questionIndex, 'question_type', question.question_type);
            actions.onUpdateQuestion(questionIndex, 'question_mode', question.question_mode);
            actions.onUpdateQuestion(questionIndex, 'table_type', question.table_type);
            actions.onUpdateQuestion(questionIndex, 'table_metadata', question.table_metadata);

            console.log(`📊 Applied ${categoryKey} preset with proper taxonomy:`, {
                question_type: question.question_type,
                question_mode: question.question_mode,
                table_type: question.table_type
            });
        }

        // Handle Likert presets in recommended category (they have hasScaleSelector)
        // Note: These will be handled by applyPresetWithScale function instead

        // Close modal first, then save with small delay to prevent re-render race
        modal.remove();

        setTimeout(() => {
            console.log('🔧 Modal save executing for question:', questionIndex, question.id);
            actions.onUpdateQuestion(questionIndex, 'advancedTable', question.advancedTable);
        }, 100);

        // Clean up
        delete window.applyPreset;
        delete window.applyPresetWithScale;

        // Show success message
        setTimeout(() => {
            const statusEl = document.querySelector('.status-message');
            if (statusEl) {
                statusEl.textContent = `Applied preset: ${preset.name}`;
                statusEl.style.color = 'var(--accent)';
                setTimeout(() => {
                    statusEl.textContent = '';
                }, 3000);
            }
        }, 100);
    };

    window.applyPresetWithScale = function(categoryKey, presetKey, scalePoints) {
        if (!scalePoints) return; // No scale selected

        const preset = presetLibrary[categoryKey].presets[presetKey];
        const question = window.state.questions[questionIndex];
        const selectedScale = preset.scaleOptions[scalePoints];

        if (!selectedScale) return;

        // Apply the preset to the question
        if (!question.advancedTable) {
            question.advancedTable = { rows: [], cols: [] };
        }

        // For Likert presets: ONLY update columns, preserve existing rows
        if (categoryKey === 'likert') {
            // Keep existing rows, only update columns with Likert scale
            question.advancedTable.cols = [...selectedScale];
            console.log('🔒 Preserved existing rows, updated only columns with Likert scale');
        } else {
            // For other presets: update both rows and columns
            question.advancedTable.rows = [...preset.rows];
            question.advancedTable.cols = [...selectedScale];
        }

        question.advancedTable.tableVariation = preset.variation;
        question.type = preset.type;

        // MAP TO YOUR 3-COLUMN SYSTEM FOR LIKERT PRESETS (from any category)
        if (categoryKey === 'likert' || categoryKey === 'recommended') {
            question.question_type = 'table';  // Always table

            // Check for dynamic features (takes precedence over likert)
            const hasDynamicRows = question.advancedTable?.rowSource;
            const hasDynamicCols = question.advancedTable?.columnSource;
            const isMultiMatrix = question.advancedTable?.tableVariation === 'Multi-Matrix';

            if (hasDynamicRows || hasDynamicCols || isMultiMatrix) {
                question.question_mode = 'advanced_table';  // Dynamic features = advanced
                console.log(`🔧 Dynamic features detected, using advanced_table mode`);
            } else {
                question.question_mode = 'likert';  // Pure Likert scale
                console.log(`📊 Pure Likert scale, using likert mode`);
            }

            question.table_type = `likert_${presetKey}_${scalePoints}`;  // Complex hybrid code

            // Add metadata for SPSS integration and reporting
            question.table_metadata = {
                base_type: 'likert',
                likert_subtype: presetKey,
                scale_points: parseInt(scalePoints),
                auto_nets: scalePoints === '3' ? [] :
                          scalePoints === '5' ? ['T2B', 'B2B'] :
                          ['T3B', 'B3B'],
                spss_variable_type: 'ordinal',
                source_config: {
                    rows: { mode: 'manual' },
                    columns: { mode: 'preset', preset_id: `${presetKey}_${scalePoints}pt` }
                }
            };

            console.log(`🎯 Applied Likert taxonomy: ${question.table_type}`);
        }

        // Close modal first, then save with small delay to prevent re-render race
        modal.remove();

        setTimeout(() => {
            console.log('🔧 Modal save executing for question:', questionIndex, question.id);
            actions.onUpdateQuestion(questionIndex, 'advancedTable', question.advancedTable);

            // Save taxonomy for Likert presets (from any category)
            if (categoryKey === 'likert' || categoryKey === 'recommended') {
                actions.onUpdateQuestion(questionIndex, 'question_type', question.question_type);
                actions.onUpdateQuestion(questionIndex, 'question_mode', question.question_mode);
                actions.onUpdateQuestion(questionIndex, 'table_type', question.table_type);
                actions.onUpdateQuestion(questionIndex, 'table_metadata', question.table_metadata);
            }
        }, 100);

        // Clean up
        delete window.applyPreset;
        delete window.applyPresetWithScale;

        // Show success message
        setTimeout(() => {
            const statusEl = document.querySelector('.status-message');
            if (statusEl) {
                statusEl.textContent = `Applied preset: ${preset.name} (${scalePoints}-Point)`;
                statusEl.style.color = 'var(--accent)';
                setTimeout(() => {
                    statusEl.textContent = '';
                }, 3000);
            }
        }, 100);
    };

    // Close modal when clicking outside
    modal.addEventListener('click', () => {
        modal.remove();
        delete window.applyPreset;
        delete window.applyPresetWithScale;
    });

    document.body.appendChild(modal);
}

function showHybridRowsLikertModal(questionIndex, actions) {
    // For now, redirect to the row modal - they can apply Likert scales after
    console.log('🔗 Hybrid rows + Likert: Opening row source modal');
    showAdvancedRowsModal(questionIndex, actions);
}

function showHybridSelectedLikertModal(questionIndex, actions) {
    // For now, redirect to the selected row modal - they can apply Likert scales after
    console.log('🔗 Hybrid selected rows + Likert: Opening selected row source modal');
    showRowSelectedModal(questionIndex, actions);
}

function showMultimatrixModal(questionIndex, actions) {
    alert('Multi-Matrix configuration coming soon! For now, please:\n1. Set up column source first\n2. Then set up row source\n3. The system will automatically detect the multi-matrix hybrid');
}

function showMultimatrixSelectedModal(questionIndex, actions) {
    alert('Multi-Matrix Selected configuration coming soon! For now, please:\n1. Set up selected column source first\n2. Then set up selected row source\n3. The system will automatically detect the multi-matrix hybrid');
}

function showSavePresetModal(questionIndex, question) {
    const presetName = prompt('Save this table configuration as a preset?\n\nEnter preset name:');
    if (presetName) {
        alert(`Preset "${presetName}" saved! (Feature coming soon)`);
    }
}

/**
 * Shows the column headers selection modal
 */
function showColumnHeadersModal(currentQuestionIndex, actions) {
    const questions = window.state.questions || [];
    const availableQuestions = questions.slice(0, currentQuestionIndex); // Only previous questions

    // Filter to questions that have selectable options
    const questionsWithOptions = availableQuestions.filter(q => {
        return (q.options && q.options.length > 0) ||
               (q.grid && q.grid.cols && q.grid.cols.length > 0) ||
               (q.scale && q.scale.labels && q.scale.labels.length > 0);
    });

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-panel" onclick="event.stopPropagation()" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Use Previous Question as Column Headers</h3>
                <button class="icon-btn" onclick="this.closest('.modal').remove()" aria-label="Close">✕</button>
            </div>
            <div class="modal-body">
                <p>Select a previous question and choose which options to use as column headers:</p>

                ${questionsWithOptions.length > 0 ? `
                    <div class="question-list" style="max-height: 400px; overflow-y: auto;">
                        ${questionsWithOptions.map(q => {
                            // Get available options from the question
                            let availableOptions = [];
                            if (q.options && q.options.length > 0) {
                                availableOptions = q.options.map(opt => ({ code: opt.code, label: opt.label }));
                            } else if (q.grid && q.grid.cols && q.grid.cols.length > 0) {
                                availableOptions = q.grid.cols.map((col, i) => ({ code: String(i + 1), label: col }));
                            } else if (q.scale && q.scale.labels && q.scale.labels.length > 0) {
                                availableOptions = q.scale.labels.map((label, i) => ({ code: String(i + 1), label: label }));
                            }

                            return `
                                <div class="question-item" style="padding: 16px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 12px;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                        <div style="flex: 1;">
                                            <div style="font-weight: 600; color: var(--accent); margin-bottom: 4px;">${q.id}</div>
                                            <div style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">${(q.text || 'Untitled Question').replace(/<[^>]*>/g, '').trim()}</div>
                                            <div style="font-size: 12px; color: var(--muted);">
                                                ${availableOptions.length} options available
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Option Selection -->
                                    <div style="margin-bottom: 12px; padding: 12px; background: var(--surface-1); border-radius: 6px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                            <label style="font-size: 13px; font-weight: 600;">Select Options:</label>
                                            <div style="display: flex; gap: 8px;">
                                                <button onclick="selectAllOptions('${q.id}')" style="font-size: 11px; padding: 2px 6px; background: none; border: 1px solid var(--line); border-radius: 3px; cursor: pointer;">Select All</button>
                                                <button onclick="selectNoneOptions('${q.id}')" style="font-size: 11px; padding: 2px 6px; background: none; border: 1px solid var(--line); border-radius: 3px; cursor: pointer;">Select None</button>
                                            </div>
                                        </div>
                                        <div class="options-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px;">
                                            ${availableOptions.map(opt => `
                                                <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.15s;" onmouseenter="this.style.background='var(--surface-2)'" onmouseleave="this.style.background='transparent'">
                                                    <input type="checkbox" class="option-checkbox" data-question="${q.id}" data-code="${opt.code}" data-label="${opt.label}" checked style="margin: 0;">
                                                    <span>${opt.label || opt.code}</span>
                                                </label>
                                            `).join('')}
                                        </div>
                                    </div>

                                    <button class="btn primary" onclick="applyColumnHeaders('${q.id}', this)" style="width: 100%; padding: 8px; font-size: 13px;">
                                        Use These as Column Headers
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 40px; color: var(--muted);">
                        <p>No previous questions with selectable options found.</p>
                        <p style="font-size: 13px;">Create questions with options, scales, or table columns first.</p>
                    </div>
                `}
            </div>
        </div>
    `;

    // Add helper functions to window for the onclick handlers
    window.selectAllOptions = function(questionId) {
        const checkboxes = modal.querySelectorAll(`input[data-question="${questionId}"]`);
        checkboxes.forEach(cb => cb.checked = true);
    };

    window.selectNoneOptions = function(questionId) {
        const checkboxes = modal.querySelectorAll(`input[data-question="${questionId}"]`);
        checkboxes.forEach(cb => cb.checked = false);
    };

    window.applyColumnHeaders = function(questionId, buttonElement) {
        const checkboxes = modal.querySelectorAll(`input[data-question="${questionId}"]:checked`);
        const selectedOptions = Array.from(checkboxes).map(cb => ({
            code: cb.dataset.code,
            label: cb.dataset.label
        }));

        if (selectedOptions.length === 0) {
            alert('Please select at least one option to use as column headers.');
            return;
        }

        // Apply the selected options as column headers for advanced table
        const question = window.state.questions[currentQuestionIndex];
        if (!question.advancedTable) question.advancedTable = { rows: [], cols: [] };

        // Set the columns to the selected option labels
        question.advancedTable.cols = selectedOptions.map(opt => opt.label || opt.code);

        // Store the source reference for display purposes
        question.advancedTable.columnSource = {
            qid: questionId,
            selectedOptions: selectedOptions
        };
        question.advancedTable.tableVariation = 'Dynamic Column Matrix';

        // Ensure we have some default rows if none exist
        if (!question.advancedTable.rows || question.advancedTable.rows.length === 0) {
            question.advancedTable.rows = ['Row 1', 'Row 2', 'Row 3'];
        }

        // NEW: Set proper table classification after setting all column source
        const hasLikertRows = detectLikertColumnPattern(question.advancedTable.rows || []);

        if (hasLikertRows) {
            // Hybrid: all column source + Likert rows
            const isHybrid = detectAndUpdateHybridTable(question, questionIndex, actions);
            if (isHybrid) {
                console.log('🔗 All column source created hybrid table classification');
            }
        } else {
            // MAP TO YOUR 3-COLUMN SYSTEM FOR DYNAMIC TABLES
            const sourceMode = 'all';
            question.question_type = 'table';  // Always table
            question.question_mode = 'advanced_table';  // Dynamic tables are advanced
            question.table_type = `dynamic_cols_${sourceMode}`;  // Complex hybrid code
            question.table_metadata = {
                base_type: 'dynamic',
                dynamic_type: `cols_${sourceMode}`,
                spss_variable_type: 'nominal',
                source_config: {
                    rows: { mode: 'manual' },
                    columns: { mode: sourceMode, source_qid: questionId }
                }
            };

            // Save to your 3-column system
            actions.onUpdateQuestion(currentQuestionIndex, 'question_type', question.question_type);
            actions.onUpdateQuestion(currentQuestionIndex, 'question_mode', question.question_mode);
            actions.onUpdateQuestion(currentQuestionIndex, 'table_type', question.table_type);
            actions.onUpdateQuestion(currentQuestionIndex, 'table_metadata', question.table_metadata);

            console.log('📊 Classified as dynamic all columns table:', question.table_type);
        }

        // Close modal first, then save with small delay to prevent re-render race
        modal.remove();

        setTimeout(() => {
            console.log('🔧 Modal save executing for question:', currentQuestionIndex, question.id);
            actions.onUpdateQuestion(currentQuestionIndex, 'advancedTable', question.advancedTable);
        }, 100);

        // Clean up global functions
        delete window.selectAllOptions;
        delete window.selectNoneOptions;
        delete window.applyColumnHeaders;
    };

    // Close modal when clicking outside
    modal.addEventListener('click', () => modal.remove());

    document.body.appendChild(modal);
}

/**
 * Shows the pipe insertion modal with dropdown of available questions
 */
function showPipeInsertModal(currentQuestionIndex, qTextInput) {
    const questions = window.state.questions || [];
    const availableQuestions = questions.slice(0, currentQuestionIndex); // Only previous questions

    // Helper function to check if question supports selective option piping
    const supportsSelectiveOptions = (question) => {
        // Check if it's a list question with options (single/multiple choice)
        if (question.mode === 'list' && question.options && question.options.length > 0) {
            return true;
        }

        // Legacy support: check questionType for backward compatibility
        const questionType = question.type || question.mode;
        return ['single', 'multiple', 'multi', 'numeric'].includes(questionType) ||
               (questionType && questionType.includes('range')) ||
               (questionType && questionType.includes('select'));
    };

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-panel" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3>Insert Pipe</h3>
                <button class="icon-btn" onclick="this.closest('.modal').remove()" aria-label="Close">✕</button>
            </div>
            <div class="modal-body">
                <p>Select a previous question to pipe its response into this question:</p>

                ${availableQuestions.length > 0 ? `
                    <div class="pipe-question-list" style="max-height: 300px; overflow-y: auto;">
                        ${availableQuestions.map(q => `
                            <div class="pipe-question-item" data-question-id="${q.id}" style="padding: 12px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: var(--accent); margin-bottom: 4px;">${q.id}</div>
                                        <div style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">${(q.text || 'Untitled Question').replace(/<[^>]*>/g, '').trim()}</div>
                                        ${q.options && q.options.length > 0 ? `
                                            <div style="font-size: 12px; color: var(--muted);">
                                                ${q.options.length} options: ${q.options.slice(0, 3).map(opt => opt.label || opt.code).join(', ')}${q.options.length > 3 ? '...' : ''}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>

                                <!-- Pipe Type Options -->
                                <div class="pipe-options" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line);">
                                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 8px; color: var(--text);">Pipe Type:</label>
                                    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                                        ${q.options && q.options.length > 0 && supportsSelectiveOptions(q) ? `
                                            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.15s;" onmouseenter="this.style.background='var(--surface-2)'" onmouseleave="this.style.background='transparent'">
                                                <input type="radio" name="pipe-type-${q.id}" value="selected" checked style="margin: 0;">
                                                <span>Selected options</span>
                                            </label>
                                            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.15s;" onmouseenter="this.style.background='var(--surface-2)'" onmouseleave="this.style.background='transparent'">
                                                <input type="radio" name="pipe-type-${q.id}" value="selective" style="margin: 0;">
                                                <span>Selection options if</span>
                                            </label>
                                        ` : q.options && q.options.length > 0 ? `
                                            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.15s;" onmouseenter="this.style.background='var(--surface-2)'" onmouseleave="this.style.background='transparent'">
                                                <input type="radio" name="pipe-type-${q.id}" value="label" checked style="margin: 0;">
                                                <span>Selected option text</span>
                                            </label>
                                            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.15s;" onmouseenter="this.style.background='var(--surface-2)'" onmouseleave="this.style.background='transparent'">
                                                <input type="radio" name="pipe-type-${q.id}" value="code" style="margin: 0;">
                                                <span>Selected option code</span>
                                            </label>
                                        ` : `
                                            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.15s;" onmouseenter="this.style.background='var(--surface-2)'" onmouseleave="this.style.background='transparent'">
                                                <input type="radio" name="pipe-type-${q.id}" value="response" checked style="margin: 0;">
                                                <span>Response value</span>
                                            </label>
                                        `}
                                    </div>
                                    <!-- Selective Options Dropdown (initially hidden) -->
                                    ${q.options && q.options.length > 0 && supportsSelectiveOptions(q) ? `
                                        <div class="selective-options-container" style="display: none; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line);">
                                            <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 8px; color: var(--text);">Select Options to Pipe:</label>
                                            <div style="max-height: 140px; overflow-y: auto; border: 1px solid var(--line); border-radius: 6px; padding: 12px; background: var(--surface-1);">
                                                ${q.options.map(opt => `
                                                    <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; margin-bottom: 8px; padding: 6px 8px; border-radius: 4px; cursor: pointer; transition: background 0.15s;" onmouseenter="this.style.background='var(--surface-2)'" onmouseleave="this.style.background='transparent'">
                                                        <input type="checkbox" name="selective-options-${q.id}" value="${opt.code}" style="margin: 0; width: 16px; height: 16px;">
                                                        <span style="font-weight: 600; color: var(--accent); min-width: 30px;">${opt.code}:</span>
                                                        <span style="flex: 1; line-height: 1.3;">${escapeHTML(opt.label)}</span>
                                                    </label>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>

                                <button class="btn" onclick="insertPipe('${q.id}', this)" style="width: 100%; margin-top: 12px; font-size: 13px;">
                                    Insert Pipe
                                </button>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 40px; color: var(--muted);">
                        <p>No previous questions available for piping.</p>
                        <p style="font-size: 12px;">Add questions before this one to enable piping.</p>
                    </div>
                `}
            </div>
            <div class="modal-footer">
                <button class="btn ghost" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
        </div>
        <div class="modal-backdrop" onclick="this.closest('.modal').remove()"></div>
    `;

    document.body.appendChild(modal);

    // Add hover effects
    modal.querySelectorAll('.pipe-question-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.background = 'var(--surface-3)';
            item.style.borderColor = 'var(--accent)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = '';
            item.style.borderColor = 'var(--line)';
        });
    });

    // Add radio button event listeners to show/hide selective options
    modal.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const questionItem = radio.closest('.pipe-question-item');
            const selectiveContainer = questionItem.querySelector('.selective-options-container');

            if (selectiveContainer) {
                if (radio.value === 'selective' && radio.checked) {
                    selectiveContainer.style.display = 'block';
                } else {
                    selectiveContainer.style.display = 'none';
                }
            }
        });
    });

    // Store reference to text input for the insert function
    window.currentPipeTextInput = qTextInput;
}

/**
 * Inserts a pipe into the question text
 */
window.insertPipe = function(questionId, buttonElement) {
    console.log('insertPipe called for question:', questionId);
    console.log('currentPipeTextInput:', window.currentPipeTextInput);

    const modal = buttonElement.closest('.modal');
    const pipeItem = buttonElement.closest('.pipe-question-item');
    const selectedPipeType = pipeItem.querySelector(`input[name="pipe-type-${questionId}"]:checked`);

    console.log('Selected pipe type:', selectedPipeType?.value);

    let pipeCode;
    if (selectedPipeType) {
        const pipeType = selectedPipeType.value;
        if (pipeType === 'label') {
            pipeCode = `{${questionId}:label}`;
        } else if (pipeType === 'code') {
            pipeCode = `{${questionId}}`;
        } else if (pipeType === 'selected') {
            pipeCode = `{${questionId}:label}`;  // Default to label for now
        } else if (pipeType === 'selective') {
            // Get selected option codes
            const checkboxes = pipeItem.querySelectorAll(`input[name="selective-options-${questionId}"]:checked`);
            if (checkboxes.length > 0) {
                const selectedCodes = Array.from(checkboxes).map(cb => cb.value);
                pipeCode = `{${questionId}:${selectedCodes.join(',')}}`;
            } else {
                pipeCode = `{${questionId}}`;  // Fallback if no options selected
            }
        } else {
            pipeCode = `{${questionId}}`;
        }
    } else {
        pipeCode = `{${questionId}}`;
    }

    console.log('Generated pipe code:', pipeCode);

    // Insert the pipe with visual styling
    if (window.currentPipeTextInput) {
        console.log('Inserting pipe into text input...');
        window.currentPipeTextInput.focus();

        // Create a styled pipe element
        const pipeElement = document.createElement('span');
        pipeElement.className = 'pipe-indicator';
        pipeElement.contentEditable = false;
        pipeElement.dataset.pipeCode = pipeCode;
        pipeElement.dataset.questionId = questionId;
        pipeElement.style.cssText = `
            color: #0066cc;
            background: rgba(0, 102, 204, 0.08);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            border: 1px solid rgba(0, 102, 204, 0.25);
            margin: 0 2px;
            display: inline-block;
            font-family: inherit !important;
            font-size: inherit !important;
        `;

        // Helper function to simplify number ranges
        function simplifyRanges(codes) {
            if (!codes || codes.length === 0) return '';

            // Convert to numbers and sort
            const numbers = codes.split(',').map(c => parseInt(c.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b);
            if (numbers.length === 0) return codes; // Fallback to original if no valid numbers

            const ranges = [];
            let start = numbers[0];
            let end = numbers[0];

            for (let i = 1; i < numbers.length; i++) {
                if (numbers[i] === end + 1) {
                    // Consecutive number, extend range
                    end = numbers[i];
                } else {
                    // Gap found, close current range
                    if (start === end) {
                        ranges.push(start.toString());
                    } else if (end === start + 1) {
                        // Only 2 consecutive numbers, list them separately
                        ranges.push(start.toString(), end.toString());
                    } else {
                        // 3+ consecutive numbers, use range notation
                        ranges.push(`${start}-${end}`);
                    }
                    start = end = numbers[i];
                }
            }

            // Handle the last range
            if (start === end) {
                ranges.push(start.toString());
            } else if (end === start + 1) {
                ranges.push(start.toString(), end.toString());
            } else {
                ranges.push(`${start}-${end}`);
            }

            return ranges.join(', ');
        }

        // Determine display text
        const question = window.state.questions.find(q => q.id === questionId);
        let displayText;

        // Check if this is a selective pipe (contains specific codes)
        const selectiveMatch = pipeCode.match(/\{([^}]+):([^}]+)\}/);
        if (selectiveMatch && selectiveMatch[2] !== 'label' && selectiveMatch[2].includes(',')) {
            // Selective pipe with specific codes - apply range simplification
            const simplifiedCodes = simplifyRanges(selectiveMatch[2]);
            displayText = `Pipe in ${questionId} ${simplifiedCodes}`;
        } else if (selectiveMatch && selectiveMatch[2] !== 'label' && !selectiveMatch[2].includes(',')) {
            // Single selective code
            displayText = `Pipe in ${questionId} ${selectiveMatch[2]}`;
        } else if (pipeCode.includes(':label')) {
            if (question && question.options && question.options.length > 0) {
                const optionRange = question.options.length > 1 ? `1-${question.options.length}` : '1';
                displayText = `Pipe in ${questionId} ${optionRange} response`;
            } else {
                displayText = `Pipe in ${questionId} response`;
            }
        } else {
            displayText = `Pipe in ${questionId} response`;
        }

        pipeElement.textContent = displayText;

        // Add click handler to jump to referenced question
        pipeElement.onclick = () => {
            // Find and select the referenced question
            const targetQuestionIndex = window.state.questions.findIndex(q => q.id === questionId);
            if (targetQuestionIndex !== -1) {
                // Dispatch event to parent to handle question navigation
                const event = new CustomEvent('navigateToQuestion', {
                    detail: { questionIndex: targetQuestionIndex }
                });
                document.dispatchEvent(event);
            }
        };

        // Restore cursor position and insert the element
        let insertionRange = window.savedCursorRange;

        if (!insertionRange) {
            // Fallback: insert at the end if no saved position
            insertionRange = document.createRange();
            insertionRange.selectNodeContents(window.currentPipeTextInput);
            insertionRange.collapse(false); // Collapse to end
        }

        // Ensure the range is still valid
        try {
            // Clear any existing selection
            const selection = window.getSelection();
            selection.removeAllRanges();

            // Insert the pipe element at the saved position
            insertionRange.deleteContents();
            insertionRange.insertNode(pipeElement);

            // Move cursor after the inserted element
            insertionRange.setStartAfter(pipeElement);
            insertionRange.setEndAfter(pipeElement);
            selection.addRange(insertionRange);

            // Focus back on the text input
            window.currentPipeTextInput.focus();

        } catch (error) {
            console.warn('Could not restore cursor position, inserting at end:', error);
            // Fallback: append to end
            window.currentPipeTextInput.appendChild(pipeElement);

            // Move cursor to end
            const range = document.createRange();
            const selection = window.getSelection();
            range.setStartAfter(pipeElement);
            range.setEndAfter(pipeElement);
            selection.removeAllRanges();
            selection.addRange(range);
            window.currentPipeTextInput.focus();
        }

        // Trigger input event to update preview
        window.currentPipeTextInput.dispatchEvent(new Event('input', { bubbles: true }));

        console.log('Pipe insertion completed successfully');
    } else {
        console.error('No currentPipeTextInput found - cannot insert pipe');
    }

    // Close modal
    console.log('Closing modal...');
    modal.remove();
    window.currentPipeTextInput = null;
};

/**
 * Shows option selector modal for global termination/must select
 */
function showOptionSelectorModal(type, question, questionIndex, onSelect) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    const title = type === 'termination' ? 'Select Option to Terminate On' : 'Select Required Option';
    const availableOptions = question.options || [];

    modal.innerHTML = `
        <div class="modal-content" style="background: white; padding: 24px; border-radius: 8px; max-width: 400px; width: 90%;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px;">${title}</h3>

            <div class="option-list" style="max-height: 300px; overflow-y: auto; margin-bottom: 16px;">
                ${availableOptions.map(opt => `
                    <div class="option-selector-item" data-option-code="${opt.code}" style="
                        padding: 8px 12px;
                        margin: 4px 0;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: all 0.2s;
                    ">
                        <span class="option-code" style="
                            background: #f5f5f5;
                            padding: 2px 6px;
                            border-radius: 3px;
                            font-family: monospace;
                            font-size: 12px;
                            min-width: 24px;
                            text-align: center;
                        ">${opt.code}</span>
                        <span class="option-label" style="flex: 1;">${escapeHTML(opt.label || '')}</span>
                    </div>
                `).join('')}
            </div>

            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="cancel-btn" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;

    // Option selection
    modal.querySelectorAll('.option-selector-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.background = '#f0f8ff';
            item.style.borderColor = '#007acc';
        });

        item.addEventListener('mouseleave', () => {
            item.style.background = 'white';
            item.style.borderColor = '#ddd';
        });

        item.addEventListener('click', () => {
            const optionCode = item.dataset.optionCode;
            modal.remove();
            onSelect(optionCode);
        });
    });

    // Cancel button
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// --- DRAG AND DROP FUNCTIONALITY ---

/**
 * Sets up drag-and-drop functionality for option reordering
 */
function setupOptionDragAndDrop(hostEl, question, questionIndex, actions) {
    let draggedElement = null;
    let draggedIndex = null;
    let placeholder = null;

    // Handle drag start
    hostEl.addEventListener('mousedown', (e) => {
        const dragHandle = e.target.closest('.drag-handle');
        if (!dragHandle) return;

        e.preventDefault();

        const optionRow = dragHandle.closest('.option-row');
        if (!optionRow) return;

        draggedIndex = parseInt(dragHandle.dataset.optIndex);
        draggedElement = optionRow;

        // Create placeholder
        placeholder = document.createElement('div');
        placeholder.className = 'option-row option-placeholder';
        placeholder.style.height = optionRow.offsetHeight + 'px';
        placeholder.style.margin = '8px 0';
        placeholder.style.background = 'var(--surface-3)';
        placeholder.style.border = '2px dashed var(--accent)';
        placeholder.style.borderRadius = '8px';

        // Style the dragged element
        optionRow.style.opacity = '0.5';
        optionRow.style.transform = 'scale(0.95)';
        optionRow.style.zIndex = '1000';
        optionRow.style.position = 'relative';

        // Add mouse move and up listeners
        const handleMouseMove = (e) => {
            const optionsContainer = hostEl.querySelector('.options-content-area');
            if (!optionsContainer) return;

            const optionRows = Array.from(optionsContainer.querySelectorAll('.option-row:not(.option-placeholder)'));
            const mouseY = e.clientY;

            // Find the closest option row
            let closestRow = null;
            let closestDistance = Infinity;
            let insertBefore = true;

            optionRows.forEach(row => {
                if (row === draggedElement) return;

                const rect = row.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;
                const distance = Math.abs(mouseY - centerY);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestRow = row;
                    insertBefore = mouseY < centerY;
                }
            });

            // Position placeholder
            if (closestRow) {
                if (insertBefore) {
                    closestRow.parentNode.insertBefore(placeholder, closestRow);
                } else {
                    closestRow.parentNode.insertBefore(placeholder, closestRow.nextSibling);
                }
            } else if (optionRows.length > 0) {
                // Insert at the end
                optionRows[optionRows.length - 1].parentNode.appendChild(placeholder);
            }
        };

        const handleMouseUp = (e) => {
            if (!draggedElement || !placeholder) return;

            // Calculate new position
            const optionsContainer = hostEl.querySelector('.options-content-area');
            const allRows = Array.from(optionsContainer.querySelectorAll('.option-row, .option-placeholder'));
            const placeholderIndex = allRows.indexOf(placeholder);

            // Adjust for placeholder position
            let newIndex = placeholderIndex;
            if (placeholderIndex > draggedIndex) {
                newIndex = placeholderIndex - 1;
            }

            // Perform the reorder
            if (newIndex !== draggedIndex && newIndex >= 0) {
                reorderOption(question, questionIndex, draggedIndex, newIndex, actions);
            }

            // Clean up
            draggedElement.style.opacity = '';
            draggedElement.style.transform = '';
            draggedElement.style.zIndex = '';
            draggedElement.style.position = '';

            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.removeChild(placeholder);
            }

            draggedElement = null;
            draggedIndex = null;
            placeholder = null;

            // Remove event listeners
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        // Add event listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    });
}

/**
 * Reorders an option in the question's options array
 */
function reorderOption(question, questionIndex, fromIndex, toIndex, actions) {
    if (!question.options || fromIndex === toIndex) return;

    const options = [...question.options];
    const [movedOption] = options.splice(fromIndex, 1);
    options.splice(toIndex, 0, movedOption);

    question.options = options;
    actions.onUpdateQuestion(questionIndex, 'options', options);
}

// --- TABLE UTILITY FUNCTIONS ---

/**
 * Renders an interactive table builder with controls built into the table
 */
function renderInteractiveTableBuilder(question, questionIndex) {
    const rows = question.grid?.rows || [];
    const cols = question.grid?.cols || [];
    const isRanking = question.type === 'ranking';
    const isMulti = question.type === 'grid_multi';

    if (rows.length === 0 && cols.length === 0) {
        return `
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background: var(--surface-2);">
                        <th style="padding: 10px; border: 1px solid var(--line); text-align: center; font-weight: 600; background: var(--surface-3);">
                            <button class="btn" data-action="add-table-row" style="padding: 4px 8px; font-size: 12px;">+ Add Row</button>
                        </th>
                        <th style="padding: 10px; border: 1px solid var(--line); text-align: center; font-weight: 600;">
                            <button class="btn" data-action="add-table-col" data-btn-type="empty-table" style="padding: 4px 8px; font-size: 12px;">+ Add Column</button>
                        </th>
                    </tr>
                </thead>
            </table>
        `;
    }

    return `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
                <tr style="background: var(--surface-2);">
                    <th style="padding: 10px; border: 1px solid var(--line); text-align: left; font-weight: 600; background: var(--surface-3); min-width: 200px;">
                        Statements
                    </th>
                    ${cols.map((col, colIndex) => `
                        <th style="padding: 8px; border: 1px solid var(--line); text-align: center; font-weight: 600; min-width: 120px; position: relative;">
                            <input value="${escapeHTML(col)}"
                                   placeholder="Column ${colIndex + 1}"
                                   data-action="update-table-col"
                                   data-col-index="${colIndex}"
                                   style="background: transparent; border: none; text-align: center; font-weight: 600; width: 100%; font-size: 13px; color: inherit;">
                            <button class="delete-column-btn"
                                    data-action="delete-table-col"
                                    data-col-index="${colIndex}"
                                    style="position: absolute; top: 2px; right: 2px; padding: 2px 4px; font-size: 10px; opacity: 0.3; transition: opacity 0.2s;"
                                    title="Delete column">✕</button>
                        </th>
                    `).join('')}
                    <th style="padding: 10px; border: 1px solid var(--line); text-align: center; font-weight: 600; width: 60px;">
                        <button class="btn" data-action="add-table-col" data-btn-type="header-col" style="padding: 4px 8px; font-size: 12px;">+</button>
                    </th>
                </tr>
            </thead>
            <tbody>
                ${rows.map((row, rowIndex) => `
                    <tr style="background: ${rowIndex % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)'};">
                        <td style="padding: 8px; border: 1px solid var(--line); font-weight: 500; position: relative;">
                            <input value="${escapeHTML(row)}"
                                   placeholder="Row ${rowIndex + 1}"
                                   data-action="update-table-row"
                                   data-row-index="${rowIndex}"
                                   style="background: transparent; border: none; font-weight: 500; width: calc(100% - 20px); font-size: 13px; color: inherit;">
                            <button class="delete-row-btn"
                                    data-action="delete-table-row"
                                    data-row-index="${rowIndex}"
                                    style="position: absolute; top: 2px; right: 2px; padding: 2px 4px; font-size: 10px; opacity: 0.3; transition: opacity 0.2s;"
                                    title="Delete row">✕</button>
                        </td>
                        ${cols.map((col, colIndex) => `
                            <td style="padding: 8px; border: 1px solid var(--line); text-align: center;">
                                ${isRanking ?
                                    `<select style="width: 60px; padding: 2px; font-size: 12px;"><option>-</option>${cols.map((_, i) => `<option>${i + 1}</option>`).join('')}</select>` :
                                    `<input type="${isMulti ? 'checkbox' : 'radio'}" name="preview_row_${rowIndex}" style="pointer-events: none; transform: scale(1.1);">`
                                }
                            </td>
                        `).join('')}
                        <td style="padding: 8px; border: 1px solid var(--line); text-align: center; width: 60px;">
                            <span style="color: var(--muted); font-size: 11px;">${rowIndex + 1}</span>
                        </td>
                    </tr>
                `).join('')}
                <tr style="background: var(--surface-3);">
                    <td style="padding: 8px; border: 1px solid var(--line); text-align: center;">
                        <button class="btn" data-action="add-table-row" style="padding: 4px 8px; font-size: 12px;">+ Add Row</button>
                    </td>
                    ${cols.map(() => `
                        <td style="padding: 8px; border: 1px solid var(--line); text-align: center;">
                            <span style="color: var(--muted); font-size: 11px;">—</span>
                        </td>
                    `).join('')}
                    <td style="padding: 8px; border: 1px solid var(--line); text-align: center; width: 60px;">
                        <span style="color: var(--muted); font-size: 11px;">+</span>
                    </td>
                </tr>
            </tbody>
        </table>
        <style>
            .editable-table tr:hover .delete-column-btn,
            .editable-table tr:hover .delete-row-btn {
                opacity: 1 !important;
            }
        </style>
    `;
}

/**
 * Renders a preview of the table question
 */
/**
 * Renders the advanced table preview with unified row/column controls
 */
function renderAdvancedTablePreview(question, questionIndex) {
    const rows = question.advancedTable?.rows || [];
    const cols = question.advancedTable?.cols || [];
    const isRanking = question.type === 'ranking';
    const isMulti = question.type === 'grid_multi';

    if (rows.length === 0 && cols.length === 0) {
        return `
            <div style="padding: 40px; text-align: center; color: var(--muted);">
                <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
                <h3 style="margin: 0 0 8px 0; font-size: 18px;">Advanced Table Builder</h3>
                <p style="margin: 0; font-size: 14px;">Add rows and columns to build your table, or use the Preset Library for quick starts.</p>
                <div style="margin-top: 16px; display: flex; gap: 8px; justify-content: center;">
                    <button class="btn" data-action="add-adv-row" style="padding: 8px 12px;">+ Add First Row</button>
                    <button class="btn" data-action="add-adv-col" style="padding: 8px 12px;">+ Add First Column</button>
                </div>
            </div>
        `;
    }

    if (rows.length === 0) {
        return `
            <div style="padding: 30px; text-align: center; color: var(--muted);">
                <p>You have ${cols.length} column(s). Add some row statements to complete your table.</p>
                <button class="btn" data-action="add-adv-row" style="padding: 8px 12px;">+ Add First Row</button>
            </div>
        `;
    }

    if (cols.length === 0) {
        return `
            <div style="padding: 30px; text-align: center; color: var(--muted);">
                <p>You have ${rows.length} row(s). Add some column headers to complete your table.</p>
                <button class="btn" data-action="add-adv-col" style="padding: 8px 12px;">+ Add First Column</button>
            </div>
        `;
    }

    return `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
                <tr style="background: var(--surface-2);">
                    <th style="padding: 12px; border: 1px solid var(--line); text-align: left; font-weight: 600; background: var(--surface-3); min-width: 200px;">
                        Statements
                    </th>
                    ${cols.map((col, colIndex) => `
                        <th style="padding: 10px; border: 1px solid var(--line); text-align: center; font-weight: 600; min-width: 120px;">
                            ${col || `Column ${colIndex + 1}`}
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
                ${rows.map((row, rowIndex) => `
                    <tr style="background: ${rowIndex % 2 === 0 ? 'var(--surface-1)' : 'white'};">
                        <td style="padding: 10px; border: 1px solid var(--line); font-weight: 500;">
                            ${row || `Row ${rowIndex + 1}`}
                        </td>
                        ${cols.map((col, colIndex) => `
                            <td style="padding: 8px; border: 1px solid var(--line); text-align: center;">
                                ${isRanking ?
                                    `<select style="width: 60px; padding: 2px; font-size: 12px;" disabled><option>-</option>${cols.map((_, i) => `<option>${i + 1}</option>`).join('')}</select>` :
                                    `<input type="${isMulti ? 'checkbox' : 'radio'}" name="preview_row_${rowIndex}" style="pointer-events: none; transform: scale(1.1);" disabled>`
                                }
                            </td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top: 12px; padding: 8px 12px; background: var(--surface-1); border-radius: 4px; font-size: 12px; color: var(--muted);">
            Preview: ${rows.length} statements × ${cols.length} response options
            ${isRanking ? '(Ranking)' : isMulti ? '(Multi-select)' : '(Single-select)'}
        </div>
    `;
}

function renderTablePreview(question) {
    if (!question.grid || (!question.grid.rows?.length && !question.grid.cols?.length)) {
        return '<div class="muted" style="padding: 20px; text-align: center;">Add rows and columns to see preview</div>';
    }

    const rows = question.grid.rows || [];
    const cols = question.grid.cols || [];
    const isRanking = question.type === 'ranking';
    const isMulti = question.type === 'grid_multi';

    if (rows.length === 0 || cols.length === 0) {
        return '<div class="muted" style="padding: 20px; text-align: center;">Add both rows and columns to see preview</div>';
    }

    return `
        <div class="table-preview" style="overflow-x: auto; border: 1px solid var(--line); border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: var(--surface-2);">
                        <th style="padding: 8px 12px; text-align: left; border-right: 1px solid var(--line); min-width: 200px; font-weight: 600;"></th>
                        ${cols.map(col => `<th style="padding: 8px 12px; text-align: center; border-right: 1px solid var(--line); min-width: 100px; font-weight: 600;">${escapeHTML(col)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((row, rowIndex) => `
                        <tr style="border-bottom: 1px solid var(--line);">
                            <td style="padding: 8px 12px; border-right: 1px solid var(--line); font-weight: 500;">${escapeHTML(row)}</td>
                            ${cols.map((col, colIndex) => `
                                <td style="padding: 8px 12px; text-align: center; border-right: 1px solid var(--line);">
                                    ${isRanking ?
                                        `<select style="width: 60px; padding: 2px;"><option>-</option>${cols.map((_, i) => `<option>${i + 1}</option>`).join('')}</select>` :
                                        `<input type="${isMulti ? 'checkbox' : 'radio'}" name="q_${rowIndex}" value="${colIndex}" style="transform: scale(1.1);">`
                                    }
                                </td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="muted" style="font-size: 11px; margin-top: 8px; padding: 8px; background: var(--surface-3); border-radius: 4px;">
            Preview shows ${question.type === 'ranking' ? 'ranking dropdowns' : question.type === 'grid_multi' ? 'checkboxes' : 'radio buttons'} • ${rows.length} rows × ${cols.length} columns
        </div>
    `;
}

/**
 * Renders a preview of the repeated options question
 */
function renderRepeatedPreview(question, questionIndex) {
    const repeated = question.repeated || {};
    const columns = repeated.columns || [];

    if (!repeated.source_qid) {
        return '<div class="muted" style="padding: 20px; text-align: center;">Select a source question to see preview</div>';
    }

    if (columns.length === 0) {
        return '<div class="muted" style="padding: 20px; text-align: center;">Add columns to see preview</div>';
    }

    // Find source question
    const sourceQuestion = (window.state.questions || []).find(q => q.id === repeated.source_qid);
    if (!sourceQuestion || !sourceQuestion.options || sourceQuestion.options.length === 0) {
        return '<div class="muted" style="padding: 20px; text-align: center;">Source question not found or has no options</div>';
    }

    const rows = sourceQuestion.options;

    return `
        <div class="table-preview" style="overflow-x: auto; border: 1px solid var(--line); border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--surface-2);">
                        <th style="padding: 12px; border: 1px solid var(--line); text-align: left; font-weight: 600;"></th>
                        ${columns.map(col => `
                            <th style="padding: 12px; border: 1px solid var(--line); text-align: center; font-weight: 600;">
                                ${escapeHTML(col)}
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((row, rowIndex) => `
                        <tr style="background: ${rowIndex % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)'};">
                            <td style="padding: 12px; border: 1px solid var(--line); font-weight: 500;">
                                ${escapeHTML(row.label || row.code || `Option ${rowIndex + 1}`)}
                            </td>
                            ${columns.map((col, colIndex) => `
                                <td style="padding: 12px; border: 1px solid var(--line); text-align: center;">
                                    <input type="radio" name="preview_row_${rowIndex}" style="pointer-events: none;" />
                                </td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="muted" style="font-size: 11px; margin-top: 8px; padding: 8px; background: var(--surface-3); border-radius: 4px;">
            Preview shows radio buttons • ${rows.length} rows from "${sourceQuestion.id}" × ${columns.length} columns
        </div>
    `;
}

/**
 * Renders an editable preview of the repeated options question
 */
function renderEditableRepeatedPreview(question, questionIndex) {
    const repeated = question.repeated || {};
    const columns = repeated.columns || [];

    if (!repeated.source_qid) {
        return '<div class="muted" style="padding: 20px; text-align: center;">Select a source question to see table</div>';
    }

    // Find source question
    const sourceQuestion = (window.state.questions || []).find(q => q.id === repeated.source_qid);
    if (!sourceQuestion || !sourceQuestion.options || sourceQuestion.options.length === 0) {
        return '<div class="muted" style="padding: 20px; text-align: center;">Source question not found or has no options</div>';
    }

    const rows = sourceQuestion.options;

    return `
        <style>
            .editable-table th:hover .delete-column-btn {
                opacity: 1 !important;
            }
        </style>
        <div class="table-preview editable-table" style="overflow-x: auto; border: 1px solid var(--line); border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background: var(--surface-2);">
                        <th style="padding: 10px; border: 1px solid var(--line); text-align: left; font-weight: 600; background: var(--surface-3); font-size: 12px;">
                            Row Source: ${sourceQuestion.id} - ${(() => {
                                // Clean up the question text for display
                                const cleanText = (sourceQuestion.text || '')
                                    .replace(/<[^>]*>/g, '') // Remove HTML tags
                                    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular spaces
                                    .replace(/&amp;/g, '&')  // Replace &amp; with &
                                    .replace(/&lt;/g, '<')   // Replace &lt; with <
                                    .replace(/&gt;/g, '>')   // Replace &gt; with >
                                    .replace(/&quot;/g, '"') // Replace &quot; with "
                                    .replace(/&#x27;/g, "'") // Replace &#x27; with '
                                    .replace(/\s+/g, ' ')    // Replace multiple whitespace with single space
                                    .trim();
                                // Truncate if too long
                                return cleanText.length > 40 ? cleanText.substring(0, 40) + '...' : cleanText;
                            })()}
                        </th>
                        ${columns.map((col, colIndex) => `
                            <th style="padding: 10px; border: 1px solid var(--line); text-align: center; position: relative; width: ${100 / (columns.length + 1)}%;">
                                <input
                                    type="text"
                                    class="column-header-input"
                                    value="${escapeHTML(col)}"
                                    placeholder="Column ${colIndex + 1}"
                                    data-action="update-repeated"
                                    data-key="column"
                                    data-col-index="${colIndex}"
                                    style="width: 100%; border: none; background: transparent; text-align: center; font-weight: 600; padding: 6px; font-size: 14px;"
                                />
                                <button
                                    class="delete-column-btn"
                                    data-action="delete-repeated-col"
                                    data-col-index="${colIndex}"
                                    style="position: absolute; top: 2px; right: 2px; width: 16px; height: 16px; border: none; background: var(--danger); color: white; border-radius: 50%; font-size: 10px; cursor: pointer; line-height: 1; opacity: 0; transition: opacity 0.2s;"
                                    title="Delete column"
                                >×</button>
                            </th>
                        `).join('')}
                        <th style="padding: 10px; border: 1px solid var(--line); text-align: center; width: 50px;">
                            <button
                                class="add-column-btn"
                                data-action="add-repeated-col"
                                style="width: 26px; height: 26px; border: 1px dashed var(--line-2); background: var(--surface-1); border-radius: 4px; cursor: pointer; font-size: 14px; color: var(--text-2);"
                                title="Add column"
                            >+</button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${[
                        `${sourceQuestion.id} selection 1...`,
                        `${sourceQuestion.id} selection 2...`,
                        `${sourceQuestion.id} selection n...`
                    ].map((rowLabel, rowIndex) => `
                        <tr style="background: ${rowIndex % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)'};">
                            <td style="padding: 12px 14px; border: 1px solid var(--line); font-weight: 500; color: var(--text-2); font-style: italic; font-size: 14px;">
                                ${escapeHTML(rowLabel)}
                            </td>
                            ${columns.map((col, colIndex) => `
                                <td style="padding: 12px; border: 1px solid var(--line); text-align: center;">
                                    <input type="radio" name="preview_row_${rowIndex}" style="pointer-events: none;" />
                                </td>
                            `).join('')}
                            <td style="padding: 12px; border: 1px solid var(--line); background: var(--surface-3);"></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="muted" style="font-size: 10px; margin-top: 6px; padding: 6px 8px; background: var(--surface-3); border-radius: 4px;">
            Rows will be populated from "${sourceQuestion.id}" selections × ${columns.length} columns
        </div>
    `;
}


// --- PERFORMANCE MEASUREMENT TOOLS ---
function measureRenderTime(label, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
}

// Expose for debugging
window.measureEditorPerformance = measureRenderTime;

// --- MAIN RENDER FUNCTION ---

export function renderEditorPanel({ hostEl, question, questionIndex, activeTab, actions }) {
    return measureRenderTime('Full renderEditorPanel', () => {

    // --- SURGICAL EVENT CLEANUP ---
    // Only cleanup elements that specifically need it (much faster than DOM replacement)
    function cleanupStaleEventListeners(hostEl) {
        return measureRenderTime('Event Listener Cleanup', () => {
            // Only cleanup elements that get dynamic content and need event listener refresh
            const staleElements = hostEl.querySelectorAll('[data-needs-cleanup]');
            console.log(`🔧 Cleaning up ${staleElements.length} stale elements (vs entire DOM before)`);
            staleElements.forEach(el => {
                const newEl = el.cloneNode(true);
                el.parentNode.replaceChild(newEl, el);
                newEl.removeAttribute('data-needs-cleanup');
            });
        });
    }

    // Use surgical cleanup instead of catastrophic DOM replacement
    cleanupStaleEventListeners(hostEl);

    // --- FALLBACK ACTIONS ---
    // Add missing action functions as fallbacks
    if (!actions.onAlphabetizeOptions) {
        actions.onAlphabetizeOptions = (questionIndex) => {
            const question = window.state.questions[questionIndex];
            if (question.options && question.options.length > 0) {
                question.options.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
                // Trigger re-render by updating the question
                actions.onUpdateQuestion(questionIndex, 'options', question.options);
            }
        };
    }

    if (!actions.onAddOption) {
        actions.onAddOption = (questionIndex) => {
            const question = window.state.questions[questionIndex];
            if (!question.options) question.options = [];
            const nextCode = question.options.length ? Math.max(...question.options.map(o => parseInt(o.code, 10) || 0)) + 1 : 1;
            question.options.push({ code: nextCode, label: '' });

            // Use debounced save pattern from CLAUDE.md
            const timeoutKey = `add-option-${questionIndex}`;
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                actions.onUpdateQuestion(questionIndex, 'options', question.options);
                delete optionUpdateTimeouts[timeoutKey];
            }, 100); // Short delay for add operations to prevent UI blocking
        };
    }

    if (!actions.onBulkAddOptions) {
        actions.onBulkAddOptions = (questionIndex, text) => {
            const question = window.state.questions[questionIndex];
            if (!question.options) question.options = [];

            const lines = text.split('\n').filter(line => line.trim());
            lines.forEach((line, index) => {
                const trimmed = line.trim();
                if (trimmed) {
                    question.options.push({
                        code: String(question.options.length + 1),
                        label: trimmed
                    });
                }
            });
            // Trigger re-render by updating the question
            actions.onUpdateQuestion(questionIndex, 'options', question.options);
        };
    }

    // Add missing global terminate actions
    if (!actions.onSetGlobalTerminate) {
        actions.onSetGlobalTerminate = (questionIndex, config) => {
            const question = window.state.questions[questionIndex];
            if (!question.numeric) question.numeric = {};

            if (config.enabled) {
                question.numeric.globalTerminate = {
                    enabled: true,
                    operator: config.operator,
                    value1: config.value1,
                    value2: config.value2
                };
            } else {
                question.numeric.globalTerminate = { enabled: false };
            }

            // Trigger re-render by updating the question
            actions.onUpdateQuestion(questionIndex, 'numeric', question.numeric);
        };
    }

    if (!actions.onUpdateGlobalTerminate) {
        actions.onUpdateGlobalTerminate = (questionIndex, key, value) => {
            const question = window.state.questions[questionIndex];
            if (!question.numeric) question.numeric = {};
            if (!question.numeric.globalTerminate) question.numeric.globalTerminate = { enabled: false };

            question.numeric.globalTerminate[key] = value;

            // Trigger re-render by updating the question
            actions.onUpdateQuestion(questionIndex, 'numeric', question.numeric);
        };
    }

    // Add missing numeric actions
    if (!actions.onUpdateNumeric) {
        actions.onUpdateNumeric = (questionIndex, key, value) => {
            const question = window.state.questions[questionIndex];
            if (!question.numeric) question.numeric = {};

            // Handle checkbox values
            if (key === 'allow_decimals') {
                question.numeric[key] = value;
            } else {
                question.numeric[key] = value;
            }

            // Only save to database, don't re-render for simple field updates like placeholder
            if (key === 'placeholder' || key === 'min' || key === 'max' || key === 'unit') {
                // Just save to database without re-rendering
                console.log('Saving numeric field without re-render:', key, '=', value);
                if (window.queueAutosave) {
                    window.queueAutosave();
                }
            } else {
                // For other changes that need UI updates, trigger re-render
                actions.onUpdateQuestion(questionIndex, 'numeric', question.numeric);
            }
        };
    }

    if (!actions.onUpdateNumericType) {
        actions.onUpdateNumericType = (questionIndex, type) => {
            const question = window.state.questions[questionIndex];
            if (!question.numeric) question.numeric = {};
            question.numeric.type = type;

            // Trigger re-render by updating the question
            actions.onUpdateQuestion(questionIndex, 'numeric', question.numeric);
        };
    }

    if (!actions.onUpdateNumericRange) {
        actions.onUpdateNumericRange = (questionIndex, rangeIndex, key, value) => {
            const question = window.state.questions[questionIndex];
            if (!question.numeric) question.numeric = {};
            if (!question.numeric.ranges) question.numeric.ranges = [];

            if (!question.numeric.ranges[rangeIndex]) {
                question.numeric.ranges[rangeIndex] = {};
            }

            question.numeric.ranges[rangeIndex][key] = value;

            // Trigger re-render by updating the question
            actions.onUpdateQuestion(questionIndex, 'numeric', question.numeric);
        };
    }

    if (!actions.onUpdateNumericRangeExtra) {
        actions.onUpdateNumericRangeExtra = (questionIndex, rangeIndex, key, value) => {
            const question = window.state.questions[questionIndex];
            if (!question.numeric) question.numeric = {};
            if (!question.numeric.ranges) question.numeric.ranges = [];

            if (!question.numeric.ranges[rangeIndex]) {
                question.numeric.ranges[rangeIndex] = {};
            }

            question.numeric.ranges[rangeIndex][key] = value;

            // Trigger re-render by updating the question
            actions.onUpdateQuestion(questionIndex, 'numeric', question.numeric);
        };
    }

    // Add table actions from modular system
    const tableActions = getTableActions(
        actions.onUpdateQuestion,
        window.queueAutosave || (() => {}),
        () => window.renderEditorPanel ? window.renderEditorPanel() : renderEditorPanel({ hostEl, question, questionIndex, activeTab, actions })
    );

    // Add termination actions from modular system
    const terminationActions = getTerminationActions(hostEl, questionIndex, actions);

    // Merge table actions into main actions object
    Object.assign(actions, tableActions);

    // Setup legacy table helpers for backward compatibility
    setupLegacyTableHelpers();
    window.tableActions = tableActions;


    // --- DATA PREPARATION ---
    const mode = question.mode || 'list';
    const N = question.numeric || {};
    const getListSelection = (q) => (q.type === 'multi' || q.type === 'grid_multi') ? 'multi' : 'single';

    // Ensure table questions have proper grid structure on render
    if (mode === 'table') {
        ensureTableGrid(question);
        updateTableVariation(question);
    }


    // --- MODE-SPECIFIC TEMPLATES ---
    const modeSpecificHTML = {
        'list': `
            <!-- DEBUG: Options count: ${(question.options || []).length} -->
            <div class="options-content-area">
                ${(() => {
                    console.log(`🔍 RENDERING DEBUG for question ${questionIndex}:`, {
                        questionId: question.id,
                        hasOptions: !!question.options,
                        optionsCount: (question.options || []).length,
                        optionsArray: question.options,
                        questionMode: question.mode,
                        questionType: question.type
                    });
                    return (question.options || []).map((o, j) => `
                    <div class="option-row"
                         ${o.medicationGroup ? `data-medication-group="${o.medicationGroup}"` : ''}
                         ${o.preferredName ? `data-preferred-name="true"` : ''}
                         ${o.anchor ? `data-anchor="${o.anchor}"` : ''}>
                        <div class="option-editor-row">
                            <div class="drag-handle" data-opt-index="${j}" title="Drag to reorder">⋮⋮</div>
                            <span style="width: 32px; text-align: center; color: var(--text-muted); font-size: 13px; font-weight: 500;">${j + 1}</span>
                            <input class="form-control" placeholder="Option text" value="${escapeHTML(o.label || '')}" data-action="update-option" data-opt-index="${j}" data-key="label" data-validation-field="optionLabel" id="optLabel-${questionIndex}-${j}" style="flex: 1; border: none; padding: 4px 8px; font-size: 14px;"/>

                            <!-- Inline Behavior Icons -->
                            <div class="option-behaviors-inline">
                                <div class="behavior-icon ${o.exclusive ? 'active' : ''}"
                                     data-action="toggle-option-behavior"
                                     data-opt-index="${j}"
                                     data-key="exclusive"
                                     data-current="${o.exclusive ? 'true' : 'false'}"
                                     title="Exclusive">🚫</div>
                                <div class="behavior-icon ${o.terminate ? 'active' : ''}"
                                     data-action="toggle-option-behavior"
                                     data-opt-index="${j}"
                                     data-key="terminate"
                                     data-current="${o.terminate ? 'true' : 'false'}"
                                     title="Terminate">⏹️</div>
                                <div class="behavior-icon ${o.mustSelectToContinue ? 'active' : ''}"
                                     data-action="toggle-option-behavior"
                                     data-opt-index="${j}"
                                     data-key="mustSelectToContinue"
                                     data-current="${o.mustSelectToContinue ? 'true' : 'false'}"
                                     title="Must select">⚠️</div>
                                <div class="behavior-icon ${o.lock_randomize ? 'active' : ''}"
                                     data-action="toggle-option-behavior"
                                     data-opt-index="${j}"
                                     data-key="lock_randomize"
                                     data-current="${o.lock_randomize ? 'true' : 'false'}"
                                     title="Lock">🔒</div>
                            </div>

                            <button class="option-settings-btn" title="Advanced Settings" data-action="toggle-advanced" data-target="adv-opt-${questionIndex}-${j}">⚙️</button>
                            <button class="icon-btn danger" title="Delete" data-action="delete-option" data-opt-index="${j}" style="opacity: 0.5;">🗑️</button>
                        </div>
                        <div class="advanced-options is-hidden" id="adv-opt-${questionIndex}-${j}">
                           <div id="pipeHost-opt-${j}" class="stack" style="margin-bottom: 8px;"></div>
                           <div class="stack" style="gap:12px; width: 100%; flex-direction: column;">
                                <!-- Advanced Option Settings -->
                                <div class="option-settings-container">

                                    <!-- Group Label Section -->
                                    <div class="option-group-label-section">
                                        <label>Assign Group Label</label>
                                        <div style="display: flex; gap: 8px; align-items: flex-end;">
                                            <input type="text" class="form-control" placeholder="e.g., semaglutide, demographics"
                                                   value="${o.medicationGroup || ''}" style="flex: 1;"
                                                   data-action="update-option-extra" data-opt-index="${j}" data-key="medicationGroup"/>
                                            <div class="behavior-toggle compact-preferred ${o.preferredName ? 'checked' : ''}"
                                                 data-action="toggle-option-behavior" data-opt-index="${j}" data-key="preferredName"
                                                 data-current="${o.preferredName ? 'true' : 'false'}"
                                                 title="Mark as preferred option">
                                                <span class="icon">⭐</span>
                                                <span>Preferred</span>
                                            </div>
                                        </div>

                                        <!-- Position Control -->
                                        <div class="option-position-section">
                                            <label>Anchor</label>
                                            <select class="form-control" data-action="update-option-extra" data-opt-index="${j}" data-key="anchor" style="max-width: 140px;">
                                                <option value="" ${!o.anchor ? 'selected' : ''}>🎯 None</option>
                                                <option value="top" ${o.anchor === 'top' ? 'selected' : ''}>⬆️ Pin to Top</option>
                                                <option value="bottom" ${o.anchor === 'bottom' ? 'selected' : ''}>⬇️ Pin to Bottom</option>
                                            </select>
                                        </div>
                                    </div>

                                    <!-- Option Behaviors Grid -->
                                    <div class="option-behaviors-section">
                                        <label>Option Behaviors</label>
                                        <div class="behavior-toggle-grid">
                                            <div class="behavior-toggle ${o.exclusive ? 'checked' : ''}" data-action="toggle-option-behavior" data-opt-index="${j}" data-key="exclusive" data-current="${o.exclusive ? 'true' : 'false'}">
                                                <span class="icon">🚫</span>
                                                <span>Exclusive</span>
                                            </div>
                                            <div class="behavior-toggle ${o.terminate ? 'checked' : ''}" data-action="toggle-option-behavior" data-opt-index="${j}" data-key="terminate" data-current="${o.terminate ? 'true' : 'false'}">
                                                <span class="icon">⏹️</span>
                                                <span>Terminate</span>
                                            </div>
                                            <div class="behavior-toggle ${o.mustSelectToContinue ? 'checked' : ''}" data-action="toggle-option-behavior" data-opt-index="${j}" data-key="mustSelectToContinue" data-current="${o.mustSelectToContinue ? 'true' : 'false'}">
                                                <span class="icon">⚠️</span>
                                                <span>Must select</span>
                                            </div>
                                            <div class="behavior-toggle ${o.lock_randomize ? 'checked' : ''}" data-action="toggle-option-behavior" data-opt-index="${j}" data-key="lock_randomize" data-current="${o.lock_randomize ? 'true' : 'false'}">
                                                <span class="icon">🔒</span>
                                                <span>Lock</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`).join('');
                })() || '<div class="muted" style="padding: 10px;">No options yet.</div>'}
            </div>`,
        'numeric': `
            <div class="options-content-area" style="padding: 12px;">
                <!-- Input Type Selection -->
                <div class="numeric-tabs">
                    <div class="numeric-tab ${!question.numeric?.type || question.numeric?.type === 'input' || question.numeric?.type === 'dropdown' ? 'active' : ''}" data-action="update-numeric-type" data-type="input">
                        🔢 Input
                    </div>
                    <div class="numeric-tab ${question.numeric?.type === 'ranges' ? 'active' : ''}" data-action="update-numeric-type" data-type="ranges">
                        📋 Select
                    </div>
                </div>

                <!-- Input Configuration -->
                <div id="numeric-input-config" ${question.numeric?.type && question.numeric?.type !== 'input' && question.numeric?.type !== 'dropdown' ? 'style="display:none;"' : ''}>
                    <!-- Main Grid: Min/Max/Unit -->
                    <div class="numeric-form-grid">
                        <div class="numeric-form-group">
                            <label>Min Value</label>
                            <input class="form-control" type="number" placeholder="0" value="${N.min ?? ''}" data-action="update-numeric" data-key="min" data-validation-field="numericRange" id="numericMin-${questionIndex}"/>
                        </div>
                        <div class="numeric-form-group">
                            <label>Max Value</label>
                            <input class="form-control" type="number" placeholder="100" value="${N.max ?? ''}" data-action="update-numeric" data-key="max" data-validation-field="numericRange" id="numericMax-${questionIndex}"/>
                        </div>
                        <div class="numeric-form-group">
                            <label>Unit</label>
                            <select class="form-control" data-action="update-numeric" data-key="unit">
                                <option value="" ${!N.unit ? 'selected' : ''}>None</option>
                                <optgroup label="Time">
                                    <option value="years" ${N.unit === 'years' ? 'selected' : ''}>Years</option>
                                    <option value="months" ${N.unit === 'months' ? 'selected' : ''}>Months</option>
                                    <option value="days" ${N.unit === 'days' ? 'selected' : ''}>Days</option>
                                </optgroup>
                                <optgroup label="Other">
                                    <option value="count" ${N.unit === 'count' ? 'selected' : ''}>Count</option>
                                    <option value="currency" ${N.unit === 'currency' ? 'selected' : ''}>Currency</option>
                                    <option value="percentage" ${N.unit === 'percentage' ? 'selected' : ''}>%</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>
                    <div id="numericRange-validation" class="field-validation"></div>

                    <!-- Input Label (Full Width) -->
                    <div style="margin-bottom: 12px;">
                        <div class="numeric-form-group">
                            <label>Input Label</label>
                            <input class="form-control" type="text"
                                   placeholder="e.g., ___ years old"
                                   value="${N.placeholder || ''}"
                                   data-action="update-numeric" data-key="placeholder"/>
                        </div>
                    </div>

                    <!-- Options Row: Checkboxes + Terminate Conditions -->
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
                        <label class="checkbox-option ${N.allow_decimals ? 'checked' : ''}">
                            <input type="checkbox" ${N.allow_decimals ? 'checked' : ''} data-action="update-numeric" data-key="allow_decimals">
                            Allow decimals
                        </label>
                        <label class="checkbox-option ${question.numeric?.type === 'dropdown' ? 'checked' : ''}">
                            <input type="checkbox" ${question.numeric?.type === 'dropdown' ? 'checked' : ''} data-action="update-numeric-type" data-type="${question.numeric?.type === 'dropdown' ? 'input' : 'dropdown'}">
                            Make Dropdown
                        </label>

                        <!-- Terminate Conditions Inline -->
                        <div style="display: flex; align-items: center; gap: 6px; margin-left: auto;">
                            <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); white-space: nowrap;">Terminate if</span>
                            <select class="form-control" style="width: 140px; padding: 4px 8px; font-size: 12px;" data-action="update-terminate-condition" data-key="terminateCondition">
                                <option value="" ${!N.terminateCondition ? 'selected' : ''}>None</option>
                                <option value="between" ${N.terminateCondition === 'between' ? 'selected' : ''}>Between</option>
                                <option value="gt" ${N.terminateCondition === 'gt' ? 'selected' : ''}>&gt;</option>
                                <option value="lt" ${N.terminateCondition === 'lt' ? 'selected' : ''}>&lt;</option>
                                <option value="gte" ${N.terminateCondition === 'gte' ? 'selected' : ''}>&gt;=</option>
                                <option value="lte" ${N.terminateCondition === 'lte' ? 'selected' : ''}>&lt;=</option>
                                <option value="equals" ${N.terminateCondition === 'equals' ? 'selected' : ''}>=</option>
                            </select>

                            <!-- Terminate Value Inputs - Inline -->
                            <div class="terminate-inline-inputs" style="display: ${!N.terminateCondition || N.terminateCondition === '' ? 'none' : 'flex'}; align-items: center; gap: 4px;">
                                ${N.terminateCondition === 'between' ? `
                                    <input class="form-control" type="number" placeholder="Min" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                           value="${N.terminateValue1 || ''}"
                                           data-action="update-numeric" data-key="terminateValue1"/>
                                    <span style="font-weight: 600; color: var(--text-secondary);">–</span>
                                    <input class="form-control" type="number" placeholder="Max" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                           value="${N.terminateValue2 || ''}"
                                           data-action="update-numeric" data-key="terminateValue2"/>
                                ` : N.terminateCondition === 'gt' ? `
                                    <span style="font-size: 14px; font-weight: 700; color: var(--cue-primary);">&gt;</span>
                                    <input class="form-control" type="number" placeholder="Value" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                           value="${N.terminateValue || ''}"
                                           data-action="update-numeric" data-key="terminateValue"/>
                                ` : N.terminateCondition === 'lt' ? `
                                    <span style="font-size: 14px; font-weight: 700; color: var(--cue-primary);">&lt;</span>
                                    <input class="form-control" type="number" placeholder="Value" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                           value="${N.terminateValue || ''}"
                                           data-action="update-numeric" data-key="terminateValue"/>
                                ` : N.terminateCondition === 'gte' ? `
                                    <span style="font-size: 14px; font-weight: 700; color: var(--cue-primary);">&gt;=</span>
                                    <input class="form-control" type="number" placeholder="Value" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                           value="${N.terminateValue || ''}"
                                           data-action="update-numeric" data-key="terminateValue"/>
                                ` : N.terminateCondition === 'lte' ? `
                                    <span style="font-size: 14px; font-weight: 700; color: var(--cue-primary);">&lt;=</span>
                                    <input class="form-control" type="number" placeholder="Value" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                           value="${N.terminateValue || ''}"
                                           data-action="update-numeric" data-key="terminateValue"/>
                                ` : N.terminateCondition === 'equals' ? `
                                    <span style="font-size: 14px; font-weight: 700; color: var(--cue-primary);">=</span>
                                    <input class="form-control" type="number" placeholder="Value" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                           value="${N.terminateValue || ''}"
                                           data-action="update-numeric" data-key="terminateValue"/>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>


                <div id="numeric-ranges-config" ${question.numeric?.type !== 'ranges' ? 'style="display:none;"' : ''}>
                    <!-- Input Label -->
                    <div style="margin-bottom: 16px;">
                        <div class="numeric-form-group">
                            <label>Input Label</label>
                            <input class="form-control" type="text"
                                   placeholder="e.g., ___ years old"
                                   value="${N.placeholder || ''}"
                                   data-action="update-numeric" data-key="placeholder"/>
                            <div class="muted" style="font-size: 11px; margin-top: 4px;">Text shown to respondents next to the range options</div>
                        </div>
                    </div>

                    <!-- Terminate Conditions -->
                    <div class="numeric-form-group" style="margin-bottom: 20px;">
                        <label>Terminate if...</label>
                        <select class="form-control" style="max-width: 300px;" data-action="update-terminate-condition" data-key="terminateCondition">
                            <option value="" ${!N.terminateCondition ? 'selected' : ''}>None</option>
                            <option value="between" ${N.terminateCondition === 'between' ? 'selected' : ''}>In between</option>
                            <option value="gt" ${N.terminateCondition === 'gt' ? 'selected' : ''}>Greater than</option>
                            <option value="lt" ${N.terminateCondition === 'lt' ? 'selected' : ''}>Less than</option>
                            <option value="gte" ${N.terminateCondition === 'gte' ? 'selected' : ''}>Greater than or equal to</option>
                            <option value="lte" ${N.terminateCondition === 'lte' ? 'selected' : ''}>Less than or equal to</option>
                            <option value="equals" ${N.terminateCondition === 'equals' ? 'selected' : ''}>Exactly</option>
                        </select>
                        <div class="terminate-input-area" style="margin-top: 8px; ${!N.terminateCondition || N.terminateCondition === '' ? 'display: none;' : ''}">
                            <div class="terminate-condition-display">
                                ${N.terminateCondition === 'between' ? `
                                    <input class="form-control" type="number" placeholder="Min" style="width: 100px;"
                                           value="${N.terminateValue1 || ''}"
                                           data-action="update-numeric" data-key="terminateValue1"/>
                                    <span>–</span>
                                    <input class="form-control" type="number" placeholder="Max" style="width: 100px;"
                                           value="${N.terminateValue2 || ''}"
                                           data-action="update-numeric" data-key="terminateValue2"/>
                                ` : `
                                    <span class="terminate-symbol">${getTerminateSymbol(N.terminateCondition)}</span>
                                    <input class="form-control" type="number" placeholder="Value" style="width: 100px;"
                                           value="${N.terminateValue || ''}"
                                           data-action="update-numeric" data-key="terminateValue"/>
                                `}
                            </div>
                        </div>
                    </div>

                    <!-- Range Options List -->
                    <div style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--cue-primary);">
                            <span style="font-size: 11px; font-weight: 700; color: var(--cue-primary); text-transform: uppercase; letter-spacing: 0.5px;">Range Options</span>
                            <button class="btn" data-action="add-numeric-option" style="padding: 6px 12px; font-size: 12px;">+ Add Range</button>
                        </div>
                        <div id="numeric-ranges-container">
                            ${(question.numeric?.ranges || []).map((range, j) => `
                                <div class="option-row" style="margin-bottom:8px;">
                                    <div class="numeric-range-editor-row">
                                        <input class="form-control" placeholder="Label" style="flex: 1;" value="${escapeHTML(range.label || '')}" data-action="update-numeric-range" data-range-index="${j}" data-key="label"/>
                                        <select class="form-control" style="width: 120px;" data-action="update-numeric-range" data-range-index="${j}" data-key="operator">
                                            <option value="lt" ${range.operator === 'lt' ? 'selected' : ''}>Less than</option>
                                            <option value="lte" ${range.operator === 'lte' ? 'selected' : ''}>≤ (Less than or equal)</option>
                                            <option value="gt" ${range.operator === 'gt' ? 'selected' : ''}>Greater than</option>
                                            <option value="gte" ${range.operator === 'gte' ? 'selected' : ''}>≥ (Greater than or equal)</option>
                                            <option value="between" ${range.operator === 'between' ? 'selected' : ''}>Between</option>
                                            <option value="equals" ${range.operator === 'equals' ? 'selected' : ''}>Equals</option>
                                        </select>
                                        <input class="form-control" style="width: 80px;" type="number" placeholder="Value" value="${range.value1 ?? ''}" data-action="update-numeric-range" data-range-index="${j}" data-key="value1"/>
                                        <span class="between-connector" style="padding: 0 8px; ${range.operator === 'between' ? '' : 'display: none;'}">and</span>
                                        <input class="form-control between-value2" style="width: 80px; ${range.operator === 'between' ? '' : 'display: none;'}" type="number" placeholder="Value 2" value="${range.value2 ?? ''}" data-action="update-numeric-range" data-range-index="${j}" data-key="value2"/>
                                        <input class="form-control" style="width: 80px;" placeholder="Unit" value="${escapeHTML(range.unit || '')}" data-action="update-numeric-range" data-range-index="${j}" data-key="unit"/>
                                        <button class="icon-btn" title="Advanced Settings" data-action="toggle-advanced" data-target="adv-range-${questionIndex}-${j}">⚙️</button>
                                        <button class="icon-btn danger" title="Delete Range" data-action="delete-numeric-range" data-range-index="${j}">🗑️</button>
                                    </div>
                                    <div class="advanced-options is-hidden" id="adv-range-${questionIndex}-${j}" style="padding: 12px 8px 4px;">
                                        <div class="stack" style="gap:12px; align-items:center;">
                                            <label class="stack" style="gap:4px;"><input type="checkbox" ${range.terminate ? 'checked' : ''} data-action="update-numeric-range-extra" data-range-index="${j}" data-key="terminate"> Terminate</label>
                                        </div>
                                    </div>
                                </div>`).join('') || '<div class="muted" style="padding: 10px;">No ranges yet. Click "Add Range" to get started.</div>'}
                        </div>

                    </div>
                </div>
            </div>`,
        'table': `
            <div class="table-setup-compact" style="display: grid; gap: 12px;">
                <!-- Quick Controls Row -->
                <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; padding: 8px 12px; background: var(--surface-2); border-radius: 6px;">
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <label style="font-size: 13px; font-weight: 600;">Type:</label>
                        <select class="form-control" style="width: 140px; padding: 4px 8px; font-size: 13px;" data-action="update-table-type">
                            <option value="grid_single" ${question.type === 'grid_single' || !question.type ? 'selected' : ''}>Single Select</option>
                            <option value="grid_multi" ${question.type === 'grid_multi' ? 'selected' : ''}>Multi Select</option>
                            <option value="ranking" ${question.type === 'ranking' ? 'selected' : ''}>Ranking</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="btn" data-action="use-prev-question-as-columns" style="padding: 4px 8px; font-size: 12px;">
                            📋 Use Previous Question as Column Headers
                        </button>
                        ${question.grid?.columnSource ? `
                            <span style="font-size: 11px; color: var(--muted); background: var(--surface-2); padding: 2px 6px; border-radius: 4px;">
                                From: ${question.grid.columnSource.qid}
                            </span>
                        ` : ''}
                    </div>

                    <div style="display: flex; gap: 4px;">
                        <button class="btn" data-action="bulk-add-rows" title="Bulk add rows" style="padding: 4px 8px; font-size: 12px;">📝 Rows</button>
                        <button class="btn" data-action="bulk-add-cols" title="Bulk add columns" style="padding: 4px 8px; font-size: 12px;">📝 Cols</button>
                    </div>
                </div>

                <!-- Interactive Table -->
                <div class="table-preview editable-table" style="overflow-x: auto; border: 1px solid var(--line); border-radius: 6px;">
                    ${renderInteractiveTableBuilder(question, questionIndex)}
                </div>
            </div>`,
        'advanced_table': `
            <div class="advanced-table-builder" style="display: grid; gap: 20px;">
                <!-- Header Controls -->
                <div class="advanced-table-header" style="display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; padding: 12px 16px; background: var(--surface-2); border-radius: 8px; border-left: 4px solid var(--accent);">
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <label style="font-size: 13px; font-weight: 600;">Table Type:</label>
                        <select class="form-control" style="width: 160px; padding: 4px 8px; font-size: 13px;" data-action="update-advanced-table-type">
                            <option value="grid_single" ${question.type === 'grid_single' || !question.type ? 'selected' : ''}>Single Select</option>
                            <option value="grid_multi" ${question.type === 'grid_multi' ? 'selected' : ''}>Multi Select</option>
                            <option value="ranking" ${question.type === 'ranking' ? 'selected' : ''}>Ranking</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: center; justify-content: center;">
                        <span style="font-size: 14px; font-weight: 600; color: var(--accent);">🎯 Advanced Table Builder</span>
                        <span style="font-size: 11px; color: var(--muted); background: var(--surface-1); padding: 2px 6px; border-radius: 4px;">
                            ${(question.advancedTable?.rows || []).length} rows × ${(question.advancedTable?.cols || []).length} cols
                        </span>
                    </div>

                    <div style="display: flex; gap: 8px;">
                        <button class="btn" data-action="show-preset-library" style="padding: 6px 12px; font-size: 12px; background: var(--accent); color: white;">
                            📚 Preset Library
                        </button>
                        <button class="btn" data-action="save-as-preset" style="padding: 6px 12px; font-size: 12px;" title="Save current table as preset">
                            💾 Save Preset
                        </button>
                    </div>
                </div>

                <!-- Row & Column Controls -->
                <div class="table-controls-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <!-- Row Controls -->
                    <div class="row-controls-section">
                        <div class="control-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 8px 12px; background: var(--surface-2); border-radius: 6px;">
                            <h4 style="margin: 0; font-size: 14px; font-weight: 600;">📋 Row Statements</h4>
                            <div style="display: flex; gap: 6px;">
                                <button class="btn" data-action="bulk-add-adv-rows" style="padding: 4px 8px; font-size: 11px;">📝 Bulk Add</button>
                                <button class="btn" data-action="rows-from-question" style="padding: 4px 8px; font-size: 11px;">🔗 From Question</button>
                                <button class="btn" data-action="add-adv-row" style="padding: 4px 8px; font-size: 11px;">+ Add Row</button>
                            </div>
                        </div>

                        <div class="row-items-list" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--line); border-radius: 6px; background: var(--surface-1);">
                            ${(question.advancedTable?.rows || []).length > 0 ?
                                (question.advancedTable.rows || []).map((row, i) => `
                                    <div class="editable-item" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--line);">
                                        <span style="color: var(--muted); font-size: 11px; min-width: 20px;">${i + 1}.</span>
                                        <input type="text" value="${row}" data-action="update-adv-row" data-row-index="${i}"
                                               ${question.advancedTable?.rowsReadOnly ? 'readonly' : ''}
                                               style="flex: 1; border: none; background: transparent; font-size: 13px; padding: 4px; ${question.advancedTable?.rowsReadOnly ? 'color: var(--muted); cursor: not-allowed;' : ''}"">
                                        <button class="icon-btn" data-action="delete-adv-row" data-row-index="${i}"
                                                style="opacity: 0.5; padding: 2px 4px; font-size: 10px;">🗑️</button>
                                    </div>
                                `).join('')
                                : '<div style="padding: 20px; text-align: center; color: var(--muted); font-size: 13px;">No rows yet. Click "Add Row" to start.</div>'
                            }
                        </div>
                    </div>

                    <!-- Column Controls -->
                    <div class="col-controls-section">
                        <div class="control-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 8px 12px; background: var(--surface-2); border-radius: 6px;">
                            <h4 style="margin: 0; font-size: 14px; font-weight: 600;">📊 Column Headers</h4>
                            <div style="display: flex; gap: 6px;">
                                <button class="btn" data-action="bulk-add-adv-cols" style="padding: 4px 8px; font-size: 11px;">📝 Bulk Add</button>
                                <button class="btn" data-action="cols-from-question" style="padding: 4px 8px; font-size: 11px;">🔗 From Question</button>
                                <button class="btn" data-action="add-adv-col" style="padding: 4px 8px; font-size: 11px;">+ Add Column</button>
                            </div>
                        </div>

                        <div class="col-items-list" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--line); border-radius: 6px; background: var(--surface-1);">
                            ${(question.advancedTable?.cols || []).length > 0 ?
                                (question.advancedTable.cols || []).map((col, i) => `
                                    <div class="editable-item" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--line);">
                                        <span style="color: var(--muted); font-size: 11px; min-width: 20px;">${i + 1}.</span>
                                        <input type="text" value="${col}" data-action="update-adv-col" data-col-index="${i}"
                                               ${question.advancedTable?.colsReadOnly ? 'readonly' : ''}
                                               style="flex: 1; border: none; background: transparent; font-size: 13px; padding: 4px; ${question.advancedTable?.colsReadOnly ? 'color: var(--muted); cursor: not-allowed;' : ''}"">
                                        <button class="icon-btn" data-action="delete-adv-col" data-col-index="${i}"
                                                style="opacity: 0.5; padding: 2px 4px; font-size: 10px;">🗑️</button>
                                    </div>
                                `).join('')
                                : '<div style="padding: 20px; text-align: center; color: var(--muted); font-size: 13px;">No columns yet. Click "Add Column" to start.</div>'
                            }
                        </div>
                    </div>
                </div>

                <!-- Live Preview -->
                <div class="advanced-table-preview">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 8px 12px; background: var(--surface-2); border-radius: 6px;">
                        <h4 style="margin: 0; font-size: 14px; font-weight: 600;">👁️ Live Preview</h4>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span style="font-size: 11px; color: var(--muted);">
                                ${question.advancedTable?.tableVariation || 'Standard Table'}
                            </span>
                            <button class="btn" data-action="refresh-preview" style="padding: 4px 8px; font-size: 11px;">🔄 Refresh</button>
                        </div>
                    </div>

                    <div class="table-preview-container" style="overflow-x: auto; border: 1px solid var(--line); border-radius: 6px; background: white;">
                        ${renderAdvancedTablePreview(question, questionIndex)}
                    </div>
                </div>
            </div>`,
        'repeated': `
            <div class="repeated-options-content" style="display: grid; gap: 20px;">
                <!-- Top Row: Source Question Selection -->
                <div class="repeated-top-section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="source-selection-section">
                        <!-- NOTE: Uses data-action="update-repeated" with data-key to avoid dropdown disappearing -->
                        <!-- This triggers the debounced input handler instead of immediate re-render -->
                        <div class="form-row">
                            <label class="form-label">Source Question <span class="form-help">Select the question whose options will become table rows</span></label>
                            <select class="form-control" data-action="update-repeated" data-key="source_qid">
                                <option value="">Select question...</option>
                                ${(window.state.questions || []).slice(0, questionIndex).filter(q =>
                                    q.options && q.options.length > 0
                                ).map(q => {
                                    // Strip HTML tags and clean up the question text for dropdown display
                                    const cleanText = (q.text || '')
                                        .replace(/<[^>]*>/g, '') // Remove HTML tags
                                        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular spaces
                                        .replace(/&amp;/g, '&')  // Replace &amp; with &
                                        .replace(/&lt;/g, '<')   // Replace &lt; with <
                                        .replace(/&gt;/g, '>')   // Replace &gt; with >
                                        .replace(/&quot;/g, '"') // Replace &quot; with "
                                        .replace(/&#x27;/g, "'") // Replace &#x27; with '
                                        .replace(/\s+/g, ' ')    // Replace multiple whitespace with single space
                                        .trim();
                                    const truncatedText = cleanText.length > 50 ? cleanText.substring(0, 50) + '...' : cleanText;
                                    return `
                                        <option value="${q.id}" ${question.repeated?.source_qid === q.id ? 'selected' : ''}>
                                            ${q.id}: ${escapeHTML(truncatedText)}
                                        </option>
                                    `;
                                }).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="repeated-info-section">
                        <div class="form-row">
                            <label class="form-label">Table Info</label>
                            <div style="padding: 12px; background: var(--surface-2); border-radius: 6px; border: 1px solid var(--line);">
                                <div style="font-size: 13px; color: var(--text-2);">
                                    ${question.repeated?.source_qid ? `
                                        <div><strong>Rows:</strong> Dynamic from ${question.repeated.source_qid}</div>
                                        <div><strong>Columns:</strong> ${question.repeated?.columns?.length || 0} response options</div>
                                    ` : '<div>Select a source question to configure table</div>'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bottom Row: Full-Width Table -->
                <div class="repeated-table-section" style="grid-column: 1 / -1;">
                    <div id="repeated-preview" class="table-preview-container">
                        ${renderEditableRepeatedPreview(question, questionIndex)}
                    </div>
                </div>
            </div>`,
        'open_end': `
            <div class="form-row">
                <label class="form-label">Length Limits</label>
                <div class="stack" style="align-items:center;">
                    <select class="form-control" style="width:150px;" data-action="update-open" data-key="limit_kind">
                        <option value="" ${!question.open?.limit_kind ? 'selected' : ''}>None</option>
                        ${['words','characters','sentences'].map(k=>`<option value="${k}" ${question.open?.limit_kind===k?'selected':''}>${k.charAt(0).toUpperCase() + k.slice(1)}</option>`).join('')}
                    </select>
                    <input class="form-control" type="number" placeholder="Min" style="width:120px" value="${question.open?.min ?? ''}" data-action="update-open" data-key="min" ${!question.open?.limit_kind ? 'disabled' : ''} />
                    <input class="form-control" type="number" placeholder="Max" style="width:120px" value="${question.open?.max ?? ''}" data-action="update-open" data-key="max" ${!question.open?.limit_kind ? 'disabled' : ''} />
                </div>
            </div>
        `,
        'text': `
            <div class="text-content-message" style="padding: 20px; text-align: center; color: var(--muted);">
                <p style="margin: 0; font-size: 14px;">
                    📝 This is a text-only element for informational content like consent notices, welcome messages, or notes.
                </p>
            </div>
        `,
    };

    // --- FINAL ASSEMBLY ---
    hostEl.innerHTML = `
        <style>
            /* FANCY EXPANDABLE SECTIONS */
            .fancy-expandable-container {
                position: relative;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: visible;
            }

            /* When logic section is expanded */
            .fancy-expandable-container.logic-expanded {
                grid-template-columns: 2fr 40px;
            }

            /* When settings section is expanded */
            .fancy-expandable-container.settings-expanded {
                grid-template-columns: 40px 2fr;
            }

            /* Collapsible sections in expandable mode */
            .fancy-expandable-container .collapsible-section {
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: visible;
            }

            /* Side panel styling */
            .collapsible-section.side-panel {
                writing-mode: vertical-lr;
                text-orientation: mixed;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, var(--surface-2), var(--surface-3));
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid var(--line);
                min-height: 200px;
                position: relative;
                overflow: hidden;
            }

            /* Side panel gradient overlay */
            .collapsible-section.side-panel::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.05), transparent);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .collapsible-section.side-panel:hover::before {
                opacity: 1;
            }

            /* Side panel header styling */
            .side-panel .collapsible-header {
                writing-mode: vertical-lr;
                text-orientation: mixed;
                transform: rotate(0deg);
                white-space: nowrap;
                padding: 12px 8px;
                font-weight: 600;
                letter-spacing: 1px;
                color: var(--text-1);
                z-index: 1;
                position: relative;
            }

            /* Left side panel (settings when logic is expanded) */
            .collapsible-section.side-panel.left {
                writing-mode: vertical-rl;
                text-orientation: mixed;
            }

            /* Right side panel (logic when settings is expanded) */
            .collapsible-section.side-panel.right {
                writing-mode: vertical-lr;
                text-orientation: mixed;
            }

            /* Hide content when in side panel mode */
            .side-panel .collapsible-content {
                display: none !important;
            }

            /* Main expanded section styling */
            .collapsible-section.main-expanded {
                z-index: 10;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                transform: scale(1.02);
            }

            /* Smooth transitions for section titles */
            .collapsible-title {
                transition: all 0.3s ease;
            }

            /* Hover effects for side panels */
            .side-panel:hover {
                background: linear-gradient(135deg, var(--surface-3), var(--surface-2));
                transform: scale(1.02) translateY(-2px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                border-color: var(--accent);
            }

            /* Animate side panel text on hover */
            .side-panel:hover .collapsible-header {
                color: var(--accent);
                transform: scale(1.05);
            }

            /* Arrow hiding in side panel mode */
            .side-panel .collapsible-arrow {
                display: none;
            }
        </style>
      <!-- Compact Header Bar -->
      <div class="editor-header-compact">
          <div class="question-basics-inline">
              <div class="question-id-group">
                  <label class="inline-label">ID:</label>
                  <input class="question-id-inline form-control" value="${question.id}" data-validation-field="questionId" data-action="update-question-prop" data-key="id">
              </div>
              <div class="question-type-group">
                  <label class="inline-label">Type:</label>
                  <select class="form-select" id="question-type-select">
                      <option value="list" ${mode === 'list' ? 'selected' : ''}>List/Items</option>
                      <option value="numeric" ${mode === 'numeric' ? 'selected' : ''}>Numeric</option>
                      <option value="advanced_table" ${mode === 'advanced_table' ? 'selected' : ''}>Advanced Table</option>
                      <option value="open_end" ${mode === 'open_end' ? 'selected' : ''}>Open End</option>
                      <!-- Legacy types: hidden from UI but still functional for existing questions -->
                      ${mode === 'repeated' ? '<option value="repeated" selected>🔁 Repeated Options (Legacy)</option>' : ''}
                      <!-- Dynamic Table modes: Always show but grouped under Advanced Table selection -->
                      ${mode === 'likert_agreement' ? '<option value="likert_agreement" selected>👍 Agreement Scale</option>' : ''}
                      ${mode === 'likert_sentiment' ? '<option value="likert_sentiment" selected>😊 Sentiment Scale</option>' : ''}
                      ${mode === 'likert_custom' ? '<option value="likert_custom" selected>⚙️ Custom Scale</option>' : ''}
                      ${mode === 'dynamic_simple_rows' ? '<option value="dynamic_simple_rows" selected>🔄 Dynamic Rows</option>' : ''}
                      ${mode === 'dynamic_simple_columns' ? '<option value="dynamic_simple_columns" selected>🔄 Dynamic Columns</option>' : ''}
                      ${mode === 'dynamic_selected_rows' ? '<option value="dynamic_selected_rows" selected>✅ Selected Rows</option>' : ''}
                      ${mode === 'dynamic_selected_columns' ? '<option value="dynamic_selected_columns" selected>✅ Selected Columns</option>' : ''}
                      ${mode === 'multi_matrix' ? '<option value="multi_matrix" selected>🎛️ Multi-Matrix</option>' : ''}
                  </select>
              </div>
          </div>
          <div class="header-actions">
              <button class="btn primary compact-btn" data-action="save-to-library" title="Save to Library">📚</button>
              <div class="header-dropdown">
                  <button class="btn compact-btn dropdown-toggle" data-action="toggle-header-menu" title="More actions">⚙️</button>
                  <div class="dropdown-menu header-dropdown-menu" style="display: none;">
                      <a href="#" class="dropdown-item" data-action="duplicate-question">
                          <span class="dropdown-icon">📑</span>
                          <span>Duplicate Question</span>
                      </a>
                      <a href="#" class="dropdown-item" data-action="delete-question">
                          <span class="dropdown-icon">🗑️</span>
                          <span>Delete Question</span>
                      </a>
                      <div class="dropdown-divider"></div>
                      <a href="#" class="dropdown-item" data-action="export-question">
                          <span class="dropdown-icon">📤</span>
                          <span>Export Question</span>
                      </a>
                  </div>
              </div>
          </div>
      </div>

      <!-- Tabs (keeping existing) -->
      <div class="editor-tabs" style="padding: 0 16px; border-bottom: 1px solid var(--line);">
        <button class="shell-tab ${activeTab === 'main' ? 'active' : ''}" data-tab="main" id="question-setup-btn">Question Setup</button>
        <button class="shell-tab ${activeTab === 'tabplan' ? 'active' : ''}" data-tab="tabplan" id="tab-plan-btn">📊 Tab Plan</button>
      </div>
      <div class="editor-content">
        <div class="tab-content ${activeTab === 'main' ? 'active' : ''}">
          <!-- Two-Column Layout: Question Text + Answer Options/Numeric Settings -->
          ${question.mode === 'list' || question.mode === 'numeric' ? `
          <div class="editor-two-column-grid">
            <!-- Left Column: Question Text -->
            <div class="question-text-column">
              <h3 class="column-label">Question Text</h3>
              <div class="editor-toolbar-container">
                  <div id="qtext-toolbar-toggle" class="toolbar-toggle-bar">
                      <span>Formatting Tools</span>
                      <span class="toolbar-arrow">▾</span>
                  </div>
                  <div id="qtext-toolbar" class="editor-toolbar">
                      <button class="btn formatting-btn" id="bold-btn" title="Bold (Ctrl+B)"><strong>B</strong></button>
                      <button class="btn formatting-btn" id="italic-btn" title="Italic (Ctrl+I)"><em>I</em></button>
                      <button class="btn formatting-btn" id="underline-btn" title="Underline (Ctrl+U)"><u>U</u></button>
                      <div style="width: 1px; height: 24px; background: var(--line); margin: 0 4px;"></div>
                      <select id="qtext-fontsize" class="form-control" title="Font Size">
                          <option value="3">Size: 14px</option>
                          <option value="4">Size: 16px</option>
                          <option value="5">Size: 18px</option>
                          <option value="6">Size: 20px</option>
                      </select>
                      <input type="color" id="qtext-color" class="form-control" style="width: 50px; padding: 4px;" title="Font Color" value="#0F172A">
                      <button class="btn" id="insert-pipe-btn">Insert Pipe</button>
                  </div>
              </div>
              <div id="questionText" class="form-control" contenteditable="true" style="min-height:200px; border-top-left-radius:0; border-top-right-radius:0; font-family: inherit !important; font-size: inherit !important;">${question.text || ''}</div>
              <div id="piping-preview" class="muted" style="font-size: 12px; margin-top: 4px; padding: 4px 8px; background: var(--surface-2); border-radius: 4px;"></div>
            </div>

            <!-- Right Column: Answer Options or Numeric Settings -->
            <div class="answer-options-column">
              ${question.mode === 'list' ? `
              <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h3 class="column-label">Answer Options</h3>
                  <span style="background: var(--cue-primary); color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;">${(question.options || []).length}</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn" data-action="add-option" style="background: var(--cue-primary); color: white; padding: 6px 12px; font-size: 12px;">+ Add Option</button>
                  <div class="preset-dropdown" style="display: inline-block;">
                      <button class="btn ghost" data-action="toggle-preset-menu" style="padding: 6px 12px; font-size: 12px;">Presets ▾</button>
                  </div>
                </div>
              </div>
              ${modeSpecificHTML['list'] || ''}
              ` : question.mode === 'numeric' ? `
              <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h3 class="column-label">Numeric Settings</h3>
                  <span style="background: var(--cue-primary); color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;">${(question.numeric?.ranges || []).length || 0}</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn" data-action="add-numeric-option" style="background: var(--cue-primary); color: white; padding: 6px 12px; font-size: 12px;">+ Add Range</button>
                </div>
              </div>
              ${modeSpecificHTML['numeric'] || ''}
              ` : ''}
            </div>
          </div>
          ` : `
          <!-- Legacy Layout for Non-List Questions -->
          ${createCollapsibleSection({
              id: 'question-text',
              title: 'Question Text',
              alwaysExpanded: true,
              content: `
                  <div class="editor-toolbar-container">
                      <div id="qtext-toolbar-toggle" class="toolbar-toggle-bar">
                          <span>Formatting Tools</span>
                          <span class="toolbar-arrow">▾</span>
                      </div>
                      <div id="qtext-toolbar" class="editor-toolbar">
                          <button class="btn formatting-btn" id="bold-btn" title="Bold (Ctrl+B)"><strong>B</strong></button>
                          <button class="btn formatting-btn" id="italic-btn" title="Italic (Ctrl+I)"><em>I</em></button>
                          <button class="btn formatting-btn" id="underline-btn" title="Underline (Ctrl+U)"><u>U</u></button>
                          <div style="width: 1px; height: 24px; background: var(--line); margin: 0 4px;"></div>
                          <select id="qtext-fontsize" class="form-control" title="Font Size">
                              <option value="3">Size: 14px</option>
                              <option value="4">Size: 16px</option>
                              <option value="5">Size: 18px</option>
                              <option value="6">Size: 20px</option>
                          </select>
                          <input type="color" id="qtext-color" class="form-control" style="width: 50px; padding: 4px;" title="Font Color" value="#0F172A">
                          <button class="btn" id="insert-pipe-btn">Insert Pipe</button>
                      </div>
                  </div>
                  <div id="questionText" class="form-control" contenteditable="true" style="min-height:80px; border-top-left-radius:0; border-top-right-radius:0; font-family: inherit !important; font-size: inherit !important;">${question.text || ''}</div>
                  <div id="piping-preview" class="muted" style="font-size: 12px; margin-top: 4px; padding: 4px 8px; background: var(--surface-2); border-radius: 4px;"></div>
              `
          })}

          <!-- Question Content Section -->
          ${createCollapsibleSection({
              id: 'question-content',
              title: `${question.mode === 'numeric' ? 'Numeric Settings' : question.mode === 'table' ? 'Table Setup' : 'Response Settings'}`,
              expanded: true,
              statusBadge: question.mode === 'numeric' ?
                      { count: (question.numeric?.ranges || []).length } :
                      question.mode === 'table' ?
                          { count: ((question.grid?.rows || []).length + (question.grid?.cols || []).length) } :
                          { count: 0 },
              headerActions: question.mode === 'numeric' ? '<button class="btn" data-action="add-numeric-option">+ Add Range</button>' :
                           question.mode === 'table' ? '<button class="btn" data-action="add-table-row">+ Add Row</button>' : null,
              content: modeSpecificHTML[mode] || ''
          })}
          `}

          <!-- Bottom Tabs (for list and table questions) -->
          ${question.mode === 'list' || question.mode === 'table' ? `
          <div class="bottom-tabs-container">
              <!-- Tab Headers -->
              <div class="bottom-tabs-header">
                ${question.mode === 'list' ? `<button class="bottom-tab ${!window._bottomTabState || window._bottomTabState === 'option-management' ? 'active' : ''}" data-action="switch-bottom-tab" data-tab="option-management">Option Management</button>` : ''}
                <button class="bottom-tab ${(question.mode === 'table' && (!window._bottomTabState || window._bottomTabState === 'logic-flow')) || (question.mode === 'list' && window._bottomTabState === 'logic-flow') ? 'active' : ''}" data-action="switch-bottom-tab" data-tab="logic-flow">Logic & Flow</button>
                <button class="bottom-tab ${window._bottomTabState === 'question-settings' ? 'active' : ''}" data-action="switch-bottom-tab" data-tab="question-settings">Question Settings</button>
              </div>

              <!-- Tab Content: Option Management (list mode only) -->
              ${question.mode === 'list' ? `
              <div class="bottom-tab-content ${!window._bottomTabState || window._bottomTabState === 'option-management' ? 'active' : ''}" id="bottom-tab-option-management">
                  <div class="option-management-content" style="display: grid; gap: 16px;">
                      <!-- Option Behavior Grid -->
                      <div class="behavior-settings-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; background: var(--surface-2); border-radius: 6px;">
                          <!-- Selection Type -->
                          <div class="behavior-section">
                              <label class="section-label" style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 11px;">Selection Type</label>
                              <div class="selection-controls" style="display: flex; gap: 6px;">
                                  <label class="selection-option ${getListSelection(question)==='single'?'active':''}" style="flex: 1; display: flex; align-items: center; gap: 4px; padding: 6px 10px; border: 1px solid var(--line); border-radius: 4px; cursor: pointer; background: ${getListSelection(question)==='single'?'var(--cue-primary)':'var(--surface-1)'}; color: ${getListSelection(question)==='single'?'white':'var(--text-1)'};">
                                      <input type="radio" id="sel-single-${questionIndex}" name="listSel-${questionIndex}" value="single" ${getListSelection(question)==='single'?'checked':''} data-action="set-list-selection" data-question-index="${questionIndex}" data-question-id="${question.id}" style="margin: 0;"/>
                                      <span style="font-size: 12px; font-weight: 500;">Single</span>
                                  </label>
                                  <label class="selection-option ${getListSelection(question)==='multi'?'active':''}" style="flex: 1; display: flex; align-items: center; gap: 4px; padding: 6px 10px; border: 1px solid var(--line); border-radius: 4px; cursor: pointer; background: ${getListSelection(question)==='multi'?'var(--cue-primary)':'var(--surface-1)'}; color: ${getListSelection(question)==='multi'?'white':'var(--text-1)'};">
                                      <input type="radio" id="sel-multi-${questionIndex}" name="listSel-${questionIndex}" value="multi" ${getListSelection(question)==='multi'?'checked':''} data-action="set-list-selection" data-question-index="${questionIndex}" data-question-id="${question.id}" style="margin: 0;"/>
                                      <span style="font-size: 12px; font-weight: 500;">Multiple</span>
                                  </label>
                              </div>
                          </div>

                          <!-- Order/Randomization -->
                          <div class="behavior-section">
                              <label class="section-label" style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 11px;">Order</label>
                              <div class="randomization-controls" style="display: flex; gap: 6px;">
                                  <label class="toggle-option ${(question.randomization?.mode||'none')!=='shuffle'?'active':''}" style="flex: 1; display: flex; align-items: center; gap: 4px; padding: 6px 10px; border: 1px solid var(--line); border-radius: 4px; cursor: pointer; background: ${(question.randomization?.mode||'none')!=='shuffle'?'var(--cue-primary)':'var(--surface-1)'}; color: ${(question.randomization?.mode||'none')!=='shuffle'?'white':'var(--text-1)'};">
                                      <input type="radio" id="rand-none-${questionIndex}" name="rand-${questionIndex}" value="none" ${(question.randomization?.mode||'none')!=='shuffle'?'checked':''} data-action="set-randomization" style="margin: 0;"/>
                                      <span style="font-size: 12px; font-weight: 500;">Sequential</span>
                                  </label>
                                  <label class="toggle-option ${question.randomization?.mode==='shuffle'?'active':''}" style="flex: 1; display: flex; align-items: center; gap: 4px; padding: 6px 10px; border: 1px solid var(--line); border-radius: 4px; cursor: pointer; background: ${question.randomization?.mode==='shuffle'?'var(--cue-primary)':'var(--surface-1)'}; color: ${question.randomization?.mode==='shuffle'?'white':'var(--text-1)'};">
                                      <input type="radio" id="rand-shuffle-${questionIndex}" name="rand-${questionIndex}" value="shuffle" ${question.randomization?.mode==='shuffle'?'checked':''} data-action="set-randomization" style="margin: 0;"/>
                                      <span style="font-size: 12px; font-weight: 500;">Randomize</span>
                                  </label>
                              </div>
                          </div>
                      </div>

                      <!-- Bulk Actions -->
                      <div class="bulk-actions-section">
                          <label class="section-label" style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 11px;">Bulk Actions</label>
                          <div class="bulk-actions-grid" style="display: flex; gap: 6px; flex-wrap: wrap;">
                              <button class="btn ghost" data-action="bulk-add-options" style="flex: 1; min-width: 100px; padding: 6px 10px; font-size: 12px;">Bulk Add</button>
                              <button class="btn ghost ${question.alphabetize ? 'active' : ''}" data-action="toggle-alphabetize" style="flex: 1; min-width: 100px; padding: 6px 10px; font-size: 12px;">Alphabetize</button>
                              <button class="btn ghost" data-action="setup-medication-groups" style="flex: 1; min-width: 100px; padding: 6px 10px; font-size: 12px;">Setup Groups</button>
                          </div>
                      </div>
                  </div>
              </div>
              ` : ''}

              <!-- Tab Content: Logic & Flow -->
              <div class="bottom-tab-content ${(question.mode === 'table' && (!window._bottomTabState || window._bottomTabState === 'logic-flow')) || (question.mode === 'list' && window._bottomTabState === 'logic-flow') ? 'active' : ''}" id="bottom-tab-logic-flow">
                <p class="section-description" style="margin-bottom: 16px; color: var(--muted); font-size: 13px;">
                    Control when this question appears based on previous responses
                </p>
                <div id="conditional-logic-container" class="logic-container" style="transition: opacity 0.2s ease;">
                    ${renderConditionalLogicPanel(question, questionIndex, (updatedQuestion) => {
                        // Update question with new conditions
                        Object.assign(question, updatedQuestion);
                        actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                    })}
                </div>
              </div>

              <!-- Tab Content: Question Settings -->
              <div class="bottom-tab-content ${window._bottomTabState === 'question-settings' ? 'active' : ''}" id="bottom-tab-question-settings">
                  ${mode === 'list' || mode === 'table' ? `
                  <!-- Row 1: Global Termination + Must Select -->
                  <div style="display: grid; grid-template-columns: ${mode === 'table' ? '1fr' : '1fr 1fr'}; gap: 16px; margin-bottom: 16px;">
                      <!-- Global Termination -->
                      <div class="form-row enhanced-form-row">
                          <label class="enhanced-label">
                            <span class="label-text">Global Termination</span>
                            <span class="label-hint">${mode === 'table' ? 'Terminate survey based on table responses' : 'Terminate survey when specific options are selected'}</span>
                          </label>
                          <div class="global-termination-builder">
                              ${renderGlobalTermination(question)}
                          </div>
                      </div>

                      ${mode === 'list' ? `
                      <!-- Must Select -->
                      <div class="form-row enhanced-form-row">
                          <label class="enhanced-label">
                            <span class="label-text">Must Select</span>
                            <span class="label-hint">Require selection of specific options to continue</span>
                          </label>
                          <div class="global-must-select-builder">
                              ${renderGlobalMustSelect(question)}
                          </div>
                      </div>
                      ` : ''}
                  </div>
                  ` : ''}

                  <!-- Row 2: Programmer Notes + Additional Table Instructions -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                      <div class="form-row enhanced-form-row">
                          <label class="enhanced-label">
                            <span class="label-text">Programmer Notes</span>
                            <span class="label-hint">Technical notes for survey programming</span>
                          </label>
                          <textarea class="form-control enhanced-input" rows="3" data-action="update-question-prop" data-key="programmer_notes" placeholder="e.g., 'Pipe from Q5', 'Set quota at 200'">${question.programmer_notes || ''}</textarea>
                      </div>

                      <div class="form-row enhanced-form-row">
                          <label class="enhanced-label">
                            <span class="label-text">Additional Table Instructions</span>
                            <span class="label-hint">Instructions for table layout and presentation</span>
                          </label>
                          <textarea class="form-control enhanced-input" rows="3" data-action="update-question-prop" data-key="table_instructions" placeholder="e.g., 'Display as 5-column grid', 'Add totals row'">${question.table_instructions || ''}</textarea>
                      </div>
                  </div>

                  <!-- Row 3: Notes (Full Width) -->
                  <div class="form-row enhanced-form-row">
                      <label class="enhanced-label">
                        <span class="label-text">Notes</span>
                        <span class="label-hint">Internal comments and annotations</span>
                      </label>
                      <textarea class="form-control enhanced-input" rows="3" data-action="update-question-prop" data-key="notes" placeholder="e.g., 'Red herring question', 'Check logic with client'">${question.notes || ''}</textarea>
                  </div>

                  ${mode === 'numeric' ? `
                  <div class="advanced-numeric-settings" style="padding-top: 16px; border-top: 1px solid var(--line);">
                      <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 12px;">Advanced Numeric Settings</h4>
                      <div class="form-row">
                          <label class="form-label" style="padding-top:8px;">Global Termination</label>
                          <div>
                              <div onclick="event.stopPropagation()" style="display: inline-block;">
                                  <select class="form-control" style="width: 160px; margin-bottom: 12px;" data-action="set-global-terminate-operator">
                                  <option value="none" ${(!question.numeric?.globalTerminate?.enabled) ? 'selected' : ''}>None</option>
                                  <option value="lt" ${question.numeric?.globalTerminate?.enabled && question.numeric?.globalTerminate?.operator === 'lt' ? 'selected' : ''}>Less than</option>
                                  <option value="lte" ${question.numeric?.globalTerminate?.enabled && question.numeric?.globalTerminate?.operator === 'lte' ? 'selected' : ''}>≤ Less than or equal</option>
                                  <option value="gt" ${question.numeric?.globalTerminate?.enabled && question.numeric?.globalTerminate?.operator === 'gt' ? 'selected' : ''}>Greater than</option>
                                  <option value="gte" ${question.numeric?.globalTerminate?.enabled && question.numeric?.globalTerminate?.operator === 'gte' ? 'selected' : ''}>≥ Greater than or equal</option>
                                  <option value="equals" ${question.numeric?.globalTerminate?.enabled && question.numeric?.globalTerminate?.operator === 'equals' ? 'selected' : ''}>Equals</option>
                                  <option value="between" ${question.numeric?.globalTerminate?.enabled && question.numeric?.globalTerminate?.operator === 'between' ? 'selected' : ''}>Between</option>
                                  </select>
                              </div>
                              <div class="global-terminate-inputs" style="${question.numeric?.globalTerminate?.enabled ? 'display: flex;' : 'display: none;'} align-items: center; gap: 8px; flex-wrap: wrap;">
                                  <!-- Single operator with symbol -->
                                  <div class="single-operator-input" style="${question.numeric?.globalTerminate?.enabled && question.numeric?.globalTerminate?.operator !== 'between' ? 'display: flex; align-items: center; gap: 4px;' : 'display: none;'}">
                                      <span class="operator-symbol">
                                          ${question.numeric?.globalTerminate?.operator === 'lt' ? '<' :
                                            question.numeric?.globalTerminate?.operator === 'lte' ? '≤' :
                                            question.numeric?.globalTerminate?.operator === 'gt' ? '>' :
                                            question.numeric?.globalTerminate?.operator === 'gte' ? '≥' :
                                            question.numeric?.globalTerminate?.operator === 'equals' ? '=' : ''}
                                      </span>
                                      <input class="form-control" style="width: 100px;" type="number" placeholder="Value" value="${question.numeric?.globalTerminate?.value1 ?? ''}" data-action="update-global-terminate" data-key="value1"/>
                                  </div>

                                  <!-- Between operator with two inputs -->
                                  <div class="between-operator-input" style="${question.numeric?.globalTerminate?.enabled && question.numeric?.globalTerminate?.operator === 'between' ? 'display: flex; align-items: center; gap: 8px;' : 'display: none;'}">
                                      <input class="form-control" style="width: 100px;" type="number" placeholder="Value" value="${question.numeric?.globalTerminate?.value1 ?? ''}" data-action="update-global-terminate" data-key="value1"/>
                                      <span>and</span>
                                      <input class="form-control" style="width: 100px;" type="number" placeholder="Value 2" value="${question.numeric?.globalTerminate?.value2 ?? ''}" data-action="update-global-terminate" data-key="value2"/>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  ` : ''}
              </div>
          </div> <!-- End bottom-tabs-container -->
          ` : ''}
        </div>
        <div class="tab-content ${activeTab === 'tabplan' ? 'active' : ''}">
           <div id="tab-plan-host"></div>
        </div>
      </div>
    `;

    // --- EVENT WIRING ---

    // Direct tab button handlers
    const questionSetupBtn = hostEl.querySelector('#question-setup-btn');
    if (questionSetupBtn) {
        questionSetupBtn.addEventListener('click', (e) => {
            actions.onSetTab('main');
        });
    }

    const tabPlanBtn = hostEl.querySelector('#tab-plan-btn');
    if (tabPlanBtn) {
        tabPlanBtn.addEventListener('click', (e) => {
            actions.onSetTab('tabplan');

            // Immediately render tab plan
            const tabPlanHost = hostEl.querySelector('#tab-plan-host');
            if (tabPlanHost && tabPlanHost._renderTabPlan) {
                setTimeout(() => tabPlanHost._renderTabPlan(), 50);
            }
        });
    }

    const qTextInput = hostEl.querySelector('#questionText');

    // Rich Text Toolbar
    const toggleBtn = hostEl.querySelector('#qtext-toolbar-toggle');
    const toolbar = hostEl.querySelector('#qtext-toolbar');
    if (toggleBtn && toolbar) {
      toggleBtn.onmousedown = (e) => e.preventDefault(); // Prevent focus loss
      toggleBtn.onclick = () => {
        toolbar.classList.toggle('is-open');
        toggleBtn.querySelector('.toolbar-arrow').style.transform = toolbar.classList.contains('is-open') ? 'rotate(180deg)' : 'rotate(0deg)';
      };
    }
    // Formatting buttons
    const boldBtn = hostEl.querySelector('#bold-btn');
    const italicBtn = hostEl.querySelector('#italic-btn');
    const underlineBtn = hostEl.querySelector('#underline-btn');

    if (boldBtn) {
        boldBtn.onmousedown = (e) => {
            e.preventDefault(); // Prevent focus loss
        };
        boldBtn.onclick = (e) => {
            e.preventDefault();
            qTextInput.focus();
            document.execCommand('bold', false, null);
            updateFormattingButtons();
        };
    }

    if (italicBtn) {
        italicBtn.onmousedown = (e) => {
            e.preventDefault(); // Prevent focus loss
        };
        italicBtn.onclick = (e) => {
            e.preventDefault();
            qTextInput.focus();
            document.execCommand('italic', false, null);
            updateFormattingButtons();
        };
    }

    if (underlineBtn) {
        underlineBtn.onmousedown = (e) => {
            e.preventDefault(); // Prevent focus loss
        };
        underlineBtn.onclick = (e) => {
            e.preventDefault();
            qTextInput.focus();
            document.execCommand('underline', false, null);
            updateFormattingButtons();
        };
    }

    // Function to update button states based on current selection
    const updateFormattingButtons = () => {
        if (boldBtn) boldBtn.classList.toggle('active', document.queryCommandState('bold'));
        if (italicBtn) italicBtn.classList.toggle('active', document.queryCommandState('italic'));
        if (underlineBtn) underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
    };

    // Update button states when selection changes (debounced to prevent excessive calls)
    let formatUpdateTimeout = null;
    const debouncedUpdateFormattingButtons = () => {
        if (formatUpdateTimeout) clearTimeout(formatUpdateTimeout);
        formatUpdateTimeout = setTimeout(updateFormattingButtons, 100);
    };

    // Only update formatting buttons when text input is focused
    qTextInput.addEventListener('focus', updateFormattingButtons);
    qTextInput.addEventListener('keyup', (e) => {
        // Only update for actual text changes, not navigation keys
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
            debouncedUpdateFormattingButtons();
        }
    });
    qTextInput.addEventListener('mouseup', debouncedUpdateFormattingButtons);

    // Keyboard shortcuts
    qTextInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    document.execCommand('bold', false, null);
                    updateFormattingButtons();
                    break;
                case 'i':
                    e.preventDefault();
                    document.execCommand('italic', false, null);
                    updateFormattingButtons();
                    break;
                case 'u':
                    e.preventDefault();
                    document.execCommand('underline', false, null);
                    updateFormattingButtons();
                    break;
            }
        }
    });

    // Paste handler - strip all formatting except bold, italic, underline
    qTextInput.addEventListener('paste', (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('📋 Paste event triggered');

        // Get pasted data
        const clipboardData = e.clipboardData || window.clipboardData;
        let pastedText = clipboardData.getData('text/plain');

        console.log('📋 Pasted text:', pastedText.substring(0, 100) + '...');

        // Simple approach: just paste plain text, no HTML at all
        // Users can re-apply bold/italic/underline after pasting if needed
        if (pastedText) {
            // Insert plain text at cursor
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();

                // Split by line breaks and insert as text nodes with <br> tags
                const lines = pastedText.split(/\r?\n/);
                lines.forEach((line, index) => {
                    range.insertNode(document.createTextNode(line));
                    if (index < lines.length - 1) {
                        range.insertNode(document.createElement('br'));
                    }
                });

                // Move cursor to end
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        console.log('📋 Paste complete, text inserted');

        // Trigger save
        setTimeout(() => {
            const inputEvent = new Event('input', { bubbles: true });
            qTextInput.dispatchEvent(inputEvent);
        }, 100);
    });

    const fontSizeSelect = hostEl.querySelector('#qtext-fontsize');
    if (fontSizeSelect) {
        fontSizeSelect.onmousedown = (e) => e.preventDefault(); // Prevent focus loss
        fontSizeSelect.onchange = (e) => {
            // Store current selection before making changes
            const selection = window.getSelection();
            let savedRange = null;
            if (selection.rangeCount > 0) {
                savedRange = selection.getRangeAt(0).cloneRange();
            }

            document.execCommand('fontSize', false, e.target.value);

            // Clean up font styling immediately after execCommand
            setTimeout(() => {
                cleanUpStyling();

                // Restore selection if possible
                if (savedRange) {
                    try {
                        selection.removeAllRanges();
                        selection.addRange(savedRange);
                    } catch (e) {
                        // Selection restoration failed, just focus the input
                        qTextInput.focus();
                    }
                } else {
                    qTextInput.focus();
                }
            }, 0);
        };
    }
    const fontColorInput = hostEl.querySelector('#qtext-color');
    if (fontColorInput) {
        fontColorInput.onmousedown = (e) => e.preventDefault(); // Prevent focus loss
        fontColorInput.oninput = (e) => {
            // Store current selection before making changes
            const selection = window.getSelection();
            let savedRange = null;
            if (selection.rangeCount > 0) {
                savedRange = selection.getRangeAt(0).cloneRange();
            }

            document.execCommand('foreColor', false, e.target.value);

            // Restore selection if possible
            setTimeout(() => {
                if (savedRange) {
                    try {
                        selection.removeAllRanges();
                        selection.addRange(savedRange);
                    } catch (e) {
                        // Selection restoration failed, just focus the input
                        qTextInput.focus();
                    }
                } else {
                    qTextInput.focus();
                }
            }, 0);
        };
    }

    // Piping
    const pipeBtn = hostEl.querySelector('#insert-pipe-btn');
    const previewEl = hostEl.querySelector('#piping-preview');
    if (pipeBtn) {
        pipeBtn.onclick = (e) => {
            e.preventDefault();
            console.log('Insert Pipe button clicked, opening modal...');

            // Ensure the text input is focused first
            qTextInput.focus();

            // Store the current selection/cursor position
            const selection = window.getSelection();
            let savedRange = null;

            if (selection.rangeCount > 0) {
                savedRange = selection.getRangeAt(0).cloneRange();
                console.log('Saved cursor range:', savedRange);
            } else {
                console.log('No selection found, will insert at end');
            }

            // Store the range for later use
            window.savedCursorRange = savedRange;
            window.currentPipeTextInput = qTextInput;  // Set this immediately

            showPipeInsertModal(questionIndex, qTextInput);
        };
    }
    const refreshPreview = () => {
        if (!previewEl) return;

        // Check if there are any pipe indicators in the question
        const pipeElements = qTextInput.querySelectorAll('.pipe-indicator');
        if (pipeElements.length === 0) {
            previewEl.style.display = 'none';
            return;
        }

        // Build mock responses
        const allQuestions = window.state?.questions || [];
        const mockResponses = buildMockResponses(allQuestions);

        // Get the HTML content and process pipes
        let previewHtml = qTextInput.innerHTML;

        // Replace pipe indicators with actual preview text
        pipeElements.forEach(pipeEl => {
            const pipeCode = pipeEl.dataset.pipeCode;
            const questionId = pipeEl.dataset.questionId;

            // Get the first option from the referenced question for preview
            const referencedQuestion = window.state.questions.find(q => q.id === questionId);
            let previewText = `[${questionId}]`;

            if (referencedQuestion) {
                // Check for selective pipe codes (e.g., {Q3:1,2,5})
                const selectiveMatch = pipeCode.match(/\{([^}]+):([^}]+)\}/);
                if (selectiveMatch && selectiveMatch[2] !== 'label' && referencedQuestion.options) {
                    const requestedCodes = selectiveMatch[2].split(',');
                    const matchingOptions = referencedQuestion.options.filter(opt => requestedCodes.includes(String(opt.code)));
                    if (matchingOptions.length > 0) {
                        // Show first matching option as preview
                        previewText = matchingOptions[0].label || matchingOptions[0].code || `[${questionId}]`;
                    } else {
                        previewText = `[${questionId} - no matching options]`;
                    }
                } else if (pipeCode.includes(':label') && referencedQuestion.options && referencedQuestion.options.length > 0) {
                    previewText = referencedQuestion.options[0].label || referencedQuestion.options[0].code || `[${questionId}]`;
                } else if (referencedQuestion.options && referencedQuestion.options.length > 0) {
                    previewText = referencedQuestion.options[0].code || `[${questionId}]`;
                } else {
                    previewText = mockResponses[questionId] || `[${questionId}]`;
                }
            }

            // Replace the pipe element with preview text in the HTML
            const pipeElementHtml = pipeEl.outerHTML;
            previewHtml = previewHtml.replace(pipeElementHtml, `<span style="color: var(--accent); font-weight: 500;">${previewText}</span>`);
        });

        // Clean HTML to preserve formatting but remove font-size
        const cleanHtml = previewHtml.replace(/style="[^"]*font-size:[^;"]*;?[^"]*"/g, (match) => {
            // Remove font-size but keep other styles
            const cleaned = match.replace(/font-size:[^;"]*;?/g, '').replace(/style=""/g, '');
            return cleaned === 'style=""' ? '' : cleaned;
        });

        // Show the preview with HTML rendering
        previewEl.innerHTML = `<strong>Preview:</strong> ${cleanHtml}`;
        previewEl.style.display = 'block';
    };
    // Strip unwanted styling on paste and input
    const cleanUpStyling = () => {
        // Remove font-family and font-size styling while preserving bold/italic/underline
        const walker = document.createTreeWalker(
            qTextInput,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        );

        const elementsToClean = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.style) {
                elementsToClean.push(node);
            }
        }

        elementsToClean.forEach(element => {
            // Remove font-specific properties but keep formatting
            element.style.removeProperty('font-family');
            element.style.removeProperty('font-size');
            element.style.removeProperty('line-height');

            // If no styles remain, remove the style attribute entirely
            if (!element.style.cssText.trim()) {
                element.removeAttribute('style');
            }
        });
    };

    // Handle question text updates without re-rendering during typing
    let textUpdateTimeout = null;
    qTextInput.addEventListener('input', (e) => {
        // Clean up unwanted font styling
        if (e.inputType === 'insertFromPaste') {
            setTimeout(cleanUpStyling, 0); // Allow paste to complete first
        }

        // Update the actual question data immediately (no re-render)
        question.text = qTextInput.innerHTML;

        // Update sidebar display immediately
        updateSidebarQuestionText(questionIndex, question.text);

        // Update preview immediately for better UX
        refreshPreview();

        // Clear any pending saves
        if (textUpdateTimeout) clearTimeout(textUpdateTimeout);
        textUpdateTimeout = setTimeout(() => {
            // Save to backend without triggering re-render (data is already updated above)
            console.log('Auto-saving question text to backend...');
            window.saveQuestionToBackend?.(question, questionIndex);
        }, 2000); // Wait 2 seconds after user stops typing
    });

    // Save immediately when user leaves the field
    qTextInput.addEventListener('blur', () => {
        if (textUpdateTimeout) {
            clearTimeout(textUpdateTimeout);
        }
        // Data is already updated in question.text above, just trigger save
        console.log('Question text saved on blur');
        window.saveQuestionToBackend?.(question, questionIndex);
    });
    refreshPreview(); // Initial render

    // Initialize formatting button states
    setTimeout(updateFormattingButtons, 0);

    // Initialize conditional logic
    if (!question.conditions) {
        question.conditions = createDefaultConditions();
    }

    // Set up conditional logic handlers (without aggressive re-rendering)
    setupConditionalLogicHandlers(question, questionIndex, (updatedQuestion) => {
        // Just update the data, don't re-render the entire panel
        Object.assign(question, updatedQuestion);
        actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
    });

    // Load tab plan styles if not already loaded
    if (!document.querySelector('link[href*="tabPlanStyles.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './src/views/project/editor/tabPlanStyles.css';
        document.head.appendChild(link);
    }

    // Set up tab plan panel (render immediately if tab is active)
    const tabPlanHost = hostEl.querySelector('#tab-plan-host');
    if (tabPlanHost) {
        if (activeTab === 'tabplan') {
            renderTabPlanPanel({
                hostEl: tabPlanHost,
                question: question,
                questionIndex: questionIndex,
                actions: actions
            });
        }

        // Store reference for lazy loading when tab becomes active
        tabPlanHost._renderTabPlan = () => {
            renderTabPlanPanel({
                hostEl: tabPlanHost,
                question: question,
                questionIndex: questionIndex,
                actions: actions
            });
        };
    }

    // Set up drag-and-drop for option reordering
    setupOptionDragAndDrop(hostEl, question, questionIndex, actions);

    // --- General Event Delegation ---

    // Stop clicks inside advanced panels from propagating
    hostEl.addEventListener('click', (e) => {
        const advancedPanel = e.target.closest('.advanced-options');
        if (advancedPanel && !advancedPanel.classList.contains('is-hidden')) {
            // Only stop propagation if clicking inside an open advanced panel
            // But allow action buttons inside to work
            if (!e.target.closest('[data-action]')) {
                e.stopPropagation();
            }
        }
    }, true); // Use capture phase to catch events early

    // Handle compact header controls
    const compactQuestionId = hostEl.querySelector('.question-id-inline');
    const compactQuestionType = hostEl.querySelector('#question-type-select');
    const headerDropdownToggle = hostEl.querySelector('[data-action="toggle-header-menu"]');
    const headerDropdownMenu = hostEl.querySelector('.header-dropdown-menu');

    // Compact question ID handler
    let idUpdateTimeout = null;
    if (compactQuestionId) {
        compactQuestionId.addEventListener('input', (e) => {
            // Update data immediately via array index (no re-render)
            window.state.questions[questionIndex].id = e.target.value;

            // Clear existing timeout
            if (idUpdateTimeout) clearTimeout(idUpdateTimeout);

            // Save after user stops typing
            idUpdateTimeout = setTimeout(() => {
                actions.onUpdateQuestion(questionIndex, 'id', e.target.value);
            }, 1000);
        });

        compactQuestionId.addEventListener('blur', (e) => {
            if (idUpdateTimeout) {
                clearTimeout(idUpdateTimeout);
                actions.onUpdateQuestion(questionIndex, 'id', e.target.value);
            }

            // Add validation checking
            const value = e.target.value;
            const allQuestions = window.state?.questions || [];
            const duplicateExists = allQuestions.some((q, index) =>
                q.id === value && index !== questionIndex
            );

            let validationResult = validateField('questionId', value);

            if (validationResult.isValid && duplicateExists) {
                validationResult = {
                    isValid: false,
                    severity: 'error',
                    message: 'Question ID already exists'
                };
            }

            // Show validation feedback in compact mode
            if (!validationResult.isValid) {
                compactQuestionId.style.borderColor = 'var(--danger)';
                compactQuestionId.title = validationResult.message;
            } else {
                compactQuestionId.style.borderColor = '';
                compactQuestionId.title = '';
            }
        });
    }

    // Compact question type handler
    if (compactQuestionType) {
        compactQuestionType.addEventListener('change', (e) => {
            const newMode = e.target.value;
            const oldMode = question.mode;

            // Clean up incompatible data when switching modes
            if (oldMode !== newMode) {
                console.log(`Switching question mode from ${oldMode} to ${newMode}`);

                // Clean up list mode data when switching away from list
                if (oldMode === 'list' && newMode !== 'list') {
                    if (question.options && question.options.length > 0) {
                        console.log('Clearing options array when switching from list mode');
                        question.options = [];
                    }
                }

                // Clean up numeric mode data when switching away from numeric
                if (oldMode === 'numeric' && newMode !== 'numeric') {
                    if (question.numeric) {
                        console.log('Clearing numeric config when switching from numeric mode');
                        question.numeric = {};
                    }
                }

                // Clean up table mode data when switching away from table
                if (oldMode === 'table' && newMode !== 'table') {
                    if (question.grid) {
                        console.log('Clearing grid config when switching from table mode');
                        question.grid = {};
                    }
                }

                // Clean up repeated mode data when switching away from repeated
                if (oldMode === 'repeated' && newMode !== 'repeated') {
                    if (question.repeated) {
                        console.log('Clearing repeated config when switching from repeated mode');
                        question.repeated = {};
                    }
                }

                // Initialize repeated mode data when switching to repeated
                if (newMode === 'repeated' && !question.repeated) {
                    console.log('Initializing repeated config when switching to repeated mode');
                    question.repeated = {
                        source_qid: '',
                        columns: ['Option 1', 'Option 2']
                    };
                }

                // Update the mode first
                question.mode = newMode;

                // Initialize table mode data when switching to table
                if (newMode === 'table') {
                    ensureTableGrid(question);
                    updateTableVariation(question);
                }

                // MAP TO YOUR 3-COLUMN SYSTEM
                const modeToTypeMap = {
                    'list': 'list',
                    'numeric': 'numeric',
                    'open_end': 'open_end',
                    'text': 'txt',
                    'table': 'table',
                    'advanced_table': 'table'
                };

                if (modeToTypeMap[newMode]) {
                    question.question_type = modeToTypeMap[newMode];
                    actions.onUpdateQuestion(questionIndex, 'question_type', question.question_type);

                    // Set default question_mode for each type
                    if (newMode === 'list') {
                        question.question_mode = question.type || 'single'; // single or multi
                    } else if (newMode === 'numeric') {
                        question.question_mode = 'numeric_simple'; // default numeric mode
                    } else if (newMode === 'table' || newMode === 'advanced_table') {
                        question.question_mode = 'simple_table'; // default table mode
                        question.table_type = null; // clear table_type for simple tables
                    } else {
                        question.question_mode = modeToTypeMap[newMode]; // txt, open_end use same value
                    }

                    actions.onUpdateQuestion(questionIndex, 'question_mode', question.question_mode);
                    if (question.table_type !== undefined) {
                        actions.onUpdateQuestion(questionIndex, 'table_type', question.table_type);
                    }

                    console.log(`🔄 Set question_type: ${question.question_type}, question_mode: ${question.question_mode} for mode: ${newMode}`);
                }


                // Initialize advanced table mode data when switching to advanced_table
                if (newMode === 'advanced_table') {
                    if (!question.advancedTable) {
                        question.advancedTable = {
                            rows: [],
                            cols: [],
                            tableVariation: 'Standard Table'
                        };
                    }

                    // NEW: Set simple taxonomy when creating advanced table
                    question.question_type = 'advanced_table';
                    question.question_mode = 'simple_table';  // Default until preset applied

                    // Save basic taxonomy to database
                    actions.onUpdateQuestion(questionIndex, 'question_type', question.question_type);
                    actions.onUpdateQuestion(questionIndex, 'question_mode', question.question_mode);
                }

                // NEW: Handle legacy Likert mode selections (future-proof)
                if (newMode.startsWith('likert_')) {
                    const likertType = newMode.replace('likert_', '');
                    const defaultPoints = 5; // Most common scale

                    // Ensure advanced table structure exists
                    if (!question.advancedTable) {
                        question.advancedTable = {
                            rows: [],
                            cols: [],
                            tableVariation: `${likertType.charAt(0).toUpperCase() + likertType.slice(1)} Scale`
                        };
                    }

                    // MAP TO YOUR 3-COLUMN SYSTEM FOR LIKERT PRESETS
                    question.question_type = 'table';  // Always table
                    question.question_mode = 'likert';  // Likert mode for any Likert scale
                    question.table_type = `likert_${likertType}_${defaultPoints}`;  // Complex hybrid code
                    question.table_metadata = {
                        base_type: 'likert',
                        likert_subtype: likertType,
                        scale_points: defaultPoints,
                        auto_nets: ['T2B', 'B2B'],
                        spss_variable_type: 'ordinal',
                        source_config: {
                            rows: { mode: 'manual' },
                            columns: { mode: 'preset', preset_id: `${likertType}_${defaultPoints}pt` }
                        }
                    };

                    // Save to your 3-column system
                    actions.onUpdateQuestion(questionIndex, 'question_type', question.question_type);
                    actions.onUpdateQuestion(questionIndex, 'question_mode', question.question_mode);
                    actions.onUpdateQuestion(questionIndex, 'table_type', question.table_type);
                    actions.onUpdateQuestion(questionIndex, 'table_metadata', question.table_metadata);

                    console.log(`🎯 Set proper taxonomy for Likert mode: ${question.table_type}`);
                }
            }

            actions.onUpdateQuestion(questionIndex, 'mode', newMode);
        });
    }

    // Header dropdown toggle
    if (headerDropdownToggle && headerDropdownMenu) {
        headerDropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = headerDropdownMenu.style.display !== 'none';

            if (isVisible) {
                headerDropdownMenu.style.display = 'none';
            } else {
                // Calculate position relative to button for fixed positioning
                const rect = headerDropdownToggle.getBoundingClientRect();
                headerDropdownMenu.style.top = (rect.bottom + 4) + 'px';
                headerDropdownMenu.style.right = (window.innerWidth - rect.right) + 'px'; // Align right edge with button
                headerDropdownMenu.style.display = 'block';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-dropdown')) {
                headerDropdownMenu.style.display = 'none';
            }
        });

        // Handle dropdown item clicks
        headerDropdownMenu.addEventListener('click', (e) => {
            e.preventDefault();
            const action = e.target.closest('[data-action]')?.dataset.action;

            if (action) {
                headerDropdownMenu.style.display = 'none';

                switch (action) {
                    case 'duplicate-question':
                        actions.onDuplicateQuestion(questionIndex);
                        break;
                    case 'delete-question':
                        actions.onDeleteQuestion(questionIndex);
                        break;
                    case 'export-question':
                        // Future feature - export single question
                        console.log('Export question feature coming soon');
                        break;
                }
            }
        });
    }

    // Handle question ID input without re-rendering during typing (legacy support)
    const legacyQuestionId = hostEl.querySelector('#questionId');
    if (legacyQuestionId) {
        legacyQuestionId.addEventListener('input', (e) => {
            // Update data immediately via array index (no re-render)
            window.state.questions[questionIndex].id = e.target.value;

            // Clear any pending saves
            if (idUpdateTimeout) clearTimeout(idUpdateTimeout);
            idUpdateTimeout = setTimeout(() => {
                actions.onUpdateQuestion(questionIndex, 'id', e.target.value);
            }, 2000);
        });

        // Save when user leaves the field
        legacyQuestionId.addEventListener('blur', (e) => {
            if (idUpdateTimeout) {
                clearTimeout(idUpdateTimeout);
                actions.onUpdateQuestion(questionIndex, 'id', e.target.value);
            }

            // Add validation checking
            const value = e.target.value;
            const allQuestions = window.state?.questions || [];
            const duplicateExists = allQuestions.some((q, index) =>
                q.id === value && index !== questionIndex
            );

            let validationResult = validateField('questionId', value);

            if (validationResult.isValid && duplicateExists) {
                validationResult = {
                    isValid: false,
                    severity: 'error',
                    message: 'Question ID already exists'
                };
            }

            const validationContainer = hostEl.querySelector('#questionId-validation');
            if (validationContainer) {
                renderFieldValidation({ hostEl: validationContainer, validationResult });
            }
        });
    }

    // Debounce mechanism for option inputs
    let optionUpdateTimeouts = {};

    hostEl.addEventListener('input', (e) => {
        const target = e.target;
        const action = target.dataset.action;

        if (action === 'update-option') {
            const optIndex = parseInt(target.dataset.optIndex);
            const key = target.dataset.key;
            const value = target.value;

            // Update data immediately (no re-render)
            if (question.options && question.options[optIndex]) {
                question.options[optIndex][key] = value;
            }

            // Create unique timeout key for this specific option field
            const timeoutKey = `${optIndex}-${key}`;

            // Clear existing timeout
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }

            // Set new timeout for save operation (NO RE-RENDER, just save to backend)
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                // ✅ CORRECT - Save to backend without re-rendering
                window.saveQuestionToBackend?.(question, questionIndex);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);

        } else if (action === 'update-table-row') {
            const rowIndex = parseInt(target.dataset.rowIndex);
            const value = target.value;

            // Update data immediately (no re-render)
            if (question.grid && question.grid.rows && question.grid.rows[rowIndex] !== undefined) {
                question.grid.rows[rowIndex] = value;
            }

            // Debounce save operation
            const timeoutKey = `table-row-${rowIndex}`;
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                actions.onUpdateTableRow(questionIndex, rowIndex, value);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);

        } else if (action === 'update-table-col') {
            const colIndex = parseInt(target.dataset.colIndex);
            const value = target.value;

            // Update data immediately (no re-render)
            if (question.grid && question.grid.cols && question.grid.cols[colIndex] !== undefined) {
                question.grid.cols[colIndex] = value;
            }

            // Debounce save operation
            const timeoutKey = `table-col-${colIndex}`;
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                actions.onUpdateTableCol(questionIndex, colIndex, value);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);

        } else if (action === 'update-adv-row') {
            const rowIndex = parseInt(target.dataset.rowIndex);
            const value = target.value;

            // Update data immediately (no re-render)
            if (question.advancedTable && question.advancedTable.rows && question.advancedTable.rows[rowIndex] !== undefined) {
                question.advancedTable.rows[rowIndex] = value;
            }

            // Debounce save operation
            const timeoutKey = `adv-row-${rowIndex}`;
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                actions.onUpdateQuestion(questionIndex, 'advancedTable', question.advancedTable);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);

        } else if (action === 'update-adv-col') {
            const colIndex = parseInt(target.dataset.colIndex);
            const value = target.value;

            // Update data immediately (no re-render)
            if (question.advancedTable && question.advancedTable.cols && question.advancedTable.cols[colIndex] !== undefined) {
                question.advancedTable.cols[colIndex] = value;
            }

            // Debounce save operation
            const timeoutKey = `adv-col-${colIndex}`;
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                actions.onUpdateQuestion(questionIndex, 'advancedTable', question.advancedTable);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);
        } else if (action === 'update-numeric') {
            const key = target.dataset.key;
            const value = target.type === 'checkbox' ? target.checked : target.value;
            console.log('update-numeric triggered:', key, '=', value);

            // For checkboxes and dropdowns, save immediately since they're discrete actions
            if (target.type === 'checkbox' || target.type === 'select-one') {
                // Update data immediately (no re-render)
                if (!question.numeric) question.numeric = {};
                question.numeric[key] = value;

                // ✅ CORRECT - Only save to backend, don't trigger re-render
                setTimeout(() => {
                    window.saveQuestionToBackend?.(question, questionIndex);
                }, 100);
            } else {
                // For text/number inputs, just update the data - save happens on blur
                if (!question.numeric) question.numeric = {};
                question.numeric[key] = value;

                console.log('Text input updated (will save on blur):', key, '=', value);
            }

        } else if (action === 'update-open') {
            const key = target.dataset.key;
            const value = target.value;

            // Update data immediately (no re-render)
            if (!question.open) question.open = {};
            question.open[key] = value;

            // Debounce save operation
            const timeoutKey = `open-${key}`;
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                actions.onUpdateOpen(questionIndex, key, value);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);

        } else if (action === 'update-question-prop') {
            // Debounced pattern to prevent focus loss (CRITICAL FIX)
            const key = target.dataset.key;
            const value = target.value;

            // Update data immediately (no re-render)
            question[key] = value;

            // Skip 'id' field - it has specific debounced handlers
            if (key !== 'id') {
                // Debounce save operation (2 second delay)
                const timeoutKey = `question-prop-${key}`;
                if (optionUpdateTimeouts[timeoutKey]) {
                    clearTimeout(optionUpdateTimeouts[timeoutKey]);
                }
                optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                    // ✅ CORRECT - Save to backend without re-rendering
                    window.saveQuestionToBackend?.(question, questionIndex);
                    delete optionUpdateTimeouts[timeoutKey];
                }, 2000);
            }
        } else if (action === 'update-col-source') {
            actions.onUpdateColSource(questionIndex, target.dataset.key, target.value);
        } else if (action === 'update-numeric-range') {
            const rangeIndex = parseInt(target.dataset.rangeIndex);
            const key = target.dataset.key;
            const value = target.value;

            // Update data immediately (no re-render)
            if (question.numeric && question.numeric.ranges && question.numeric.ranges[rangeIndex]) {
                question.numeric.ranges[rangeIndex][key] = value;
            }

            // Debounce save operation
            const timeoutKey = `numeric-range-${rangeIndex}-${key}`;
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                actions.onUpdateNumericRange(questionIndex, rangeIndex, key, value);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);

            // Handle showing/hiding the second value field for "between" operator
        } else if (action === 'update-repeated') {
            // REPEATED OPTIONS PATTERN - Fixed dropdown disappearing issue (2025-01-23)
            // Uses debounced input pattern instead of immediate click handlers
            // See CLAUDE.md for detailed explanation of this pattern
            const key = target.dataset.key;
            const value = target.value;

            // Update data immediately (no re-render) - prevents data loss during typing
            if (!question.repeated) question.repeated = {};

            if (key === 'column') {
                const colIndex = parseInt(target.dataset.colIndex);
                if (!question.repeated.columns) question.repeated.columns = [];
                question.repeated.columns[colIndex] = value;
            } else {
                question.repeated[key] = value;
            }

            // For source_qid changes, trigger a re-render to update preview immediately
            // This is an exception because the preview needs to update when source changes
            if (key === 'source_qid') {
                console.log('Source question changed, triggering preview update');
                setTimeout(() => {
                    actions.onUpdateQuestion(questionIndex, 'repeated', question.repeated);
                }, 0);
            } else {
                // Debounce save operation for other fields (2 second delay)
                // This prevents re-rendering while user is typing/interacting
                const timeoutKey = key === 'column' ? `repeated-col-${target.dataset.colIndex}` : `repeated-${key}`;
                if (optionUpdateTimeouts[timeoutKey]) {
                    clearTimeout(optionUpdateTimeouts[timeoutKey]);
                }
                optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                    actions.onUpdateQuestion(questionIndex, 'repeated', question.repeated);
                    delete optionUpdateTimeouts[timeoutKey];
                }, 2000);
            }
        } else if (action === 'update-global-terminate') {
            // Update the global terminate values
            actions.onUpdateGlobalTerminate(questionIndex, target.dataset.key, target.value);
        } else if (action === 'update-conditional-mode') {
            // CONDITIONAL LOGIC MODE - Fixed dropdown disappearing issue
            // Uses debounced input pattern instead of immediate click handlers
            const mode = target.dataset.key;

            // Update data immediately (no re-render)
            if (!question.conditions) question.conditions = createDefaultConditions();
            question.conditions.mode = mode;

            if (mode === 'none') {
                question.conditions.rules = [];
            } else {
                // Ensure rules array exists
                if (!question.conditions.rules) {
                    question.conditions.rules = [];
                }
                // Only add an empty rule if no rules exist
                if (question.conditions.rules.length === 0) {
                    // Import is already done at the top, use the imported function
                    question.conditions.rules = [createEmptyConditionRule()];
                }
            }

            // Debounce save operation
            const timeoutKey = 'conditional-mode';
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);
        } else if (action === 'update-conditional-logic') {
            // CONDITIONAL LOGIC OPERATOR - Fixed dropdown disappearing issue
            const key = target.dataset.key;
            const value = target.value;

            // Update data immediately (no re-render)
            if (!question.conditions) question.conditions = createDefaultConditions();
            question.conditions[key] = value;

            // Debounce save operation
            const timeoutKey = `conditional-${key}`;
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);
        } else if (action === 'update-conditional-rule') {
            // CONDITIONAL RULES - Fixed dropdown disappearing issue
            const ruleIndex = parseInt(target.dataset.ruleIndex);
            const key = target.dataset.key;
            const value = target.value;

            // Update data immediately (no re-render)
            if (!question.conditions) question.conditions = createDefaultConditions();
            if (!question.conditions.rules[ruleIndex]) return;

            question.conditions.rules[ruleIndex][key] = value;

            // Reset values when source question or operator changes
            if (key === 'source_qid' || key === 'operator') {
                question.conditions.rules[ruleIndex].values = [''];
                question.conditions.rules[ruleIndex].value2 = '';
            }

            // For critical changes that need immediate UI updates
            if (key === 'source_qid' || key === 'operator') {
                console.log('Critical conditional rule field changed, triggering immediate update');
                setTimeout(() => {
                    actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                }, 0);
            } else {
                // Debounce save operation for other fields
                const timeoutKey = `conditional-rule-${ruleIndex}-${key}`;
                if (optionUpdateTimeouts[timeoutKey]) {
                    clearTimeout(optionUpdateTimeouts[timeoutKey]);
                }
                optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                    actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                    delete optionUpdateTimeouts[timeoutKey];
                }, 2000);
            }
        } else if (action === 'set-simple-mode') {
            // SIMPLE MODE RADIO BUTTONS - Progressive disclosure
            const mode = target.dataset.mode;
            if (mode === 'always') {
                // Clear all conditions
                question.conditions = createDefaultConditions();
                question.conditions.mode = 'none';
            } else if (mode === 'conditional') {
                // Initialize with basic conditional setup
                if (!question.conditions) question.conditions = createDefaultConditions();
                question.conditions.mode = 'show_if';
                if (!question.conditions.rules || question.conditions.rules.length === 0) {
                    question.conditions.rules = [createEmptyConditionRule()];
                }
            }
            // Re-render only the conditional panel to avoid white flash
            const conditionalPanel = hostEl.querySelector('#conditional-logic-container');
            if (conditionalPanel) {
                conditionalPanel.innerHTML = renderConditionalLogicPanel(question, questionIndex, (updatedQuestion) => {
                    // Update question with new conditions
                    Object.assign(question, updatedQuestion);
                    actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                });
            }

            // Debounce save operation for persistence only
            const timeoutKey = 'set-simple-mode-save';
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                // Save to backend without triggering re-render
                window.saveQuestionToBackend?.(question, questionIndex);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);
        } else if (action === 'update-smart-source') {
            // SMART SETUP - Update source question
            if (!question.conditions) question.conditions = createDefaultConditions();
            if (!question.conditions.rules) question.conditions.rules = [];
            if (question.conditions.rules.length === 0) {
                question.conditions.rules = [createEmptyConditionRule()];
            }

            const sourceQid = target.value;
            question.conditions.rules[0].source_qid = sourceQid;
            question.conditions.rules[0].values = []; // Reset values when source changes
            question.conditions.mode = 'show_if';

            // Re-render only the conditional panel to show the new options immediately
            const conditionalPanel = hostEl.querySelector('#conditional-logic-container');
            if (conditionalPanel) {
                conditionalPanel.innerHTML = renderConditionalLogicPanel(question, questionIndex, (updatedQuestion) => {
                    // Update question with new conditions
                    Object.assign(question, updatedQuestion);
                    actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                });
            }

            // Debounce save operation for persistence only
            const timeoutKey = 'smart-source-save';
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                // Save to backend without triggering re-render
                window.saveQuestionToBackend?.(question, questionIndex);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);
        } else if (action === 'update-smart-value') {
            // SMART SETUP - Update values
            if (!question.conditions?.rules?.[0]) return;

            const rule = question.conditions.rules[0];
            const valueKey = target.dataset.key;

            if (valueKey === 'text_value') {
                rule.values = [target.value];
            } else if (valueKey === 'option_value') {
                const value = target.dataset.value;
                if (!rule.values) rule.values = [];

                if (target.checked) {
                    if (!rule.values.includes(value)) {
                        rule.values.push(value);
                    }
                } else {
                    const index = rule.values.indexOf(value);
                    if (index > -1) {
                        rule.values.splice(index, 1);
                    }
                }
            }

            // Debounce save operation for persistence only (no re-render needed for checkbox changes)
            const valueTimeoutKey = 'smart-value-save';
            if (optionUpdateTimeouts[valueTimeoutKey]) {
                clearTimeout(optionUpdateTimeouts[valueTimeoutKey]);
            }
            optionUpdateTimeouts[valueTimeoutKey] = setTimeout(() => {
                // Save to backend without triggering re-render
                window.saveQuestionToBackend?.(question, questionIndex);
                delete optionUpdateTimeouts[valueTimeoutKey];
            }, 2000);
        } else if (action === 'update-conditional-value') {
            // CONDITIONAL VALUES - Fixed dropdown disappearing issue
            const ruleIndex = parseInt(target.dataset.ruleIndex);
            const key = target.dataset.key;
            const value = target.value;

            // Update data immediately (no re-render)
            if (!question.conditions) question.conditions = createDefaultConditions();
            if (!question.conditions.rules[ruleIndex]) return;

            const rule = question.conditions.rules[ruleIndex];

            if (key.startsWith('values.')) {
                const valueIndex = parseInt(key.split('.')[1]);
                if (!rule.values) rule.values = [];
                rule.values[valueIndex] = value;
            } else {
                rule[key] = value;
            }

            // Debounce save operation
            const timeoutKey = `conditional-value-${ruleIndex}-${key}`;
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);
        } else if (action === 'update-conditional-checkbox') {
            // CONDITIONAL CHECKBOXES - Fixed dropdown disappearing issue
            const ruleIndex = parseInt(target.dataset.ruleIndex);
            const value = target.dataset.value;
            const checked = target.checked;

            // Update data immediately (no re-render)
            if (!question.conditions) question.conditions = createDefaultConditions();
            if (!question.conditions.rules[ruleIndex]) return;

            const rule = question.conditions.rules[ruleIndex];
            if (!rule.values) rule.values = [];

            if (checked) {
                if (!rule.values.includes(value)) {
                    rule.values.push(value);
                }
            } else {
                const index = rule.values.indexOf(value);
                if (index > -1) {
                    rule.values.splice(index, 1);
                }
            }

            // Debounce save operation
            const timeoutKey = `conditional-checkbox-${ruleIndex}`;
            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
            }
            optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                delete optionUpdateTimeouts[timeoutKey];
            }, 2000);
        }
    });


    // Handle mousedown on buttons BEFORE blur fires to save input first
    hostEl.addEventListener('mousedown', (e) => {
        const target = e.target.closest('button, [role="button"], .behavior-icon, .option-settings-btn');
        if (!target) return;

        // Find any focused input that needs saving
        const activeInput = document.activeElement;
        if (activeInput && activeInput.tagName === 'INPUT' && activeInput.dataset.action === 'update-option') {
            const optIndex = parseInt(activeInput.dataset.optIndex);
            const key = activeInput.dataset.key;
            const timeoutKey = `${optIndex}-${key}`;

            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
                // ✅ CORRECT - Save immediately without re-rendering
                window.saveQuestionToBackend?.(question, questionIndex);
                delete optionUpdateTimeouts[timeoutKey];
            }
        }
    }, true); // Use capture phase to fire before blur

    // Handle blur events for immediate saving when user leaves input fields
    hostEl.addEventListener('blur', (e) => {
        const target = e.target;
        const action = target.dataset.action;

        if (action === 'update-option') {
            const optIndex = parseInt(target.dataset.optIndex);
            const key = target.dataset.key;
            const timeoutKey = `${optIndex}-${key}`;

            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
                // ✅ CORRECT - Save to backend without re-rendering
                window.saveQuestionToBackend?.(question, questionIndex);
                delete optionUpdateTimeouts[timeoutKey];
            }
        } else if (action === 'update-table-row') {
            const rowIndex = parseInt(target.dataset.rowIndex);
            const timeoutKey = `table-row-${rowIndex}`;

            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
                actions.onUpdateTableRow(questionIndex, rowIndex, target.value);
                delete optionUpdateTimeouts[timeoutKey];
            }
        } else if (action === 'update-table-col') {
            const colIndex = parseInt(target.dataset.colIndex);
            const timeoutKey = `table-col-${colIndex}`;

            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
                actions.onUpdateTableCol(questionIndex, colIndex, target.value);
                delete optionUpdateTimeouts[timeoutKey];
            }
        // Remove duplicate update-numeric handler - handled above
        } else if (action === 'update-open') {
            const key = target.dataset.key;
            const timeoutKey = `open-${key}`;

            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
                actions.onUpdateOpen(questionIndex, key, target.value);
                delete optionUpdateTimeouts[timeoutKey];
            }
        } else if (action === 'update-numeric-range') {
            const rangeIndex = parseInt(target.dataset.rangeIndex);
            const key = target.dataset.key;
            const timeoutKey = `numeric-range-${rangeIndex}-${key}`;

            if (optionUpdateTimeouts[timeoutKey]) {
                clearTimeout(optionUpdateTimeouts[timeoutKey]);
                actions.onUpdateNumericRange(questionIndex, rangeIndex, key, target.value);
                delete optionUpdateTimeouts[timeoutKey];
            }
        } else if (action === 'update-numeric' && (target.type === 'text' || target.type === 'number')) {
            // Handle blur events for numeric text/number inputs
            const key = target.dataset.key;
            const value = target.value;

            console.log('Saving numeric field on blur:', key, '=', value);

            // ✅ CORRECT - Only save to backend, don't trigger re-render
            setTimeout(() => {
                window.saveQuestionToBackend?.(question, questionIndex);
            }, 100);
        }
    }, true); // Use capture phase to ensure we catch blur events

    hostEl.addEventListener('change', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (action === 'update-option-extra') {
             const value = target.type === 'checkbox' ? target.checked : target.value;
             actions.onUpdateOption(questionIndex, parseInt(target.dataset.optIndex), target.dataset.key, value);
        } else if (action === 'update-numeric-type') {
             // This is now handled in the main switch statement above
        } else if (action === 'update-numeric-range-extra') {
             const value = target.type === 'checkbox' ? target.checked : target.value;
             actions.onUpdateNumericRangeExtra(questionIndex, parseInt(target.dataset.rangeIndex), target.dataset.key, value);
        } else if (action === 'update-table-type') {
             actions.onUpdateTableType(questionIndex, target.value);
        } else if (action === 'update-table-validation') {
             const value = target.type === 'checkbox' ? target.checked : target.value;
             actions.onUpdateTableValidation(questionIndex, target.dataset.key, value);
        } else if (action === 'update-terminate-condition') {
            // Handle terminate condition dropdown changes with direct DOM manipulation
            console.log('Terminate condition changed via change event to:', target.value);

            // Update the numeric data immediately (no re-render)
            const currentQuestion = window.state.questions[questionIndex];
            if (!currentQuestion.numeric) currentQuestion.numeric = {};
            currentQuestion.numeric.terminateCondition = target.value;

            // Find the terminate inputs container (both old and new styles)
            const terminateInputArea = target.parentElement.querySelector('.terminate-input-area, .terminate-inline-inputs');

            if (terminateInputArea) {
                const operator = target.value;

                if (operator && operator !== '') {
                    // Show container
                    terminateInputArea.style.display = 'flex';

                    // Generate the correct HTML based on operator
                    let inputsHTML = '';
                    const N = currentQuestion.numeric || {};

                    if (operator === 'between') {
                        inputsHTML = `
                            <input class="form-control" type="number" placeholder="Min" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                   value="${N.terminateValue1 || ''}"
                                   data-action="update-numeric" data-key="terminateValue1"/>
                            <span style="font-weight: 600; color: var(--text-secondary);">–</span>
                            <input class="form-control" type="number" placeholder="Max" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                   value="${N.terminateValue2 || ''}"
                                   data-action="update-numeric" data-key="terminateValue2"/>
                        `;
                    } else if (operator === 'gt') {
                        inputsHTML = `
                            <span style="font-size: 14px; font-weight: 700; color: var(--cue-primary);">&gt;</span>
                            <input class="form-control" type="number" placeholder="Value" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                   value="${N.terminateValue || ''}"
                                   data-action="update-numeric" data-key="terminateValue"/>
                        `;
                    } else if (operator === 'lt') {
                        inputsHTML = `
                            <span style="font-size: 14px; font-weight: 700; color: var(--cue-primary);">&lt;</span>
                            <input class="form-control" type="number" placeholder="Value" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                   value="${N.terminateValue || ''}"
                                   data-action="update-numeric" data-key="terminateValue"/>
                        `;
                    } else if (operator === 'gte') {
                        inputsHTML = `
                            <span style="font-size: 14px; font-weight: 700; color: var(--cue-primary);">&gt;=</span>
                            <input class="form-control" type="number" placeholder="Value" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                   value="${N.terminateValue || ''}"
                                   data-action="update-numeric" data-key="terminateValue"/>
                        `;
                    } else if (operator === 'lte') {
                        inputsHTML = `
                            <span style="font-size: 14px; font-weight: 700; color: var(--cue-primary);">&lt;=</span>
                            <input class="form-control" type="number" placeholder="Value" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                   value="${N.terminateValue || ''}"
                                   data-action="update-numeric" data-key="terminateValue"/>
                        `;
                    } else if (operator === 'equals') {
                        inputsHTML = `
                            <span style="font-size: 14px; font-weight: 700; color: var(--cue-primary);">=</span>
                            <input class="form-control" type="number" placeholder="Value" style="width: 70px; padding: 4px 8px; font-size: 12px;"
                                   value="${N.terminateValue || ''}"
                                   data-action="update-numeric" data-key="terminateValue"/>
                        `;
                    }

                    // Update the container's HTML
                    terminateInputArea.innerHTML = inputsHTML;
                } else {
                    // Hide container
                    terminateInputArea.style.display = 'none';
                    terminateInputArea.innerHTML = '';
                }
            }

            // Debounce save operation (no re-render) - use unique timeout key
            const terminateChangeTimeoutKey = `terminate-condition-change-${questionIndex}`;
            if (optionUpdateTimeouts[terminateChangeTimeoutKey]) {
                clearTimeout(optionUpdateTimeouts[terminateChangeTimeoutKey]);
            }
            optionUpdateTimeouts[terminateChangeTimeoutKey] = setTimeout(() => {
                // ✅ CORRECT - Only save to backend, don't trigger re-render
                window.saveQuestionToBackend?.(currentQuestion, questionIndex);
                delete optionUpdateTimeouts[terminateChangeTimeoutKey];
            }, 1000); // 1 second delay for dropdown changes
        }

        // Numeric type UI updates are now handled in the main switch statement above

        // Numeric unit handling now consolidated in main update-numeric handler above

        // Handle table validation type changes to show/hide validation panels
        if (action === 'update-table-validation' && target.dataset.key === 'type') {
            const sumValidationPanel = hostEl.querySelector('.sum-validation-panel');
            if (sumValidationPanel) {
                sumValidationPanel.style.display = target.value === 'sum_equals_qid' ? 'block' : 'none';
            }
        }
    });

    // Prevent focus loss from all interactive elements except text inputs
    hostEl.addEventListener('mousedown', (e) => {
        const target = e.target.closest('[data-action]');
        const button = e.target.closest('.btn');
        const select = e.target.closest('select');
        const checkbox = e.target.closest('input[type="checkbox"]');
        const radio = e.target.closest('input[type="radio"]');

        // Don't prevent focus loss from any input elements, textareas, or contenteditable elements
        const isInput = e.target.matches('input, textarea, [contenteditable="true"]') ||
                       e.target.closest('input, textarea, [contenteditable="true"]');

        // Only prevent focus loss for formatting toolbar buttons specifically
        const isFormattingButton = e.target.closest('#qtext-toolbar .btn, #qtext-toolbar select, #qtext-toolbar input[type="color"]');

        // For action buttons, prevent the event from interfering with the main click handler
        if (target && target.dataset.action) {
            e.stopPropagation(); // Prevent this mousedown from interfering with click events
            return;
        }

        if (isFormattingButton && !isInput) {
            e.preventDefault(); // Prevent focus loss from text inputs
        }
    });

    // Add global handler for modal buttons to prevent focus loss
    document.addEventListener('mousedown', (e) => {
        const modalButton = e.target.closest('.modal .btn, .icon-btn');
        const isInput = e.target.matches('input, textarea, [contenteditable="true"]') ||
                       e.target.closest('input, textarea, [contenteditable="true"]');

        if (modalButton && !isInput) {
            e.preventDefault(); // Prevent focus loss from text inputs when clicking modal buttons
        }
    });

    // Real-time validation for input fields
    hostEl.addEventListener('input', (e) => {
        const target = e.target;
        const validationField = target.dataset.validationField;

        if (validationField) {
            const value = target.value;
            let validationResult = null;

            // Get additional context for validation
            const context = {};
            if (validationField === 'numericRange') {
                const minInput = hostEl.querySelector('[data-key="min"]');
                const maxInput = hostEl.querySelector('[data-key="max"]');
                if (minInput) context.min = minInput.value;
                if (maxInput) context.max = maxInput.value;
            }

            // Run field validation
            validationResult = validateField(validationField, value, context);

            // Update validation display
            const validationContainer = hostEl.querySelector(`#${target.id || target.dataset.fieldId}-validation`);
            if (validationContainer) {
                renderFieldValidation({ hostEl: validationContainer, validationResult });
            }
        }
    });


    // Action handling function to avoid duplication
    const handleAction = (e, target, questionIndex, actions) => {
        const action = target.dataset.action;
        const dataset = target.dataset;

        // Handle add-option specifically
        if (action === 'add-option') {
            console.log('Add option clicked, actions.onAddOption:', actions.onAddOption);
            if (actions.onAddOption) {
                actions.onAddOption(questionIndex);
            } else {
                console.error('onAddOption action is not defined');
            }
            return;
        }


        // Handle preset dropdown toggle
        if (action === 'toggle-preset-menu') {
            console.log('🎯 Preset dropdown toggle clicked!');
            e.preventDefault();
            e.stopPropagation();

            // Close any existing preset menus
            document.querySelectorAll('[data-preset-menu]').forEach(existingMenu => {
                existingMenu.remove();
            });

            // Create and show new menu
            const menuHtml = renderPresetMenu();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = menuHtml;
            const menu = tempDiv.firstElementChild;

            // Position the menu using fixed positioning
            const buttonRect = target.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Calculate available space
            const spaceBelow = viewportHeight - buttonRect.bottom - 20;
            const spaceAbove = buttonRect.top - 20;
            const maxMenuHeight = Math.min(500, Math.max(spaceBelow, spaceAbove));

            // Set the max height dynamically
            menu.style.maxHeight = maxMenuHeight + 'px';

            // Smart vertical positioning
            if (spaceBelow >= 300 || spaceBelow > spaceAbove) {
                // Position below
                menu.style.top = (buttonRect.bottom + 4) + 'px';
            } else {
                // Position above
                menu.style.bottom = (viewportHeight - buttonRect.top + 4) + 'px';
            }

            // Smart horizontal positioning
            const menuWidth = 350;
            let leftPosition = buttonRect.right - menuWidth;

            // Ensure menu doesn't go off-screen
            if (leftPosition < 10) {
                leftPosition = 10;
            } else if (leftPosition + menuWidth > viewportWidth - 10) {
                leftPosition = viewportWidth - menuWidth - 10;
            }

            menu.style.left = leftPosition + 'px';

            // Remove is-hidden class and add to document
            menu.classList.remove('is-hidden');
            document.body.appendChild(menu);

            console.log('📍 Menu created and positioned:', menu);

            // Add event listeners to the new menu
            menu.addEventListener('click', (menuEvent) => {
                console.log('📍 Menu clicked:', menuEvent.target);
                const menuTarget = menuEvent.target.closest('[data-action]');
                if (menuTarget) {
                    console.log('📍 Menu action:', menuTarget.dataset.action);
                    handleAction(menuEvent, menuTarget, questionIndex, actions);
                }
            });

            // Add change event listener for select elements
            menu.addEventListener('change', (menuEvent) => {
                console.log('📍 Menu changed:', menuEvent.target);
                const menuTarget = menuEvent.target.closest('[data-action]');
                if (menuTarget) {
                    console.log('📍 Menu change action:', menuTarget.dataset.action);
                    handleAction(menuEvent, menuTarget, questionIndex, actions);
                }
            });

            // Add outside click listener
            setTimeout(() => {
                const closeHandler = (closeEvent) => {
                    if (!menu.contains(closeEvent.target) && !target.contains(closeEvent.target)) {
                        console.log('📍 Closing menu via outside click');
                        menu.remove();
                        document.removeEventListener('click', closeHandler);
                    }
                };
                document.addEventListener('click', closeHandler);
            }, 0);

            return;
        }

        // Handle simple preset toggle
        if (action === 'toggle-simple-preset') {
            const item = target.closest('.preset-quick-item');
            if (item) {
                item.classList.toggle('selected');
                const checkbox = item.querySelector('.checkbox');
                if (item.classList.contains('selected')) {
                    checkbox.textContent = '✓';
                } else {
                    checkbox.textContent = '';
                }
                updateSelectedCount();
            }
            return;
        }

        // Handle scale preset selection
        if (action === 'select-scale-preset') {
            // Clear other selections
            const menu = target.closest('[data-preset-menu]');
            menu.querySelectorAll('.preset-scale-item').forEach(item => {
                item.classList.remove('selected');
            });

            // Select this one
            const item = target.closest('.preset-scale-item');
            item.classList.add('selected');

            // Enable the replace button
            const replaceBtn = menu.querySelector('[data-action="apply-selected-scale"]');
            replaceBtn.disabled = false;
            replaceBtn.style.opacity = '1';
            return;
        }

        // Handle adding selected simple presets
        if (action === 'add-selected-presets') {
            const menu = target.closest('[data-preset-menu]');
            const selectedItems = menu.querySelectorAll('.preset-quick-item.selected');

            if (selectedItems.length > 0 && actions.onUpdateQuestion) {
                const question = window.state.questions[questionIndex];
                if (!question.options) question.options = [];

                selectedItems.forEach(item => {
                    const presetKey = item.dataset.presetKey;
                    const preset = presetData.simple[presetKey];

                    if (preset) {
                        // Calculate next code
                        const nextCode = question.options.length ?
                            Math.max(...question.options.map(o => parseInt(o.code, 10) || 0)) + 1 : 1;

                        // Add the preset option
                        const newOption = {
                            code: preset.code || nextCode.toString(),
                            label: preset.label,
                            ...(preset.anchor && { anchor: preset.anchor }),
                            ...(preset.exclusive && { exclusive: preset.exclusive })
                        };

                        question.options.push(newOption);
                    }
                });

                // MAP TO YOUR 3-COLUMN SYSTEM FOR SIMPLE TABLES
                if (question.mode === 'advanced_table') {
                    question.question_type = 'table';  // Always table
                    question.question_mode = 'simple_table';  // Simple tables
                    question.table_type = null;  // No complex hybrid for simple tables
                    question.table_metadata = {
                        base_type: 'simple',
                        spss_variable_type: 'nominal',
                        source_config: {
                            rows: { mode: 'manual' },
                            columns: { mode: 'manual' }
                        }
                    };

                    // Save to your 3-column system
                    actions.onUpdateQuestion(questionIndex, 'question_type', question.question_type);
                    actions.onUpdateQuestion(questionIndex, 'question_mode', question.question_mode);
                    actions.onUpdateQuestion(questionIndex, 'table_type', question.table_type);
                    actions.onUpdateQuestion(questionIndex, 'table_metadata', question.table_metadata);
                }

                // NEW: Check for hybrid table combinations after applying simple presets
                const isHybrid = detectAndUpdateHybridTable(question, questionIndex, actions);
                if (isHybrid) {
                    console.log('🔗 Simple preset created hybrid table classification');
                }

                // Update the question
                actions.onUpdateQuestion(questionIndex, 'options', question.options);

                // Close menu and reset selections
                menu.remove();
                console.log('📍 Menu closed after adding presets');
            }
            return;
        }

        // Handle scale points dropdown change
        if (action === 'change-scale-points') {
            const selectedPoints = target.value;
            const menu = target.closest('[data-preset-menu]');

            if (menu) {
                // Update all scale items to show the selected points
                const scaleItems = menu.querySelectorAll('.preset-scale-item');
                scaleItems.forEach(item => {
                    const scaleType = item.dataset.scaleType;
                    const scaleTypeData = presetData.scaleTypes[scaleType];

                    if (scaleTypeData && scaleTypeData.points[selectedPoints]) {
                        const preview = item.querySelector('.preset-scale-preview');
                        const labels = scaleTypeData.points[selectedPoints].map(option => option.label);
                        preview.textContent = labels.join(' • ');
                        item.dataset.points = selectedPoints;
                    } else {
                        const preview = item.querySelector('.preset-scale-preview');
                        preview.textContent = `No ${selectedPoints}pt scale available`;
                        item.dataset.points = selectedPoints;
                    }
                });
            }
            return;
        }

        // Handle scale preset selection
        if (action === 'select-scale-preset') {
            const item = target.closest('.preset-scale-item');
            if (item) {
                // Clear other scale selections
                const menu = target.closest('[data-preset-menu]');
                if (menu) {
                    menu.querySelectorAll('.preset-scale-item').forEach(otherItem => {
                        otherItem.classList.remove('selected');
                        const radio = otherItem.querySelector('.preset-scale-radio');
                        radio.innerHTML = '';
                    });
                }

                // Select this item
                item.classList.add('selected');
                const radio = item.querySelector('.preset-scale-radio');
                radio.innerHTML = '●';

                // Enable the apply button
                const applyBtn = menu.querySelector('[data-action="apply-selected-scale"]');
                if (applyBtn) {
                    applyBtn.disabled = false;
                    applyBtn.style.opacity = '1';
                }
            }
            return;
        }

        // Handle applying selected scale
        if (action === 'apply-selected-scale') {
            const menu = target.closest('[data-preset-menu]');
            const selectedScale = menu.querySelector('.preset-scale-item.selected');

            if (selectedScale && actions.onUpdateQuestion) {
                const scaleType = selectedScale.dataset.scaleType;
                const points = parseInt(selectedScale.dataset.points);
                const scaleTypeData = presetData.scaleTypes[scaleType];

                if (scaleTypeData && scaleTypeData.points[points]) {
                    // Get the scale options for the selected points
                    const scaleOptions = scaleTypeData.points[points];

                    const question = window.state.questions[questionIndex];

                    if (question.mode === 'advanced_table') {
                        // For advanced tables: replace COLUMNS only, preserve rows
                        if (!question.advancedTable) question.advancedTable = { rows: [], cols: [] };
                        question.advancedTable.cols = scaleOptions.map(option => option.label);
                        console.log('📊 Applied Likert scale to advanced table columns, preserved rows');
                    } else {
                        // For list/items: replace options as before
                        question.options = scaleOptions.map(option => ({
                            code: option.code,
                            label: option.label
                        }));
                        console.log('📊 Applied Likert scale to question options');
                    }

                    // MAP TO YOUR 3-COLUMN SYSTEM FOR LIKERT SCALES
                    if (question.mode === 'advanced_table') {
                        question.question_type = 'table';  // Always table
                        question.question_mode = 'likert';  // Likert mode for any Likert scale
                        question.table_type = `likert_${scaleType}_${points}`;  // Complex hybrid code

                        // Update taxonomy in database
                        actions.onUpdateQuestion(questionIndex, 'question_type', question.question_type);
                        actions.onUpdateQuestion(questionIndex, 'question_mode', question.question_mode);
                        actions.onUpdateQuestion(questionIndex, 'table_type', question.table_type);
                    } else if (question.mode === 'list') {
                        // For list questions with Likert presets
                        question.question_type = 'list';  // Always list for list questions
                        const selectionType = question.type === 'multi' ? 'multi' : 'single';
                        question.question_mode = `${selectionType}_likert`;  // single_likert or multi_likert
                        question.table_type = null;  // No table_type for list questions

                        // Update taxonomy in database
                        actions.onUpdateQuestion(questionIndex, 'question_type', question.question_type);
                        actions.onUpdateQuestion(questionIndex, 'question_mode', question.question_mode);
                        actions.onUpdateQuestion(questionIndex, 'table_type', question.table_type);

                        console.log(`🎯 Applied list Likert taxonomy: question_type=${question.question_type}, question_mode=${question.question_mode}, table_type=${question.table_type}`);
                    }

                    // Check for hybrid combinations after applying scale preset (only for advanced tables)
                    if (question.mode === 'advanced_table') {
                        const isHybrid = detectAndUpdateHybridTable(question, questionIndex, actions);
                        if (isHybrid) {
                            console.log('🔗 Scale preset created hybrid table classification');
                        } else {
                            // If not hybrid, ensure scale points in metadata match actual columns
                            if (question.table_metadata && question.advancedTable?.cols) {
                                const actualPoints = question.advancedTable.cols.length;
                                if (question.table_metadata.scale_points !== actualPoints) {
                                    question.table_metadata.scale_points = actualPoints;
                                    question.table_metadata.auto_nets = actualPoints === 3 ? [] :
                                                                       actualPoints === 5 ? ['T2B', 'B2B'] : ['T3B', 'B3B'];

                                    // Update table_type to reflect actual scale points
                                    const baseType = question.table_type.replace(/_\d+$/, '');
                                    question.table_type = `${baseType}_${actualPoints}`;

                                    actions.onUpdateQuestion(questionIndex, 'table_type', question.table_type);
                                    actions.onUpdateQuestion(questionIndex, 'table_metadata', question.table_metadata);

                                    console.log(`🎯 Updated scale points to match actual columns: ${actualPoints}`);
                                }
                            }
                        }
                    }

                    // Auto-configure nets based on scale points
                    // Use dynamic import with promise-based approach since this isn't an async function
                    import('/src/lib/tabPlanNets.js')
                        .then(({ autoConfigureNetsForScale }) => {
                            try {
                                // Auto-configure nets for this scale
                                const configuredNets = autoConfigureNetsForScale(question, points);
                                console.log('🎯 Auto-configured nets:', configuredNets);

                                // Update tab data if nets were configured
                                if (question.tab && configuredNets.length > 0) {
                                    actions.onUpdateQuestion(questionIndex, 'tab', question.tab);
                                    console.log('📍 Updated question with auto-configured nets');
                                }
                            } catch (error) {
                                console.warn('Error during nets auto-configuration:', error);
                            }
                        })
                        .catch(error => {
                            console.warn('Could not load nets library:', error);
                        });

                    // Update the appropriate field based on question mode
                    console.log('🔧 PRESET SAVE DEBUG:', {
                        questionId: question.id,
                        questionMode: question.mode,
                        isAdvancedTable: question.mode === 'advanced_table',
                        hasOptions: !!question.options,
                        optionsCount: question.options?.length || 0,
                        hasAdvancedTable: !!question.advancedTable
                    });

                    if (question.mode === 'advanced_table') {
                        console.log('💾 Saving advancedTable for advanced table question');
                        actions.onUpdateQuestion(questionIndex, 'advancedTable', question.advancedTable);
                    } else {
                        console.log('💾 Saving options for list/regular question');
                        actions.onUpdateQuestion(questionIndex, 'options', question.options);
                    }

                    // Close menu and reset
                    menu.remove();
                    console.log('📍 Menu closed after applying scale with auto-configured nets');
                }
            }
            return;
        }

        // Helper function to update selected count
        function updateSelectedCount() {
            const menu = target.closest('[data-preset-menu]') || document.querySelector('[data-preset-menu]');
            if (menu) {
                const selectedCount = menu.querySelectorAll('.preset-quick-item.selected').length;
                const countBadge = menu.querySelector('.preset-count');
                const addBtn = menu.querySelector('[data-action="add-selected-presets"]');

                if (selectedCount > 0) {
                    countBadge.textContent = selectedCount;
                    countBadge.classList.remove('is-hidden');
                    addBtn.disabled = false;
                    addBtn.style.opacity = '1';
                } else {
                    countBadge.classList.add('is-hidden');
                    addBtn.disabled = true;
                    addBtn.style.opacity = '0.6';
                }
            }
        }

        // Handle other actions here if needed
        console.log('Action clicked:', action);
    };

    // Header action buttons are handled by the main click handler below
    // Also add event delegation to header actions that have stopPropagation
    const headerActions = hostEl.querySelector('.collapsible-header-actions');
    if (headerActions) {
        console.log('📍 Header actions found:', headerActions);
        headerActions.addEventListener('click', (e) => {
            console.log('📍 Header actions clicked:', e.target);
            const target = e.target.closest('[data-action]');
            console.log('📍 Found action target:', target, target?.dataset?.action);
            if (target) {
                // Handle the action directly since stopPropagation blocks bubbling
                handleAction(e, target, questionIndex, actions);
            }
        });
    } else {
        console.log('❌ No header actions found');
    }

    hostEl.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) {
            return;
        }

        const action = target.dataset.action;
        const dataset = target.dataset;

        // Debug logging for numeric type clicks
        if (action === 'update-numeric-type') {
            console.log('Numeric type clicked:', target.dataset.type, target);
        }

        switch(action) {
            case 'toggle-section': {
                e.preventDefault();
                e.stopPropagation();

                // Prevent duplicate processing by checking if already processed
                if (e._toggleProcessed) {
                    console.log('Toggle already processed, skipping');
                    return false;
                }
                e._toggleProcessed = true;

                // FANCY EXPANDABLE BEHAVIOR
                const sectionId = target.closest('[data-section-id]')?.dataset.sectionId;
                const fancyContainer = hostEl.querySelector('.fancy-expandable-container');
                const logicSection = hostEl.querySelector('[data-section-id="logic-flow"]');
                const settingsSection = hostEl.querySelector('[data-section-id="question-settings"]');

                if (fancyContainer && (sectionId === 'logic-flow' || sectionId === 'question-settings')) {
                    const section = target.closest('.collapsible-section');
                    const isExpanded = section.classList.contains('expanded');

                    if (!isExpanded) {
                        // EXPANDING: Apply fancy behavior
                        if (sectionId === 'logic-flow') {
                            // Logic expanding: push settings to right side panel
                            fancyContainer.classList.remove('settings-expanded');
                            fancyContainer.classList.add('logic-expanded');
                            logicSection.classList.add('main-expanded');
                            settingsSection.classList.add('side-panel', 'right');
                            settingsSection.classList.remove('expanded', 'main-expanded');
                        } else if (sectionId === 'question-settings') {
                            // Settings expanding: push logic to left side panel
                            fancyContainer.classList.remove('logic-expanded');
                            fancyContainer.classList.add('settings-expanded');
                            settingsSection.classList.add('main-expanded');
                            logicSection.classList.add('side-panel', 'left');
                            logicSection.classList.remove('expanded', 'main-expanded');
                        }
                    } else {
                        // COLLAPSING: Return to normal layout
                        fancyContainer.classList.remove('logic-expanded', 'settings-expanded');
                        logicSection.classList.remove('side-panel', 'left', 'right', 'main-expanded');
                        settingsSection.classList.remove('side-panel', 'left', 'right', 'main-expanded');
                    }
                }

                // SIDE PANEL CLICK HANDLING
                if (target.closest('.side-panel')) {
                    const sidePanelSection = target.closest('.side-panel');
                    const sidePanelId = sidePanelSection.dataset.sectionId;

                    if (sidePanelId === 'logic-flow') {
                        // Clicked on logic side panel: switch to logic expanded
                        fancyContainer.classList.remove('settings-expanded');
                        fancyContainer.classList.add('logic-expanded');
                        logicSection.classList.remove('side-panel', 'left', 'right');
                        logicSection.classList.add('main-expanded', 'expanded');
                        settingsSection.classList.remove('expanded', 'main-expanded');
                        settingsSection.classList.add('side-panel', 'right');
                    } else if (sidePanelId === 'question-settings') {
                        // Clicked on settings side panel: switch to settings expanded
                        fancyContainer.classList.remove('logic-expanded');
                        fancyContainer.classList.add('settings-expanded');
                        settingsSection.classList.remove('side-panel', 'left', 'right');
                        settingsSection.classList.add('main-expanded', 'expanded');
                        logicSection.classList.remove('expanded', 'main-expanded');
                        logicSection.classList.add('side-panel', 'left');
                    }
                    return false; // Don't continue with normal toggle logic
                }

                console.log('Toggle section - target:', target);
                console.log('Toggle section - closest header:', target.closest('.collapsible-header'));

                // Only toggle if we clicked the actual header, not content inside the section
                if (target.closest('.collapsible-header')) {
                    const section = target.closest('.collapsible-section');
                    console.log('Toggle section - section found:', section);

                    if (section) {
                        const wasExpanded = section.classList.contains('expanded');
                        console.log('Toggle section - was expanded:', wasExpanded);

                        section.classList.toggle('expanded');

                        const isNowExpanded = section.classList.contains('expanded');
                        console.log('Toggle section - now expanded:', isNowExpanded);

                        // Prevent any further event processing
                        return false;
                    }
                }
                break;
            }
            case 'toggle-compact-card': {
                e.preventDefault();
                const cardId = dataset.target;
                const card = hostEl.querySelector(`#${cardId}`);
                if (card) {
                    card.classList.toggle('expanded');
                }
                break;
            }
            case 'switch-bottom-tab': {
                e.preventDefault();
                e.stopPropagation(); // Prevent event from bubbling up
                const tabName = dataset.tab;
                console.log('🔄 Switching to bottom tab:', tabName);

                // Save tab state globally (persists across re-renders)
                window._bottomTabState = tabName;
                console.log('💾 Saved tab state:', window._bottomTabState);

                // Remove active class from all tabs and contents
                const allTabs = hostEl.querySelectorAll('.bottom-tab');
                const allContents = hostEl.querySelectorAll('.bottom-tab-content');
                console.log('📋 Found tabs:', allTabs.length, 'contents:', allContents.length);

                allTabs.forEach(tab => {
                    tab.classList.remove('active');
                    console.log('Removed active from tab:', tab.dataset.tab);
                });
                allContents.forEach(content => {
                    content.classList.remove('active');
                    console.log('Removed active from content:', content.id);
                });

                // Add active class to clicked tab and corresponding content
                target.classList.add('active');
                console.log('Added active to tab button:', tabName);

                const tabContent = hostEl.querySelector(`#bottom-tab-${tabName}`);
                console.log('🎯 Looking for tab content with ID:', `bottom-tab-${tabName}`);
                console.log('🎯 Found tab content element:', tabContent);
                console.log('🎯 Tab content classes before:', tabContent?.className);

                if (tabContent) {
                    tabContent.classList.add('active');
                    console.log('🎯 Tab content classes after:', tabContent.className);
                    console.log('✅ Tab switched successfully to:', tabName);

                    // Force a reflow to ensure CSS is applied
                    void tabContent.offsetHeight;
                    console.log('📏 Content height:', tabContent.offsetHeight);
                    console.log('📏 Content display:', getComputedStyle(tabContent).display);
                } else {
                    console.error('❌ Could not find tab content for:', tabName);
                }
                break;
            }
            case 'delete-option': actions.onDeleteOption(questionIndex, parseInt(dataset.optIndex)); break;
            case 'add-option':
                console.log('Add option clicked, actions.onAddOption:', actions.onAddOption);
                if (actions.onAddOption) {
                    actions.onAddOption(questionIndex);
                } else {
                    console.error('onAddOption action is not defined');
                }
                break;
            case 'bulk-add-options': {
                showBulkAddModal(questionIndex, actions);
                break;
            }
            case 'toggle-alphabetize': {
                const question = window.state.questions[questionIndex];
                // Update data immediately (no re-render)
                question.alphabetize = !question.alphabetize;

                // Update button visual state immediately
                e.target.classList.toggle('active', question.alphabetize);

                // Debounce save operation (2 second delay)
                const timeoutKey = `alphabetize-${questionIndex}`;
                if (optionUpdateTimeouts[timeoutKey]) {
                    clearTimeout(optionUpdateTimeouts[timeoutKey]);
                }
                optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                    actions.onUpdateQuestion(questionIndex, 'alphabetize', question.alphabetize);
                    delete optionUpdateTimeouts[timeoutKey];
                }, 2000);
                break;
            }
            case 'setup-medication-groups': {
                e.preventDefault();
                e.stopPropagation();

                // Prevent duplicate processing by checking if already processed
                if (e._setupGroupsProcessed) {
                    console.log('Setup groups already processed, skipping');
                    return false;
                }
                e._setupGroupsProcessed = true;

                showMedicationGroupSetup(questionIndex, actions);
                break;
            }
            case 'delete-table-row': actions.onDeleteTableRow(questionIndex, parseInt(dataset.rowIndex)); break;
            case 'add-table-row':
                e.stopPropagation();
                // Direct DOM manipulation instead of full re-render
                const question = window.state.questions[questionIndex];
                if (!question.grid) question.grid = { rows: [], cols: [] };
                if (!Array.isArray(question.grid.rows)) question.grid.rows = [];

                // Add new row to data
                const newRowIndex = question.grid.rows.length;
                question.grid.rows.push('');

                // Add row to DOM directly with smooth animation
                const tableBody = target.closest('table').querySelector('tbody');
                const lastRow = tableBody.querySelector('tr:last-child'); // The "+" button row
                const cols = question.grid.cols || [];

                const newRowHTML = `
                    <tr style="background: ${newRowIndex % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)'}; opacity: 0; transform: translateY(-10px); transition: all 0.3s ease-in-out;">
                        <td style="padding: 8px; border: 1px solid var(--line); font-weight: 500; position: relative;">
                            <input value=""
                                   placeholder="Row ${newRowIndex + 1}"
                                   data-action="update-table-row"
                                   data-row-index="${newRowIndex}"
                                   style="width: 100%; border: none; background: transparent; padding: 4px 8px; font-size: 13px;">
                            <button class="icon-btn danger delete-row-btn"
                                    data-action="delete-table-row"
                                    data-row-index="${newRowIndex}"
                                    style="position: absolute; top: 2px; right: 2px; padding: 2px 4px; font-size: 10px; opacity: 0.3; transition: opacity 0.2s;"
                                    title="Delete row">✕</button>
                        </td>
                        ${cols.map((col, colIndex) => `
                            <td style="padding: 8px; border: 1px solid var(--line); text-align: center;">
                                <span style="color: var(--muted); font-size: 11px;">—</span>
                            </td>
                        `).join('')}
                        <td style="padding: 8px; border: 1px solid var(--line); text-align: center; width: 60px;">
                            <span style="color: var(--muted); font-size: 11px;">—</span>
                        </td>
                    </tr>
                `;

                // Insert before the last row (the + button row)
                lastRow.insertAdjacentHTML('beforebegin', newRowHTML);
                const newRowElement = lastRow.previousElementSibling;

                // Smooth animation
                setTimeout(() => {
                    newRowElement.style.opacity = '1';
                    newRowElement.style.transform = 'translateY(0)';
                }, 50);

                // Focus the new input
                setTimeout(() => {
                    const newInput = newRowElement.querySelector('input');
                    if (newInput) newInput.focus();
                }, 350);

                // Debounced save
                const saveTimeoutKey = `add-table-row-${questionIndex}`;
                if (optionUpdateTimeouts[saveTimeoutKey]) {
                    clearTimeout(optionUpdateTimeouts[saveTimeoutKey]);
                }
                optionUpdateTimeouts[saveTimeoutKey] = setTimeout(() => {
                    actions.onAddTableRow(questionIndex);
                    delete optionUpdateTimeouts[saveTimeoutKey];
                }, 1000);
                break;
            case 'insert-table-row': actions.onInsertTableRow(questionIndex, parseInt(dataset.rowIndex)); break;
            case 'bulk-add-rows': actions.onBulkAddRows(questionIndex); break;
            case 'clear-all-rows': actions.onClearAllRows(questionIndex); break;
            case 'delete-table-col': actions.onDeleteTableCol(questionIndex, parseInt(dataset.colIndex)); break;
            case 'add-table-col':
                e.preventDefault();
                e.stopPropagation();
                actions.onAddTableCol(questionIndex);
                break;
            case 'insert-table-col': actions.onInsertTableCol(questionIndex, parseInt(dataset.colIndex)); break;
            case 'bulk-add-cols': actions.onBulkAddCols(questionIndex); break;
            case 'clear-all-cols': actions.onClearAllCols(questionIndex); break;
            case 'add-repeated-col':
                const repeatedQuestion = window.state.questions[questionIndex];
                if (!repeatedQuestion.repeated) repeatedQuestion.repeated = {};
                if (!repeatedQuestion.repeated.columns) repeatedQuestion.repeated.columns = [];
                repeatedQuestion.repeated.columns.push('');
                actions.onUpdateQuestion(questionIndex, 'repeated', repeatedQuestion.repeated);
                break;
            case 'delete-repeated-col':
                const deleteRepeatedQuestion = window.state.questions[questionIndex];
                if (!deleteRepeatedQuestion.repeated) deleteRepeatedQuestion.repeated = {};
                if (!deleteRepeatedQuestion.repeated.columns) deleteRepeatedQuestion.repeated.columns = [];
                const delColIndex = parseInt(dataset.colIndex);
                deleteRepeatedQuestion.repeated.columns.splice(delColIndex, 1);
                actions.onUpdateQuestion(questionIndex, 'repeated', deleteRepeatedQuestion.repeated);
                break;
            case 'save-to-library':
                const libraryQuestion = window.state.questions[questionIndex];
                showSaveQuestionModal(libraryQuestion, (libraryQuestionId, metadata) => {
                    // Show success feedback
                    console.log('Question saved to library:', libraryQuestionId, metadata);
                });
                break;
            case 'add-conditional-rule':
                const conditionalQuestion = window.state.questions[questionIndex];
                if (!conditionalQuestion.conditions) conditionalQuestion.conditions = createDefaultConditions();
                if (!conditionalQuestion.conditions.rules) conditionalQuestion.conditions.rules = [];
                conditionalQuestion.conditions.rules.push(createEmptyConditionRule());
                actions.onUpdateQuestion(questionIndex, 'conditions', conditionalQuestion.conditions);
                break;
            case 'remove-conditional-rule':
                const ruleIndex = parseInt(dataset.ruleIndex);
                if (question.conditions && question.conditions.rules) {
                    question.conditions.rules.splice(ruleIndex, 1);
                    if (question.conditions.rules.length === 0) {
                        question.conditions.mode = 'none';
                    }
                    actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                }
                break;
            case 'toggle-conditional-panel':
                const content = hostEl.querySelector('.conditional-content');
                const toggleBtn = hostEl.querySelector('#conditional-toggle-btn');
                const isHidden = content.style.display === 'none';

                content.style.display = isHidden ? 'block' : 'none';

                // Update button text
                if (toggleBtn) {
                    toggleBtn.textContent = isHidden ? 'Close' : (question.conditions?.mode === 'none' ? 'Add Conditions' : 'Configure');
                }

                // If opening panel and no conditions set, initialize with show_if mode
                if (isHidden && (!question.conditions || question.conditions.mode === 'none')) {
                    if (!question.conditions) question.conditions = createDefaultConditions();
                    question.conditions.mode = 'show_if';
                    if (!question.conditions.rules || question.conditions.rules.length === 0) {
                        question.conditions.rules = [createEmptyConditionRule()];
                    }
                    // Re-render panel content to show the new mode
                    setTimeout(() => {
                        actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                    }, 0);
                }
                break;
            case 'auto-configure-conditional':
                // SIMPLIFIED MAPPING - Auto-configure optimal conditional logic
                if (!question.conditions) question.conditions = createDefaultConditions();
                if (!question.conditions.rules) question.conditions.rules = [];

                // Find the most recent question to create a smart relationship
                const availableQuestions = window.state.questions.slice(0, questionIndex);
                if (availableQuestions.length > 0) {
                    const lastQuestion = availableQuestions[availableQuestions.length - 1];

                    // Import the mapper
                    import('../../../lib/conditionalMapper.js').then(({ autoConfigureConditional }) => {
                        const config = autoConfigureConditional(lastQuestion, question);

                        // Create an optimized rule
                        const newRule = {
                            source_qid: lastQuestion.id,
                            operator: config.recommendedOperator,
                            values: [''], // Will be configured by user
                            value2: ''
                        };

                        question.conditions.mode = 'show_if';
                        question.conditions.rules = [newRule];

                        actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                    });
                } else {
                    // No previous questions available
                    alert('No previous questions available for auto-configuration');
                }
                break;
            case 'optimize-conditional':
                // SIMPLIFIED OPTIMIZATION - Auto-optimize existing conditional logic
                if (question.conditions && question.conditions.rules) {
                    import('../../../lib/conditionalMapper.js').then(({ autoConfigureConditional }) => {
                        question.conditions.rules.forEach((rule, index) => {
                            const sourceQuestion = window.state.questions.find(q => q.id === rule.source_qid);
                            if (sourceQuestion) {
                                const config = autoConfigureConditional(sourceQuestion, question);
                                // Optimize operator if current one isn't ideal
                                if (!config.ui.showOperators.includes(rule.operator)) {
                                    rule.operator = config.recommendedOperator;
                                }
                            }
                        });
                        actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                    });
                }
                break;
            case 'switch-conditional-mode':
                // PROGRESSIVE DISCLOSURE - Switch between conditional UI modes
                const targetMode = dataset.target;
                window.conditionalUIMode = targetMode;

                // Only re-render the conditional panel section, not the entire editor
                const conditionalPanel = hostEl.querySelector('#conditional-logic-container');
                if (conditionalPanel) {
                    conditionalPanel.innerHTML = renderConditionalLogicPanel(question, questionIndex, (updatedQuestion) => {
                        // Update question with new conditions
                        Object.assign(question, updatedQuestion);
                        actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                    });
                }
                break;
            // Remove duplicate handlers - now handled in input event
            case 'apply-smart-setup':
                // SMART SETUP - Apply the current rule with smart operator selection
                if (question.conditions?.rules?.[0]) {
                    const rule = question.conditions.rules[0];

                    // Smart operator selection based on question type
                    const sourceQuestion = window.state.questions.find(q => q.id === rule.source_qid);
                    if (sourceQuestion) {
                        import('../../../lib/conditionalMapper.js').then(({ autoConfigureConditional }) => {
                            const config = autoConfigureConditional(sourceQuestion, question);
                            rule.operator = config.recommendedOperator;
                            question.conditions.mode = 'show_if';
                            actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                        });
                        return; // Exit early, will be handled by the promise
                    } else {
                        // Fallback to safe default
                        rule.operator = rule.values?.length > 1 ? 'in' : '==';
                    }

                    question.conditions.mode = 'show_if';
                }
                actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
                break;
            case 'duplicate-question': actions.onDuplicateQuestion(questionIndex); break;
            // case 'delete-question': actions.onDeleteQuestion(questionIndex); break; // REMOVED: Handled by header dropdown
            case 'toggle-advanced':
                e.preventDefault();
                e.stopPropagation();

                // Prevent duplicate processing
                if (e._advancedToggleProcessed) {
                    console.log('Advanced toggle already processed, skipping');
                    return false;
                }
                e._advancedToggleProcessed = true;

                toggleAdvancedPanel(dataset.target);
                break;
            case 'toggle-option-behavior':
                e.preventDefault();
                e.stopPropagation(); // Prevent any parent handlers from interfering
                const { optIndex, key, current } = dataset;
                const newValue = current === 'true' ? false : true;

                // Update data immediately (no re-render)
                const currentQuestion = window.state.questions[questionIndex];
                if (currentQuestion && currentQuestion.options && currentQuestion.options[parseInt(optIndex)]) {
                    const option = currentQuestion.options[parseInt(optIndex)];
                    option[key] = newValue;
                }

                // Update inline icon visual state immediately
                if (target.classList.contains('behavior-icon')) {
                    target.dataset.current = newValue.toString();
                    if (newValue) {
                        target.classList.add('active');
                    } else {
                        target.classList.remove('active');
                    }
                }

                // Also update the advanced panel toggle if it exists
                const advancedToggle = document.querySelector(
                    `.behavior-toggle[data-opt-index="${optIndex}"][data-key="${key}"]`
                );
                if (advancedToggle) {
                    advancedToggle.dataset.current = newValue.toString();
                    if (newValue) {
                        advancedToggle.classList.add('checked');
                    } else {
                        advancedToggle.classList.remove('checked');
                    }
                }

                // Debounced save to backend (NO re-render)
                if (!window._behaviorSaveTimeouts) window._behaviorSaveTimeouts = {};
                const behaviorTimeoutKey = `behavior-${questionIndex}-${optIndex}-${key}`;
                clearTimeout(window._behaviorSaveTimeouts[behaviorTimeoutKey]);
                window._behaviorSaveTimeouts[behaviorTimeoutKey] = setTimeout(() => {
                    window.saveQuestionToBackend?.(currentQuestion, questionIndex);
                    delete window._behaviorSaveTimeouts[behaviorTimeoutKey];
                }, 2000);
                break;
            case 'set-list-selection':
                e.stopPropagation();
                const selectionType = target.value === 'multi' ? 'multi' : 'single';

                // CRITICAL: Get index from data attribute, not closure variable
                const actualQuestionIndex = parseInt(target.dataset.questionIndex, 10);
                const questionId = target.dataset.questionId;

                // Verify we have valid data
                if (isNaN(actualQuestionIndex)) {
                    console.error('❌ Invalid question index from data attribute:', target.dataset.questionIndex);
                    break;
                }

                // CRITICAL: Get the SPECIFIC question to avoid shared references
                const targetQuestion = window.state.questions[actualQuestionIndex];

                if (!targetQuestion) {
                    console.error('❌ Question not found at index:', actualQuestionIndex);
                    break;
                }

                console.log(`🔄 Changing selection type for question ${targetQuestion.id} (index ${actualQuestionIndex}) to: ${selectionType}`);
                console.log(`   Expected ID: ${questionId}, Actual ID: ${targetQuestion.id}`);

                // Update data - use the specific question object
                targetQuestion.type = selectionType;
                targetQuestion.question_mode = selectionType;

                // Update in database
                actions.onUpdateQuestion(actualQuestionIndex, 'type', selectionType);
                actions.onUpdateQuestion(actualQuestionIndex, 'question_mode', selectionType);

                // Update UI directly - ONLY for this specific question's radio group
                const radioGroup = target.closest('.selection-controls');
                if (radioGroup) {
                    const allSelectionOptions = radioGroup.querySelectorAll('.selection-option');
                    allSelectionOptions.forEach(option => {
                        const input = option.querySelector('input[type="radio"]');
                        const isActive = input.value === target.value;

                        if (isActive) {
                            option.style.background = 'var(--cue-primary)';
                            option.style.color = 'white';
                            option.classList.add('active');
                        } else {
                            option.style.background = 'var(--surface-1)';
                            option.style.color = 'var(--text-1)';
                            option.classList.remove('active');
                        }
                    });
                }

                window.queueAutosave?.();
                break;

            case 'set-randomization':
                e.stopPropagation();
                const randomMode = target.value;

                // Update data
                window.state.questions[questionIndex].randomization = { mode: randomMode };

                // Update UI directly
                const allRandomOptions = target.closest('.option-management-content').querySelectorAll('.toggle-option');
                allRandomOptions.forEach(option => {
                    const input = option.querySelector('input[type="radio"]');
                    const isActive = input.value === target.value;

                    if (isActive) {
                        option.style.background = 'var(--accent)';
                        option.style.color = 'white';
                    } else {
                        option.style.background = 'var(--surface-1)';
                        option.style.color = 'var(--text-1)';
                    }
                });

                window.queueAutosave?.();
                break;
            case 'use-prev-question-as-columns':
                e.preventDefault();
                e.stopPropagation();
                showColumnHeadersModal(questionIndex, actions);
                break;
            // Advanced Table Actions
            case 'add-adv-row':
                e.preventDefault();
                e.stopPropagation();
                const questionAddRow = window.state.questions[questionIndex];
                if (!questionAddRow.advancedTable) questionAddRow.advancedTable = { rows: [], cols: [] };
                questionAddRow.advancedTable.rows.push('');
                // Debounce save to prevent re-render race
                setTimeout(() => {
                    actions.onUpdateQuestion(questionIndex, 'advancedTable', questionAddRow.advancedTable);
                }, 50);
                break;
            case 'add-adv-col':
                e.preventDefault();
                e.stopPropagation();
                const questionAddCol = window.state.questions[questionIndex];
                if (!questionAddCol.advancedTable) questionAddCol.advancedTable = { rows: [], cols: [] };
                questionAddCol.advancedTable.cols.push('');
                // Debounce save to prevent re-render race
                setTimeout(() => {
                    actions.onUpdateQuestion(questionIndex, 'advancedTable', questionAddCol.advancedTable);
                }, 50);
                break;
            case 'delete-adv-row':
                e.preventDefault();
                e.stopPropagation();
                const questionDelRow = window.state.questions[questionIndex];
                const rowIndex = parseInt(dataset.rowIndex);
                if (questionDelRow.advancedTable?.rows && rowIndex >= 0 && rowIndex < questionDelRow.advancedTable.rows.length) {
                    questionDelRow.advancedTable.rows.splice(rowIndex, 1);
                    // Debounce save to prevent re-render race
                    setTimeout(() => {
                        actions.onUpdateQuestion(questionIndex, 'advancedTable', questionDelRow.advancedTable);
                    }, 50);
                }
                break;
            case 'delete-adv-col':
                e.preventDefault();
                e.stopPropagation();
                const questionDelCol = window.state.questions[questionIndex];
                const colIndex = parseInt(dataset.colIndex);
                if (questionDelCol.advancedTable?.cols && colIndex >= 0 && colIndex < questionDelCol.advancedTable.cols.length) {
                    questionDelCol.advancedTable.cols.splice(colIndex, 1);
                    // Debounce save to prevent re-render race
                    setTimeout(() => {
                        actions.onUpdateQuestion(questionIndex, 'advancedTable', questionDelCol.advancedTable);
                    }, 50);
                }
                break;
            case 'bulk-add-adv-rows':
                e.preventDefault();
                e.stopPropagation();
                showAdvancedTableBulkModal(questionIndex, actions, 'rows');
                break;
            case 'bulk-add-adv-cols':
                e.preventDefault();
                e.stopPropagation();
                showAdvancedTableBulkModal(questionIndex, actions, 'cols');
                break;
            case 'rows-from-question':
                e.preventDefault();
                e.stopPropagation();
                showAdvancedRowsModal(questionIndex, actions);
                break;
            case 'cols-from-question':
                e.preventDefault();
                e.stopPropagation();
                showAdvancedColumnsModal(questionIndex, actions);
                break;
            case 'show-preset-library':
                e.preventDefault();
                e.stopPropagation();
                showPresetLibraryModal(questionIndex, actions);
                break;
            case 'save-as-preset':
                e.preventDefault();
                e.stopPropagation();
                showSavePresetModal(questionIndex, question);
                break;
            case 'refresh-preview':
                e.preventDefault();
                e.stopPropagation();
                // Debounce save to prevent re-render race
                setTimeout(() => {
                    actions.onUpdateQuestion(questionIndex, 'advancedTable', question.advancedTable);
                }, 50);
                break;
            case 'add-numeric-option': actions.onAddNumericRange(questionIndex); break;
            case 'delete-numeric-range': actions.onDeleteNumericRange(questionIndex, parseInt(dataset.rangeIndex)); break;
            case 'update-numeric-type':
                e.stopPropagation();
                console.log('Numeric type switch case triggered:', target.dataset.type);

                // Update data immediately (no re-render)
                const numericQuestion = window.state.questions[questionIndex];
                if (!numericQuestion.numeric) numericQuestion.numeric = {};
                numericQuestion.numeric.type = target.dataset.type;

                // Update tab visual states immediately - smooth transitions
                const numericTabs = target.parentElement.querySelectorAll('.numeric-tab');
                numericTabs.forEach(tab => {
                    tab.classList.remove('active');
                    // Smooth visual feedback
                    tab.style.transition = 'all 0.15s ease-in-out';
                });
                target.classList.add('active');

                // Smooth content panel switching
                const numericHostEl = target.closest('#prefield-content-host, .editor-panel-card');
                if (numericHostEl) {
                    const inputConfig = numericHostEl.querySelector('#numeric-input-config');
                    const dropdownConfig = numericHostEl.querySelector('#numeric-dropdown-config');
                    const rangesConfig = numericHostEl.querySelector('#numeric-ranges-config');
                    const selectedType = target.dataset.type;

                    // Enhanced smooth transitions with proper crossfade
                    const allPanels = [inputConfig, dropdownConfig, rangesConfig].filter(Boolean);

                    // First, fade out all currently visible panels
                    allPanels.forEach(panel => {
                        if (panel) {
                            panel.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
                            if (panel.style.display !== 'none') {
                                panel.style.opacity = '0';
                                panel.style.transform = 'translateY(-8px)';
                            }
                        }
                    });

                    // After fade out completes, switch panels
                    setTimeout(() => {
                        // Hide all panels
                        allPanels.forEach(panel => {
                            if (panel) panel.style.display = 'none';
                        });

                        // Determine and show target panel
                        let targetPanel = null;
                        if (selectedType === 'ranges') {
                            targetPanel = rangesConfig;
                        } else {
                            targetPanel = inputConfig; // Both 'input' and 'dropdown' use input config
                        }

                        if (targetPanel) {
                            targetPanel.style.display = 'block';
                            targetPanel.style.opacity = '0';
                            targetPanel.style.transform = 'translateY(8px)';

                            // Smooth fade in with slight delay for better UX
                            setTimeout(() => {
                                targetPanel.style.opacity = '1';
                                targetPanel.style.transform = 'translateY(0px)';
                            }, 50);
                        }
                    }, 300); // Wait for fade out animation to complete
                }

                // Debounce save operation (no immediate re-render)
                const timeoutKey = `numeric-type-${questionIndex}`;
                if (optionUpdateTimeouts[timeoutKey]) {
                    clearTimeout(optionUpdateTimeouts[timeoutKey]);
                }
                optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
                    actions.onUpdateNumericType(questionIndex, target.dataset.type);
                    delete optionUpdateTimeouts[timeoutKey];
                }, 500); // Quick save for UI changes

                // MAP TO YOUR NUMERIC QUESTION_MODE SYSTEM
                const numericType = target.dataset.type;
                let questionMode = 'numeric_simple'; // default

                if (numericType === 'ranges') {
                    questionMode = 'numeric_select';
                } else if (numericType === 'dropdown' || numericQuestion.numeric.type === 'dropdown') {
                    questionMode = 'numeric_dropdown';
                } else {
                    questionMode = 'numeric_simple';
                }

                numericQuestion.question_mode = questionMode;
                actions.onUpdateQuestion(questionIndex, 'question_mode', questionMode);
                console.log(`🔄 Set numeric question_mode: ${questionMode} for type: ${numericType}`);

                break;
            // Removed duplicate 'update-terminate-condition' handler - now handled by change event
            case 'set-global-terminate-operator':
                // Don't preventDefault here as it might interfere with dropdown functionality
                e.stopPropagation();

                const numericTermQuestion = window.state.questions[questionIndex];
                const operator = target.value;
                if (operator === 'none') {
                    // Disable global termination
                    actions.onSetGlobalTerminate(questionIndex, { enabled: false });
                } else {
                    // Enable global termination with selected operator
                    actions.onSetGlobalTerminate(questionIndex, {
                        enabled: true,
                        operator: operator,
                        value1: numericTermQuestion.numeric?.globalTerminate?.value1 || '',
                        value2: numericTermQuestion.numeric?.globalTerminate?.value2 || ''
                    });
                }

                // Show/hide input containers based on operator
                const inputsContainer = hostEl.querySelector('.global-terminate-inputs');
                const singleOperatorInput = hostEl.querySelector('.single-operator-input');
                const betweenOperatorInput = hostEl.querySelector('.between-operator-input');
                const operatorSymbol = hostEl.querySelector('.operator-symbol');

                if (inputsContainer) {
                    if (operator === 'none') {
                        inputsContainer.style.display = 'none';
                    } else {
                        inputsContainer.style.display = 'flex';
                        inputsContainer.style.alignItems = 'center';
                        inputsContainer.style.gap = '8px';
                        inputsContainer.style.flexWrap = 'wrap';
                    }
                }

                if (singleOperatorInput && betweenOperatorInput) {
                    if (operator === 'between') {
                        singleOperatorInput.style.display = 'none';
                        betweenOperatorInput.style.display = 'flex';
                        betweenOperatorInput.style.alignItems = 'center';
                        betweenOperatorInput.style.gap = '8px';
                    } else if (operator !== 'none') {
                        singleOperatorInput.style.display = 'flex';
                        singleOperatorInput.style.alignItems = 'center';
                        singleOperatorInput.style.gap = '4px';
                        betweenOperatorInput.style.display = 'none';

                        // Update the operator symbol
                        if (operatorSymbol) {
                            const symbols = {
                                'lt': '<',
                                'lte': '≤',
                                'gt': '>',
                                'gte': '≥',
                                'equals': '='
                            };
                            operatorSymbol.textContent = symbols[operator] || '';
                        }
                    } else {
                        // operator === 'none'
                        singleOperatorInput.style.display = 'none';
                        betweenOperatorInput.style.display = 'none';
                    }
                }
                break;

            // Global Termination Actions (NEW MODULAR SYSTEM)
            case 'enable-global-termination':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.enableGlobalTermination(e);
                break;

            case 'disable-global-termination':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.disableGlobalTermination(e);
                break;

            case 'toggle-termination-mode':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.toggleTerminationMode(e);
                break;

            case 'set-termination-operator':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.setTerminationOperator(e);
                break;

            case 'toggle-termination-option':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.toggleTerminationOption(e);
                break;

            case 'add-termination-condition-adv':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.addTerminationCondition(e);
                break;

            case 'remove-termination-condition-adv':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.removeTerminationCondition(e);
                break;

            case 'toggle-condition-type':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.toggleConditionType(e);
                break;

            case 'toggle-condition-operator':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.toggleConditionOperator(e);
                break;

            case 'toggle-row-operator':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.toggleRowOperator(e);
                break;

            case 'add-option-to-condition':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.addOptionToCondition(e);
                break;

            case 'remove-option-from-condition':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.removeOptionFromCondition(e);
                break;

            // Table Termination Actions
            case 'set-table-termination-pattern':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.setTableTerminationPattern(e);
                break;

            case 'set-table-row-filter':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.setTableRowFilter(e);
                break;

            case 'toggle-table-column':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.toggleTableColumn(e);
                break;

            case 'toggle-table-row':
                e.preventDefault();
                e.stopPropagation();
                terminationActions.toggleTableRow(e);
                break;

            // Global Must Select Actions
            case 'enable-global-must-select':
                e.preventDefault();
                e.stopPropagation();
                const questionMustSelect = window.state.questions[questionIndex];
                if (!questionMustSelect.globalMustSelect) questionMustSelect.globalMustSelect = {};
                questionMustSelect.globalMustSelect.enabled = true;
                questionMustSelect.globalMustSelect.conditions = [];
                questionMustSelect.globalMustSelect.operator = 'OR'; // Default to OR for must select

                // Update just the must select section, not the full editor
                setTimeout(() => {
                    const mustSelectBuilder = hostEl.querySelector('.global-must-select-builder');
                    if (mustSelectBuilder) {
                        mustSelectBuilder.innerHTML = renderGlobalMustSelect(questionMustSelect);
                    }
                    // Save to backend without re-rendering
                    window.queueAutosave?.();
                }, 50);
                break;

            case 'disable-global-must-select':
                e.preventDefault();
                e.stopPropagation();
                const questionDisableMustSelect = window.state.questions[questionIndex];
                if (questionDisableMustSelect.globalMustSelect) {
                    questionDisableMustSelect.globalMustSelect.enabled = false;
                    questionDisableMustSelect.globalMustSelect.conditions = [];
                }

                // Update just the must select section, not the full editor
                setTimeout(() => {
                    const mustSelectBuilder = hostEl.querySelector('.global-must-select-builder');
                    if (mustSelectBuilder) {
                        mustSelectBuilder.innerHTML = renderGlobalMustSelect(questionDisableMustSelect);
                    }
                    // Save to backend without re-rendering
                    window.queueAutosave?.();
                }, 50);
                break;

            case 'add-must-select-condition':
                e.preventDefault();
                e.stopPropagation();
                const questionAddMustCond = window.state.questions[questionIndex];
                showOptionSelectorModal('must-select', questionAddMustCond, questionIndex, (optionCode) => {
                    if (!questionAddMustCond.globalMustSelect) questionAddMustCond.globalMustSelect = { enabled: true, conditions: [], operator: 'OR' };
                    if (!questionAddMustCond.globalMustSelect.conditions.find(c => c.optionCode === optionCode)) {
                        questionAddMustCond.globalMustSelect.conditions.push({ optionCode });

                        // Update just the must select section, not the full editor
                        setTimeout(() => {
                            const mustSelectBuilder = hostEl.querySelector('.global-must-select-builder');
                            if (mustSelectBuilder) {
                                mustSelectBuilder.innerHTML = renderGlobalMustSelect(questionAddMustCond);
                            }
                            // Save to backend without re-rendering
                            window.queueAutosave?.();
                        }, 50);
                    }
                });
                break;

            case 'remove-must-select-condition':
                e.preventDefault();
                e.stopPropagation();
                const questionRemoveMustCond = window.state.questions[questionIndex];
                const mustConditionIndex = parseInt(dataset.conditionIndex);
                if (questionRemoveMustCond.globalMustSelect?.conditions) {
                    questionRemoveMustCond.globalMustSelect.conditions.splice(mustConditionIndex, 1);

                    // Use debounced save pattern
                    setTimeout(() => {
                        actions.onUpdateQuestion(questionIndex, 'globalMustSelect', questionRemoveMustCond.globalMustSelect);
                    }, 100);
                }
                break;

            case 'toggle-must-select-operator':
                e.preventDefault();
                e.stopPropagation();
                const questionToggleMustOp = window.state.questions[questionIndex];
                console.log('Toggle must select operator clicked, current operator:', questionToggleMustOp.globalMustSelect?.operator);
                if (questionToggleMustOp.globalMustSelect) {
                    const oldOperator = questionToggleMustOp.globalMustSelect.operator;
                    questionToggleMustOp.globalMustSelect.operator = questionToggleMustOp.globalMustSelect.operator === 'OR' ? 'AND' : 'OR';
                    console.log('Changed operator from', oldOperator, 'to', questionToggleMustOp.globalMustSelect.operator);

                    // Update just the must select section, not the full editor
                    setTimeout(() => {
                        const mustSelectBuilder = hostEl.querySelector('.global-must-select-builder');
                        console.log('Found mustSelectBuilder:', !!mustSelectBuilder);
                        if (mustSelectBuilder) {
                            mustSelectBuilder.innerHTML = renderGlobalMustSelect(questionToggleMustOp);
                        }
                        // Save to backend without re-rendering
                        window.queueAutosave?.();
                    }, 50);
                }
                break;

            default:
                // For actions not in switch, call handleAction
                handleAction(e, target, questionIndex, actions);
                break;
        }

        const tab = target.closest('[data-tab]');
        if(tab && tab.id !== 'question-setup-btn' && tab.id !== 'tab-plan-btn' && !tab.classList.contains('bottom-tab')) {
            // Only handle tabs that don't have direct event listeners (exclude bottom tabs)
            actions.onSetTab(tab.dataset.tab);
        }
    });

    }); // Close measureRenderTime function
}