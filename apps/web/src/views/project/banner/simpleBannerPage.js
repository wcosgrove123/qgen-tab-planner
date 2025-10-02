// src/views/project/banner/simpleBannerPage.js
// Professional Banner Builder - H1/H2 Structure with Equation Mapping

import bannerManager from '../../../services/bannerManager.js';
import questionPicker from './questionPicker.js';
import equationBuilder from './equationBuilder.js';

class SimpleBannerPage {
  constructor() {
    this.currentBanner = null;
    this.bannerHierarchy = [];
    this.questions = [];
    this.isLoading = false;
    this.buttonTimeouts = new Map(); // Track active button timeouts
    this.globalListenerAttached = false;

    // Set up global fallback listener
    this.setupGlobalFallbackListener();
  }

  // Global fallback listener that catches banner clicks even when local listeners fail
  setupGlobalFallbackListener() {
    if (this.globalListenerAttached) return;

    document.addEventListener('click', (e) => {
      // Only handle banner-related clicks
      const bannerContainer = e.target.closest('.banner-page');
      if (!bannerContainer) return;

      const action = e.target.dataset.action;
      if (!action) return;

      // Check if this is our banner page
      if (!this.hostEl || !this.hostEl.contains(e.target)) return;

      console.log('🚨 Global fallback handling click:', action);

      // Try to handle the click
      this.handleClick(e);

      // If the page seems broken (no event listeners), try to fix it
      setTimeout(() => {
        if (!this.isAlreadyRendered()) {
          console.log('🔧 Banner page seems broken, attempting to re-attach listeners');
          this.attachEventListeners();
        }
      }, 100);
    }, true); // Use capture phase to catch before other handlers

    this.globalListenerAttached = true;
    console.log('🌐 Global fallback listener attached');
  }

