/**
 * Termination Logic Builder
 *
 * Supports complex termination conditions:
 * - Simple: Terminate if 2 OR 3 selected
 * - Complex: Terminate if (2 AND 3) AND NOT (4)
 * - Advanced: Terminate if (1 OR 2) AND NOT (3 OR 4)
 *
 * Data Structure:
 * {
 *   mode: 'simple' | 'advanced',
 *   operator: 'AND' | 'OR',
 *   conditions: [
 *     {
 *       type: 'include' | 'exclude',
 *       options: ['2', '3'],
 *       operator: 'AND' | 'OR'  // For multi-option conditions
 *     }
 *   ]
 * }
 */

/**
 * Render global termination builder
 */
export function renderGlobalTermination(question) {
    const termination = question.globalTermination || { enabled: false, mode: 'simple', operator: 'OR', conditions: [] };
    const isTableQuestion = question.mode === 'table';

    if (!termination.enabled) {
        return `
            <div class="termination-disabled" style="padding: 12px; background: var(--surface-2); border-radius: 6px; text-align: center;">
                <p style="margin: 0 0 8px 0; color: var(--muted); font-size: 12px;">Survey will not terminate based on responses to this question</p>
                <button class="btn ghost small" data-action="enable-global-termination" style="font-size: 12px;">
                    <span style="margin-right: 4px;">⚡</span> Enable Termination
                </button>
            </div>
        `;
    }

    // Enabled state - show builder
    const mode = termination.mode || 'simple';

    return `
        <div class="termination-builder" style="background: var(--surface-2); border-radius: 6px; padding: 12px;">
            <!-- Header -->
            <div class="termination-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 600; font-size: 12px; color: var(--text-1);">⚡ Termination Active</span>
                    ${renderTerminationEquation(termination, question)}
                </div>
                <div style="display: flex; gap: 6px;">
                    ${!isTableQuestion ? `
                        <button
                            class="btn ghost mini"
                            data-action="toggle-termination-mode"
                            style="font-size: 11px; padding: 4px 8px;"
                            title="${mode === 'simple' ? 'Switch to Advanced Mode' : 'Switch to Simple Mode'}"
                        >
                            ${mode === 'simple' ? '⚙️ Advanced' : '◀️ Simple'}
                        </button>
                    ` : ''}
                    <button
                        class="btn ghost mini"
                        data-action="disable-global-termination"
                        style="font-size: 11px; padding: 4px 8px;"
                    >
                        ✕ Disable
                    </button>
                </div>
            </div>

            <!-- Builder UI -->
            ${isTableQuestion ? renderTableTerminationBuilder(termination, question) :
              (mode === 'simple' ? renderSimpleTerminationBuilder(termination, question) : renderAdvancedTerminationBuilder(termination, question))}
        </div>
    `;
}

/**
 * Simple Mode: Visual chip-based selection
 */
