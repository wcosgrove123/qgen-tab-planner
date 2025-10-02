/**
 * questionList.js
 * * This module is responsible for rendering the interactive list of questions
 * in the editor's sidebar. It includes functionality for displaying questions,
 * handling selection, and drag-and-drop reordering.
 */

// Import conditional logic utilities
import { shouldShowQuestion, getConditionsDescription } from '../../../lib/conditionalLogic.js';

// Import validation utilities
import { validateField, runQuestionValidation } from '../../../lib/validation.js';

// --- UTILITY FUNCTIONS (migrated from legacy) ---

function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[m]));
}

function cleanHTMLForPreview(s) {
    if (!s) return '';

    // Create a temporary DOM element to parse and clean the HTML
    const temp = document.createElement('div');
    temp.innerHTML = String(s);

    // Recursively clean all nodes
    function normalizeNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();

            // Keep only these tags with their content
            if (['b', 'strong', 'i', 'em', 'u', 'span'].includes(tagName)) {
                const children = Array.from(node.childNodes).map(normalizeNode).join('');

                // Check if this is a pipe (span with specific class or data attributes)
                if (tagName === 'span' && (node.classList.contains('pipe') || node.dataset.pipe || node.className.includes('pipe'))) {
                    return `<span class="pipe">${children}</span>`;
                }

                // For formatting tags, only keep if they actually provide formatting
                if (tagName === 'b' || tagName === 'strong') {
                    return `<strong>${children}</strong>`;
                }
                if (tagName === 'i' || tagName === 'em') {
                    return `<em>${children}</em>`;
                }
                if (tagName === 'u') {
                    return `<u>${children}</u>`;
                }

                // For other spans, just return the content without the wrapper
                return children;
            }

            // For all other tags (div, p, etc.), just return their content
            return Array.from(node.childNodes).map(normalizeNode).join('');
        }

        return '';
    }

    const cleaned = normalizeNode(temp);

    // Clean up any multiple spaces and trim
    return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Quick validation check for a question
 * @param {object} question - The question to check
 * @param {Array} questions - All questions for reference
 * @returns {boolean} - True if question has validation issues
 */
