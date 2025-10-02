/**
 * Professional Equation Builder Modal
 * Modern, intuitive interface for building banner logic equations
 */

class EquationBuilder {
  constructor() {
    this.modal = null;
    this.currentH2Id = null;
    this.currentEquation = '';
    this.conditions = [];
    this.questions = [];
    this.onSave = null;
  }

  /**
   * Open the equation builder modal
   */
  async open(h2Id, currentEquation = '', questions = [], onSaveCallback) {
    this.currentH2Id = h2Id;
    this.currentEquation = currentEquation;
    // CRITICAL: Deep copy to prevent banner tool from modifying original question data
    this.questions = JSON.parse(JSON.stringify(questions || []));
    this.onSave = onSaveCallback;

    // Parse existing equation into conditions
    this.parseEquation(currentEquation);

    this.createModal();
    this.renderContent();
    this.attachEventListeners();

    // Show modal with animation
    document.body.appendChild(this.modal);
    setTimeout(() => this.modal.classList.add('active'), 50);
  }

  /**
   * Parse equation string into individual conditions
   */
  parseEquation(equation) {
    console.log('🔍 Parsing equation:', equation);
    this.conditions = [];

    if (!equation || equation.trim() === '') {
      console.log('🔍 Equation is empty, no conditions to parse');
      return;
    }

    // Simple parsing for now - split by AND/OR
    const parts = equation.split(/\s+(AND|OR)\s+/i);
    console.log('🔍 Split parts:', parts);

    for (let i = 0; i < parts.length; i += 2) {
      const conditionStr = parts[i].trim();
      const operator = parts[i + 1] ? parts[i + 1].toUpperCase() : 'AND';

      console.log(`🔍 Processing condition: "${conditionStr}"`);

      // Parse condition like "S7=2" or UUID format "0552bd78-6b13-4733-b23a-9320e635845a=1"
      const match = conditionStr.match(/^([A-Z0-9-]+)\s*([=<>!=]+)\s*(.+)$/);
      if (match) {
        const condition = {
          questionId: match[1],
          operator: match[2],
          value: match[3],
          logicalOperator: operator
        };
        console.log('🔍 Parsed condition:', condition);
        this.conditions.push(condition);
      } else {
        console.log('🔍 Failed to match condition:', conditionStr);
      }
    }

    // Remove last logical operator
    if (this.conditions.length > 0) {
      this.conditions[this.conditions.length - 1].logicalOperator = null;
    }

    console.log('🔍 Final parsed conditions:', this.conditions);
  }

  /**
   * Create the modal DOM structure
   */
  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'equation-builder-modal';
    this.modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h2>🔧 Equation Builder</h2>
          <button class="close-btn" data-action="close">&times;</button>
        </div>

        <div class="modal-body">
          <div class="preview-section">
            <label class="preview-label">Preview:</label>
            <div class="equation-preview" id="equation-preview">
              No conditions yet
            </div>
          </div>

          <div class="conditions-section">
            <div class="section-header">
              <h3>Conditions</h3>
              <button class="btn primary" data-action="add-condition">
                ➕ Add Condition
              </button>
            </div>