  async render(hostEl) {
    console.log('🎯 SimpleBannerPage.render() called');

    if (!hostEl) {
      console.error('❌ No host element provided to banner page');
      return;
    }

    // Check if already rendered with same host element and still functional
    if (this.hostEl === hostEl && this.isAlreadyRendered()) {
      console.log('🔄 Banner page already rendered and functional, skipping re-render');
      // Just re-attach event listeners to be safe
      this.attachEventListeners();
      return;
    }

    try {
      // Clean up any previous instance
      this.cleanup();

      this.hostEl = hostEl;
      await this.loadQuestionPickerStyles();
      await this.loadData();
      this.renderUI();
      this.attachEventListeners();
    } catch (error) {
      console.error('❌ Error rendering banner page:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      this.renderError(error.message);
    }
  }

  // Check if the banner page is already rendered and functional
  isAlreadyRendered() {
    if (!this.hostEl) return false;

    // Check if banner content exists
    const bannerPage = this.hostEl.querySelector('.banner-page');
    if (!bannerPage) return false;

    // Check if action buttons exist
    const actionButtons = this.hostEl.querySelectorAll('button[data-action]');
    if (actionButtons.length === 0) return false;

    console.log('✅ Banner page appears functional with', actionButtons.length, 'action buttons');
    return true;
  }

  async loadQuestionPickerStyles() {
    // Load question picker styles if not already loaded
    if (!document.querySelector('link[href*="questionPickerStyles.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './src/views/project/banner/questionPickerStyles.css';
      document.head.appendChild(link);
      console.log('📝 Loaded question picker styles');
    }

    // Load equation builder styles
    if (!document.querySelector('link[href*="equationBuilderStyles"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './src/views/project/banner/equationBuilderStyles.css';
      document.head.appendChild(link);
      console.log('🔧 Loaded equation builder styles');
    }
  }

  async loadData() {
    console.log('📊 Loading banner data...');

    // Safety check: ensure host element still exists
    if (!this.hostEl || !this.hostEl.parentElement) {
      throw new Error('Host element was removed during loading');
    }

    this.isLoading = true;

    try {
      // Get current project questions for equation building (READ-ONLY COPY)
      // CRITICAL: Deep copy to prevent banner tool from modifying original question data
      const originalQuestions = window.state?.questions || [];
      this.questions = JSON.parse(JSON.stringify(originalQuestions));
      console.log('📝 Loaded questions (read-only copy):', this.questions.length);

      // Debug: Check first question structure
      if (this.questions.length > 0) {
        console.log('🔍 First question structure:', {
          id: this.questions[0].id,
          question_id: this.questions[0].question_id,
          idType: typeof this.questions[0].id,
          allKeys: Object.keys(this.questions[0]),
          sample: this.questions[0]
        });
      }

      // Get or create banner for current project
      const projectId = bannerManager.getCurrentProjectId();
      if (!projectId) {
        throw new Error('No active project found');
      }

      // Try to load existing banners
      console.log('🔍 About to call getBannerDefinitions with projectId:', projectId);
      let bannersResult;
      try {
        bannersResult = await bannerManager.getBannerDefinitions(projectId);
        console.log('🔍 getBannerDefinitions result:', bannersResult);
      } catch (bannerError) {
        console.error('❌ Critical error in getBannerDefinitions:', bannerError);
        throw new Error(`Banner loading failed: ${bannerError.message}`);
      }

      if (bannersResult.success && bannersResult.data.length > 0) {
        this.currentBanner = bannersResult.data[0];
        console.log('✅ Loaded existing banner:', this.currentBanner.name || this.currentBanner.banner_name);

        // Load banner groups (H1 categories) and columns (H2 subgroups)
        console.log('🔍 About to call getBannerGroups with bannerId:', this.currentBanner.id);

        try {
          const groupsResult = await bannerManager.getBannerGroups(this.currentBanner.id);
          console.log('🔍 getBannerGroups result:', groupsResult);

          if (groupsResult.success) {
            console.log('🔍 Raw banner groups data from database:', groupsResult.data);

            this.bannerHierarchy = groupsResult.data.map(group => {
              console.log(`🔍 Processing group ${group.name}:`, {
                id: group.id,
                banner_columns: group.banner_columns,
                columns_count: group.banner_columns?.length || 0
              });

              const h2Columns = (group.banner_columns || []).map(col => {
                console.log(`🔍 Processing column ${col.name}:`, {
                  id: col.id,
                  question_id: col.question_id,
                  logic_equation: col.logic_equation,
                  has_logic_equation: !!col.logic_equation
                });

                return {
                  id: col.id,
                  databaseId: col.id,
                  name: col.name,
                  questionId: col.question_id,
                  logicEquation: col.logic_equation || `${col.question_id || 'q1'}=1` // Use saved equation or placeholder
                };
              });

              return {
                id: group.id,
                databaseId: group.id,
                name: group.name,
                h2Columns: h2Columns
              };
            });

            console.log('📊 Loaded banner hierarchy:', this.bannerHierarchy.length, 'H1 groups');
            console.log('📊 Final hierarchy structure:', this.bannerHierarchy);
          } else {
            console.error('❌ Failed to load banner groups:', groupsResult.error);
            this.bannerHierarchy = [];
          }
        } catch (groupsError) {
          console.error('❌ Exception loading banner groups:', groupsError);
          this.bannerHierarchy = [];
        }
      } else {
        // Create default banner
        console.log('🔄 Creating new default banner...');
        const createResult = await bannerManager.createDefaultBanner(projectId);
        if (createResult.success) {
          this.currentBanner = createResult.data;
          this.bannerHierarchy = [];
          console.log('✅ Created new banner:', this.currentBanner.banner_name);
        } else {
          throw new Error(`Failed to create banner: ${createResult.error}`);
        }
      }
    } finally {
      this.isLoading = false;
    }
  }

  renderUI() {
    if (!this.currentBanner) {
      this.renderError('No banner available');
      return;
    }

    this.hostEl.innerHTML = `
      <div class="banner-page">
        <!-- Header Section -->
        <div class="banner-page-header">
          <div class="banner-page-title">
            <h1>Banner Builder</h1>
            <div class="banner-info">
              <span class="banner-name">${this.currentBanner.name || this.currentBanner.banner_name || 'Untitled Banner'}</span>
              <span class="banner-meta">${this.bannerHierarchy.length} demographics • ${this.getTotalH2Count()} columns</span>
            </div>
          </div>
          <div class="banner-actions">
            <button class="btn secondary" data-action="fix-equations">
              Fix Equations
            </button>
            <button class="btn secondary" data-action="export-banner">
              Export CSV
            </button>
            <button class="btn primary large" data-action="add-demographic">
              Add Demographic
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="banner-content">
          <!-- Demographics Builder -->
          <div class="demographics-section">
            <div class="section-header">
              <h2>Demographics</h2>
              <p class="section-description">Create H1 categories and H2 subgroups using questionnaire equations</p>
            </div>

            <div class="demographics-list" id="demographics-container">
              ${this.renderDemographics()}
            </div>

            ${this.bannerHierarchy.length === 0 ? this.renderEmptyState() : ''}
          </div>

          <!-- Banner Preview -->
          <div class="preview-section">
            <div class="section-header">
              <h2>Banner Preview</h2>
              <p class="section-description">Live preview of your banner structure</p>
            </div>

            <div class="banner-preview" id="banner-preview">
              ${this.renderBannerPreview()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderDemographics() {
    if (this.bannerHierarchy.length === 0) return '';

    return this.bannerHierarchy.map((h1Group, index) => `
      <div class="demographic-group" data-h1-id="${h1Group.databaseId}">
        <!-- H1 Group Header -->
        <div class="h1-header">
          <div class="h1-title">
            <h3 contenteditable="true" data-action="edit-h1-name" data-h1-id="${h1Group.databaseId}">
              ${h1Group.name}
            </h3>
            <span class="h1-meta">${h1Group.h2Columns.length} subgroups</span>
          </div>
          <div class="h1-actions">
            <button class="btn-icon" data-action="add-h2" data-h1-id="${h1Group.databaseId}" title="Add Subgroup">
              +
            </button>
            <button class="btn-icon danger" data-action="delete-h1" data-h1-id="${h1Group.databaseId}" title="Delete Category">
              ×
            </button>
          </div>
        </div>

        <!-- H2 Columns -->
        <div class="h2-columns">
          ${h1Group.h2Columns.map(h2Col => `
            <div class="h2-column" data-h2-id="${h2Col.databaseId}">
              <div class="h2-header">
                <input type="text"
                       class="h2-name"
                       value="${h2Col.name}"
                       data-action="edit-h2-name"
                       data-h2-id="${h2Col.databaseId}"
                       placeholder="Subgroup name">
                <button class="btn-icon-small danger" data-action="delete-h2" data-h2-id="${h2Col.databaseId}">×</button>
              </div>
              <div class="h2-equation">
                <input type="text"
                       class="equation-input"
                       value="${h2Col.logicEquation || ''}"
                       data-action="edit-equation"
                       data-h2-id="${h2Col.databaseId}"
                       placeholder="e.g., S7=2 AND q1=4">
                <button class="btn-small secondary" data-action="build-equation" data-h2-id="${h2Col.databaseId}">
                  Build
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <h3>No Demographics Yet</h3>
        <p>Start building your banner by adding demographic categories like "Gender", "Age Groups", or "Usage Patterns".</p>
        <button class="btn primary large" data-action="add-demographic">
          Add Your First Demographic
        </button>
      </div>
    `;
  }

  renderBannerPreview() {
    if (this.bannerHierarchy.length === 0) {
      return `
        <div class="preview-empty">
          <p>Add demographics to see banner preview</p>
        </div>
      `;
    }

    // Calculate total columns
    const totalColumns = this.getTotalH2Count() + 1; // +1 for Total column

    // Generate table structure similar to CSV examples
    const headerRow = ['Total', ...this.bannerHierarchy.flatMap(h1 =>
      h1.h2Columns.map(h2 => h2.name)
    )];

    // Generate sequential column letters: B, C, D, E, F, etc.
    let columnIndex = 0;
    const codeRow = ['(A)', ...this.bannerHierarchy.flatMap(h1 =>
      h1.h2Columns.map(h2 => {
        const letterCode = String.fromCharCode(66 + columnIndex); // B, C, D, etc.
        columnIndex++;
        return `(${letterCode})`;
      })
    )];

    return `
      <div class="banner-preview-container">
        <!-- Fixed Yellow Header -->
        <div class="preview-header">
          <h3>${this.currentBanner.name || this.currentBanner.banner_name || 'Banner Preview'}</h3>
          <span class="confidence-level">90% CONFIDENCE LEVEL</span>
        </div>

        <!-- Scrollable Table Grid -->
        <div class="preview-grid-wrapper">
          <div class="preview-grid" style="grid-template-columns: repeat(${totalColumns}, 1fr);">
            <!-- H1 Category Headers -->
            <div class="category-header total-header">Total</div>
            ${this.bannerHierarchy.map(h1 => `
              <div class="category-header" style="grid-column: span ${h1.h2Columns.length};">
                ${h1.name}
              </div>
            `).join('')}

            <!-- H2 Column Headers -->
            ${headerRow.map((header, index) => `
              <div class="column-header ${index === 0 ? 'total-column' : ''}">
                ${header}
              </div>
            `).join('')}

            <!-- Code Row -->
            ${codeRow.map((code, index) => `
              <div class="code-cell ${index === 0 ? 'total-column' : ''}">
                ${code}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Fixed Equation Definitions -->
        <div class="equation-definitions">
          <h4>Banner Logic:</h4>
          <div class="equation-list">
            <div class="equation-item">
              <span class="eq-code">(A)</span>
              <span class="eq-definition">Total (qualified respondents)</span>
            </div>
            ${(() => {
              let columnIndex = 0;
              return this.bannerHierarchy.flatMap(h1 =>
                h1.h2Columns.map(h2 => {
                  const letterCode = String.fromCharCode(66 + columnIndex);
                  columnIndex++;
                  return `
                    <div class="equation-item">
                      <span class="eq-code">(${letterCode})</span>
                      <span class="eq-definition">${this.formatEquationForDisplay(h2.logicEquation) || 'No equation set'}</span>
                    </div>
                  `;
                })
              ).join('');
            })()}
          </div>
        </div>
      </div>
    `;
  }

  renderError(message) {
    this.hostEl.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Error Loading Banner</h3>
        <p>${message}</p>
        <button class="btn primary" onclick="location.reload()">Reload Page</button>
      </div>
    `;
  }

  // Cleanup method to clear all timeouts and prevent memory leaks
  cleanup() {
    // Clear all button timeouts
    for (const timeoutId of this.buttonTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.buttonTimeouts.clear();
  }

  attachEventListeners() {
    if (!this.hostEl) return;

    // Ensure all action buttons are enabled (prevent stuck disabled state)
    const actionButtons = this.hostEl.querySelectorAll('button[data-action]');
    actionButtons.forEach(button => {
      button.disabled = false;
    });

    // Remove any existing listeners first to prevent duplicates
    this.hostEl.removeEventListener('click', this.boundHandleClick);
    this.hostEl.removeEventListener('input', this.boundHandleInput);
    this.hostEl.removeEventListener('blur', this.boundHandleBlur);

    // Create bound methods if they don't exist
    if (!this.boundHandleClick) {
      this.boundHandleClick = this.handleClick.bind(this);
      this.boundHandleInput = this.handleInput.bind(this);
      this.boundHandleBlur = this.handleBlur.bind(this);
    }

    // Event delegation for all banner actions
    this.hostEl.addEventListener('click', this.boundHandleClick);
    this.hostEl.addEventListener('input', this.boundHandleInput);
    this.hostEl.addEventListener('blur', this.boundHandleBlur);

    console.log('🔗 Event listeners attached to hostEl:', this.hostEl);
  }

  async handleClick(e) {
    const action = e.target.dataset.action;
    if (!action) return;

    console.log('🎯 Banner action:', action, e.target);

    // Prevent double-clicking on any action buttons
    if (['delete-h1', 'delete-h2', 'add-h2', 'add-demographic'].includes(action)) {
      if (e.target.disabled) return;

      // Clear any existing timeout for this action
      const timeoutKey = `${action}-timeout`;
      if (this.buttonTimeouts.has(timeoutKey)) {
        clearTimeout(this.buttonTimeouts.get(timeoutKey));
      }

      e.target.disabled = true;
      const timeoutId = setTimeout(() => {
        e.target.disabled = false;
        this.buttonTimeouts.delete(timeoutKey);
      }, 2000);

      this.buttonTimeouts.set(timeoutKey, timeoutId);
    }

    try {
      switch (action) {
        case 'add-demographic':
          await this.addDemographic();
          break;
        case 'add-h2':
          await this.addH2Column(e.target.dataset.h1Id);
          break;
        case 'delete-h1':
          await this.deleteH1Group(e.target.dataset.h1Id);
          break;
        case 'delete-h2':
          await this.deleteH2Column(e.target.dataset.h2Id);
          break;
        case 'build-equation':
          this.openEquationBuilder(e.target.dataset.h2Id);
          break;
        case 'export-banner':
          await this.exportBanner();
          break;
        case 'fix-equations':
          await this.fixExistingEquations();
          break;
      }
    } catch (error) {
      console.error('❌ Error handling banner action:', error);
      alert(`Error: ${error.message}`);
    }
  }

  async handleInput(e) {
    const action = e.target.dataset.action;
    if (!action) return;

    // ✅ IMMEDIATE VISUAL UPDATE: Update local data instantly (Layer 1)
    const value = e.target.value || e.target.textContent;
    switch (action) {
      case 'edit-h1-name':
        const h1Group = this.bannerHierarchy.find(h1 => h1.databaseId === e.target.dataset.h1Id);
        if (h1Group) {
          h1Group.name = value.trim();
          // ✅ IMMEDIATE PREVIEW UPDATE: Update banner preview instantly
          this.updatePreview();
        }
        break;
      case 'edit-h2-name':
        this.bannerHierarchy.forEach(h1 => {
          const h2 = h1.h2Columns.find(h2 => h2.databaseId === e.target.dataset.h2Id);
          if (h2) {
            h2.name = value.trim();
            // ✅ IMMEDIATE PREVIEW UPDATE: Update banner preview instantly
            this.updatePreview();
          }
        });
        break;
      case 'edit-equation':
        this.bannerHierarchy.forEach(h1 => {
          const h2 = h1.h2Columns.find(h2 => h2.databaseId === e.target.dataset.h2Id);
          if (h2) {
            h2.logicEquation = value.trim();
            // ✅ IMMEDIATE PREVIEW UPDATE: Update banner preview instantly
            this.updatePreview();
          }
        });
        break;
    }

    // ✅ DEBOUNCED SAVE: Save to database in background (Layer 2)
    clearTimeout(this.inputTimeout);
    this.inputTimeout = setTimeout(async () => {
      try {
        switch (action) {
          case 'edit-h1-name':
            await this.saveH1Name(e.target.dataset.h1Id, value.trim());
            break;
          case 'edit-h2-name':
            await this.saveH2Name(e.target.dataset.h2Id, value.trim());
            break;
          case 'edit-equation':
            await this.saveEquation(e.target.dataset.h2Id, value.trim());
            break;
        }
      } catch (error) {
        console.error('❌ Error saving:', error);
      }
    }, 1000); // 1 second debounce
  }

  async handleBlur(e) {
    // Handle immediate save on blur for important fields
    const action = e.target.dataset.action;
    if (action === 'edit-h1-name' || action === 'edit-h2-name') {
      clearTimeout(this.inputTimeout);
      try {
        const value = e.target.value || e.target.textContent;
        if (action === 'edit-h1-name') {
          await this.saveH1Name(e.target.dataset.h1Id, value.trim());
        } else if (action === 'edit-h2-name') {
          await this.saveH2Name(e.target.dataset.h2Id, value.trim());
        }
      } catch (error) {
        console.error('❌ Error saving on blur:', error);
      }
    }
  }

  // === ACTION HANDLERS ===

  async addDemographic() {
    console.log('➕ Adding new demographic category...');

    const demographicName = prompt('Enter demographic category name (e.g., "Gender", "Age Groups"):');
    if (!demographicName || !demographicName.trim()) return;

    console.log('📊 Banner hierarchy before creation:', this.bannerHierarchy.length, 'groups');

    const result = await bannerManager.createBannerGroup({
      bannerId: this.currentBanner.id,
      name: demographicName.trim(),
      displayOrder: this.bannerHierarchy.length
    });

    if (result.success) {
      console.log('✅ Created H1 group:', result.data);

      // ✅ MINIMAL UPDATE: Add new group to local data
      const newH1Group = {
        id: result.data.id,
        databaseId: result.data.id,
        name: result.data.name,
        h2Columns: []
      };
      this.bannerHierarchy.push(newH1Group);

      // ✅ MINIMAL UPDATE: Only add the new H1 element to DOM (no re-render)
      this.addH1ElementToDOM(newH1Group);
      this.updateBannerMeta();
      this.updatePreview();

      console.log('📊 Added group locally:', this.bannerHierarchy.length, 'groups');
    } else {
      throw new Error(result.error);
    }
  }

  async addH2Column(h1Id) {
    console.log('➕ Opening question picker for H1:', h1Id);

    const h1Group = this.bannerHierarchy.find(h1 => h1.databaseId === h1Id);
    if (!h1Group) {
      throw new Error('H1 group not found');
    }

    // Open the question picker modal
    questionPicker.open(this.questions, async (result) => {
      console.log('🎯 Question picker result:', result);
      await this.createSubgroupsFromOptions(h1Id, result);
    });
  }

  async createSubgroupsFromOptions(h1Id, pickerResult) {
    const { question, selectedOptions } = pickerResult;

    console.log(`📊 Creating ${selectedOptions.length} subgroups for question ${question.question_id}`);
    console.log('📝 Question structure:', {
      id: question.id,
      question_id: question.question_id,
      keys: Object.keys(question),
      // Look for UUID-like fields
      possibleUUIDs: Object.entries(question).filter(([key, value]) =>
        typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
      )
    });
    console.log('📊 Selected options:', selectedOptions);

    const h1Group = this.bannerHierarchy.find(h1 => h1.databaseId === h1Id);
    if (!h1Group) {
      throw new Error('H1 group not found');
    }

    // Note: We allow "duplicate" names because users will differentiate them with equations
    // For example: "Acuvue Oasys 1-Day" with "S7=2 AND S1=1" vs "S7=2 AND S1=2"

    try {
      // Create a banner column for each selected option
      const createPromises = selectedOptions.map(async (option, index) => {
        let columnName = option.label || option.value || `Option ${index + 1}`;

        // Make name unique if it already exists by adding a suffix
        const existingNames = h1Group.h2Columns.map(col => col.name);
        let uniqueName = columnName;
        let suffix = 1;

        while (existingNames.includes(uniqueName)) {
          uniqueName = `${columnName} (${suffix})`;
          suffix++;
        }

        columnName = uniqueName;
        // Use question.id (like "S7") not the UUID for the equation
        const questionCode = question.id || question.question_id || 'Q1';
        const optionCode = option.code || option.value || (index + 1);

        // Handle numeric questions with custom equations
        let equation;
        if (option.equation) {
          // Numeric question with custom operator/value (e.g., "Q1>5", "Q1<=2")
          equation = option.equation;
          console.log(`🔢 Using custom numeric equation: "${equation}"`);
        } else {
          // Standard single/multi question format (e.g., "S7=2")
          equation = `${questionCode}=${optionCode}`;
        }

        console.log(`🔧 Creating subgroup: "${columnName}" with equation: "${equation}"`);
        console.log('📝 Option structure:', option);

        // Try to find the actual UUID for this question
        let questionUUID = null;

        // Check if we already have a UUID
        const possibleUUIDs = Object.entries(question).filter(([key, value]) =>
          typeof value === 'string' &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
        );

        if (possibleUUIDs.length > 0) {
          questionUUID = possibleUUIDs[0][1]; // Use the first UUID found
          console.log(`🎯 Found UUID in question object: ${questionUUID} (field: ${possibleUUIDs[0][0]})`);
        } else {
          // If no UUID in object, try to look up by question_id (code)
          const questionCode = question.id || question.question_id;
          console.log(`🔍 Looking up UUID for question code: ${questionCode}`);

          // CRITICAL: Database UUID lookup with enhanced debugging (FIXED hanging issue)
          // This lookup was hanging silently on second H1 categories until we added
          // timeout and connection testing in bannerManager.lookupQuestionUUID()
          try {
            // Use bannerManager's Supabase client instead of window.supabase
            console.log(`🔍 About to call bannerManager.lookupQuestionUUID(${questionCode})`);
            const result = await bannerManager.lookupQuestionUUID(questionCode);
            console.log(`🔍 Database lookup result:`, result);
            if (!result.success) {
              console.error(`❌ Lookup failed:`, result.error);
              throw new Error(result.error);
            }
            questionUUID = result.data.id;
            console.log(`✅ Found UUID in database: ${questionUUID} for code ${questionCode}`);
          } catch (lookupError) {
            console.error(`❌ Failed to lookup question UUID for ${questionCode}:`, lookupError);
            throw new Error(`Cannot find question UUID for code: ${questionCode} - ${lookupError.message}`);
          }
        }

        console.log(`🔧 About to create banner column with question code: ${questionCode}`);

        const createParams = {
          bannerGroupId: h1Id,
          name: columnName.trim(),
          questionId: questionCode,  // ⚠️ CHANGED: Use text ID (like "S7") not UUID
          displayOrder: h1Group.h2Columns.length + index,
          spssVariableName: `BNR_${question.id || question.question_id}_${option.value || option.code || index + 1}`,
          logicEquation: equation // Store the equation like "S7=2"
        };

        console.log('📝 Create params:', createParams);

        return await bannerManager.createBannerColumn(createParams);
      });

      // Wait for all columns to be created
      const results = await Promise.all(createPromises);

      // Check for failures
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        console.error('❌ Some subgroups failed to create:', failures);
        failures.forEach(f => console.error('❌ Failure details:', f));

        // Show user-friendly error message
        alert(`Failed to create ${failures.length} subgroups. Please check the console for details or try again.`);
        throw new Error(`Failed to create ${failures.length} subgroups: ${failures.map(f => f.error).join(', ')}`);
      }

      console.log(`✅ Successfully created ${results.length} subgroups`);

      // ✅ MINIMAL UPDATE: Add new H2 columns to local data
      const newH2Columns = results.map((result, index) => ({
        id: result.data.id,
        databaseId: result.data.id,
        name: result.data.name, // Use the unique name we created (with suffix if needed)
        questionId: result.data.question_id,
        logicEquation: result.data.logic_equation || `${question.id || question.question_id}=${selectedOptions[index].code || selectedOptions[index].value || (index + 1)}`
      }));

      // Add to local hierarchy
      h1Group.h2Columns.push(...newH2Columns);

      // ✅ MINIMAL UPDATE: Only add the new H2 elements to DOM (no re-render)
      this.addH2ElementsToDOM(h1Id, newH2Columns);
      this.updateBannerMeta();
      this.updatePreview();

    } catch (error) {
      console.error('❌ Error creating subgroups:', error);
      throw new Error(`Failed to create subgroups: ${error.message}`);
    }
  }

  async deleteH1Group(h1Id) {
    if (!confirm('Delete this demographic category and all its subgroups?')) return;

    console.log('🗑️ Deleting H1 group:', h1Id);

    const result = await bannerManager.deleteBannerGroup(h1Id);
    if (result.success) {
      // ✅ MINIMAL UPDATE: Remove from local data
      this.bannerHierarchy = this.bannerHierarchy.filter(h1 => h1.databaseId !== h1Id);

      // ✅ MINIMAL UPDATE: Remove only the specific H1 element from DOM
      const h1Element = this.hostEl.querySelector(`[data-h1-id="${h1Id}"]`);
      if (h1Element) {
        h1Element.remove();
      }

      // Update meta and preview
      this.updateBannerMeta();
      this.updatePreview();
    } else {
      throw new Error(result.error);
    }
  }

  async deleteH2Column(h2Id) {
    console.log('🗑️ Deleting H2 column:', h2Id);

    const result = await bannerManager.deleteBannerColumn(h2Id);
    if (result.success) {
      // ✅ MINIMAL UPDATE: Remove from local data
      let h1Group = null;
      this.bannerHierarchy.forEach(h1 => {
        const h2Index = h1.h2Columns.findIndex(h2 => h2.databaseId === h2Id);
        if (h2Index !== -1) {
          h1.h2Columns.splice(h2Index, 1);
          h1Group = h1;
        }
      });

      // ✅ MINIMAL UPDATE: Remove only the specific H2 element from DOM
      const h2Element = this.hostEl.querySelector(`[data-h2-id="${h2Id}"]`);
      if (h2Element) {
        h2Element.remove();
      }

      // Update the H1 meta count if we found the group
      if (h1Group) {
        const h1MetaSpan = this.hostEl.querySelector(`[data-h1-id="${h1Group.databaseId}"] .h1-meta`);
        if (h1MetaSpan) {
          h1MetaSpan.textContent = `${h1Group.h2Columns.length} subgroups`;
        }
      }

      // Update overall meta and preview
      this.updateBannerMeta();
      this.updatePreview();
    } else {
      throw new Error(result.error);
    }
  }

  async updateH1Name(h1Id, newName) {
    if (!newName) return;

    console.log('✏️ Updating H1 name:', h1Id, newName);

    const result = await bannerManager.updateBannerGroup(h1Id, {
      name: newName
    });

    if (result.success) {
      // ✅ MINIMAL UPDATE: Update local data
      const h1Group = this.bannerHierarchy.find(h1 => h1.databaseId === h1Id);
      if (h1Group) {
        h1Group.name = newName;

        // ✅ MINIMAL UPDATE: Update only the specific H1 name in DOM
        const h1NameElement = this.hostEl.querySelector(`[data-h1-id="${h1Id}"] h3[contenteditable]`);
        if (h1NameElement && h1NameElement.textContent !== newName) {
          h1NameElement.textContent = newName;
        }

        this.updatePreview();
      }
    } else {
      throw new Error(result.error);
    }
  }

  async updateH2Name(h2Id, newName) {
    if (!newName) return;

    console.log('✏️ Updating H2 name:', h2Id, newName);

    const result = await bannerManager.updateBannerColumn(h2Id, {
      name: newName
    });

    if (result.success) {
      // ✅ MINIMAL UPDATE: Update local data
      this.bannerHierarchy.forEach(h1 => {
        const h2 = h1.h2Columns.find(h2 => h2.databaseId === h2Id);
        if (h2) {
          h2.name = newName;

          // ✅ MINIMAL UPDATE: Update only the specific H2 name in DOM
          const h2NameInput = this.hostEl.querySelector(`[data-h2-id="${h2Id}"] .h2-name`);
          if (h2NameInput && h2NameInput.value !== newName) {
            h2NameInput.value = newName;
          }
        }
      });
      this.updatePreview();
    } else {
      throw new Error(result.error);
    }
  }

  async updateEquation(h2Id, equation) {
    console.log('🔧 Updating equation:', h2Id, equation);

    // ✅ MINIMAL UPDATE: Update local data
    this.bannerHierarchy.forEach(h1 => {
      const h2 = h1.h2Columns.find(h2 => h2.databaseId === h2Id);
      if (h2) {
        h2.logicEquation = equation;

        // ✅ MINIMAL UPDATE: Update only the specific equation input in DOM
        const equationInput = this.hostEl.querySelector(`[data-h2-id="${h2Id}"] .equation-input`);
        if (equationInput && equationInput.value !== equation) {
          equationInput.value = equation;
        }
      }
    });
    this.updatePreview();

    // Update in database
    try {
      const result = await bannerManager.updateBannerColumn(h2Id, {
        logic_equation: equation
      });

      if (result.success) {
        console.log('✅ Equation saved to database:', equation);
      } else {
        console.error('❌ Failed to save equation to database:', result.error);
      }
    } catch (error) {
      console.error('❌ Error saving equation to database:', error);
    }
  }

  openEquationBuilder(h2Id) {
    console.log('🔧 Opening professional equation builder for H2:', h2Id);

    // Find the current H2 column
    const h2Column = this.findH2Column(h2Id);
    if (!h2Column) {
      alert('Column not found');
      return;
    }

    // Get current equation or create a default one
    const currentEquation = h2Column.logicEquation || '';

    console.log('🔍 H2 Column data:', h2Column);
    console.log('🔍 Current equation from database:', currentEquation);
    console.log('🔍 Current equation type:', typeof currentEquation);

    // Open the professional equation builder modal
    equationBuilder.open(
      h2Id,
      currentEquation,
      this.questions,
      (newEquation) => {
        console.log('💾 Equation saved:', newEquation);
        this.updateEquation(h2Id, newEquation);
      }
    );
  }

  findH2Column(h2Id) {
    for (const h1Group of this.bannerHierarchy) {
      const h2Column = h1Group.h2Columns.find(col => col.databaseId === h2Id);
      if (h2Column) {
        return h2Column;
      }
    }
    return null;
  }

  async exportBanner() {
    console.log('📤 Exporting banner...');

    // Generate CSV content similar to examples
    const csvContent = this.generateBannerCSV();

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentBanner.banner_name || 'banner'}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Banner exported successfully');
  }

  generateBannerCSV() {
    const lines = [];

    // Header
    lines.push('BANNERS');
    lines.push('90% CONFIDENCE LEVEL');
    lines.push('');

    // Column headers
    const headers = ['Total', ...this.bannerHierarchy.flatMap(h1 =>
      h1.h2Columns.map(h2 => h2.name)
    )];
    lines.push(headers.join(','));

    // Codes
    let columnIndex = 0;
    const codes = ['(A)', ...this.bannerHierarchy.flatMap(h1 =>
      h1.h2Columns.map(h2 => {
        const letterCode = String.fromCharCode(66 + columnIndex);
        columnIndex++;
        return `(${letterCode})`;
      })
    )];
    lines.push(codes.join(','));

    lines.push('');

    // Equation definitions
    lines.push('(A) Total (qualified respondents)');
    columnIndex = 0; // Reset the existing columnIndex variable
    this.bannerHierarchy.forEach(h1 => {
      h1.h2Columns.forEach(h2 => {
        const letterCode = String.fromCharCode(66 + columnIndex);
        columnIndex++;
        lines.push(`(${letterCode}) ${this.formatEquationForDisplay(h2.logicEquation) || 'No equation set'}`);
      });
    });

    return lines.join('\\n');
  }

  // === UTILITY METHODS ===

  getTotalH2Count() {
    return this.bannerHierarchy.reduce((total, h1) => total + h1.h2Columns.length, 0);
  }

  async refreshData() {
    console.log('🔄 Refreshing banner data...');
    console.log('📊 Hierarchy before refresh:', this.bannerHierarchy.length, 'groups');

    // Add small delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 100));

    await this.loadData();
    console.log('📊 Hierarchy after loadData:', this.bannerHierarchy.length, 'groups');
    console.log('📊 Groups:', this.bannerHierarchy.map(h1 => ({ id: h1.databaseId, name: h1.name })));

    console.log('🎨 Calling renderUI()...');
    this.renderUI();
    console.log('🔗 Attaching event listeners...');
    this.attachEventListeners();
    console.log('✅ Refresh complete');
  }

  // Fix existing equations that use UUIDs instead of question codes
  async fixExistingEquations() {
    console.log('🔧 Fixing existing UUID-based equations...');

    for (const h1Group of this.bannerHierarchy) {
      for (const h2Column of h1Group.h2Columns) {
        // Check if equation uses UUID format
        if (h2Column.logicEquation && h2Column.logicEquation.includes('-')) {
          console.log(`🔧 Fixing equation for: ${h2Column.name}`);
          console.log(`   Old equation: ${h2Column.logicEquation}`);

          // Find the question for this UUID
          const question = this.questions.find(q =>
            (q.uuid || q.question_uuid) === h2Column.questionId ||
            q.id === h2Column.questionId
          );

          if (question) {
            // Extract the value part (after =)
            const valuePart = h2Column.logicEquation.split('=')[1];
            // Create new equation with question code
            const questionCode = question.id || question.question_id || 'Q1';
            const newEquation = `${questionCode}=${valuePart}`;

            console.log(`   New equation: ${newEquation}`);

            // Update in local data
            h2Column.logicEquation = newEquation;

            // Update in database
            await this.updateEquation(h2Column.databaseId, newEquation);
          }
        }
      }
    }

    // ✅ MINIMAL UPDATE: Only refresh the preview, not the entire UI
    this.updatePreview();
  }

  updatePreview() {
    const previewContainer = this.hostEl.querySelector('#banner-preview');
    if (previewContainer) {
      previewContainer.innerHTML = this.renderBannerPreview();
    }
  }

  /**
   * Convert database equation format to display format
   * "Q1 BETWEEN 5 AND 10" -> "Q1 = 5-10"
   */
  formatEquationForDisplay(equation) {
    console.log('🎯 formatEquationForDisplay called with:', equation);
    if (!equation) return equation;

    // Handle BETWEEN format - replace all instances
    let result = equation;

    // Pattern to match: questionId BETWEEN value1 AND value2
    // Must be careful not to match logical AND operators
    const betweenPattern = /(\w+)\s+BETWEEN\s+([^A-Z\s]+)\s+AND\s+([^A-Z\s]+)/gi;

    result = result.replace(betweenPattern, (match, questionId, fromValue, toValue) => {
      console.log('🔄 Converting BETWEEN:', match, '→', `${questionId} = ${fromValue.trim()}-${toValue.trim()}`);
      return `${questionId} = ${fromValue.trim()}-${toValue.trim()}`;
    });

    console.log('🎯 formatEquationForDisplay result:', result);
    return result;
  }

  // ✅ TRULY MINIMAL UPDATE: Add new H1 element without touching existing ones
  addH1ElementToDOM(h1Group) {
    const container = this.hostEl.querySelector('#demographics-container');
    if (container) {
      // Create the new H1 group element
      const newH1Html = `
        <div class="demographic-group" data-h1-id="${h1Group.databaseId}">
          <!-- H1 Group Header -->
          <div class="h1-header">
            <div class="h1-title">
              <h3 contenteditable="true" data-action="edit-h1-name" data-h1-id="${h1Group.databaseId}">
                ${h1Group.name}
              </h3>
              <span class="h1-meta">${h1Group.h2Columns.length} subgroups</span>
            </div>
            <div class="h1-actions">
              <button class="btn-icon" data-action="add-h2" data-h1-id="${h1Group.databaseId}" title="Add Subgroup">
                ➕
              </button>
              <button class="btn-icon danger" data-action="delete-h1" data-h1-id="${h1Group.databaseId}" title="Delete Category">
                🗑️
              </button>
            </div>
          </div>

          <!-- H2 Columns -->
          <div class="h2-columns">
            ${h1Group.h2Columns.map(h2Col => `
              <div class="h2-column" data-h2-id="${h2Col.databaseId}">
                <div class="h2-header">
                  <input type="text"
                         class="h2-name"
                         value="${h2Col.name}"
                         data-action="edit-h2-name"
                         data-h2-id="${h2Col.databaseId}"
                         placeholder="Subgroup name">
                  <button class="btn-icon-small danger" data-action="delete-h2" data-h2-id="${h2Col.databaseId}">×</button>
                </div>
                <div class="h2-equation">
                  <input type="text"
                         class="equation-input"
                         value="${h2Col.logicEquation || ''}"
                         data-action="edit-equation"
                         data-h2-id="${h2Col.databaseId}"
                         placeholder="e.g., S7=2 AND q1=4">
                  <button class="btn-small secondary" data-action="build-equation" data-h2-id="${h2Col.databaseId}">
                    🔧 Build
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      // Insert the new element
      container.insertAdjacentHTML('beforeend', newH1Html);

      // ✅ CRITICAL: Ensure buttons are enabled (event delegation handles clicks)
      // Use requestAnimationFrame for better timing than setTimeout
      requestAnimationFrame(() => {
        const newH1Element = container.querySelector(`[data-h1-id="${h1Group.databaseId}"]`);
        if (newH1Element) {
          // Ensure all buttons start enabled (prevent stuck disabled state)
          const buttons = newH1Element.querySelectorAll('button[data-action]');
          buttons.forEach(button => {
            button.disabled = false;
          });

          console.log('✅ Enabled buttons in new H1 element:', buttons.length, 'buttons');

          // Verify buttons are actually clickable by testing one
          if (buttons.length > 0) {
            console.log('🔍 Testing first button accessibility:', {
              element: buttons[0],
              disabled: buttons[0].disabled,
              dataset: buttons[0].dataset,
              visible: buttons[0].offsetParent !== null
            });
          }
        } else {
          console.error('❌ Could not find newly created H1 element with ID:', h1Group.databaseId);
        }
      });
    }
  }

  // ✅ TRULY MINIMAL UPDATE: Add new H2 elements to existing H1 without touching other elements
  addH2ElementsToDOM(h1Id, newH2Columns) {
    console.log('🔧 Adding H2 elements to DOM:', h1Id, newH2Columns.length, 'columns');

    const h1Element = this.hostEl.querySelector(`[data-h1-id="${h1Id}"]`);
    console.log('🔍 Found H1 element:', !!h1Element);

    if (h1Element) {
      const h2Container = h1Element.querySelector('.h2-columns');
      const h1MetaSpan = h1Element.querySelector('.h1-meta');

      console.log('🔍 Found H2 container:', !!h2Container);
      console.log('🔍 Found H1 meta span:', !!h1MetaSpan);

      if (h2Container && h1MetaSpan) {
        // Add each new H2 column
        newH2Columns.forEach((h2Col, index) => {
          console.log(`🔧 Adding H2 column ${index + 1}:`, h2Col.name);
          const newH2Html = `
            <div class="h2-column" data-h2-id="${h2Col.databaseId}">
              <div class="h2-header">
                <input type="text"
                       class="h2-name"
                       value="${h2Col.name}"
                       data-action="edit-h2-name"
                       data-h2-id="${h2Col.databaseId}"
                       placeholder="Subgroup name">
                <button class="btn-icon-small danger" data-action="delete-h2" data-h2-id="${h2Col.databaseId}">×</button>
              </div>
              <div class="h2-equation">
                <input type="text"
                       class="equation-input"
                       value="${h2Col.logicEquation || ''}"
                       data-action="edit-equation"
                       data-h2-id="${h2Col.databaseId}"
                       placeholder="e.g., S7=2 AND q1=4">
                <button class="btn-small secondary" data-action="build-equation" data-h2-id="${h2Col.databaseId}">
                  Build
                </button>
              </div>
            </div>
          `;
          h2Container.insertAdjacentHTML('beforeend', newH2Html);
          console.log(`✅ Inserted H2 column ${index + 1} into DOM`);
        });

        console.log('🔍 H2 container children after insertion:', h2Container.children.length);

        // ✅ CRITICAL: Ensure H2 buttons are enabled (event delegation handles clicks)
        // Use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          newH2Columns.forEach(h2Col => {
            const newH2Element = h2Container.querySelector(`[data-h2-id="${h2Col.databaseId}"]`);
            if (newH2Element) {
              // Ensure all buttons start enabled (prevent stuck disabled state)
              const buttons = newH2Element.querySelectorAll('button[data-action]');
              buttons.forEach(button => {
                button.disabled = false;
              });

              console.log(`✅ Enabled buttons in H2 "${h2Col.name}":`, buttons.length, 'buttons');

              // Verify buttons are accessible
              if (buttons.length > 0) {
                console.log('🔍 Testing H2 buttons:', {
                  element: buttons[0],
                  disabled: buttons[0].disabled,
                  action: buttons[0].dataset.action,
                  visible: buttons[0].offsetParent !== null
                });
              }
            } else {
              console.error('❌ Could not find newly created H2 element with ID:', h2Col.databaseId);
            }
          });
        });

        // Update the H1 meta count
        const h1Group = this.bannerHierarchy.find(h1 => h1.databaseId === h1Id);
        if (h1Group) {
          const totalH2Count = h1Group.h2Columns.length;
          h1MetaSpan.textContent = `${totalH2Count} subgroups`;
          console.log(`✅ Updated H1 meta count to ${totalH2Count} for group ${h1Group.name}`);
        } else {
          console.error(`❌ Could not find H1 group with ID ${h1Id} in hierarchy`);
          console.log('📊 Available H1 groups:', this.bannerHierarchy.map(h1 => ({ id: h1.databaseId, name: h1.name })));
        }
      }
    }
  }