function renderSimpleTerminationBuilder(termination, question) {
    const options = question.options || [];
    const operator = termination.operator || 'OR';

    // Get selected option codes from conditions
    const selectedCodes = new Set();
    (termination.conditions || []).forEach(cond => {
        if (cond.type === 'include') {
            (cond.options || []).forEach(code => selectedCodes.add(code));
        }
    });

    return `
        <div class="simple-termination-builder">
            <!-- Operator Toggle -->
            <div class="termination-operator-row" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 12px; color: var(--muted);">Terminate if respondent selects:</span>
                <div class="operator-toggle" style="display: inline-flex; border: 1px solid var(--line); border-radius: 4px; overflow: hidden;">
                    <button
                        class="operator-btn ${operator === 'OR' ? 'active' : ''}"
                        data-action="set-termination-operator"
                        data-operator="OR"
                        style="
                            padding: 4px 12px;
                            border: none;
                            background: ${operator === 'OR' ? 'var(--cue-primary)' : 'var(--surface-1)'};
                            color: ${operator === 'OR' ? 'white' : 'var(--text-2)'};
                            font-size: 11px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.15s ease;
                        "
                    >
                        ANY of these
                    </button>
                    <button
                        class="operator-btn ${operator === 'AND' ? 'active' : ''}"
                        data-action="set-termination-operator"
                        data-operator="AND"
                        style="
                            padding: 4px 12px;
                            border: none;
                            background: ${operator === 'AND' ? 'var(--cue-primary)' : 'var(--surface-1)'};
                            color: ${operator === 'AND' ? 'white' : 'var(--text-2)'};
                            font-size: 11px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.15s ease;
                        "
                    >
                        ALL of these
                    </button>
                </div>
            </div>

            <!-- Option Chips -->
            <div class="termination-options-grid" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
                ${options.map(opt => {
                    const isSelected = selectedCodes.has(opt.code);
                    return `
                        <button
                            class="option-chip ${isSelected ? 'selected' : ''}"
                            data-action="toggle-termination-option"
                            data-option-code="${opt.code}"
                            style="
                                padding: 6px 12px;
                                border: 1px solid ${isSelected ? 'var(--cue-primary)' : 'var(--line)'};
                                border-radius: 4px;
                                background: ${isSelected ? 'var(--cue-primary)' : 'var(--surface-1)'};
                                color: ${isSelected ? 'white' : 'var(--text-1)'};
                                font-size: 12px;
                                cursor: pointer;
                                transition: all 0.15s ease;
                                display: flex;
                                align-items: center;
                                gap: 6px;
                            "
                        >
                            <span class="chip-checkbox" style="
                                width: 14px;
                                height: 14px;
                                border-radius: 3px;
                                border: 1px solid ${isSelected ? 'white' : 'var(--line)'};
                                background: ${isSelected ? 'white' : 'transparent'};
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 10px;
                                color: var(--cue-primary);
                            ">
                                ${isSelected ? '✓' : ''}
                            </span>
                            <span>${opt.code}. ${opt.label}</span>
                        </button>
                    `;
                }).join('')}
            </div>

            ${selectedCodes.size === 0 ? `
                <p style="margin: 8px 0 0 0; color: var(--muted); font-size: 11px; text-align: center;">
                    Click options above to select termination conditions
                </p>
            ` : ''}
        </div>
    `;
}

/**
 * Advanced Mode: Row-based condition builder
 */
