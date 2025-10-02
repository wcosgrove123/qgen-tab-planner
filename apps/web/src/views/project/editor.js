import { renderEditorSidebar } from './editor/editorSidebar.js';
import { renderEditorPanel } from './editor/editorPanel.js';
import { saveProject } from '../../api/projects.js';
import { logActivity, ACTIVITY_TYPES } from '../../lib/activityLogger.js';
import { editorCore } from './editor/editorCore.js';

// --- STATE MANAGEMENT & HELPERS ---

function queueAutosave() {
    clearTimeout(window._autosaveTimer);
    window._autosaveTimer = setTimeout(() => {
        // Validate before saving to prevent database conflicts
        const isValid = validateProjectData();
        if (!isValid) {
            console.warn('⚠️ Invalid data detected, auto-fixing before save...');
            fixDuplicateQuestionIds(window.state?.questions || []);

            // Re-validate after fix
            const isValidAfterFix = validateProjectData();
            if (!isValidAfterFix) {
                console.error('❌ Cannot auto-fix data. Save blocked to prevent database conflicts.');
                return;
            }
        }

        saveProject(window.state, window.ui_state);
    }, 600);
}

/**
 * UNIFIED UPDATE HANDLER
 *
 * This is the ONE function for handling all user actions in the editor.
 * It provides consistent behavior for autosave and re-rendering.
 *
 * @param {Function} callback - The actual action to perform (e.g., add question, delete option)
 * @param {Object} options - Configuration for the update behavior
 * @param {boolean} options.rerender - Whether to trigger full UI re-render (default: true)
 * @param {boolean} options.autosave - Whether to trigger autosave (default: true)
 *
 * WHEN TO USE EACH OPTION:
 *
 * rerender: true, autosave: true (DEFAULT - use for 95% of cases)
 * - Adding/deleting/modifying questions
 * - Adding/deleting/modifying options
 * - Any data changes that need to be saved and reflected in UI
 *
 * rerender: false, autosave: false (RARE - only for pure UI interactions)
 * - Selecting different questions (handleSelectQuestion does its own custom re-render)
 * - Pure UI state that doesn't affect data and handles its own rendering
 */
function handleUpdate(callback, options = {}) {
    const { rerender = true, autosave = true } = options;

    return (...args) => {
        callback(...args);

        if (autosave) {
            queueAutosave();
        }

        if (rerender) {
            const hostEl = document.getElementById('prefield-content-host');
            if (hostEl) {
                // Preserve UI state before re-rendering
                preserveUIState();
                renderEditor(hostEl);
                // Restore UI state after re-rendering
                setTimeout(restoreUIState, 0);
            }
        }
    };
}

// Preserve open/closed state of collapsible sections
function preserveUIState() {
    window._preservedUIState = {
        expandedSections: [],
        openAdvancedPanels: [],
        expandedSidebarSections: [],
        fancyExpandableState: null
    };

    // Save expanded collapsible sections
    document.querySelectorAll('.collapsible-section.expanded').forEach(section => {
        const id = section.dataset.sectionId;
        if (id) window._preservedUIState.expandedSections.push(id);
    });

    // Save open advanced panels
    document.querySelectorAll('.advanced-options:not(.is-hidden)').forEach(panel => {
        const id = panel.id;
        if (id) window._preservedUIState.openAdvancedPanels.push(id);
    });

    // Save expanded sidebar sections (screener/main question lists)
    document.querySelectorAll('#screener-section.expanded, #main-section.expanded').forEach(section => {
        const id = section.id;
        if (id) window._preservedUIState.expandedSidebarSections.push(id);
    });

    // Save fancy expandable container state (logic-expanded/settings-expanded)
    const fancyContainer = document.querySelector('.fancy-expandable-container');
    if (fancyContainer) {
        if (fancyContainer.classList.contains('logic-expanded')) {
            window._preservedUIState.fancyExpandableState = 'logic-expanded';
        } else if (fancyContainer.classList.contains('settings-expanded')) {
            window._preservedUIState.fancyExpandableState = 'settings-expanded';
        }
    }
}