  // ✅ TARGETED UPDATE: Update only the banner meta information
  updateBannerMeta() {
    const metaEl = this.hostEl.querySelector('.banner-meta');
    if (metaEl) {
      metaEl.textContent = `${this.bannerHierarchy.length} demographics • ${this.getTotalH2Count()} columns`;
    }
  }

  // ✅ BACKGROUND SAVE METHODS: Save to database without DOM updates (data already updated)
  async saveH1Name(h1Id, newName) {
    if (!newName) return;

    console.log('💾 Saving H1 name to database:', h1Id, newName);

    const result = await bannerManager.updateBannerGroup(h1Id, {
      name: newName
    });

    if (result.success) {
      console.log('✅ H1 name saved to database');
      this.updatePreview(); // Only update preview after successful save
    } else {
      console.error('❌ Failed to save H1 name:', result.error);
    }
  }

  async saveH2Name(h2Id, newName) {
    if (!newName) return;

    console.log('💾 Saving H2 name to database:', h2Id, newName);

    const result = await bannerManager.updateBannerColumn(h2Id, {
      name: newName
    });

    if (result.success) {
      console.log('✅ H2 name saved to database');
      this.updatePreview(); // Only update preview after successful save
    } else {
      console.error('❌ Failed to save H2 name:', result.error);
    }
  }

  async saveEquation(h2Id, equation) {
    console.log('💾 Saving equation to database:', h2Id, equation);

    const result = await bannerManager.updateBannerColumn(h2Id, {
      logic_equation: equation
    });

    if (result.success) {
      console.log('✅ Equation saved to database');
      this.updatePreview(); // Only update preview after successful save
    } else {
      console.error('❌ Failed to save equation:', result.error);
    }
  }
}

// Export the class
export default new SimpleBannerPage();