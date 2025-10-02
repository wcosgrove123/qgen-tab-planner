/**
 * Termination Logic Actions
 *
 * Follows rendering patterns:
 * - No re-renders for simple state changes
 * - Debounced saves (2 seconds)
 * - Direct DOM updates with smooth transitions
 * - Event delegation (handled by editorPanel)
 */

import { renderGlobalTermination } from './terminationBuilder.js';

// Debounce timeouts
const saveTimeouts = {};

/**
 * Queue autosave with debouncing
 */
function queueSave(key, saveFn, delay = 2000) {
    if (saveTimeouts[key]) {
        clearTimeout(saveTimeouts[key]);
    }
    saveTimeouts[key] = setTimeout(() => {
        saveFn();
        delete saveTimeouts[key];
    }, delay);
}

/**
 * Update termination UI without full re-render
 */
function updateTerminationUI(hostEl, question) {
    const terminationBuilder = hostEl.querySelector('.global-termination-builder');
    if (!terminationBuilder) return;

    // Smooth fade transition
    terminationBuilder.style.transition = 'opacity 0.2s ease';
    terminationBuilder.style.opacity = '0';

    setTimeout(() => {
        terminationBuilder.innerHTML = renderGlobalTermination(question);
        terminationBuilder.style.opacity = '1';
    }, 200);
}

/**
 * Get termination actions
 */