// Restore open/closed state after re-rendering
function restoreUIState() {
    if (!window._preservedUIState) return;

    // Restore expanded collapsible sections
    window._preservedUIState.expandedSections.forEach(sectionId => {
        const section = document.querySelector(`[data-section-id="${sectionId}"]`);
        if (section) section.classList.add('expanded');
    });

    // Restore open advanced panels
    window._preservedUIState.openAdvancedPanels.forEach(panelId => {
        const panel = document.getElementById(panelId);
        if (panel) panel.classList.remove('is-hidden');
    });

    // Restore expanded sidebar sections
    window._preservedUIState.expandedSidebarSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) section.classList.add('expanded');
    });

    // Restore fancy expandable container state
    if (window._preservedUIState.fancyExpandableState) {
        const fancyContainer = document.querySelector('.fancy-expandable-container');
        const logicSection = document.querySelector('[data-section-id="logic-flow"]');
        const settingsSection = document.querySelector('[data-section-id="question-settings"]');

        if (fancyContainer && logicSection && settingsSection) {
            if (window._preservedUIState.fancyExpandableState === 'logic-expanded') {
                fancyContainer.classList.add('logic-expanded');
                logicSection.classList.add('main-expanded');
                settingsSection.classList.add('side-panel', 'right');
                settingsSection.classList.remove('expanded', 'main-expanded');
            } else if (window._preservedUIState.fancyExpandableState === 'settings-expanded') {
                fancyContainer.classList.add('settings-expanded');
                settingsSection.classList.add('main-expanded');
                logicSection.classList.add('side-panel', 'left');
                logicSection.classList.remove('expanded', 'main-expanded');
            }
        }
    }
}

// Clear cached UI state (useful for resolving stuck states)
function clearUIStateCache() {
    window._preservedUIState = null;
    console.log('UI state cache cleared');
}

// Expose globally for debugging
window.clearUIStateCache = clearUIStateCache;

// Check for any data integrity issues before saving
function validateProjectData() {
    const questions = window.state?.questions || [];

    // Check for duplicate question IDs
    const questionIds = questions.map(q => q.id).filter(Boolean);
    const duplicateIds = questionIds.filter((id, index) => questionIds.indexOf(id) !== index);

    if (duplicateIds.length > 0) {
        console.error('DUPLICATE QUESTION IDs FOUND:', duplicateIds);
        console.error('All question IDs:', questionIds);
        console.error('Full questions data:', questions.map(q => ({ id: q.id, text: q.text?.substring(0, 50) })));

        // Attempt to fix duplicates by renumbering
        fixDuplicateQuestionIds(questions);
        return false; // Still return false to prevent save until user confirms
    }

    return true;
}

// Attempt to fix duplicate question IDs
function fixDuplicateQuestionIds(questions) {
    console.log('Attempting to fix duplicate question IDs...');

    const seenIds = new Set();
    const duplicatesFixed = [];

    questions.forEach((question, index) => {
        if (!question.id) {
            const prefix = index === 0 || questions[index-1]?.id?.startsWith('S') ? 'S' : 'Q';
            question.id = `${prefix}${nextNumber(prefix)}`;
            duplicatesFixed.push(`Added missing ID: ${question.id}`);
        } else if (seenIds.has(question.id)) {
            const oldId = question.id;
            const prefix = question.id.replace(/\d+.*$/, ''); // Extract prefix (S, Q, etc.)
            question.id = `${prefix}${nextNumber(prefix)}`;
            duplicatesFixed.push(`Changed ${oldId} → ${question.id}`);
        } else {
            seenIds.add(question.id);
        }
    });

    if (duplicatesFixed.length > 0) {
        console.log('Fixed duplicates:', duplicatesFixed);
        alert(`Fixed duplicate question IDs:\n${duplicatesFixed.join('\n')}\n\nPlease review and save again.`);
    }
}

// Debug function to check current questions
function debugQuestionIds() {
    const questions = window.state?.questions || [];
    console.log('Current questions:');
    questions.forEach((q, i) => {
        console.log(`${i}: ID="${q.id}" Text="${q.text?.substring(0, 30)}..."`);
    });

    const questionIds = questions.map(q => q.id).filter(Boolean);
    const duplicates = questionIds.filter((id, index) => questionIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
        console.warn('DUPLICATES FOUND:', duplicates);
    } else {
        console.log('No duplicates found');
    }
}