function renderAdvancedTerminationBuilder(termination, question) {
    const options = question.options || [];
    const conditions = termination.conditions || [];
    const globalOperator = termination.operator || 'AND';

    return `
        <div class="advanced-termination-builder">
            <p style="margin: 0 0 12px 0; font-size: 11px; color: var(--muted);">
                Build complex conditions with include/exclude logic
            </p>

            <!-- Conditions List -->
            <div class="termination-conditions-list" style="display: flex; flex-direction: column; gap: 8px;">
                ${conditions.length > 0 ? conditions.map((cond, idx) => `
                    <div class="termination-condition-row" style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px;
                        background: var(--surface-1);
                        border: 1px solid var(--line);
                        border-radius: 4px;
                    ">
                        <!-- Row Number -->
                        ${idx > 0 ? `
                            <div class="condition-operator" style="
                                font-size: 10px;
                                font-weight: 700;
                                color: var(--cue-primary);
                                background: var(--surface-2);
                                padding: 2px 6px;
                                border-radius: 3px;
                                cursor: pointer;
                            " data-action="toggle-row-operator" data-row-index="${idx}">
                                ${globalOperator}
                            </div>
                        ` : ''}

                        <!-- Include/Exclude Toggle -->
                        <button
                            class="type-toggle ${cond.type === 'include' ? 'include' : 'exclude'}"
                            data-action="toggle-condition-type"
                            data-condition-index="${idx}"
                            style="
                                padding: 4px 10px;
                                border: 1px solid var(--line);
                                border-radius: 4px;
                                background: ${cond.type === 'exclude' ? '#ff4444' : 'var(--cue-primary)'};
                                color: white;
                                font-size: 10px;
                                font-weight: 600;
                                cursor: pointer;
                                flex-shrink: 0;
                            "
                        >
                            ${cond.type === 'exclude' ? 'NOT' : 'IS'}
                        </button>

                        <!-- Condition Content -->
                        <div style="flex: 1; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                            ${(cond.options || []).map(code => {
                                const opt = options.find(o => o.code === code);
                                return opt ? `
                                    <span class="condition-option-tag" style="
                                        padding: 3px 8px;
                                        background: var(--surface-2);
                                        border-radius: 3px;
                                        font-size: 11px;
                                        display: flex;
                                        align-items: center;
                                        gap: 4px;
                                    ">
                                        <span>${opt.code}. ${opt.label}</span>
                                        <button
                                            data-action="remove-option-from-condition"
                                            data-condition-index="${idx}"
                                            data-option-code="${code}"
                                            style="
                                                background: none;
                                                border: none;
                                                color: var(--muted);
                                                cursor: pointer;
                                                padding: 0;
                                                font-size: 10px;
                                            "
                                        >✕</button>
                                    </span>
                                ` : '';
                            }).join('')}

                            ${(cond.options || []).length > 1 ? `
                                <span class="multi-operator" style="
                                    font-size: 10px;
                                    color: var(--muted);
                                    font-weight: 600;
                                    cursor: pointer;
                                    padding: 2px 6px;
                                    background: var(--surface-2);
                                    border-radius: 3px;
                                " data-action="toggle-condition-operator" data-condition-index="${idx}">
                                    (${cond.operator || 'OR'})
                                </span>
                            ` : ''}

                            <button
                                class="btn ghost mini"
                                data-action="add-option-to-condition"
                                data-condition-index="${idx}"
                                style="font-size: 11px; padding: 2px 6px;"
                            >+ Option</button>
                        </div>

                        <!-- Remove Button -->
                        <button
                            class="btn ghost mini"
                            data-action="remove-termination-condition-adv"
                            data-condition-index="${idx}"
                            style="font-size: 11px; padding: 4px 6px; color: var(--danger);"
                        >✕</button>
                    </div>
                `).join('') : `
                    <div style="padding: 16px; text-align: center; color: var(--muted); font-size: 12px;">
                        No conditions added yet
                    </div>
                `}
            </div>

            <!-- Add Condition Button -->
            <button
                class="btn ghost small"
                data-action="add-termination-condition-adv"
                style="width: 100%; margin-top: 8px; font-size: 12px;"
            >
                <span style="margin-right: 4px;">+</span> Add Condition
            </button>
        </div>
    `;
}

/**
 * Table/Grid Termination Builder with Presets
 */