export function getTerminationActions(hostEl, questionIndex, actions) {
    return {
        /**
         * Enable global termination
         */
        enableGlobalTermination: (e) => {
            const question = window.state.questions[questionIndex];

            // Initialize termination object
            if (!question.globalTermination) {
                question.globalTermination = {
                    enabled: true,
                    mode: 'simple',
                    operator: 'OR',
                    conditions: []
                };
            } else {
                question.globalTermination.enabled = true;
            }

            // Update UI only
            updateTerminationUI(hostEl, question);

            // Queue save
            queueSave(`termination-enable-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Disable global termination
         */
        disableGlobalTermination: (e) => {
            const question = window.state.questions[questionIndex];

            if (question.globalTermination) {
                question.globalTermination.enabled = false;
            }

            // Update UI only
            updateTerminationUI(hostEl, question);

            // Queue save
            queueSave(`termination-disable-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Toggle between simple and advanced mode
         */
        toggleTerminationMode: (e) => {
            const question = window.state.questions[questionIndex];

            if (!question.globalTermination) return;

            const currentMode = question.globalTermination.mode || 'simple';
            const newMode = currentMode === 'simple' ? 'advanced' : 'simple';

            question.globalTermination.mode = newMode;

            // Update UI only
            updateTerminationUI(hostEl, question);

            // Queue save
            queueSave(`termination-mode-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Set operator (AND/OR) in simple mode
         */
        setTerminationOperator: (e) => {
            const question = window.state.questions[questionIndex];
            const operator = e.target.dataset.operator;

            if (!question.globalTermination) return;

            question.globalTermination.operator = operator;

            // Update UI only (smooth button transition)
            const buttons = hostEl.querySelectorAll('.operator-btn');
            buttons.forEach(btn => {
                const isActive = btn.dataset.operator === operator;
                btn.classList.toggle('active', isActive);
                btn.style.background = isActive ? 'var(--cue-primary)' : 'var(--surface-1)';
                btn.style.color = isActive ? 'white' : 'var(--text-2)';
            });

            // Update equation display
            const equation = hostEl.querySelector('.termination-header code');
            if (equation) {
                const selectedCodes = [];
                (question.globalTermination.conditions || []).forEach(cond => {
                    if (cond.type === 'include') {
                        selectedCodes.push(...(cond.options || []));
                    }
                });
                equation.textContent = selectedCodes.join(` ${operator} `);
            }

            // Queue save
            queueSave(`termination-operator-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Toggle option selection in simple mode
         */
        toggleTerminationOption: (e) => {
            const question = window.state.questions[questionIndex];
            const optionCode = e.target.closest('[data-option-code]').dataset.optionCode;

            if (!question.globalTermination) {
                question.globalTermination = {
                    enabled: true,
                    mode: 'simple',
                    operator: 'OR',
                    conditions: []
                };
            }

            // Get or create simple condition
            let condition = question.globalTermination.conditions.find(c => c.type === 'include');
            if (!condition) {
                condition = { type: 'include', options: [], operator: 'OR' };
                question.globalTermination.conditions.push(condition);
            }

            // Toggle option
            const idx = condition.options.indexOf(optionCode);
            if (idx >= 0) {
                condition.options.splice(idx, 1);
            } else {
                condition.options.push(optionCode);
            }

            // Clean up empty conditions
            question.globalTermination.conditions = question.globalTermination.conditions.filter(
                c => c.options && c.options.length > 0
            );

            // Update chip UI immediately (smooth transition)
            const chip = e.target.closest('.option-chip');
            const isSelected = condition.options.includes(optionCode);

            chip.style.transition = 'all 0.15s ease';
            chip.classList.toggle('selected', isSelected);
            chip.style.borderColor = isSelected ? 'var(--cue-primary)' : 'var(--line)';
            chip.style.background = isSelected ? 'var(--cue-primary)' : 'var(--surface-1)';
            chip.style.color = isSelected ? 'white' : 'var(--text-1)';

            const checkbox = chip.querySelector('.chip-checkbox');
            checkbox.style.borderColor = isSelected ? 'white' : 'var(--line)';
            checkbox.style.background = isSelected ? 'white' : 'transparent';
            checkbox.textContent = isSelected ? '✓' : '';

            // Update equation display
            const equation = hostEl.querySelector('.termination-header code');
            if (equation) {
                const operator = question.globalTermination.operator || 'OR';
                equation.textContent = condition.options.join(` ${operator} `);
            }

            // Queue save
            queueSave(`termination-option-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Add new condition in advanced mode
         */
        addTerminationCondition: (e) => {
            const question = window.state.questions[questionIndex];

            if (!question.globalTermination) {
                question.globalTermination = {
                    enabled: true,
                    mode: 'advanced',
                    operator: 'AND',
                    conditions: []
                };
            }

            // Add empty condition
            question.globalTermination.conditions.push({
                type: 'include',
                options: [],
                operator: 'OR'
            });

            // Update UI
            updateTerminationUI(hostEl, question);

            // Queue save
            queueSave(`termination-add-cond-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Remove condition in advanced mode
         */
        removeTerminationCondition: (e) => {
            const question = window.state.questions[questionIndex];
            const conditionIndex = parseInt(e.target.closest('[data-condition-index]').dataset.conditionIndex);

            if (!question.globalTermination?.conditions) return;

            question.globalTermination.conditions.splice(conditionIndex, 1);

            // Update UI
            updateTerminationUI(hostEl, question);

            // Queue save
            queueSave(`termination-remove-cond-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Toggle condition type (include/exclude)
         */
        toggleConditionType: (e) => {
            const question = window.state.questions[questionIndex];
            const conditionIndex = parseInt(e.target.dataset.conditionIndex);

            const condition = question.globalTermination?.conditions?.[conditionIndex];
            if (!condition) return;

            condition.type = condition.type === 'include' ? 'exclude' : 'include';

            // Update button UI immediately
            const btn = e.target;
            btn.style.transition = 'all 0.15s ease';
            btn.style.background = condition.type === 'exclude' ? '#ff4444' : 'var(--cue-primary)';
            btn.textContent = condition.type === 'exclude' ? 'NOT' : 'IS';

            // Update equation
            updateTerminationUI(hostEl, question);

            // Queue save
            queueSave(`termination-toggle-type-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Toggle condition operator (AND/OR) for multi-option conditions
         */
        toggleConditionOperator: (e) => {
            const question = window.state.questions[questionIndex];
            const conditionIndex = parseInt(e.target.dataset.conditionIndex);

            const condition = question.globalTermination?.conditions?.[conditionIndex];
            if (!condition) return;

            condition.operator = condition.operator === 'OR' ? 'AND' : 'OR';

            // Update operator display
            e.target.textContent = `(${condition.operator})`;

            // Update equation
            const equation = hostEl.querySelector('.termination-header code');
            if (equation) {
                // Regenerate equation text
                updateTerminationUI(hostEl, question);
            }

            // Queue save
            queueSave(`termination-cond-op-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Toggle global row operator (AND/OR between conditions)
         */
        toggleRowOperator: (e) => {
            const question = window.state.questions[questionIndex];

            if (!question.globalTermination) return;

            const currentOp = question.globalTermination.operator || 'AND';
            question.globalTermination.operator = currentOp === 'AND' ? 'OR' : 'AND';

            // Update all operator badges
            const operatorBadges = hostEl.querySelectorAll('.condition-operator');
            operatorBadges.forEach(badge => {
                badge.textContent = question.globalTermination.operator;
            });

            // Update equation
            updateTerminationUI(hostEl, question);

            // Queue save
            queueSave(`termination-row-op-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Add option to condition (advanced mode)
         */
        addOptionToCondition: (e) => {
            const question = window.state.questions[questionIndex];
            const conditionIndex = parseInt(e.target.closest('[data-condition-index]').dataset.conditionIndex);

            const condition = question.globalTermination?.conditions?.[conditionIndex];
            if (!condition) return;

            // Show option selector modal
            window.showOptionSelectorModal?.('termination-advanced', question, questionIndex, (optionCode) => {
                if (!condition.options.includes(optionCode)) {
                    condition.options.push(optionCode);

                    // Update UI
                    updateTerminationUI(hostEl, question);

                    // Queue save
                    queueSave(`termination-add-opt-${questionIndex}`, () => {
                        actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
                    });
                }
            });
        },

        /**
         * Remove option from condition
         */
        removeOptionFromCondition: (e) => {
            const question = window.state.questions[questionIndex];
            const conditionIndex = parseInt(e.target.dataset.conditionIndex);
            const optionCode = e.target.dataset.optionCode;

            const condition = question.globalTermination?.conditions?.[conditionIndex];
            if (!condition) return;

            const idx = condition.options.indexOf(optionCode);
            if (idx >= 0) {
                condition.options.splice(idx, 1);

                // If condition is now empty, remove it
                if (condition.options.length === 0) {
                    question.globalTermination.conditions.splice(conditionIndex, 1);
                }

                // Update UI
                updateTerminationUI(hostEl, question);

                // Queue save
                queueSave(`termination-remove-opt-${questionIndex}`, () => {
                    actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
                });
            }
        },

        /**
         * Set table termination pattern (preset)
         */
        setTableTerminationPattern: (e) => {
            const question = window.state.questions[questionIndex];
            const pattern = e.target.value;

            if (!question.globalTermination) return;

            question.globalTermination.tablePattern = pattern;

            // Set default values based on pattern
            if (pattern === 'must_t2b_any') {
                question.globalTermination.rowFilter = 'all';
                question.globalTermination.columnCodes = ['1', '2', '3'];
            } else if (pattern === 'must_t2b_all') {
                question.globalTermination.rowFilter = 'any';
                question.globalTermination.columnCodes = ['1', '2', '3'];
            } else if (pattern === 'cannot_b2b_all') {
                question.globalTermination.rowFilter = 'all';
                question.globalTermination.columnCodes = ['1', '2'];
            } else if (pattern === 'cannot_neutral_all') {
                question.globalTermination.rowFilter = 'all';
                question.globalTermination.columnCodes = ['3'];
            }

            // Update UI
            updateTerminationUI(hostEl, question);

            // Queue save
            queueSave(`termination-table-pattern-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Set table row filter (all/any/specific)
         */
        setTableRowFilter: (e) => {
            const question = window.state.questions[questionIndex];
            const rowFilter = e.target.value;

            if (!question.globalTermination) return;

            question.globalTermination.rowFilter = rowFilter;

            // Initialize specific rows if needed
            if (rowFilter === 'specific' && !question.globalTermination.specificRows) {
                question.globalTermination.specificRows = [];
            }

            // Update UI
            updateTerminationUI(hostEl, question);

            // Queue save
            queueSave(`termination-row-filter-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Toggle table column code selection
         */
        toggleTableColumn: (e) => {
            const question = window.state.questions[questionIndex];
            const columnCode = e.target.dataset.columnCode || e.target.closest('[data-column-code]').dataset.columnCode;

            if (!question.globalTermination) return;

            if (!question.globalTermination.columnCodes) {
                question.globalTermination.columnCodes = [];
            }

            const idx = question.globalTermination.columnCodes.indexOf(columnCode);
            if (idx >= 0) {
                question.globalTermination.columnCodes.splice(idx, 1);
            } else {
                question.globalTermination.columnCodes.push(columnCode);
            }

            // Update chip UI immediately
            const chip = e.target.closest('.option-chip');
            const isSelected = question.globalTermination.columnCodes.includes(columnCode);

            chip.style.transition = 'all 0.15s ease';
            chip.classList.toggle('selected', isSelected);
            chip.style.borderColor = isSelected ? 'var(--cue-primary)' : 'var(--line)';
            chip.style.background = isSelected ? 'var(--cue-primary)' : 'var(--surface-1)';
            chip.style.color = isSelected ? 'white' : 'var(--text-1)';

            // Update equation display
            const equation = hostEl.querySelector('.termination-header code');
            if (equation) {
                const rowFilter = question.globalTermination.rowFilter || 'all';
                equation.textContent = `${question.globalTermination.columnCodes.join('|')} for ${rowFilter.toUpperCase()} rows`;
            }

            // Queue save
            queueSave(`termination-table-col-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        },

        /**
         * Toggle table row selection (for specific rows mode)
         */
        toggleTableRow: (e) => {
            const question = window.state.questions[questionIndex];
            const rowCode = e.target.dataset.rowCode;

            if (!question.globalTermination) return;

            if (!question.globalTermination.specificRows) {
                question.globalTermination.specificRows = [];
            }

            const idx = question.globalTermination.specificRows.indexOf(rowCode);
            if (idx >= 0) {
                question.globalTermination.specificRows.splice(idx, 1);
            } else {
                question.globalTermination.specificRows.push(rowCode);
            }

            // Queue save
            queueSave(`termination-table-row-${questionIndex}`, () => {
                actions.onUpdateQuestion(questionIndex, 'globalTermination', question.globalTermination);
            });
        }
    };
}