function checkQuestionValidation(question, questions) {
    // Quick basic checks
    if (!question.id || !question.id.trim()) return true;
    if (!question.text || !question.text.trim()) return true;

    // Check for list questions without options
    if (question.mode === 'list' && (!question.options || question.options.length === 0)) return true;

    // Check for duplicate option codes
    if (question.options && question.options.length > 0) {
        const codes = question.options.map(o => o.code).filter(Boolean);
        const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);
        if (duplicates.length > 0) return true;

        // Check for missing labels
        const hasEmptyLabels = question.options.some(o => !o.label || !o.label.trim());
        if (hasEmptyLabels) return true;
    }

    // Check for table questions without rows/columns
    if (question.mode === 'table') {
        const grid = question.grid || {};
        if ((!grid.rows || grid.rows.length === 0) ||
            (!grid.cols || grid.cols.length === 0) && !grid.columnSource) {
            return true;
        }
    }

    // Check for repeated questions without source or columns
    if (question.mode === 'repeated') {
        const repeated = question.repeated || {};
        if (!repeated.source_qid || !repeated.columns || repeated.columns.length === 0) {
            return true;
        }
    }

    // Check for advanced table questions without rows/columns
    if (question.mode === 'advanced_table' || question.question_type === 'advanced_table') {
        const advTable = question.advancedTable || {};

        // NEW: Use table_type for enhanced validation
        const tableType = question.table_type;
        const metadata = question.table_metadata;

        if (tableType?.startsWith('dynamic_')) {
            // Dynamic tables require source configuration
            if (!metadata?.source_config?.rows?.qid && !metadata?.source_config?.columns?.qid) {
                return true; // Invalid: no source configured
            }
        } else if (tableType?.startsWith('likert_')) {
            // Likert scales need rows (statements)
            if (!advTable.rows || advTable.rows.length === 0) {
                return true; // Invalid: no statements
            }
        } else {
            // Simple tables need both rows and columns
            if ((!advTable.rows || advTable.rows.length === 0) ||
                (!advTable.cols || advTable.cols.length === 0)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Generates a concise summary string for a given question object.
 * This is used to display the question's type and option/statement count.
 * @param {object} q - The question object.
 * @returns {string} A summary string, e.g., "single • 5 opt".
 */
function summaryFor(q) {
    const numericSummary = (q) => {
        const N = q.numeric || {};
        const hasRange = (N.min != null || N.max != null);
        const range = hasRange ? ` ${N.min ?? ''}–${N.max ?? ''}` : '';
        if (q.type === 'numeric_time') return `time${range} ${N.time_unit || ''}`.trim();
        if (q.type === 'numeric_count') return `count${range} ${N.unit || ''}`.trim();
        if (q.type === 'numeric_open') return `num${range} ${N.unit || ''}`.trim();
        return '';
    };

    const openSummary = (q) => {
        if (q.type !== 'open_end') return '';
        const O = q.open || {};
        const k = O.limit_kind || '';
        const a = O.min, b = O.max;
        const detail = (k && (a != null || b != null)) ? ` ${a ?? ''}–${b ?? ''} ${k}` : '';
        return ` • open${detail}`;
    };

    // ✅ CORRECT: Show question_mode from database (read-only, no rewrite power)
    // question_mode contains the detailed type (e.g., "single", "multi", "numeric_simple", "table_single")
    if (q.question_mode) {
        // For list questions, add option count
        if (q.mode === 'list') {
            const opts = (q.options?.length || 0) ? ` • ${q.options.length} opt` : '';
            return q.question_mode + opts;
        }
        return q.question_mode;
    }

    // FALLBACK: If no question_mode, use client-side mode
    if (q.mode === 'list') {
        // List questions default to "single" unless type is "multi"
        const base = q.type === 'multi' ? 'multi' : 'single';
        const opts = (q.options?.length || 0) ? ` • ${q.options.length} opt` : '';
        return base + opts;
    }

    if (q.mode === 'table' && q.table_variation) {
        return q.table_variation;
    }

    if (q.mode === 'advanced_table') {
        // Show the database mode that will be saved (for trial phase recognition)
        if (q.advancedTable?.tableVariation) {
            const variation = q.advancedTable.tableVariation;
            if (variation === 'Agreement Scale') return 'likert_agreement';
            if (variation === 'Satisfaction Scale') return 'likert_sentiment';
            if (variation === 'Frequency Scale' || variation === 'Importance Scale') return 'likert_custom';
            if (variation === 'Dynamic Column Matrix') return 'dynamic_simple_columns';
            if (variation === 'Dynamic Selected Columns') return 'dynamic_selected_columns';
            if (variation === 'Dynamic Row Matrix') return 'dynamic_simple_rows';
            if (variation === 'Dynamic Selected Rows') return 'dynamic_selected_rows';
            if (variation === 'Multi-Select Table') return 'multi_matrix';
            return q.advancedTable.tableVariation; // fallback to display name
        }
        return 'advanced_table';
    }

    if (q.mode === 'open_end') {
        return 'open_end';
    }

    if (q.mode === 'numeric') {
        return q.numeric?.type ? `numeric_${q.numeric.type}` : 'numeric';
    }

    if (q.mode === 'repeated') {
        const repeated = q.repeated
            ? ` • ${q.repeated.columns?.length || 0} cols` + (q.repeated.source_qid ? ` from ${q.repeated.source_qid}` : '')
            : '';
        return 'repeated' + repeated;
    }

    // Final fallback
    return q.type || 'single';
}


// --- CORE RENDER FUNCTION ---

/**
 * Updates just the question text in the sidebar without re-rendering
 * @param {number} questionIndex - The index of the question to update
 * @param {string} newText - The new text to display
 */
export function updateSidebarQuestionText(questionIndex, newText) {
    // Find the sidebar item for this question
    const sidebarItem = document.querySelector(`.question-item[data-index="${questionIndex}"]`);

    if (sidebarItem) {
        const textDiv = sidebarItem.querySelector('.text');
        if (textDiv) {
            // Use the same cleaning function that the full render uses
            textDiv.innerHTML = cleanHTMLForPreview(newText || '...');
            console.log(`✅ Updated sidebar text for question index ${questionIndex}`);
        }
    }
}

/**
 * Renders the list of questions for a specific section (screener or main).
 * @param {object} config - The configuration object.
 * @param {HTMLElement} config.listEl - The DOM element to render the list into.
 * @param {HTMLElement} config.headerEl - The DOM element for the list's header.
 * @param {Array<object>} config.questions - The full array of project questions.
 * @param {number|null} config.activeIndex - The index of the currently selected question.
 * @param {string} config.filter - 'screener' or 'main'.
 * @param {function} config.onSelect - Callback when a question is selected.
 * @param {function} config.onReorder - Callback when questions are reordered.
 */
export function renderQuestionList({ listEl, headerEl, questions, activeIndex, filter, onSelect, onReorder }) {
    if (!listEl || !headerEl) return;

    const rows = questions
        .map((q, originalIndex) => ({ q, originalIndex }))
        .filter(({ q }) => {
            const id = String(q.id || '').toUpperCase();
            if (filter === 'screener') {
                // Screener includes: S questions, S_H (screener hidden), SQC_ (screener QC check), and STXT_ (screener text) questions
                return id.startsWith('S');
            }
            if (filter === 'main') {
                // Main includes: Q questions, Q_H (main hidden), Q_R (legacy QC check), QC_ (new QC check), and TXT_ (main text) questions
                return id.startsWith('Q') || id.startsWith('TXT_');
            }
            return true;
        });

    headerEl.textContent = `${filter === 'screener' ? 'Screener' : 'Main Survey'} Questions (${rows.length})`;
    listEl.innerHTML = '';

    rows.forEach(({ q, originalIndex }) => {
        const item = document.createElement('div');

        // Check if question has conditional logic (with safety checks)
        const hasConditions = q.conditions &&
                              q.conditions.mode !== 'none' &&
                              q.conditions.rules &&
                              Array.isArray(q.conditions.rules) &&
                              q.conditions.rules.length > 0 &&
                              q.conditions.rules.some(rule => rule.source_qid && rule.source_qid.trim() !== '');

        // Build mock responses for visibility check
        const mockResponses = {};
        questions.forEach(question => {
            if (question.id) {
                if (question.options && question.options.length > 0) {
                    mockResponses[question.id] = question.options[0].code || '1';
                } else if (question.type && question.type.includes('numeric')) {
                    mockResponses[question.id] = '25';
                } else {
                    mockResponses[question.id] = 'Sample response';
                }
            }
        });

        // Check if question would be visible with mock responses
        const isVisible = shouldShowQuestion(q, mockResponses, questions);

        // Apply conditional styling (removed conditional-hidden to prevent graying out)
        let conditionalClasses = '';
        if (hasConditions) {
            conditionalClasses = ' has-conditions';
        }

        // Basic validation check for the question
        const hasValidationIssues = checkQuestionValidation(q, questions);
        if (hasValidationIssues) {
            conditionalClasses += ' has-validation-issues';
        }

        item.className = 'question-item' + (originalIndex === activeIndex ? ' active' : '') + conditionalClasses;
        item.dataset.index = String(originalIndex);
        item.draggable = true;

        // Build conditional logic indicator with simplified text
        const getSimplifiedConditionText = (conditions, questions) => {
            try {
                if (!conditions || conditions.mode === 'none' || !conditions.rules || conditions.rules.length === 0) {
                    return '';
                }

                const modeText = conditions.mode === 'show_if' ? 'Show if' : 'Hide if';
                const logicText = conditions.logic === 'OR' ? 'OR' : 'AND';

                const ruleDescriptions = conditions.rules.map(rule => {
                    const sourceQuestion = questions.find(q => q.id === rule.source_qid);
                    const questionId = rule.source_qid; // Just use the ID like "S1", "Q2"

                    const operatorText = rule.operator === '==' ? '=' : (rule.operator === 'in' ? '=' : rule.operator);

                    if (rule.operator === 'is_empty' || rule.operator === 'is_not_empty') {
                        return `${questionId} ${operatorText}`;
                    }

                    if (rule.operator === 'between') {
                        const val1 = rule.values && rule.values[0] ? rule.values[0] : '';
                        const val2 = rule.value2 || '';
                        return `${questionId} between ${val1} and ${val2}`;
                    }

                    const values = Array.isArray(rule.values) ? rule.values : [rule.values];
                    const filteredValues = values.filter(Boolean);

                    // Always use option codes (like 1, 2, 14) not labels
                    return `${questionId} ${operatorText} ${filteredValues.join(', ')}`;
                });

                if (ruleDescriptions.length === 1) {
                    return `${modeText}: ${ruleDescriptions[0]}`;
                }

                return `${modeText}: ${ruleDescriptions.join(` ${logicText} `)}`;
            } catch (error) {
                return 'Invalid conditions';
            }
        };

        const conditionIndicator = hasConditions ? `
            <span class="tag" style="background: var(--surface-2); color: var(--muted); font-size: 12px;" title="${escapeHTML(getConditionsDescription(q.conditions, questions))}">
                ${escapeHTML(getSimplifiedConditionText(q.conditions, questions))}
            </span>
        ` : '';

        item.innerHTML = `
            <div class="stack" style="align-items:flex-start;">
                <span class="tag">${escapeHTML(q.id || '')}</span>
                <div class="text" style="flex:1;">${cleanHTMLForPreview(q.text || '...')}</div>
            </div>
            <div class="summary-row" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="summary">${summaryFor(q)}</div>
                ${conditionIndicator}
            </div>
        `;

        item.addEventListener('click', () => onSelect(originalIndex));

        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', String(originalIndex));
        });
        item.addEventListener('dragover', (e) => e.preventDefault());
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
            const toIndex = originalIndex;
            if (fromIndex !== toIndex) {
                onReorder(fromIndex, toIndex);
            }
        });

        listEl.appendChild(item);
    });
}