function renderTableTerminationBuilder(termination, question) {
    const rows = question.grid?.rows || [];
    const cols = question.grid?.cols || [];
    const pattern = termination.tablePattern || 'custom';

    // Detect if this is a Likert scale
    const isLikert = cols.some(col => /agree|disagree|strongly|somewhat|neither/i.test(col));
    const isSatisfaction = cols.some(col => /satisfied|dissatisfied/i.test(col));

    // Common presets for Likert scales
    const likertPresets = [
        { value: 'must_t2b_any', label: 'Must be T2B (Agree) for at least 1 statement', desc: 'Terminate if codes 1-3 selected for ALL statements' },
        { value: 'must_t2b_all', label: 'Must be T2B (Agree) for ALL statements', desc: 'Terminate if codes 1-3 selected for any statement' },
        { value: 'cannot_b2b_all', label: 'Cannot be B2B (Disagree) for all statements', desc: 'Terminate if codes 1-2 selected for ALL statements' },
        { value: 'cannot_neutral_all', label: 'Cannot be Neutral for all statements', desc: 'Terminate if code 3 selected for ALL statements' },
        { value: 'custom', label: 'Custom rule...', desc: 'Build your own logic' }
    ];

    const satisfactionPresets = [
        { value: 'must_t2b_any', label: 'Must be T2B (Satisfied) for at least 1 statement', desc: 'Terminate if codes 1-3 selected for ALL statements' },
        { value: 'must_t2b_all', label: 'Must be T2B (Satisfied) for ALL statements', desc: 'Terminate if codes 1-3 selected for any statement' },
        { value: 'cannot_b2b_all', label: 'Cannot be B2B (Dissatisfied) for all statements', desc: 'Terminate if codes 1-2 selected for ALL statements' },
        { value: 'custom', label: 'Custom rule...', desc: 'Build your own logic' }
    ];

    const presets = isLikert ? likertPresets : (isSatisfaction ? satisfactionPresets : [
        { value: 'custom', label: 'Custom rule...', desc: 'Build your own logic' }
    ]);

    return `
        <div class="table-termination-builder">
            <!-- Preset Patterns -->
            ${presets.length > 1 ? `
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-2); margin-bottom: 6px;">
                        Common Patterns
                    </label>
                    <select
                        class="form-control"
                        data-action="set-table-termination-pattern"
                        style="font-size: 12px; padding: 8px;"
                    >
                        ${presets.map(preset => `
                            <option value="${preset.value}" ${pattern === preset.value ? 'selected' : ''}>
                                ${preset.label}
                            </option>
                        `).join('')}
                    </select>
                    ${pattern !== 'custom' ? `
                        <p style="margin: 6px 0 0 0; font-size: 10px; color: var(--muted); font-style: italic;">
                            ${presets.find(p => p.value === pattern)?.desc || ''}
                        </p>
                    ` : ''}
                </div>
            ` : ''}

            <!-- Custom Builder (only show if custom selected) -->
            ${pattern === 'custom' ? `
                <div class="custom-table-termination">
                    <p style="font-size: 11px; color: var(--muted); margin-bottom: 12px;">
                        Build custom table termination logic
                    </p>

                    <!-- Row Aggregation -->
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-2); margin-bottom: 6px;">
                            Apply to:
                        </label>
                        <select class="form-control" data-action="set-table-row-filter" style="font-size: 12px; padding: 8px;">
                            <option value="all" ${(termination.rowFilter || 'all') === 'all' ? 'selected' : ''}>All statements</option>
                            <option value="any" ${termination.rowFilter === 'any' ? 'selected' : ''}>Any statement</option>
                            <option value="specific" ${termination.rowFilter === 'specific' ? 'selected' : ''}>Specific statements...</option>
                        </select>
                    </div>

                    <!-- Column Codes -->
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-2); margin-bottom: 6px;">
                            Terminate if selected:
                        </label>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${cols.map((col, idx) => {
                                const code = (idx + 1).toString();
                                const selectedCodes = termination.columnCodes || [];
                                const isSelected = selectedCodes.includes(code);
                                return `
                                    <button
                                        class="option-chip ${isSelected ? 'selected' : ''}"
                                        data-action="toggle-table-column"
                                        data-column-code="${code}"
                                        style="
                                            padding: 6px 12px;
                                            border: 1px solid ${isSelected ? 'var(--cue-primary)' : 'var(--line)'};
                                            border-radius: 4px;
                                            background: ${isSelected ? 'var(--cue-primary)' : 'var(--surface-1)'};
                                            color: ${isSelected ? 'white' : 'var(--text-1)'};
                                            font-size: 11px;
                                            cursor: pointer;
                                            transition: all 0.15s ease;
                                        "
                                    >
                                        ${code}. ${col.length > 20 ? col.substring(0, 20) + '...' : col}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Specific Rows (if rowFilter is 'specific') -->
                    ${termination.rowFilter === 'specific' ? `
                        <div style="margin-bottom: 12px;">
                            <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-2); margin-bottom: 6px;">
                                Select statements:
                            </label>
                            <div style="display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; padding: 8px; background: var(--surface-1); border-radius: 4px;">
                                ${rows.map((row, idx) => {
                                    const rowCode = (idx + 1).toString();
                                    const selectedRows = termination.specificRows || [];
                                    const isSelected = selectedRows.includes(rowCode);
                                    return `
                                        <label style="display: flex; align-items: center; gap: 8px; font-size: 11px; cursor: pointer;">
                                            <input
                                                type="checkbox"
                                                data-action="toggle-table-row"
                                                data-row-code="${rowCode}"
                                                ${isSelected ? 'checked' : ''}
                                            />
                                            <span>${row}</span>
                                        </label>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Render human-readable equation
 */
function renderTerminationEquation(termination, question) {
    // Handle table questions
    if (question.mode === 'table' && termination.tablePattern) {
        const pattern = termination.tablePattern;
        let equationText = '';

        if (pattern === 'must_t2b_any') {
            equationText = 'Must be T2B for ≥1 statement';
        } else if (pattern === 'must_t2b_all') {
            equationText = 'Must be T2B for ALL statements';
        } else if (pattern === 'cannot_b2b_all') {
            equationText = 'Cannot be B2B for ALL statements';
        } else if (pattern === 'cannot_neutral_all') {
            equationText = 'Cannot be Neutral for ALL';
        } else if (pattern === 'custom') {
            const rowFilter = termination.rowFilter || 'all';
            const columnCodes = termination.columnCodes || [];
            equationText = `${columnCodes.join('|')} for ${rowFilter.toUpperCase()} rows`;
        }

        return `
            <code style="
                font-size: 10px;
                padding: 3px 8px;
                background: rgba(255, 87, 51, 0.1);
                border: 1px solid rgba(255, 87, 51, 0.3);
                border-radius: 3px;
                color: #ff5733;
                font-family: monospace;
            ">${equationText}</code>
        `;
    }

    const conditions = termination.conditions || [];
    if (conditions.length === 0) {
        return `<span style="font-size: 11px; color: var(--muted);">(No conditions)</span>`;
    }

    const mode = termination.mode || 'simple';
    const options = question.options || [];

    if (mode === 'simple') {
        // Simple mode: just list selected options with operator
        const selectedCodes = [];
        conditions.forEach(cond => {
            if (cond.type === 'include') {
                selectedCodes.push(...(cond.options || []));
            }
        });

        if (selectedCodes.length === 0) {
            return `<span style="font-size: 11px; color: var(--muted);">(No options selected)</span>`;
        }

        const operator = termination.operator || 'OR';
        const equation = selectedCodes.join(` ${operator} `);

        return `
            <code style="
                font-size: 10px;
                padding: 3px 8px;
                background: rgba(255, 87, 51, 0.1);
                border: 1px solid rgba(255, 87, 51, 0.3);
                border-radius: 3px;
                color: #ff5733;
                font-family: monospace;
            ">${equation}</code>
        `;
    } else {
        // Advanced mode: show full logic
        const parts = conditions.map((cond, idx) => {
            const optCodes = cond.options || [];
            const condOp = cond.operator || 'OR';
            const optStr = optCodes.length > 1 ? `(${optCodes.join(` ${condOp} `)})` : optCodes[0];
            return cond.type === 'exclude' ? `NOT ${optStr}` : optStr;
        });

        const globalOp = termination.operator || 'AND';
        const equation = parts.join(` ${globalOp} `);

        return `
            <code style="
                font-size: 10px;
                padding: 3px 8px;
                background: rgba(255, 87, 51, 0.1);
                border: 1px solid rgba(255, 87, 51, 0.3);
                border-radius: 3px;
                color: #ff5733;
                font-family: monospace;
                max-width: 400px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                display: inline-block;
            " title="${equation}">${equation}</code>
        `;
    }
}

/**
 * Render global must-select (similar structure)
 */
export function renderGlobalMustSelect(question) {
    const mustSelect = question.globalMustSelect || { enabled: false, conditions: [] };

    if (!mustSelect.enabled) {
        return `
            <div class="must-select-disabled" style="padding: 12px; background: var(--surface-2); border-radius: 6px; text-align: center;">
                <p style="margin: 0 0 8px 0; color: var(--muted); font-size: 12px;">No required selections for this question</p>
                <button class="btn ghost small" data-action="enable-global-must-select" style="font-size: 12px;">
                    <span style="margin-right: 4px;">✓</span> Enable Must Select
                </button>
            </div>
        `;
    }

    // Similar to termination, but different actions
    return `
        <div class="must-select-builder" style="background: var(--surface-2); border-radius: 6px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: 600; font-size: 12px; color: var(--text-1);">✓ Must Select Active</span>
                <button class="btn ghost mini" data-action="disable-global-must-select" style="font-size: 11px; padding: 4px 8px;">
                    ✕ Disable
                </button>
            </div>
            <p style="margin: 0; font-size: 11px; color: var(--muted);">
                Respondent must select these options to continue
            </p>
            <!-- Add must-select UI here (similar to simple termination) -->
        </div>
    `;
}