// Debug function to check groups
function debugGroups(questionIndex) {
    const questions = window.state?.questions || [];
    const qIndex = questionIndex !== undefined ? questionIndex : window.ui_state?.active_question_index;

    if (qIndex === null || qIndex === undefined || !questions[qIndex]) {
        console.log('No active question or invalid index:', qIndex);
        return;
    }

    const question = questions[qIndex];
    console.log(`=== Groups Debug for Question ${question.id} ===`);
    console.log('Full question object:', question);

    if (question.groups && question.groups.length > 0) {
        console.log('Stored groups:', question.groups);
        question.groups.forEach(group => {
            console.log(`Group "${group.name}":`, group.options, 'Created:', group.created);
        });
    } else {
        console.log('No stored groups array. question.groups =', question.groups);
    }

    // Show which options have group assignments
    const groupedOptions = question.options?.filter(opt => opt.medicationGroup) || [];
    if (groupedOptions.length > 0) {
        console.log('Options with group assignments:');
        groupedOptions.forEach(opt => {
            console.log(`- ${opt.label} → ${opt.medicationGroup}`);
        });
    } else {
        console.log('No options have group assignments');
    }

    // Check if the groups are in the stored state vs live state
    console.log('window.state reference:', window.state === window.state ? 'same' : 'different');
    console.log('questions array length:', questions.length);
}

// Force refresh question data from storage
function refreshQuestionData() {
    console.log('=== REFRESHING QUESTION DATA ===');

    // Check if there's a mismatch between what's saved and what's loaded
    const currentQuestion = window.state?.questions?.[window.ui_state?.active_question_index];
    if (currentQuestion) {
        console.log('Current question groups before refresh:', currentQuestion.groups);

        // Force a re-render to see if data gets refreshed
        const hostEl = document.getElementById('prefield-content-host');
        if (hostEl && window.renderEditor) {
            window.renderEditor(hostEl);
        }

        console.log('Current question groups after refresh:', currentQuestion.groups);
    }
}

// Emergency data debugging function
function emergencyDataDebug() {
    console.log('=== EMERGENCY DATA DEBUG ===');
    console.log('window.state:', window.state);
    console.log('window.state.questions:', window.state?.questions);
    console.log('window.state.project:', window.state?.project);
    console.log('window.ui_state:', window.ui_state);
    console.log('window.ui_state.active_project_id:', window.ui_state?.active_project_id);

    // Check localStorage
    console.log('localStorage keys:', Object.keys(localStorage));
    for (let key of Object.keys(localStorage)) {
        if (key.includes('project') || key.includes('question')) {
            console.log(`localStorage.${key}:`, localStorage.getItem(key));
        }
    }

    // Check if there's a backup or cached version
    if (window._backupState) {
        console.log('Found backup state:', window._backupState);
    }
}

// Expose for debugging
window.validateProjectData = validateProjectData;
window.fixDuplicateQuestionIds = () => fixDuplicateQuestionIds(window.state?.questions || []);
window.debugQuestionIds = debugQuestionIds;
window.debugGroups = debugGroups;
window.refreshQuestionData = refreshQuestionData;
window.emergencyDataDebug = emergencyDataDebug;

// Force validate and fix before saving
window.validateAndFixBeforeSave = function() {
    console.log('=== VALIDATING PROJECT DATA BEFORE SAVE ===');

    const isValid = validateProjectData();
    if (!isValid) {
        console.log('Validation failed, attempting auto-fix...');
        fixDuplicateQuestionIds(window.state?.questions || []);

        // Re-validate after fix
        const isValidAfterFix = validateProjectData();
        if (isValidAfterFix) {
            console.log('✅ Auto-fix successful! Data is now valid.');
            return true;
        } else {
            console.error('❌ Auto-fix failed. Manual intervention required.');
            return false;
        }
    } else {
        console.log('✅ Data is valid, ready to save.');
        return true;
    }
};

