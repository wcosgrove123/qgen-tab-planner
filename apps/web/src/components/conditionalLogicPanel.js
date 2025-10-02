/**
 * conditionalLogicPanel.js
 *
 * PROGRESSIVE DISCLOSURE CONDITIONAL LOGIC INTERFACE
 * Three levels of complexity: Simple → Smart Setup → Advanced
 * Reduces cognitive load for new users while preserving power-user features.
 */

import {
  OPERATORS,
  LOGICAL_OPERATORS,
  createEmptyConditionRule,
  createDefaultConditions,
  validateConditionRule,
  getAvailableSourceQuestions,
  getConditionsDescription,
  getConditionRuleDescription,
  getOperatorsForQuestionType,
  getQuestionConditionalSupport
} from '../lib/conditionalLogic.js';
import { autoConfigureConditional, evaluateRelationship } from '../lib/conditionalMapper.js';

/**
 * Renders the conditional logic panel for a question with progressive disclosure
 * @param {Object} question - The question being edited
 * @param {number} questionIndex - Index of the question in the questions array
 * @param {Function} onUpdate - Callback when conditions are updated
 * @returns {string} - HTML string for the conditional logic panel
 */
export function renderConditionalLogicPanel(question, questionIndex, onUpdate) {
  const conditions = question.conditions || createDefaultConditions();
  const availableQuestions = getAvailableSourceQuestions(questionIndex, window.state.questions);

  // Determine current UI mode based on conditions complexity
  const uiMode = getConditionalUIMode(conditions, availableQuestions);

  return renderConditionalByMode(uiMode, question, questionIndex, conditions, availableQuestions, onUpdate);
}

/**
 * Determines the appropriate UI mode based on current conditions
 */
function getConditionalUIMode(conditions, availableQuestions) {
  // Check if we're in a specific mode (stored in UI state)
  const storedMode = window.conditionalUIMode || 'simple';

  // Force simple mode if no previous questions available
  if (availableQuestions.length === 0) {
    return 'simple';
  }

  return storedMode;
}

/**
 * Renders conditional logic based on the current UI mode
 */
function renderConditionalByMode(mode, question, questionIndex, conditions, availableQuestions, onUpdate) {
  switch (mode) {
    case 'smart_setup':
      return renderSmartSetupMode(question, questionIndex, conditions, availableQuestions);
    case 'advanced':
      return renderAdvancedMode(question, questionIndex, conditions, availableQuestions);
    default:
      return renderSimpleMode(question, questionIndex, conditions, availableQuestions);
  }
}

/**
 * LEVEL 1: Simple Mode - Clean, non-intimidating interface
 */
