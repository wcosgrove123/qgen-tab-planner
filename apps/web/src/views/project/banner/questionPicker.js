// src/views/project/banner/questionPicker.js
// Question/Option Picker Modal for Banner Builder

export class QuestionPicker {
  constructor() {
    this.questions = [];
    this.selectedQuestion = null;
    this.onComplete = null;
    this.modal = null;
  }

  /**
   * Open the question picker modal
   * @param {Array} questions - Array of questions from the project
   * @param {Function} onComplete - Callback when options are selected
   */
  open(questions, onComplete) {
    console.log('🔍 Raw questions received:', questions?.length || 0);
    console.log('📋 First raw question structure:', questions?.[0]);

    // Accept all questions - we'll filter by mode when they click into options
    // CRITICAL: Deep copy to prevent banner tool from modifying original question data
    const originalQuestions = (questions || []).filter(q => q && (q.id || q.question_id));
    this.questions = JSON.parse(JSON.stringify(originalQuestions));
    this.onComplete = onComplete;
    this.selectedQuestion = null;

    console.log('🎯 Opening question picker with', this.questions.length, 'questions');
    console.log('📋 First few filtered questions:', this.questions.slice(0, 3));

    this.createModal();
    this.renderQuestionList();
    this.attachEventListeners();

    // Show modal
    document.body.appendChild(this.modal);
    this.modal.classList.add('show');
  }

  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'question-picker-modal';
    this.modal.innerHTML = `
      <div class="question-picker-backdrop" data-action="close-modal"></div>
      <div class="question-picker-content">
        <div class="question-picker-header">
          <h2>🔧 Select Question & Options</h2>
          <button class="btn-close" data-action="close-modal">×</button>
        </div>
        <div class="question-picker-body">
          <div class="picker-step" id="step-questions">
            <div class="step-header">
              <h3>Step 1: Choose Question</h3>
              <p>Select a question to create banner subgroups from</p>
            </div>
            <div class="questions-grid" id="questions-container">
              <!-- Questions will be rendered here -->
            </div>
          </div>
          <div class="picker-step hidden" id="step-options">
            <div class="step-header">
              <h3>Step 2: Select Options</h3>
              <p id="selected-question-info">Choose which options to include as subgroups</p>
            </div>
            <div class="step-actions">
              <button class="btn secondary" data-action="back-to-questions">← Back to Questions</button>
              <button class="btn primary" data-action="select-all-options">Select All</button>
              <button class="btn secondary" data-action="select-none-options">Select None</button>
            </div>
            <div class="options-grid" id="options-container">
              <!-- Options will be rendered here -->
            </div>
            <div class="picker-footer">
              <button class="btn secondary" data-action="close-modal">Cancel</button>
              <button class="btn primary large" data-action="create-subgroups">
                ✅ Create Subgroups
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderQuestionList() {
    const container = this.modal.querySelector('#questions-container');

    const questionsByType = this.groupQuestionsByType();

    console.log('📊 Questions by type:', questionsByType);

    let html = '';

    Object.entries(questionsByType).forEach(([type, questions]) => {
      if (questions.length > 0) {
        html += `
          <div class="question-type-section">
            <h4 class="question-type-header">${type} (${questions.length})</h4>
            <div class="question-cards">
              ${questions.map(q => this.renderQuestionCard(q)).join('')}
            </div>
          </div>
        `;
      }
    });

    if (html === '') {
      html = `
        <div class="no-questions-message">
          <h4>⚠️ No Questions Found</h4>
          <p>No questions with valid IDs were found in this project.</p>
          <p>Total questions received: ${this.questions.length}</p>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  groupQuestionsByType() {
    const groups = {
      'Screeners': [],
      'Main Questions': [],
      'Other': []
    };

    this.questions.forEach(q => {
      // Try different possible field names for question ID
      const qid = (q.question_id || q.questionId || q.id || '').toString().toUpperCase();

      console.log('🔍 Processing question with ID:', qid, 'from question:', q);

      if (qid.startsWith('S')) {
        groups['Screeners'].push(q);
      } else if (qid.startsWith('Q')) {
        groups['Main Questions'].push(q);
      } else {
        groups['Other'].push(q);
      }
    });

    return groups;
  }