// --- LOGIC HELPERS ---

function nextNumber(prefix) {
    let n = 1;
    const questions = window.state.questions || [];
    while (questions.some(q => q.id === (prefix + n))) { n++; }
    return n;
}

function harmonizeTypeFromMode(q) {
    if (!q) return;
    const mode = q.mode || 'list';
    if (mode === 'table' && !q.type?.startsWith('grid_')) {
        q.type = 'grid_single';
    } else if (mode === 'repeated') {
        q.type = 'repeated_measures';
    }
    // Add other harmonization rules as needed
}

// --- ACTION HANDLERS ---

// CUSTOM PARTIAL RE-RENDER: This doesn't use full re-render because it does its own
// selective rendering of just the editor panel (for performance when switching questions)
const handleSelectQuestion = handleUpdate((index) => {
    // Update the active question index
    window.ui_state.active_question_index = index;

    // Update sidebar highlights directly without re-rendering
    updateSidebarSelection(index);

    // Only re-render the main editor panel (not the sidebar)
    const panelHost = document.getElementById('editor-panel-host');
    if (panelHost) {
        renderEditorPanel({
            hostEl: panelHost,
            question: window.state.questions[index],
            questionIndex: index,
            activeTab: window.ui_state.active_tab || 'main',
            actions: getAllEditorActions()
        });
    }
}, { rerender: false, autosave: false });

const handleReorderQuestion = handleUpdate((fromIndex, toIndex) => {
    const { questions } = window.state;
    const [moved] = questions.splice(fromIndex, 1);
    questions.splice(toIndex, 0, moved);
    window.ui_state.active_question_index = questions.findIndex(q => q === moved);
});

const handleAddQuestion = handleUpdate((type) => {
    if (!window.state.questions) window.state.questions = [];
    let id;
    const prefix = type.replace(/_H|_R/, '');
    const nextNum = nextNumber(prefix);

    switch (type) {
        case 'S': id = `S${nextNum}`; break;
        case 'Q': id = `Q${nextNum}`; break;
        case 'H': id = `Q${nextNum}_H`; break;
        case 'SH': id = `S${nextNum}_H`; break;
        case 'R': id = `Q${nextNum}_R`; break;
        case 'QC':
            const qcNum = nextNumber('QC_');
            id = `QC_${qcNum}`;
            break;
        case 'SQC':
            const sqcNum = nextNumber('SQC_');
            id = `SQC_${sqcNum}`;
            break;
        case 'TXT':
            const txtNum = nextNumber('TXT_');
            id = `TXT_${txtNum}`;
            break;
        case 'STXT':
            const stxtNum = nextNumber('STXT_');
            id = `STXT_${stxtNum}`;
            break;
        default: id = `Q${nextNum}`;
    }

    let mode = 'list';
    let question_mode = 'single'; // Default to single unless it's a text question
    if (type === 'TXT' || type === 'STXT') {
        mode = 'text'; // Special text mode for pure text questions
        question_mode = 'text'; // Text questions have their own mode
    }

    const newQuestion = {
        id: id,
        type: 'single',
        mode: mode,
        question_mode: question_mode, // Explicitly set question_mode to 'single'
        text: '',
        options: []
    };
    window.state.questions.push(newQuestion);
    window.ui_state.active_question_index = window.state.questions.length - 1;

});

// DATA MODIFICATION: Deleting a question requires full re-render and autosave
const handleDeleteQuestion = handleUpdate((index) => {
    const questions = window.state?.questions;
    if (!questions || index < 0 || index >= questions.length) {
        console.error('Invalid question index for deletion:', index, 'Total questions:', questions?.length);
        return;
    }

    const questionId = questions[index]?.id || 'this question';
    if (!confirm(`Are you sure you want to delete question ${questionId}?`)) {
        return;
    }

    // Remove the question
    questions.splice(index, 1);

    // Update active index safely
    if (window.ui_state.active_question_index >= index) {
        const newIndex = Math.max(0, window.ui_state.active_question_index - 1);
        window.ui_state.active_question_index = questions.length > 0 ? newIndex : null;
    }
});

