/**
 * Tab Plan Panel Component
 * Handles nets management in the tab plan section of the question editor
 */

import {
    ensureTabBucket,
    isNumericQuestion,
    isCodesQuestion,
    isLikertScale,
    generateT2BNets,
    createCodesNet,
    createRangeNet,
    addNet,
    updateNet,
    deleteNet,
    getQuestionOptions,
    getAllQuestionOptions,
    getOptionLabel,
    getNetSummaryText,
    validateNet
} from '../../../lib/tabPlanNets.js';

let currentEditingQuestion = null;

export function renderTabPlanPanel({ hostEl, question, questionIndex, actions }) {
    currentEditingQuestion = { question, questionIndex, actions };
    // Store actions globally for nets functions to access
    window.currentEditorActions = actions;

    // Ensure tab bucket exists
    ensureTabBucket(question);

    const nets = question.tab?.nets || [];
    const canAddNets = isNumericQuestion(question) || isCodesQuestion(question);
    const isLikert = isLikertScale(question);
    const canAutoGenerate = isLikert && nets.length === 0; // Only show auto-gen if no nets exist yet
    const options = getQuestionOptions(question);

    // COMPREHENSIVE DEBUG: log question details for Supabase analysis
    console.log('=== TAB PLAN SUPABASE DEBUG ===');
    console.log('Question ID:', question.id);
    console.log('Question type:', question.type);
    console.log('Question mode:', question.mode);
    console.log('Question text:', question.text);
    console.log('Question statements:', question.statements);
    console.log('Question scale:', JSON.stringify(question.scale, null, 2));
    console.log('Question grid:', JSON.stringify(question.grid, null, 2));
    console.log('Question options:', JSON.stringify(question.options, null, 2));
    console.log('Question numeric:', JSON.stringify(question.numeric, null, 2));
    console.log('Question validation:', JSON.stringify(question.validation, null, 2));
    console.log('Question tab:', JSON.stringify(question.tab, null, 2));
    console.log('Full question object:', JSON.stringify(question, null, 2));
    console.log('--- Detection Results ---');
    console.log('isNumeric:', isNumericQuestion(question));
    console.log('isCodesQuestion:', isCodesQuestion(question));
    console.log('isLikertScale:', isLikert);
    console.log('canAddNets:', canAddNets);
    console.log('canAutoGenerate:', canAutoGenerate);
    console.log('getQuestionOptions result:', JSON.stringify(options, null, 2));
    console.log('getAllQuestionOptions result:', JSON.stringify(getAllQuestionOptions(question), null, 2));
    console.log('Nets:', JSON.stringify(nets, null, 2));
    console.log('================================');

    // Check tab visibility after render
    setTimeout(() => {
        const allTabContents = document.querySelectorAll('.tab-content');
        allTabContents.forEach((tab, i) => {
            console.log(`Tab ${i} active:`, tab.classList.contains('active'), 'content:', tab.textContent.substring(0, 50));
        });
    }, 200);

    hostEl.innerHTML = `
        <section class="editor-section nets-management-section">
            <div class="section-header">
                <div class="section-title-group">
                    <div class="section-icon">📊</div>
                    <h3 class="section-title">Nets Management</h3>
                </div>
                <div class="section-subtitle">Define grouped codes or numeric ranges for cross-tabulation</div>
            </div>

            ${!canAddNets ? `
                <div class="info-card">
                    <div class="info-card-icon">💡</div>
                    <div class="info-card-content">
                        <div class="info-card-title">Nets not available</div>
                        <div class="info-card-desc">Nets can only be created for single choice, multiple choice, grid, or numeric questions.</div>
                    </div>
                </div>
            ` : `
                <div class="nets-container">
                    <div class="nets-header">
                        <div class="nets-header-content">
                            <span class="nets-count">${nets.length} net${nets.length !== 1 ? 's' : ''} defined</span>
                            ${isLikert && nets.length === 0 ? '<span class="likert-badge">Likert Scale Detected</span>' : ''}
                        </div>
                        <div class="nets-header-actions">
                            ${canAutoGenerate ? `
                                <button id="auto-generate-btn" class="btn secondary auto-generate-btn">
                                    <span class="btn-icon">🎯</span>
                                    Auto-Generate T2B/B2B
                                </button>
                            ` : ''}
                            <button id="add-net-btn" class="btn primary add-net-btn">
                                <span class="btn-icon">+</span>
                                Add ${isNumericQuestion(question) ? 'Range' : 'Codes'} Net
                            </button>
                        </div>
                    </div>

                    <div id="nets-preview-host" class="nets-preview">
                        ${renderNetsPreview(nets, question)}
                    </div>
                </div>
            `}
        </section>
    `;

    // Wire up event handlers
    wireTabPlanEvents(hostEl, question, questionIndex, actions);
}