  renderQuestionCard(question) {
    // Debug: Log the full question structure for first few questions
    if (Math.random() < 0.1) { // Only log 10% to avoid spam
      console.log('🔍 Full question structure:', question);
    }

    // More flexible field access
    const questionText = this.cleanQuestionText(
      question.question_text || question.questionText || question.text || 'No text available'
    );
    const questionId = question.question_id || question.questionId || question.id || 'Unknown';
    // Use consistent ID for click handling
    const actualId = question.id || questionId;
    const optionCount = question.values?.length ||
                       question.options?.length ||
                       question.choices?.length ||
                       question.answer_options?.length ||
                       0;

    // Check if this is a numeric question that uses inequality builder
    const mode = question.question_mode || question.mode || '';
    const isNumericQuestion = ['numeric_simple', 'numeric_dropdown'].includes(mode);

    // Numeric questions "have options" via the inequality builder
    const hasOptions = optionCount > 0 || isNumericQuestion;

    return `
      <div class="question-card ${hasOptions ? 'has-options' : 'no-options'}"
           data-question-id="${actualId}"
           data-action="select-question">
        <div class="question-header">
          <span class="question-id">${questionId}</span>
          <span class="option-count">${isNumericQuestion ? 'numeric values' : `${optionCount} options`}</span>
        </div>
        <div class="question-text">
          ${questionText.substring(0, 120)}${questionText.length > 120 ? '...' : ''}
        </div>
        <div class="question-meta">
          <span class="question-type">${question.question_mode || question.mode || 'Unknown'}</span>
          ${hasOptions ?
            '<span class="has-options-badge">✓ Has Options</span>' :
            '<span class="no-options-badge">⚠ No Options</span>'
          }
        </div>
      </div>
    `;
  }

  cleanQuestionText(html) {
    // Remove HTML tags and clean up text
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }

  async selectQuestion(questionId) {
    console.log('🎯 Selected question:', questionId);

    this.selectedQuestion = this.questions.find(q => q.id === questionId);
    if (!this.selectedQuestion) {
      console.error('Question not found:', questionId);
      return;
    }

    console.log('📝 Question details:', {
      id: this.selectedQuestion.id,
      question_id: this.selectedQuestion.question_id,
      values: this.selectedQuestion.values
    });

    // Switch to options step using shared method
    this.showOptionsStep();

    await this.renderOptionsList();
  }