const handleDuplicateQuestion = handleUpdate((index) => {
    const original = window.state.questions[index];
    const newQuestion = JSON.parse(JSON.stringify(original));
    const prefix = original.id.startsWith('S') ? 'S' : 'Q';
    newQuestion.id = `${prefix}${nextNumber(prefix)}`;
    window.state.questions.splice(index + 1, 0, newQuestion);
    window.ui_state.active_question_index = index + 1;
});

const handleUpdateQuestion = handleUpdate((index, key, value) => {
    const question = window.state.questions[index];
    if (!question) return;

    if (key.includes('.')) {
        const keys = key.split('.');
        let obj = question;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]] = obj[keys[i]] || {};
        }
        obj[keys[keys.length - 1]] = value;
    } else {
        question[key] = value;
    }

    if (key === 'mode') {
        harmonizeTypeFromMode(question);
        if (value === 'table' && !question.grid) question.grid = { rows: [], cols: [] };
        if (value === 'repeated' && !question.repeated_measures) {
            question.repeated_measures = { enabled: true, source_qid: null, template: { fields: [] } };
        }
    }
});

// --- Mode-Specific & Advanced Actions ---

const onUpdateOption = handleUpdate((qIndex, optIndex, key, value) => {
    const option = window.state.questions[qIndex]?.options?.[optIndex];
    if (option) option[key] = value;
});

const onDeleteOption = handleUpdate((qIndex, optIndex) => {
    window.state.questions[qIndex]?.options?.splice(optIndex, 1);
});

const onAddOption = handleUpdate((qIndex) => {
    const q = window.state.questions[qIndex];
    if (!q.options) q.options = [];
    const nextCode = q.options.length ? Math.max(...q.options.map(o => parseInt(o.code, 10) || 0)) + 1 : 1;
    q.options.push({ code: nextCode, label: '' });
});

const onBulkAddOptions = handleUpdate((qIndex, text) => {
    const q = window.state.questions[qIndex];
    if (!q.options) q.options = [];
    const lines = text.split('\n').filter(line => line.trim() !== '');
    lines.forEach(line => {
        const nextCode = q.options.length ? Math.max(...q.options.map(o => parseInt(o.code, 10) || 0)) + 1 : 1;
        q.options.push({ code: nextCode, label: line.trim() });
    });
});

const onAddPresetOption = handleUpdate((qIndex, presetType) => {
    const q = window.state.questions[qIndex];
    if (!q.options) q.options = [];
    let nextCode = 97;
    const existingCodes = new Set(q.options.map(o => parseInt(o.code, 10)).filter(c => !isNaN(c)));
    while (existingCodes.has(nextCode)) nextCode++;
    const presets = { 'pna': { code: nextCode, label: "Prefer not to say", exclusive: true }, 'other': { code: nextCode, label: "Other (please specify)", anchor: 'bottom' }, 'na': { code: nextCode, label: "N/A", exclusive: true } };
    if (presets[presetType]) q.options.push(presets[presetType]);
});

// Table Actions
const onUpdateTableRow = handleUpdate((qIndex, rowIndex, value) => { window.state.questions[qIndex].grid.rows[rowIndex] = value; });
const onDeleteTableRow = handleUpdate((qIndex, rowIndex) => { window.state.questions[qIndex].grid.rows.splice(rowIndex, 1); });
const onAddTableRow = handleUpdate((qIndex) => { const q = window.state.questions[qIndex]; if (!q.grid) q.grid = { rows: [], cols: [] }; if (!Array.isArray(q.grid.rows)) q.grid.rows = []; q.grid.rows.push(''); });
const onUpdateTableCol = handleUpdate((qIndex, colIndex, value) => { window.state.questions[qIndex].grid.cols[colIndex] = value; });
const onDeleteTableCol = handleUpdate((qIndex, colIndex) => { window.state.questions[qIndex].grid.cols.splice(colIndex, 1); });
const onAddTableCol = handleUpdate((qIndex) => { const q = window.state.questions[qIndex]; if (!q.grid) q.grid = { rows: [], cols: [] }; if (!Array.isArray(q.grid.cols)) q.grid.cols = []; q.grid.cols.push(''); });
const onToggleDynamicCols = handleUpdate((qIndex) => { const q = window.state.questions[qIndex]; if (!q.grid) q.grid = { rows: [], cols: [] }; if (q.grid.columnSource) { delete q.grid.columnSource; } else { q.grid.columnSource = { qid: null, exclude: '' }; } });
const onUpdateColSource = handleUpdate((qIndex, key, value) => { const q = window.state.questions[qIndex]; if (q.grid?.columnSource) { q.grid.columnSource[key] = value; } });