function renderNetsPreview(nets, question) {
    if (!nets.length) {
        return `
            <div class="nets-empty">
                <div class="empty-state-icon">🎯</div>
                <div class="empty-state-title">No nets defined</div>
                <div class="empty-state-desc">Create nets to group related options for better analysis</div>
            </div>
        `;
    }

    return `
        <div class="nets-list">
            ${nets.map((net, index) => {
                const summaryText = getNetSummaryText(net, question);
                const netLabel = net.label ? escapeHTML(net.label) : `Net ${index + 1}`;

                return `
                    <div class="net-card" data-net-index="${index}">
                        <div class="net-card-header">
                            <div class="net-card-title">
                                <span class="net-card-label">${netLabel}</span>
                                <span class="net-card-badge">${isNumericQuestion(question) ? 'Range' : 'Codes'}</span>
                            </div>
                            <div class="net-actions">
                                <button class="btn-icon" data-action="edit" data-net-index="${index}" title="Edit net">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 20h9"/>
                                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                    </svg>
                                </button>
                                <button class="btn-icon danger" data-action="delete" data-net-index="${index}" title="Delete net">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3,6 5,6 21,6"/>
                                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="net-card-content">
                            <div class="net-summary">${summaryText}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function wireTabPlanEvents(hostEl, question, questionIndex, actions) {
    // Auto-generate T2B/B2B button
    const autoGenerateBtn = hostEl.querySelector('#auto-generate-btn');
    if (autoGenerateBtn) {
        autoGenerateBtn.addEventListener('click', () => {
            console.log('Auto-generate T2B/B2B clicked for question:', {
                id: question.id,
                mode: question.mode,
                isLikert: isLikertScale(question),
                options: getQuestionOptions(question)
            });

            // Generate the nets
            const generatedNets = generateT2BNets(question);

            if (generatedNets.length > 0) {
                // Add both T2B and B2B nets
                generatedNets.forEach(net => {
                    addNet(questionIndex, net, currentEditingQuestion?.actions?.onUpdateQuestion);
                });

                // Refresh the panel to show new nets
                refreshTabPlan();

                // Show success message
                console.log(`Generated ${generatedNets.length} T2B/B2B nets for Likert scale`);
            } else {
                console.warn('Failed to generate T2B/B2B nets');
                alert('Could not generate T2B/B2B nets for this question.');
            }
        });
    }

    // Add net button
    const addNetBtn = hostEl.querySelector('#add-net-btn');
    if (addNetBtn) {
        addNetBtn.addEventListener('click', () => {
            console.log('Add net button clicked for question:', {
                type: question.type,
                numeric: question.numeric,
                isNumeric: isNumericQuestion(question),
                isCodes: isCodesQuestion(question)
            });

            if (isNumericQuestion(question)) {
                console.log('Opening range net editor for numeric question');
                openRangeNetEditor(questionIndex);
            } else if (isCodesQuestion(question)) {
                console.log('Opening codes net editor for codes question');
                openCodesNetEditor(questionIndex);
            } else {
                console.warn('Question type not supported for nets:', question.type);
                alert('This question type does not support nets.');
            }
        });
    }

    // Net action buttons
    hostEl.addEventListener('click', (e) => {
        // Find the closest button with data attributes (handles SVG clicks)
        const button = e.target.closest('[data-action][data-net-index]');
        if (!button) return;

        const netIndex = parseInt(button.dataset.netIndex);
        const action = button.dataset.action;

        console.log('Net action clicked:', { action, netIndex, target: e.target, button });

        if (action === 'edit' && !isNaN(netIndex)) {
            editNet(questionIndex, netIndex);
        } else if (action === 'delete' && !isNaN(netIndex)) {
            if (confirm('Are you sure you want to delete this net?')) {
                deleteNet(questionIndex, netIndex, currentEditingQuestion?.actions?.onUpdateQuestion);
                refreshTabPlan();
            }
        }
    });

}

function editNet(questionIndex, netIndex) {
    const questions = window.state?.questions || [];
    const q = questions[questionIndex];
    const net = q.tab?.nets?.[netIndex];

    if (!net) return;

    if (net.kind === 'range' || isNumericQuestion(q)) {
        openRangeNetEditor(questionIndex, netIndex);
    } else {
        openCodesNetEditor(questionIndex, netIndex);
    }
}

function openCodesNetEditor(questionIndex, netIndex = null) {
    const questions = window.state?.questions || [];
    const q = questions[questionIndex];
    const isEditing = netIndex !== null;
    const net = isEditing ? q.tab.nets[netIndex] : { label: '', codes: [] };

    const options = getQuestionOptions(q);
    const selectedCodes = new Set(net.codes?.map(String) || []);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-panel" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3>📊 ${isEditing ? 'Edit Codes Net' : 'Add Codes Net'}</h3>
                <button class="icon-btn" id="net-close" aria-label="Close">✕</button>
            </div>

            <div class="modal-body">
                <div class="form-group">
                    <label>
                        <span>Net Label (Optional)</span>
                        <input id="net-label" type="text" placeholder="e.g., Manufacturer 1" value="${escapeHTML(net.label || '')}" />
                    </label>
                </div>

                <div class="form-group">
                    <label>
                        <span>Select Options to Include in Net</span>
                        <div class="options-list">
                            ${options.map(o => `
                                <label class="option-checkbox">
                                    <input type="checkbox" class="net-opt-cb" value="${o.code}" ${selectedCodes.has(String(o.code)) ? 'checked' : ''}/>
                                    <span>${escapeHTML(o.label)} <small class="muted">(${o.code})</small></span>
                                </label>
                            `).join('') || '<div class="form-hint">This question has no options to select.</div>'}
                        </div>
                    </label>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" id="net-cancel">Cancel</button>
                <button type="button" id="net-save" class="primary">Save Net</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Wire handlers
    modal.querySelector('#net-close').onclick = () => modal.remove();
    modal.querySelector('#net-cancel').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    modal.querySelector('#net-save').onclick = () => {
        const newLabel = modal.querySelector('#net-label').value.trim() || null;
        const newCodes = Array.from(modal.querySelectorAll('.net-opt-cb:checked')).map(cb => cb.value);

        if (newCodes.length === 0) {
            alert('Please select at least one option.');
            return;
        }

        const newNet = createCodesNet({ label: newLabel, codes: newCodes });

        if (isEditing) {
            updateNet(questionIndex, netIndex, newNet, currentEditingQuestion?.actions?.onUpdateQuestion);
        } else {
            addNet(questionIndex, newNet, currentEditingQuestion?.actions?.onUpdateQuestion);
        }

        modal.remove();
        refreshTabPlan();
    };
}

function openRangeNetEditor(questionIndex, netIndex = null) {
    console.log('openRangeNetEditor called with questionIndex:', questionIndex, 'netIndex:', netIndex);

    const questions = window.state?.questions || [];
    const q = questions[questionIndex];
    const isEditing = netIndex !== null;
    const net = isEditing ? q.tab.nets[netIndex] : { operator: '-', value1: '', value2: '' };

    console.log('Range net editor - question:', q, 'net:', net);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-panel" onclick="event.stopPropagation()" style="width: min(500px, 92vw);">
            <div class="modal-header">
                <h3>📊 ${isEditing ? 'Edit Numeric Net' : 'Add Numeric Net'}</h3>
                <button class="icon-btn" id="net-close" aria-label="Close">✕</button>
            </div>

            <div class="modal-body">
                <div class="form-group">
                    <label>
                        <span>Net Label (Optional)</span>
                        <input id="net-label" type="text" placeholder="e.g., Ages 18-34" value="${escapeHTML(net.label || '')}" />
                    </label>
                </div>

                <div class="form-group">
                    <label>
                        <span>Range Definition</span>
                        <div class="range-inputs">
                            <input id="net-value1" type="number" placeholder="Value" value="${net.value1 ?? ''}" />

                            <select id="net-operator">
                                <option value="-" ${net.operator === '-' ? 'selected' : ''}>to (range)</option>
                                <option value="exact" ${net.operator === 'exact' ? 'selected' : ''}>(exact)</option>
                                <option value="+" ${net.operator === '+' ? 'selected' : ''}>+ (and above)</option>
                                <option value="<" ${net.operator === '<' ? 'selected' : ''}>&lt; (less than)</option>
                                <option value=">" ${net.operator === '>' ? 'selected' : ''}>&gt; (greater than)</option>
                                <option value="<=" ${net.operator === '<=' ? 'selected' : ''}>≤ (less than or equal)</option>
                                <option value=">=" ${net.operator === '>=' ? 'selected' : ''}>≥ (greater than or equal)</option>
                            </select>

                            <input id="net-value2" type="number" placeholder="Max" value="${net.value2 ?? ''}" />
                        </div>
                    </label>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" id="net-cancel">Cancel</button>
                <button type="button" id="net-save" class="primary">Save Net</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const value1Input = modal.querySelector('#net-value1');
    const value2Input = modal.querySelector('#net-value2');
    const operatorSelect = modal.querySelector('#net-operator');

    // Function to toggle the second input box
    const toggleSecondInput = () => {
        const needsSecondValue = operatorSelect.value === '-';
        value2Input.style.display = needsSecondValue ? 'block' : 'none';
        value2Input.required = needsSecondValue;
    };

    toggleSecondInput();
    operatorSelect.addEventListener('change', toggleSecondInput);

    // Wire handlers
    modal.querySelector('#net-close').onclick = () => modal.remove();
    modal.querySelector('#net-cancel').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    modal.querySelector('#net-save').onclick = () => {
        const newLabel = modal.querySelector('#net-label').value.trim() || null;
        const operator = operatorSelect.value;
        const val1 = value1Input.value;
        const val2 = value2Input.value;

        if (!val1 || val1 === '') {
            alert('Please enter a value.');
            return;
        }

        if (operator === '-' && (!val2 || val2 === '')) {
            alert('Please enter both min and max values for a range.');
            return;
        }

        const newNet = createRangeNet({
            label: newLabel,
            operator: operator,
            value1: Number(val1),
            value2: operator === '-' ? Number(val2) : null
        });

        if (isEditing) {
            updateNet(questionIndex, netIndex, newNet, currentEditingQuestion?.actions?.onUpdateQuestion);
        } else {
            addNet(questionIndex, newNet, currentEditingQuestion?.actions?.onUpdateQuestion);
        }

        modal.remove();
        refreshTabPlan();
    };

    // Focus first input
    setTimeout(() => value1Input.focus(), 100);
}

function refreshTabPlan() {
    if (currentEditingQuestion) {
        const { question, questionIndex, actions } = currentEditingQuestion;
        const hostEl = document.querySelector('.tab-content.active .editor-section');
        if (hostEl) {
            renderTabPlanPanel({ hostEl, question, questionIndex, actions });
        }
    }
}

function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]));
}