            <div class="conditions-list" id="conditions-list">
              <!-- Conditions will be rendered here -->
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn secondary" data-action="cancel">Cancel</button>
          <button class="btn primary large" data-action="save-equation">Save Equation</button>
        </div>
      </div>
    `;
  }

  /**
   * Render the modal content
   */
  renderContent() {
    this.renderConditions();
    this.updatePreview();
  }

  /**
   * Render all conditions
   */
  renderConditions() {
    const container = this.modal.querySelector('#conditions-list');

    if (this.conditions.length === 0) {
      container.innerHTML = `
        <div class="no-conditions">
          <p>No conditions added yet. Click "Add Condition" to get started.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.conditions.map((condition, index) =>
      this.renderCondition(condition, index)
    ).join('');
  }

  /**
   * Render a single condition
   */
  renderCondition(condition, index) {
    const isLast = index === this.conditions.length - 1;

    return `
      <div class="condition-row" data-index="${index}">
        <div class="condition-content">
          <div class="condition-field">
            <label>Question</label>
            <select class="question-select" data-action="update-question" data-index="${index}">
              ${this.renderQuestionOptions(condition.questionId)}
            </select>
          </div>

          <div class="condition-field">
            <label>Operator</label>
            <select class="operator-select" data-action="update-operator" data-index="${index}">
              <option value="=" ${condition.operator === '=' ? 'selected' : ''}>Equals (=)</option>
              <option value="!=" ${condition.operator === '!=' ? 'selected' : ''}>Not Equals (≠)</option>
              <option value=">" ${condition.operator === '>' ? 'selected' : ''}>Greater Than (>)</option>
              <option value="<" ${condition.operator === '<' ? 'selected' : ''}>Less Than (<)</option>
              <option value=">=" ${condition.operator === '>=' ? 'selected' : ''}>Greater or Equal (≥)</option>
              <option value="<=" ${condition.operator === '<=' ? 'selected' : ''}>Less or Equal (≤)</option>
              <option value="BETWEEN" ${condition.operator === 'BETWEEN' ? 'selected' : ''}>Between (BETWEEN)</option>
            </select>
          </div>

          <div class="condition-field">
            <label>Value</label>
            <div class="value-input-container">
              ${this.renderValueInput(condition, index)}
            </div>
          </div>

          <div class="condition-actions">
            <button class="btn-icon danger" data-action="remove-condition" data-index="${index}" title="Remove condition">
              🗑️
            </button>
          </div>
        </div>

        ${!isLast ? `
          <div class="logical-operator">
            <select data-action="update-logical" data-index="${index}">
              <option value="AND" ${condition.logicalOperator === 'AND' ? 'selected' : ''}>AND</option>
              <option value="OR" ${condition.logicalOperator === 'OR' ? 'selected' : ''}>OR</option>
            </select>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render question dropdown options
   */
  renderQuestionOptions(selectedQuestionId) {
    return `
      <option value="">Select Question...</option>
      ${this.questions.map(q => {
        const mode = q.question_mode || q.mode || '';
        const isNumeric = ['numeric_simple', 'numeric_dropdown'].includes(mode);
        const typeIndicator = isNumeric ? ' (numeric)' : '';

        return `
        <option value="${q.id || q.question_id}" ${(q.id === selectedQuestionId || q.question_id === selectedQuestionId) ? 'selected' : ''}>
          ${q.question_id || q.id} - ${(q.question_text || '').substring(0, 50)}${q.question_text && q.question_text.length > 50 ? '...' : ''}${typeIndicator}
        </option>`;
      }).join('')}
    `;
  }

  /**
   * Render value input based on question type
   */
  renderValueInput(condition, index) {
    const question = this.questions.find(q =>
      (q.id === condition.questionId || q.question_id === condition.questionId)
    );

    if (!question) {
      return `<input type="text" class="value-input" value="${condition.value}" data-action="update-value" data-index="${index}">`;
    }

    // Check if this is a numeric question
    const mode = question.question_mode || question.mode || '';
    const isNumericQuestion = ['numeric_simple', 'numeric_dropdown'].includes(mode);

    // Handle BETWEEN operator with dual inputs
    if (condition.operator === 'BETWEEN') {
      const values = condition.value ? condition.value.split(' AND ') : ['', ''];
      const fromValue = values[0] || '';
      const toValue = values[1] || '';

      return `
        <div class="between-inputs">
          <input type="number" class="value-input between-from" value="${fromValue}" data-action="update-between-from" data-index="${index}" placeholder="From..." step="any">
          <span class="between-separator">AND</span>
          <input type="number" class="value-input between-to" value="${toValue}" data-action="update-between-to" data-index="${index}" placeholder="To..." step="any">
        </div>
      `;
    }

    if (isNumericQuestion) {
      // For numeric questions, show number input
      return `<input type="number" class="value-input numeric-value-input" value="${condition.value}" data-action="update-value" data-index="${index}" placeholder="Enter number..." step="any">`;
    }

    // If question has options, show dropdown
    if (question.values || question.options || question.question_options) {
      const options = question.values || question.options || question.question_options || [];

      return `
        <select class="value-select" data-action="update-value" data-index="${index}">
          <option value="">Select Value...</option>
          ${options.map(opt => {
            const optValue = opt.code || opt.value || opt.option_code || opt;
            const optLabel = opt.label || opt.option_label || opt.name || opt;

            return `<option value="${optValue}" ${condition.value == optValue ? 'selected' : ''}>${optLabel}</option>`;
          }).join('')}
        </select>
      `;
    }

    // Default to text input
    return `<input type="text" class="value-input" value="${condition.value}" data-action="update-value" data-index="${index}">`;
  }

  /**
   * Update the equation preview
   */
  updatePreview() {
    const previewEl = this.modal.querySelector('#equation-preview');

    if (this.conditions.length === 0) {
      previewEl.textContent = 'No conditions yet';
      previewEl.className = 'equation-preview empty';
      return;
    }

    const equationStr = this.conditions.map((condition, index) => {
      let conditionStr;

      if (condition.operator === 'BETWEEN') {
        // Format: "Q1 = 5-10" (cleaner display format)
        const values = condition.value ? condition.value.split(' AND ') : ['', ''];
        const fromValue = values[0] || '';
        const toValue = values[1] || '';
        conditionStr = `${condition.questionId} = ${fromValue}-${toValue}`;
      } else {
        // Format: "Q1=5" or "Q1>5"
        conditionStr = `${condition.questionId}${condition.operator}${condition.value}`;
      }

      const logicalStr = condition.logicalOperator ? ` ${condition.logicalOperator} ` : '';
      return conditionStr + logicalStr;
    }).join('');

    previewEl.textContent = equationStr.trim();
    previewEl.className = 'equation-preview';
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    this.modal.addEventListener('click', (e) => this.handleClick(e));
    this.modal.addEventListener('change', (e) => this.handleChange(e));

    // Close on backdrop click
    this.modal.querySelector('.modal-backdrop').addEventListener('click', () => this.close());
  }

  /**
   * Handle click events
   */
  handleClick(e) {
    const action = e.target.dataset.action;
    if (!action) return;

    e.preventDefault();
    e.stopPropagation();

    switch (action) {
      case 'close':
      case 'cancel':
        this.close();
        break;

      case 'add-condition':
        this.addCondition();
        break;

      case 'remove-condition':
        this.removeCondition(parseInt(e.target.dataset.index));
        break;

      case 'save-equation':
        this.saveEquation();
        break;
    }
  }

  /**
   * Handle change events (dropdowns, inputs)
   */
  handleChange(e) {
    const action = e.target.dataset.action;
    const index = parseInt(e.target.dataset.index);

    if (!action || isNaN(index)) return;

    const condition = this.conditions[index];
    if (!condition) return;

    switch (action) {
      case 'update-question':
        condition.questionId = e.target.value;
        condition.value = ''; // Reset value when question changes
        this.renderConditions(); // Re-render to update value input
        break;

      case 'update-operator':
        const oldOperator = condition.operator;
        condition.operator = e.target.value;

        // Reset value when switching to/from BETWEEN
        if ((oldOperator === 'BETWEEN' && e.target.value !== 'BETWEEN') ||
            (oldOperator !== 'BETWEEN' && e.target.value === 'BETWEEN')) {
          condition.value = '';
        }

        // Re-render to show appropriate input type
        this.renderConditions();
        break;

      case 'update-value':
        condition.value = e.target.value;
        break;

      case 'update-between-from':
        this.updateBetweenValue(condition, e.target.value, 'from');
        break;

      case 'update-between-to':
        this.updateBetweenValue(condition, e.target.value, 'to');
        break;

      case 'update-logical':
        condition.logicalOperator = e.target.value;
        break;
    }

    this.updatePreview();
  }

  /**
   * Update BETWEEN values (from/to)
   */
  updateBetweenValue(condition, newValue, type) {
    const values = condition.value ? condition.value.split(' AND ') : ['', ''];

    if (type === 'from') {
      values[0] = newValue;
    } else if (type === 'to') {
      values[1] = newValue;
    }

    // Combine values back into "FROM AND TO" format
    condition.value = `${values[0]} AND ${values[1]}`;
  }

  /**
   * Add a new condition
   */
  addCondition() {
    this.conditions.push({
      questionId: '',
      operator: '=',
      value: '',
      logicalOperator: 'AND'
    });

    // Remove logical operator from last condition
    if (this.conditions.length > 1) {
      this.conditions[this.conditions.length - 2].logicalOperator = 'AND';
    }
    this.conditions[this.conditions.length - 1].logicalOperator = null;

    this.renderConditions();
    this.updatePreview();
  }

  /**
   * Remove a condition
   */
  removeCondition(index) {
    this.conditions.splice(index, 1);

    // Fix logical operators
    if (this.conditions.length > 0) {
      this.conditions[this.conditions.length - 1].logicalOperator = null;
    }

    this.renderConditions();
    this.updatePreview();
  }

  /**
   * Save the equation
   */
  saveEquation() {
    const equation = this.conditions.map((condition, index) => {
      let conditionStr;

      if (condition.operator === 'BETWEEN') {
        // Format: "Q1 BETWEEN 5 AND 10" (database format for saving)
        conditionStr = `${condition.questionId} ${condition.operator} ${condition.value}`;
      } else {
        // Format: "Q1=5" or "Q1>5"
        conditionStr = `${condition.questionId}${condition.operator}${condition.value}`;
      }

      const logicalStr = condition.logicalOperator ? ` ${condition.logicalOperator} ` : '';
      return conditionStr + logicalStr;
    }).join('').trim();

    console.log('💾 Saving equation:', equation);

    if (this.onSave) {
      this.onSave(equation);
    }

    this.close();
  }

  /**
   * Close the modal
   */
  close() {
    if (!this.modal) return;

    this.modal.classList.remove('active');
    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      this.modal = null;
    }, 300);
  }
}

// Singleton instance
export default new EquationBuilder();