// Numeric / Open End Actions
const onUpdateNumeric = handleUpdate((qIndex, key, value) => { const q = window.state.questions[qIndex]; if (!q.numeric) q.numeric = {}; const numVal = value === '' ? null : Number(value); q.numeric[key] = numVal; });
const onUpdateOpen = handleUpdate((qIndex, key, value) => { const q = window.state.questions[qIndex]; if (!q.open) q.open = {}; const val = value.trim(); q.open[key] = val === '' ? null : (isNaN(Number(val)) ? val : Number(val)); });

// Extended Numeric Actions
const onUpdateNumericType = handleUpdate((qIndex, type) => { const q = window.state.questions[qIndex]; if (!q.numeric) q.numeric = {}; q.numeric.type = type; if (type === 'ranges' && !q.numeric.ranges) q.numeric.ranges = []; });
const onAddNumericRange = handleUpdate((qIndex) => { const q = window.state.questions[qIndex]; if (!q.numeric) q.numeric = {}; if (!q.numeric.ranges) q.numeric.ranges = []; q.numeric.ranges.push({ label: '', operator: 'lt', value1: null, value2: null, unit: '', terminate: false }); });
const onDeleteNumericRange = handleUpdate((qIndex, rangeIndex) => { window.state.questions[qIndex]?.numeric?.ranges?.splice(rangeIndex, 1); });
const onUpdateNumericRange = handleUpdate((qIndex, rangeIndex, key, value) => { const range = window.state.questions[qIndex]?.numeric?.ranges?.[rangeIndex]; if (!range) return; if (key === 'value1' || key === 'value2') { range[key] = value === '' ? null : Number(value); } else { range[key] = value; } });
const onUpdateNumericRangeExtra = handleUpdate((qIndex, rangeIndex, key, value) => { const range = window.state.questions[qIndex]?.numeric?.ranges?.[rangeIndex]; if (range) range[key] = value; });
const onToggleGlobalTerminate = handleUpdate((qIndex) => { const q = window.state.questions[qIndex]; if (!q.numeric) q.numeric = {}; if (!q.numeric.globalTerminate) { q.numeric.globalTerminate = { enabled: true, operator: 'lt', value1: null, value2: null }; } else { q.numeric.globalTerminate.enabled = !q.numeric.globalTerminate.enabled; } });
const onUpdateGlobalTerminate = handleUpdate((qIndex, key, value) => { const q = window.state.questions[qIndex]; if (!q.numeric?.globalTerminate) return; if (key === 'value1' || key === 'value2') { q.numeric.globalTerminate[key] = value === '' ? null : Number(value); } else { q.numeric.globalTerminate[key] = value; } });

// Conditional Logic Actions
const onUpdateConditionMode = handleUpdate((qIndex, mode) => { const q = window.state.questions[qIndex]; if (!q.conditions) q.conditions = {}; q.conditions.mode = mode; if (mode === 'none') q.conditions.rules = []; });
const onAddConditionRule = handleUpdate((qIndex) => { const q = window.state.questions[qIndex]; if (!q.conditions) q.conditions = { mode: 'show_if', rules: [] }; if (!q.conditions.rules) q.conditions.rules = []; q.conditions.rules.push({ qid: '', operator: 'equals', values: [''] }); });
const onRemoveConditionRule = handleUpdate((qIndex, ruleIndex) => { window.state.questions[qIndex]?.conditions?.rules?.splice(ruleIndex, 1); });
const onUpdateConditionRule = handleUpdate((qIndex, ruleIndex, field, value) => { const rule = window.state.questions[qIndex]?.conditions?.rules?.[ruleIndex]; if (!rule) return; rule[field] = value; if (field === 'qid') rule.values = ['']; });