  async renderOptionsList() {
    const container = this.modal.querySelector('#options-container');
    const mode = this.selectedQuestion.question_mode || this.selectedQuestion.mode || '';

    console.log('🔍 Processing question_mode:', mode);
    console.log('📝 Question structure keys:', Object.keys(this.selectedQuestion));

    // Handle different question modes
    let options = [];

    if (['single', 'multi', 'single_likert', 'numeric_select'].includes(mode)) {
      // These modes should have predefined options/values
      options = this.selectedQuestion.values ||
               this.selectedQuestion.options ||
               this.selectedQuestion.choices ||
               this.selectedQuestion.answer_options ||
               [];
    } else if (['numeric_simple', 'numeric_dropdown'].includes(mode)) {
      // Numeric questions - show inequality builder instead of loading nets
      this.renderNumericInequalityBuilder();
      return; // Exit early, inequality builder handles its own rendering
    } else if (mode === 'list') {
      // Legacy mode - check the actual question structure
      options = this.selectedQuestion.values ||
               this.selectedQuestion.options ||
               [];
    }

    console.log('📊 Final options for mode', mode, ':', options);

    if (options.length === 0) {
      container.innerHTML = `
        <div class="no-options-message">
          <h4>⚠️ No Options Available</h4>
          <p>Mode: <strong>${mode}</strong> - This question mode isn't supported for banner creation yet.</p>
          <p>Debug: Question structure:</p>
          <pre style="font-size: 10px; background: #f5f5f5; padding: 10px; border-radius: 4px;">${JSON.stringify(this.selectedQuestion, null, 2).substring(0, 500)}...</pre>
        </div>
      `;
      return;
    }

    const html = options.map((option, index) => `
      <div class="option-card" data-option-index="${index}">
        <label class="option-checkbox">
          <input type="checkbox"
                 data-action="toggle-option"
                 data-option-index="${index}"
                 checked>
          <div class="option-content">
            <div class="option-label">${option.label || option.value || `Option ${index + 1}`}</div>
            <div class="option-value">Value: ${option.value || 'N/A'}</div>
            ${option.code ? `<div class="option-code">Code: ${option.code}</div>` : ''}
          </div>
        </label>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  attachEventListeners() {
    this.modal.addEventListener('click', this.handleModalClick.bind(this));
  }

  async handleModalClick(e) {
    const action = e.target.dataset.action;
    if (!action) {
      // Check if clicking anywhere on a question card
      const questionCard = e.target.closest('.question-card');
      if (questionCard) {
        console.log('🎯 Clicked on question card:', questionCard);
        const questionId = questionCard.dataset.questionId;
        console.log('🔍 Question ID from card:', questionId);
        if (questionId) {
          await this.selectQuestion(questionId);
        }
        return;
      }
      return;
    }

    console.log('🎯 Picker action:', action);

    try {
      switch (action) {
        case 'close-modal':
          this.close();
          break;

        case 'select-question':
          const questionId = e.target.closest('.question-card')?.dataset.questionId;
          console.log('🔍 Select question action, ID:', questionId);
          if (questionId) {
            await this.selectQuestion(questionId);
          }
          break;

        case 'back-to-questions':
          this.modal.querySelector('#step-options').classList.add('hidden');
          this.modal.querySelector('#step-questions').classList.remove('hidden');
          // Clean up any layout helper classes
          const optionsContainer = this.modal.querySelector('#options-container');
          optionsContainer.classList.remove('has-inequality-builder');
          // Restore original modal buttons
          const pickerFooter = this.modal.querySelector('.picker-footer');
          if (pickerFooter) {
            pickerFooter.style.display = '';
          }
          this.selectedQuestion = null;
          break;

        case 'select-all-options':
          this.selectAllOptions();
          break;

        case 'select-none-options':
          this.selectNoneOptions();
          break;

        case 'create-subgroups':
          this.createSubgroups();
          break;
      }
    } catch (error) {
      console.error('❌ Error handling picker action:', error);
      alert(`Error: ${error.message}`);
    }
  }

  selectAllOptions() {
    const checkboxes = this.modal.querySelectorAll('input[type="checkbox"][data-action="toggle-option"]');
    checkboxes.forEach(cb => cb.checked = true);
  }

  selectNoneOptions() {
    const checkboxes = this.modal.querySelectorAll('input[type="checkbox"][data-action="toggle-option"]');
    checkboxes.forEach(cb => cb.checked = false);
  }

  async loadNumericNets() {
    const container = this.modal.querySelector('#options-container');

    // ✅ IMMEDIATE VISUAL UPDATE (Layer 1): Show loading without destroying DOM
    const existingContent = container.innerHTML;
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-state';
    loadingDiv.innerHTML = `<p>🔍 Loading nets for ${this.selectedQuestion.question_id || 'numeric question'}...</p>`;

    container.appendChild(loadingDiv);

    try {
      // Debug question structure to find the correct ID field
      console.log('🔍 Question structure for nets lookup:', {
        id: this.selectedQuestion.id,
        uuid: this.selectedQuestion.uuid,
        question_id: this.selectedQuestion.question_id,
        allKeys: Object.keys(this.selectedQuestion),
        fullQuestion: this.selectedQuestion
      });

      // Get the question UUID (primary key, not the question_id text field)
      // Based on schema: questions.id is UUID, questions.question_id is text like "Q1"
      const questionUUID = this.selectedQuestion.uuid ||
                          this.selectedQuestion.database_id ||
                          this.selectedQuestion.question_uuid;

      if (!questionUUID) {
        // If we don't have the UUID directly, we need to look it up by question_id
        const questionCode = this.selectedQuestion.question_id || this.selectedQuestion.id;
        if (!questionCode) {
          throw new Error(`No question identifier found. Available fields: ${Object.keys(this.selectedQuestion).join(', ')}`);
        }

        console.log('🔍 Looking up UUID for question code:', questionCode);
        const lookupResult = await bannerManager.lookupQuestionUUID(questionCode);
        if (!lookupResult.success) {
          throw new Error(`Failed to lookup question UUID: ${lookupResult.error}`);
        }

        var questionId = lookupResult.data.id;
        console.log('✅ Found UUID:', questionId);
      } else {
        var questionId = questionUUID;
        console.log('✅ Using existing UUID:', questionId);
      }

      console.log('🔍 Using question ID for nets lookup:', questionId);

      // Fetch nets from database
      const result = await bannerManager.getQuestionNets(questionId);

      if (!result.success) {
        throw new Error(result.error);
      }

      const nets = result.data || [];
      console.log('📊 Loaded nets for numeric question:', nets);

      // ✅ MINIMAL UPDATE: Remove loading, add content without destroying existing DOM
      loadingDiv.remove();

      if (nets.length === 0) {
        // ✅ MINIMAL UPDATE: Add no-nets message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'no-options-message';
        messageDiv.innerHTML = `
          <h4>⚠️ No Nets Configured</h4>
          <p>This numeric question doesn't have any nets configured yet.</p>
          <p>You can configure nets in the questionnaire builder for questions like:</p>
          <ul>
            <li>Age ranges (18-24, 25-34, 35-44, etc.)</li>
            <li>Income brackets (Under $50K, $50K-$100K, Over $100K)</li>
            <li>Rating groups (Low 1-3, Medium 4-6, High 7-10)</li>
          </ul>
          <br>
          <button class="btn secondary" data-action="back-to-questions">← Back to Questions</button>
        `;
        container.appendChild(messageDiv);
        return;
      }

      // Convert nets to options format
      const options = nets.map(net => ({
        label: net.net_label,
        value: net.id, // Use net ID as value
        code: net.id, // Use net ID as code for equations
        net_type: net.net_type,
        net_config: net.net_config
      }));

      // ✅ MINIMAL UPDATE: Add nets options without destroying DOM
      this.addNetOptionsToDOM(container, options);

    } catch (error) {
      console.error('❌ Error loading numeric nets:', error);

      // ✅ MINIMAL UPDATE: Remove loading, add error without destroying DOM
      loadingDiv.remove();
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.innerHTML = `
        <h4>❌ Error Loading Nets</h4>
        <p>Failed to load nets for this numeric question: ${error.message}</p>
        <button class="btn secondary" data-action="back-to-questions">← Back to Questions</button>
      `;
      container.appendChild(errorDiv);
    }
  }

  addNetOptionsToDOM(container, options) {
    // ✅ MINIMAL UPDATE: Create and add header element
    const headerDiv = document.createElement('div');
    headerDiv.className = 'options-header';
    headerDiv.innerHTML = `
      <div class="options-title">
        <h3>📊 Select Nets for Banner</h3>
        <p>Choose which nets to include as banner columns:</p>
      </div>
      <div class="options-actions">
        <button class="btn secondary small" data-action="select-none-options">Select None</button>
      </div>
    `;

    // ✅ MINIMAL UPDATE: Create and add options grid
    const gridDiv = document.createElement('div');
    gridDiv.className = 'options-grid';

    options.forEach((option, index) => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'option-card';
      optionDiv.dataset.optionIndex = index;
      optionDiv.innerHTML = `
        <div class="option-checkbox">
          <input type="checkbox" id="option-${index}" data-action="toggle-option">
        </div>
        <div class="option-content">
          <div class="option-label">${option.label}</div>
          ${option.net_type ? `<div class="option-meta">Type: ${option.net_type}</div>` : ''}
        </div>
      `;
      gridDiv.appendChild(optionDiv);
    });

    // ✅ MINIMAL UPDATE: Create and add footer element
    const footerDiv = document.createElement('div');
    footerDiv.className = 'options-footer';
    footerDiv.innerHTML = `
      <button class="btn secondary" data-action="back-to-questions">← Back</button>
      <button class="btn primary" data-action="create-subgroups">Create Subgroups</button>
    `;

    // ✅ MINIMAL UPDATE: Append all elements to container (no innerHTML replacement)
    container.appendChild(headerDiv);
    container.appendChild(gridDiv);
    container.appendChild(footerDiv);

    // Store options for later use
    this.currentOptions = options;
  }

  createSubgroups() {
    if (!this.selectedQuestion) {
      alert('No question selected');
      return;
    }

    // For numeric questions, they should use the inequality builder, not this method
    const mode = this.selectedQuestion.question_mode || this.selectedQuestion.mode || '';
    let options = [];

    if (['numeric_simple', 'numeric_dropdown'].includes(mode)) {
      // Numeric questions should use the inequality builder, not this old path
      console.error('❌ Numeric questions should use inequality builder, not createSubgroups()');
      alert('Please use the inequality builder for numeric questions.');
      return;
    } else {
      // Use the standard question options for other question types
      if (['single', 'multi', 'single_likert', 'numeric_select'].includes(mode)) {
        options = this.selectedQuestion.values ||
                 this.selectedQuestion.options ||
                 this.selectedQuestion.choices ||
                 this.selectedQuestion.answer_options ||
                 [];
      } else if (mode === 'list') {
        options = this.selectedQuestion.values ||
                 this.selectedQuestion.options ||
                 [];
      }
    }

    const checkboxes = this.modal.querySelectorAll('input[type="checkbox"][data-action="toggle-option"]:checked');
    const selectedOptions = Array.from(checkboxes).map(cb => {
      const index = parseInt(cb.closest('.option-card').dataset.optionIndex);
      return options[index];
    }).filter(option => option); // Filter out undefined options

    if (selectedOptions.length === 0) {
      alert('Please select at least one option');
      return;
    }

    console.log('✅ Creating subgroups for:', {
      question: this.selectedQuestion.question_id,
      mode: mode,
      options: selectedOptions.length,
      details: selectedOptions
    });

    // Call the completion callback
    if (this.onComplete) {
      this.onComplete({
        question: this.selectedQuestion,
        selectedOptions: selectedOptions
      });
    }

    this.close();
  }

  /**
   * Switch to the options step of the modal
   */
  showOptionsStep() {
    // Switch to options step
    this.modal.querySelector('#step-questions').classList.add('hidden');
    this.modal.querySelector('#step-options').classList.remove('hidden');

    // Update header
    const questionInfo = this.modal.querySelector('#selected-question-info');
    questionInfo.innerHTML = `
      Selected: <strong>${this.selectedQuestion.question_id || this.selectedQuestion.id}</strong> -
      ${this.cleanQuestionText(this.selectedQuestion.question_text || this.selectedQuestion.text || '').substring(0, 60)}...
    `;
  }

  /**
   * Render numeric inequality builder for creating banner logic
   * Shows a professional interface for building equations like Q1 > 5, Q1 <= 2, etc.
   */
  renderNumericInequalityBuilder() {
    // Switch to options step (same as other question types)
    this.showOptionsStep();

    const container = this.modal.querySelector('#options-container');

    // Add helper class for layout integration
    container.classList.add('has-inequality-builder');

    // Hide the original modal buttons since we have our own
    const pickerFooter = this.modal.querySelector('.picker-footer');
    if (pickerFooter) {
      pickerFooter.style.display = 'none';
    }

    // Clear existing content
    container.innerHTML = '';

    const questionCode = this.selectedQuestion.question_id || this.selectedQuestion.id || 'Q1';
    const questionText = this.selectedQuestion.question_text || this.selectedQuestion.text || 'Numeric Question';

    // Create inequality builder interface
    const builderDiv = document.createElement('div');
    builderDiv.className = 'numeric-inequality-builder';
    builderDiv.innerHTML = `
      <div class="inequality-header">
        <h3>🔢 Create Numeric Banner Logic</h3>
        <p>Build conditions for: <strong>${questionCode}</strong></p>
      </div>

      <div class="inequality-form">
        <div class="inequality-row">
          <div class="question-code">
            <label>Question</label>
            <div class="code-display">${questionCode}</div>
          </div>

          <div class="operator-selector">
            <label>Operator</label>
            <select id="inequality-operator" class="operator-select">
              <option value="=">Equals (=)</option>
              <option value="!=">Not Equals (≠)</option>
              <option value=">">Greater Than (>)</option>
              <option value="<">Less Than (<)</option>
              <option value=">=">Greater or Equal (≥)</option>
              <option value="<=">Less or Equal (≤)</option>
              <option value="BETWEEN">Between (BETWEEN)</option>
            </select>
          </div>

          <div class="value-input">
            <label>Value</label>
            <div id="value-input-container">
              <input type="number" id="inequality-value" class="numeric-input" placeholder="Enter number..." step="any">
            </div>
          </div>
        </div>

        <div class="inequality-preview">
          <label>Preview</label>
          <div id="equation-preview" class="equation-display">
            ${questionCode} =
          </div>
        </div>

        <div class="banner-label-section">
          <label for="banner-label">Banner Column Label</label>
          <input type="text" id="banner-label" class="label-input" placeholder="e.g., 'Heavy Users', '5+ Hours', 'Low Usage'">
          <small>This will be the column header in your banner</small>
        </div>
      </div>

      <div class="inequality-actions">
        <button class="btn secondary" data-action="back-to-questions">← Back to Questions</button>
        <button class="btn primary" data-action="create-inequality-banner" disabled>Create Banner Column</button>
      </div>
    `;

    container.appendChild(builderDiv);

    // Add event listeners for real-time preview and validation
    this.attachInequalityEventListeners();
  }

  /**
   * Attach event listeners for the inequality builder
   */
  attachInequalityEventListeners() {
    const modal = this.modal;
    const operatorSelect = modal.querySelector('#inequality-operator');
    const valueInputContainer = modal.querySelector('#value-input-container');
    const labelInput = modal.querySelector('#banner-label');
    const preview = modal.querySelector('#equation-preview');
    const createBtn = modal.querySelector('[data-action="create-inequality-banner"]');

    const questionCode = this.selectedQuestion.question_id || this.selectedQuestion.id || 'Q1';

    // Update input type based on operator
    const updateInputType = () => {
      const operator = operatorSelect.value;

      if (operator === 'BETWEEN') {
        valueInputContainer.innerHTML = `
          <div class="between-inputs">
            <input type="number" id="inequality-from" class="numeric-input between-from" placeholder="From..." step="any">
            <span class="between-separator">AND</span>
            <input type="number" id="inequality-to" class="numeric-input between-to" placeholder="To..." step="any">
          </div>
        `;

        // Re-attach listeners for new inputs
        const fromInput = modal.querySelector('#inequality-from');
        const toInput = modal.querySelector('#inequality-to');
        fromInput.addEventListener('input', updatePreview);
        toInput.addEventListener('input', updatePreview);
      } else {
        valueInputContainer.innerHTML = `
          <input type="number" id="inequality-value" class="numeric-input" placeholder="Enter number..." step="any">
        `;

        // Re-attach listener for single input
        const valueInput = modal.querySelector('#inequality-value');
        valueInput.addEventListener('input', updatePreview);
      }

      updatePreview();
    };

    // Update preview and validate form
    const updatePreview = () => {
      const operator = operatorSelect.value;
      const label = labelInput.value.trim();
      let value, isValid;

      if (operator === 'BETWEEN') {
        const fromInput = modal.querySelector('#inequality-from');
        const toInput = modal.querySelector('#inequality-to');
        const fromValue = fromInput ? fromInput.value : '';
        const toValue = toInput ? toInput.value : '';

        value = `${fromValue} AND ${toValue}`;
        isValid = fromValue !== '' && toValue !== '' && !isNaN(fromValue) && !isNaN(toValue) && label !== '';

        // Update equation preview
        if (fromValue && toValue) {
          preview.textContent = `${questionCode} BETWEEN ${fromValue} AND ${toValue}`;
          preview.classList.remove('empty');
        } else {
          preview.textContent = `${questionCode} BETWEEN `;
          preview.classList.add('empty');
        }
      } else {
        const valueInput = modal.querySelector('#inequality-value');
        value = valueInput ? valueInput.value : '';
        isValid = value !== '' && !isNaN(value) && label !== '';

        // Update equation preview
        if (value) {
          preview.textContent = `${questionCode} ${operator} ${value}`;
          preview.classList.remove('empty');
        } else {
          preview.textContent = `${questionCode} ${operator} `;
          preview.classList.add('empty');
        }
      }

      // Enable/disable create button
      createBtn.disabled = !isValid;

      if (isValid) {
        createBtn.classList.remove('disabled');
      } else {
        createBtn.classList.add('disabled');
      }
    };

    // Attach event listeners
    operatorSelect.addEventListener('change', updateInputType);
    labelInput.addEventListener('input', updatePreview);

    // Handle create button click
    createBtn.addEventListener('click', () => {
      const operator = operatorSelect.value;
      const label = labelInput.value.trim();
      let value, equation;

      if (operator === 'BETWEEN') {
        const fromInput = modal.querySelector('#inequality-from');
        const toInput = modal.querySelector('#inequality-to');
        const fromValue = fromInput ? fromInput.value : '';
        const toValue = toInput ? toInput.value : '';

        if (fromValue !== '' && toValue !== '' && !isNaN(fromValue) && !isNaN(toValue) && label !== '') {
          value = `${fromValue} AND ${toValue}`;
          equation = `${questionCode} BETWEEN ${fromValue} AND ${toValue}`;
        } else {
          return; // Invalid BETWEEN values
        }
      } else {
        const valueInput = modal.querySelector('#inequality-value');
        value = valueInput ? valueInput.value : '';

        if (value !== '' && !isNaN(value) && label !== '') {
          equation = `${questionCode}${operator}${value}`;
        } else {
          return; // Invalid single value
        }
      }

      // Create the banner equation and option object
      const selectedOption = {
        code: value,
        label: label,
        equation: equation,
        operator: operator,
        value: value,
        questionCode: questionCode
      };

      console.log('🔢 Creating numeric banner:', selectedOption);

      // Call the callback with the result
      if (this.onComplete) {
        this.onComplete({
          question: this.selectedQuestion,
          selectedOptions: [selectedOption]
        });
      }

      this.close();
    });

    // Initial setup for default single value input
    const initialValueInput = modal.querySelector('#inequality-value');
    if (initialValueInput) {
      initialValueInput.addEventListener('input', updatePreview);
    }

    // Initial preview update
    updatePreview();
  }
}

// Singleton instance
export default new QuestionPicker();