function renderSimpleMode(question, questionIndex, conditions, availableQuestions) {
  const hasConditions = conditions.mode !== 'none' && conditions.rules?.length > 0;
  const canSetupConditions = availableQuestions.length > 0;

  return `
    <div class="conditional-logic-panel simple-mode">
      <style>
        .conditional-logic-panel.simple-mode {
          background: var(--surface-1);
          padding: 20px;
          transition: all 0.2s ease;
        }
        .simple-header {
          margin-bottom: 20px;
        }
        .simple-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-1);
          margin-bottom: 6px;
        }
        .simple-description {
          font-size: 13px;
          color: var(--muted);
        }
        .simple-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        .simple-option {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s;
          background: var(--surface-1);
        }
        .simple-option:hover {
          border-color: var(--accent);
          background: var(--surface-2);
        }
        .simple-option.selected {
          border-color: var(--accent);
          background: rgba(var(--accent-rgb, 59, 130, 246), 0.08);
        }
        .simple-option.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .simple-option.disabled input {
          cursor: not-allowed;
        }
        .simple-option input[type="radio"] {
          margin-top: 1px;
          width: 16px;
          height: 16px;
        }
        .simple-option-content {
          flex: 1;
        }
        .simple-option-title {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 2px;
          line-height: 1.3;
        }
        .simple-option-description {
          font-size: 11px;
          color: var(--muted);
          line-height: 1.3;
        }
        .simple-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--line);
          transition: opacity 0.2s ease;
        }
        .simple-preview {
          padding: 12px;
          background: var(--surface-3);
          border-radius: var(--radius-md);
          font-size: 13px;
          color: var(--muted);
          margin-top: 16px;
          border-left: 3px solid var(--accent);
        }
        .btn.simple {
          padding: 8px 16px;
          font-size: 13px;
        }
      </style>

      <div class="simple-header">
        <div class="simple-title">Conditional Logic</div>
        <div class="simple-description">Control when this question appears</div>
      </div>

      <div class="simple-options">
        <label class="simple-option ${!hasConditions ? 'selected' : ''}">
          <input type="radio" name="conditional-mode" value="always" ${!hasConditions ? 'checked' : ''}
                 data-action="set-simple-mode" data-mode="always">
          <div class="simple-option-content">
            <div class="simple-option-title">Always show this question</div>
            <div class="simple-option-description">Question appears for all respondents</div>
          </div>
        </label>

        <label class="simple-option ${hasConditions ? 'selected' : ''} ${!canSetupConditions ? 'disabled' : ''}"
               ${!canSetupConditions ? 'title="Add questions before this one to enable conditional logic"' : ''}>
          <input type="radio" name="conditional-mode" value="conditional" ${hasConditions ? 'checked' : ''} ${!canSetupConditions ? 'disabled' : ''}
                 data-action="set-simple-mode" data-mode="conditional">
          <div class="simple-option-content">
            <div class="simple-option-title">Show only if previous answers match</div>
            <div class="simple-option-description">
              ${canSetupConditions ? 'Show based on responses to earlier questions' : 'Requires previous questions to be available'}
            </div>
          </div>
        </label>
      </div>

      ${hasConditions ? `
        <div class="simple-actions">
          <button class="btn ghost simple" data-action="switch-conditional-mode" data-target="smart_setup">
            🤖 Smart Setup
          </button>
          <button class="btn ghost simple" data-action="switch-conditional-mode" data-target="advanced">
            ⚙️ Advanced Rules
          </button>
        </div>
      ` : canSetupConditions ? `
        <div class="simple-actions">
          <button class="btn simple" data-action="switch-conditional-mode" data-target="smart_setup" style="background: var(--accent); color: white;">
            🤖 Smart Setup
          </button>
          <button class="btn ghost simple" data-action="switch-conditional-mode" data-target="advanced">
            ⚙️ Advanced Rules
          </button>
        </div>
      ` : ''}

      ${hasConditions ? `
        <div class="simple-preview">
          <strong>Current rule:</strong> ${getConditionsDescription(conditions, window.state.questions)}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * LEVEL 2: Smart Setup Mode - Guided, user-friendly interface
 */
function renderSmartSetupMode(question, questionIndex, conditions, availableQuestions) {
  const rule = conditions.rules?.[0] || createEmptyConditionRule();
  const sourceQuestion = availableQuestions.find(q => q.id === rule.source_qid);

  // Debug logging
  console.log('Smart Setup Debug:', {
    ruleSourceQid: rule.source_qid,
    foundSourceQuestion: sourceQuestion?.id,
    sourceQuestionText: sourceQuestion?.text,
    availableQuestionIds: availableQuestions.map(q => q.id),
    availableQuestionTexts: availableQuestions.map(q => `${q.id}: ${q.text?.substring(0, 30)}...`)
  });

  return `
    <div class="conditional-logic-panel smart-setup-mode">
      <style>
        .conditional-logic-panel.smart-setup-mode {
          background: var(--surface-1);
          padding: 20px;
          transition: all 0.2s ease;
        }
        .smart-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--line);
        }
        .smart-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-1);
        }
        .smart-back-btn {
          padding: 6px 12px;
          background: var(--surface-2);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 12px;
          color: var(--muted);
        }
        .smart-setup-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: opacity 0.2s ease;
        }
        .smart-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .smart-label {
          font-weight: 500;
          font-size: 14px;
          color: var(--text-1);
        }
        .smart-select {
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          background: var(--surface-1);
          font-size: 14px;
        }
        .smart-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 8px;
          max-height: 120px;
          overflow-y: auto;
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          background: var(--surface-1);
        }
        .smart-option {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .smart-actions {
          display: flex;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid var(--line);
        }
        .smart-preview {
          padding: 16px;
          background: rgba(var(--accent-rgb, 59, 130, 246), 0.1);
          border: 1px solid var(--accent);
          border-radius: var(--radius-md);
          font-size: 13px;
          margin-top: 16px;
        }
        .smart-options-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          background: var(--surface-1);
          max-height: 200px;
          overflow-y: auto;
        }
        .smart-option {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background-color 0.15s;
          font-size: 14px;
          line-height: 1.4;
          border: 1px solid transparent;
        }
        .smart-option:hover {
          background: var(--surface-2);
          border-color: var(--line);
        }
        .smart-option input[type="checkbox"] {
          margin: 0;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .smart-option span {
          flex: 1;
          word-wrap: break-word;
        }
      </style>

      <div class="smart-header">
        <button class="smart-back-btn" data-action="switch-conditional-mode" data-target="simple">
          ← Back
        </button>
        <div class="smart-title">🤖 Smart Setup</div>
      </div>

      <div class="smart-setup-form">
        <div class="smart-field">
          <label class="smart-label">Show this question when:</label>
          <select class="smart-select" data-action="update-smart-source" data-key="source_qid">
            <option value="">Select a previous question...</option>
            ${availableQuestions.map(q => {
              const typeIcon = getQuestionTypeIcon(q.type);
              const cleanText = q.text ? q.text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : 'Untitled Question';
              return `
                <option value="${q.id}" ${rule.source_qid === q.id ? 'selected' : ''}>
                  ${typeIcon} ${q.id}: ${truncateText(cleanText, 50)}
                </option>
              `;
            }).join('')}
          </select>
        </div>

        ${sourceQuestion ? `
          <div class="smart-field">
            <label class="smart-label">Equals any of these values:</label>
            ${renderSmartValueSelector(rule, sourceQuestion)}
          </div>
        ` : ''}

        ${rule.source_qid ? `
          <div class="smart-preview">
            <strong>Preview:</strong> Show if ${getConditionRuleDescription(rule, window.state.questions)}
          </div>
        ` : ''}
      </div>

      <div class="smart-actions">
        <button class="btn" data-action="apply-smart-setup" style="background: var(--accent); color: white;">
          Apply Rule
        </button>
        <button class="btn ghost" data-action="switch-conditional-mode" data-target="advanced">
          ⚙️ Advanced Rules
        </button>
      </div>
    </div>
  `;
}

/**
 * Renders the value selector for smart setup mode
 */
function renderSmartValueSelector(rule, sourceQuestion) {
  if (!sourceQuestion.options || sourceQuestion.options.length === 0) {
    return `
      <input type="text"
             placeholder="Enter value..."
             class="smart-select"
             value="${rule.values?.[0] || ''}"
             data-action="update-smart-value"
             data-key="text_value">
    `;
  }

  const selectedValues = rule.values || [];

  return `
    <div class="smart-options-grid">
      ${sourceQuestion.options.map(opt => `
        <label class="smart-option">
          <input type="checkbox"
                 value="${opt.code}"
                 ${selectedValues.includes(opt.code) ? 'checked' : ''}
                 data-action="update-smart-value"
                 data-key="option_value"
                 data-value="${opt.code}">
          <span>${opt.code}: ${truncateText(opt.label, 15)}</span>
        </label>
      `).join('')}
    </div>
  `;
}

/**
 * LEVEL 3: Advanced Mode - Full power-user interface (existing functionality)
 */
function renderAdvancedMode(question, questionIndex, conditions, availableQuestions) {
  return `
    <div class="conditional-logic-panel advanced-mode">
      <style>
        .conditional-logic-panel.advanced-mode {
          background: var(--surface-2);
          margin: 16px 0;
          transition: all 0.2s ease;
          position: relative;
          z-index: 100;
        }
        .conditional-content {
          max-height: 600px;
          overflow-y: auto;
          overflow-x: visible;
        }
        .conditional-content::-webkit-scrollbar {
          width: 8px;
        }
        .conditional-content::-webkit-scrollbar-track {
          background: var(--surface-3);
          border-radius: 4px;
        }
        .conditional-content::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 4px;
          border: 1px solid var(--surface-3);
        }
        .conditional-content::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--accent-rgb, 59, 130, 246), 0.8);
        }
        .advanced-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--line);
          background: var(--surface-3);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }
        .advanced-back-btn {
          padding: 4px 8px;
          background: var(--surface-1);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 11px;
          color: var(--muted);
        }
        /* Advanced Mode CSS - Essential for functionality */
        .condition-mode-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 12px 16px;
          background: var(--surface-1);
          border-radius: var(--radius-md);
          border: 1px solid var(--line);
        }
        .mode-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-1);
        }
        .mode-toggle {
          display: flex;
          background: var(--surface-2);
          border-radius: var(--radius-sm);
          padding: 2px;
          border: 1px solid var(--line);
        }
        .condition-mode-btn {
          padding: 6px 12px;
          border: none;
          border-radius: calc(var(--radius-sm) - 2px);
          background: transparent;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.15s ease;
          color: var(--muted);
        }
        .condition-mode-btn.active {
          background: var(--accent);
          color: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .condition-mode-btn:hover:not(.active) {
          color: var(--text-1);
        }
        .logic-operator-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 16px 0;
          padding: 12px 16px;
          background: var(--surface-1);
          border-radius: var(--radius-md);
          border: 1px solid var(--line);
          font-size: 14px;
        }
        .logic-operator-selector select {
          padding: 4px 8px;
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          background: var(--surface-2);
          font-size: 13px;
          font-weight: 500;
        }
        .condition-rule {
          display: grid;
          grid-template-columns: 2fr 120px 2fr 40px;
          gap: 12px;
          align-items: start;
          padding: 16px;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          background: var(--surface-1);
          margin-bottom: 12px;
          transition: border-color 0.2s ease;
          position: relative;
          z-index: 1;
          overflow: visible;
        }
        .condition-rule:hover {
          border-color: var(--accent);
        }
        .condition-rule:last-of-type {
          margin-bottom: 0;
        }
        .condition-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .condition-field-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .condition-field select,
        .condition-field input {
          padding: 10px 12px;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          font-size: 13px;
          background: var(--surface-1);
          transition: all 0.2s ease;
          min-height: 40px;
        }
        .condition-field select:focus,
        .condition-field input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(var(--accent-rgb, 59, 130, 246), 0.1);
        }
        .condition-field select:hover,
        .condition-field input:hover {
          border-color: rgba(var(--accent-rgb, 59, 130, 246), 0.5);
        }
        .condition-field select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 10px center;
          background-repeat: no-repeat;
          background-size: 16px;
          padding-right: 40px;
          position: relative;
          z-index: 10;
          max-width: 100%;
          word-wrap: break-word;
        }
        .condition-field select option {
          padding: 8px 12px;
          background: var(--surface-1);
          color: var(--text-1);
          border: none;
          white-space: normal;
          word-wrap: break-word;
        }
        .condition-field {
          position: relative;
          z-index: 1;
        }
        .condition-values {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .condition-value-input {
          padding: 10px 12px;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          font-size: 13px;
          background: var(--surface-1);
          transition: all 0.2s ease;
          min-height: 40px;
        }
        .condition-value-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(var(--accent-rgb, 59, 130, 246), 0.1);
        }
        .condition-value-input:hover {
          border-color: rgba(var(--accent-rgb, 59, 130, 246), 0.5);
        }
        .between-inputs {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 8px;
          align-items: center;
        }
        .option-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 160px;
          overflow-y: auto;
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          background: var(--surface-1);
        }
        .option-checkboxes::-webkit-scrollbar {
          width: 6px;
        }
        .option-checkboxes::-webkit-scrollbar-track {
          background: var(--surface-2);
          border-radius: 3px;
        }
        .option-checkboxes::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 3px;
        }
        .option-checkboxes::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--accent-rgb, 59, 130, 246), 0.8);
        }
        .option-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background-color 0.15s;
          font-size: 13px;
          line-height: 1.4;
          border: 1px solid transparent;
        }
        .option-checkbox:hover {
          background: var(--surface-2);
          border-color: var(--line);
        }
        .option-checkbox input[type="checkbox"] {
          margin: 0;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin-top: 1px;
          cursor: pointer;
        }
        .option-checkbox span {
          flex: 1;
          word-wrap: break-word;
          cursor: pointer;
        }
        .condition-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .add-condition-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: 2px dashed rgba(var(--accent-rgb, 59, 130, 246), 0.3);
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--accent);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
          flex: 1;
        }
        .add-condition-btn:hover {
          background: rgba(var(--accent-rgb, 59, 130, 246), 0.05);
          border-color: var(--accent);
        }
        .auto-configure-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: 1px solid var(--accent);
          border-radius: var(--radius-md);
          background: var(--accent);
          color: white;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
          flex: 1;
        }
        .auto-configure-btn:hover {
          background: transparent;
          color: var(--accent);
        }
        .remove-rule-btn {
          width: 32px;
          height: 32px;
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          background: var(--surface-1);
          color: var(--muted);
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .remove-rule-btn:hover {
          background: var(--danger);
          color: white;
          border-color: var(--danger);
          transform: scale(1.05);
        }
        .condition-error {
          padding: 8px;
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border-radius: var(--radius-sm);
          font-size: 12px;
          margin-top: 4px;
        }
        .condition-preview {
          padding: 16px 20px;
          background: linear-gradient(135deg, rgba(var(--accent-rgb, 59, 130, 246), 0.05), rgba(var(--accent-rgb, 59, 130, 246), 0.1));
          border: 1px solid rgba(var(--accent-rgb, 59, 130, 246), 0.2);
          border-radius: var(--radius-md);
          font-size: 14px;
          color: var(--text-1);
          margin-top: 20px;
          border-left: 4px solid var(--accent);
        }
        .condition-preview strong {
          color: var(--accent);
          font-weight: 600;
        }
        .condition-preview-content {
          margin-top: 8px;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.4;
        }
      </style>

      <div class="advanced-header">
        <div>
          <button class="advanced-back-btn" data-action="switch-conditional-mode" data-target="simple">
            ← Simple
          </button>
          <strong style="margin-left: 12px;">⚙️ Advanced Conditional Rules</strong>
          <div style="font-size: 12px; color: var(--muted); margin-top: 2px;">
            Full control over conditional logic
          </div>
        </div>
        <button class="btn ghost" data-action="toggle-conditional-panel" style="padding: 4px 8px; font-size: 12px;" id="conditional-toggle-btn">
          Close
        </button>
      </div>

      <div class="conditional-content" style="padding: 16px;">
        ${renderOriginalConditionalContent(conditions, availableQuestions)}
      </div>
    </div>
  `;
}

/**
 * Renders the original complex conditional interface
 */
function renderOriginalConditionalContent(conditions, availableQuestions) {
  return `
    <!-- Condition Mode Selector -->
    <div class="condition-mode-selector">
      <span class="mode-label">Question visibility:</span>
      <div class="mode-toggle">
        <button class="condition-mode-btn ${conditions.mode === 'show_if' ? 'active' : ''}"
                data-action="update-conditional-mode" data-key="show_if">
          Show when
        </button>
        <button class="condition-mode-btn ${conditions.mode === 'hide_if' ? 'active' : ''}"
                data-action="update-conditional-mode" data-key="hide_if">
          Hide when
        </button>
      </div>
    </div>

    ${conditions.mode !== 'none' ? renderConditionalRules(conditions, availableQuestions) : ''}

    <!-- Auto-Configuration Suggestion -->
    ${conditions.mode !== 'none' && conditions.rules && conditions.rules.length > 0 ? `
      <div class="condition-preview">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <strong>Preview:</strong>
            <div class="condition-preview-content">
              ${getConditionsDescription(conditions, window.state.questions)}
            </div>
          </div>
          <button class="btn ghost" data-action="optimize-conditional" style="font-size: 11px; padding: 6px 10px; margin-left: 16px;">
            🚀 Optimize
          </button>
        </div>
      </div>
    ` : ''}
  `;
}

/**
 * Renders the conditional rules section
 */
function renderConditionalRules(conditions, availableQuestions) {
  if (!conditions.rules || conditions.rules.length === 0) {
    return `
      <div style="text-align: center; padding: 24px; color: var(--muted); font-size: 14px;">
        No conditions set. Click "Add Condition" to get started.
      </div>
      <div class="condition-actions">
        <button class="add-condition-btn" data-action="add-conditional-rule" style="width: 100%;">
          <span style="font-size: 16px;">+</span> Add Condition
        </button>
      </div>
    `;
  }

  return `
    <!-- Logic Operator Selector -->
    <div class="logic-operator-selector">
      <span style="color: var(--text-1); font-weight: 500;">Show if</span>
      <select data-action="update-conditional-logic" data-key="logic">
        <option value="AND" ${conditions.logic === 'AND' ? 'selected' : ''}>ALL</option>
        <option value="OR" ${conditions.logic === 'OR' ? 'selected' : ''}>ANY</option>
      </select>
      <span style="color: var(--text-1);">of these conditions:</span>
    </div>

    <!-- Condition Rules -->
    <div class="condition-rules">
      ${conditions.rules.map((rule, index) => renderConditionRule(rule, index, availableQuestions)).join('')}
    </div>

    <div class="condition-actions">
      <button class="add-condition-btn" data-action="add-conditional-rule">
        <span style="font-size: 16px;">+</span> Add Another Condition
      </button>
      <button class="auto-configure-btn" data-action="auto-configure-conditional">
        🤖 Auto-Configure
      </button>
    </div>
  `;
}

/**
 * Renders a single condition rule
 */
function renderConditionRule(rule, ruleIndex, availableQuestions) {
  const sourceQuestion = availableQuestions.find(q => q.id === rule.source_qid);
  const validation = validateConditionRule(rule, window.state.questions);

  // Auto-configure complexity indicator
  let complexityBadge = '';
  if (sourceQuestion) {
    const config = autoConfigureConditional(sourceQuestion, null);
    const complexityColors = {
      simple: '#10b981',
      medium: '#f59e0b',
      complex: '#ef4444'
    };
    complexityBadge = `
      <span style="font-size: 9px; padding: 3px 6px; background: ${complexityColors[config.ui.complexity]}; color: white; border-radius: 8px; margin-left: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
        ${config.ui.complexity}
      </span>
    `;
  }

  return `
    <div class="condition-rule" data-rule-index="${ruleIndex}">
      <!-- Source Question -->
      <div class="condition-field">
        <label class="condition-field-label">
          If Question${complexityBadge}
        </label>
        <select data-action="update-conditional-rule" data-key="source_qid" data-rule-index="${ruleIndex}">
          <option value="">Select question...</option>
          ${availableQuestions.map(q => {
            const typeIcon = getQuestionTypeIcon(q.type);
            const supportBadge = getSupportBadge(q.supportLevel);
            const displayText = `${q.id}: ${truncateText(q.text, 30)} ${typeIcon}${supportBadge}`;

            return `
              <option value="${q.id}" ${rule.source_qid === q.id ? 'selected' : ''}
                      ${q.supportLevel === 'coming_soon' ? 'disabled' : ''}>
                ${displayText}
              </option>
            `;
          }).join('')}
        </select>
      </div>

      <!-- Operator -->
      <div class="condition-field">
        <label class="condition-field-label">Is</label>
        <select data-action="update-conditional-rule" data-key="operator" data-rule-index="${ruleIndex}">
          ${(() => {
            const sourceQuestionType = sourceQuestion ? sourceQuestion.type : null;
            const availableOperators = sourceQuestionType ? getOperatorsForQuestionType(sourceQuestionType) : OPERATORS;

            return Object.entries(availableOperators).map(([op, label]) => `
              <option value="${op}" ${rule.operator === op ? 'selected' : ''}>${label}</option>
            `).join('');
          })()}
        </select>
      </div>

      <!-- Values -->
      <div class="condition-field">
        <label class="condition-field-label">Value(s)</label>
        ${renderConditionValues(rule, ruleIndex, sourceQuestion)}
      </div>

      <!-- Remove Button -->
      <div style="display: flex; align-items: flex-end; height: 100%;">
        <button class="remove-rule-btn" data-action="remove-conditional-rule" data-rule-index="${ruleIndex}" title="Remove condition">
          ✕
        </button>
      </div>

      ${!validation.isValid ? `
        <div class="condition-error" style="grid-column: 1 / -1;">
          ${validation.errors.join(', ')}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Renders the value input section for a condition rule
 */
function renderConditionValues(rule, ruleIndex, sourceQuestion) {
  if (rule.operator === 'is_empty' || rule.operator === 'is_not_empty') {
    return '<span style="color: var(--muted); font-size: 12px;">No value needed</span>';
  }

  if (rule.operator === 'between') {
    return `
      <div class="between-inputs">
        <input type="number" placeholder="Min" value="${rule.values?.[0] || ''}"
               data-action="update-conditional-value" data-key="values.0" data-rule-index="${ruleIndex}"
               class="condition-value-input">
        <span style="font-size: 12px;">and</span>
        <input type="number" placeholder="Max" value="${rule.value2 || ''}"
               data-action="update-conditional-value" data-key="value2" data-rule-index="${ruleIndex}"
               class="condition-value-input">
      </div>
    `;
  }

  if (sourceQuestion && sourceQuestion.options && sourceQuestion.options.length > 0 &&
      ['in', 'not_in', '==', '!='].includes(rule.operator)) {
    const selectedValues = rule.values || [];
    return `
      <div class="option-checkboxes">
        ${sourceQuestion.options.map(opt => `
          <label class="option-checkbox">
            <input type="checkbox"
                   value="${opt.code}"
                   ${selectedValues.includes(opt.code) ? 'checked' : ''}
                   data-action="update-conditional-checkbox" data-rule-index="${ruleIndex}"
                   data-value="${opt.code}">
            <span>${opt.code}: ${truncateText(opt.label, 12)}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  if (['contains', 'not_contains'].includes(rule.operator)) {
    return `
      <input type="text" placeholder="Enter text..."
             value="${rule.values?.[0] || ''}"
             data-action="update-conditional-value" data-key="values.0" data-rule-index="${ruleIndex}"
             class="condition-value-input">
    `;
  }

  return `
    <input type="text" placeholder="Enter value..."
           value="${rule.values?.[0] || ''}"
           data-action="update-conditional-value" data-key="values.0" data-rule-index="${ruleIndex}"
           class="condition-value-input">
  `;
}

/**
 * Helper function to truncate text
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Gets the icon for a question type
 */
function getQuestionTypeIcon(type) {
  const icons = {
    'single': '🔘',
    'multi': '☑️',
    'scale': '📊',
    'numeric': '🔢',
    'text': '📝',
    'textarea': '📄',
    'grid_single': '📋',
    'grid_multi': '✅',
    'ranking': '🥇',
    'open': '💬',
    'repeated': '🔄'
  };
  return icons[type] || '❓';
}

/**
 * Gets the support badge for a question's conditional logic support level
 */
function getSupportBadge(supportLevel) {
  switch (supportLevel) {
    case 'full':
      return '';
    case 'partial':
      return ' (Basic)';
    case 'coming_soon':
      return ' (Coming Soon)';
    default:
      return ' (?)';
  }
}

/**
 * Sets up event handlers for conditional logic panel
 * This should be called after the panel is rendered
 */
export function setupConditionalLogicHandlers() {
  // This function is kept for compatibility but handlers are now managed
  // by the main editor panel event system using data-action attributes
}