// Repeated Measures Actions
const onUpdateRepeatedSource = handleUpdate((qIndex, sourceQid) => { const q = window.state.questions[qIndex]; if (!q.repeated_measures) q.repeated_measures = {}; q.repeated_measures.source_qid = sourceQid || null; });
const onAddRepeatedField = handleUpdate((qIndex) => { const q = window.state.questions[qIndex]; if (!q.repeated_measures.template) q.repeated_measures.template = { fields: [] }; q.repeated_measures.template.fields.push({ label: '', type: 'text', options: [] }); });
const onDelRepeatedField = handleUpdate((qIndex, fieldIndex) => { window.state.questions[qIndex]?.repeated_measures?.template?.fields?.splice(fieldIndex, 1); });
const onUpdateRepeatedField = handleUpdate((qIndex, fieldIndex, property, value) => { const field = window.state.questions[qIndex]?.repeated_measures?.template?.fields?.[fieldIndex]; if (field) field[property] = value; });

// Validation Actions
const onUpdateValidation = handleUpdate((qIndex, key, value) => { const q = window.state.questions[qIndex]; if (!q.validation) q.validation = {}; q.validation[key] = value; });

// Direct option behavior update without re-render
const updateOptionBehaviorDirectly = (questionIndex, optionIndex, key, value) => {
    // Update the data
    const question = window.state.questions[questionIndex];
    const option = question.options[optionIndex];
    option[key] = value;

    // Update the visual state directly
    const toggleButton = document.querySelector(`[data-opt-index="${optionIndex}"][data-key="${key}"]`);
    if (toggleButton) {
        // Update button appearance
        const isActive = value;
        toggleButton.classList.toggle('checked', isActive);

        // Update background and colors
        if (isActive) {
            toggleButton.style.background = 'var(--accent)';
            toggleButton.style.color = 'white';
            toggleButton.style.borderColor = 'var(--accent)';
        } else {
            toggleButton.style.background = 'var(--surface-2)';
            toggleButton.style.color = 'var(--text-1)';
            toggleButton.style.borderColor = 'var(--line)';
        }

        // Update data attribute for next toggle
        toggleButton.setAttribute('data-current', value.toString());
    }

    // Trigger autosave
    queueAutosave();
};

// Expose the direct update function globally
window.updateOptionBehaviorDirectly = updateOptionBehaviorDirectly;

// Expose autosave function for direct UI updates
window.queueAutosave = queueAutosave;

// Expose render functions for the core system
window.renderEditor = renderEditor;
window.getAllEditorActions = getAllEditorActions;

// Expose renderEditorPanel - make sure this happens after import
window.renderEditorPanel = renderEditorPanel;
console.log('Exposing renderEditorPanel:', typeof renderEditorPanel);

// Update sidebar question selection without re-rendering
function updateSidebarSelection(activeIndex) {
    // Remove active class from all question items
    document.querySelectorAll('.question-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to the selected question
    const selectedItem = document.querySelector(`.question-item[data-index="${activeIndex}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
}

// Get all editor actions for the panel
function getAllEditorActions() {
    return {
        onUpdateQuestion: handleUpdateQuestion,
        onDeleteQuestion: handleDeleteQuestion,
        onDuplicateQuestion: handleDuplicateQuestion,
        onAddOption, onDeleteOption, onUpdateOption, onBulkAddOptions, onAddPresetOption,
        onUpdateTableRow, onDeleteTableRow, onAddTableRow,
        onUpdateTableCol, onDeleteTableCol, onAddTableCol,
        onToggleDynamicCols, onUpdateColSource,
        onUpdateNumeric, onUpdateOpen, onSetTab,
        onUpdateNumericType, onAddNumericRange, onDeleteNumericRange, onUpdateNumericRange, onUpdateNumericRangeExtra,
        onToggleGlobalTerminate, onUpdateGlobalTerminate,
        onUpdateConditionMode, onAddConditionRule, onRemoveConditionRule, onUpdateConditionRule,
        onUpdateRepeatedSource, onAddRepeatedField, onDelRepeatedField, onUpdateRepeatedField,
        onUpdateValidation
    };
}

// Tab Plan Actions
const onSetTab = handleUpdate((tab) => {
    window.ui_state.active_tab = tab;
});

// --- MAIN RENDER FUNCTION ---

// Load modern editor styles
function loadEditorStyles() {
    if (!document.querySelector('link[href*="editorStyles.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './src/views/project/editor/editorStyles.css';
        document.head.appendChild(link);
        console.log('📝 Loaded modern editor styles');
    }
}

export function renderEditor(hostEl) {
    // Load styles on first render
    loadEditorStyles();

    hostEl.id = 'prefield-content-host';
    const questions = window.state.questions || [];
    const activeIndex = window.ui_state.active_question_index;
    const activeQuestion = (activeIndex !== null && questions[activeIndex]) ? questions[activeIndex] : null;

    hostEl.innerHTML = `
        <div class="editor-main-content">
            <aside id="editor-sidebar-host"></aside>
            <main id="editor-panel-host" class="editor-panel-card"></main>
        </div>
    `;

    const sidebarHost = hostEl.querySelector('#editor-sidebar-host');
    const panelHost = hostEl.querySelector('#editor-panel-host');

    renderEditorSidebar({
        hostEl: sidebarHost,
        questions: questions,
        activeIndex: activeIndex,
        onSelectQuestion: handleSelectQuestion,
        onReorderQuestion: handleReorderQuestion,
        onAddQuestion: handleAddQuestion
    });

    // Apply status-based styling to the sidebar after it's rendered
    setTimeout(() => {
        const projectStatus = window.state?.project?.status;
        const editorSidebar = document.querySelector('#editor-sidebar-host');

        if (editorSidebar) {
            // Remove any existing status classes
            editorSidebar.classList.remove('status-draft', 'status-active', 'status-fielding', 'status-reporting', 'status-waiting-for-approval', 'status-archived');

            // Add the appropriate status class
            if (projectStatus) {
                const statusClass = `status-${projectStatus.toLowerCase().replace(/\s+/g, '-')}`;
                editorSidebar.classList.add(statusClass);
            } else {
                // Default to draft if no status
                editorSidebar.classList.add('status-draft');
            }
        }
    }, 0);

    if (activeQuestion) {
        renderEditorPanel({
            hostEl: panelHost,
            question: activeQuestion,
            questionIndex: activeIndex,
            activeTab: window.ui_state.active_tab || 'main',
            actions: {
                onUpdateQuestion: handleUpdateQuestion,
                onDeleteQuestion: handleDeleteQuestion,
                onDuplicateQuestion: handleDuplicateQuestion,
                onAddOption, onDeleteOption, onUpdateOption, onBulkAddOptions, onAddPresetOption,
                onUpdateTableRow, onDeleteTableRow, onAddTableRow,
                onUpdateTableCol, onDeleteTableCol, onAddTableCol,
                onToggleDynamicCols, onUpdateColSource,
                onUpdateNumeric, onUpdateOpen, onSetTab,
                onUpdateNumericType, onAddNumericRange, onDeleteNumericRange, onUpdateNumericRange, onUpdateNumericRangeExtra,
                onToggleGlobalTerminate, onUpdateGlobalTerminate,
                onUpdateConditionMode, onAddConditionRule, onRemoveConditionRule, onUpdateConditionRule,
                onUpdateRepeatedSource, onAddRepeatedField, onDelRepeatedField, onUpdateRepeatedField,
                onUpdateValidation
            }
        });
    } else {
        panelHost.innerHTML = `
            <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; text-align:center; padding: 40px;">
                <svg style="width: 48px; height: 48px; color: var(--muted); margin-bottom: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l-4 4-4-4M6 16l-4-4 4-4"></path></svg>
                <h3 style="font-size: 18px; margin: 0 0 8px 0;">No Question Selected</h3>
                <p style="color: var(--muted);">Select a question from the list on the left to begin editing.</p>
            </div>
        `;
    }
}