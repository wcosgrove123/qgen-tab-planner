/**
 * Core Editor State Management System
 *
 * This module provides a centralized, consistent way to manage editor state
 * and updates, eliminating the architectural issues causing bugs.
 */

class EditorCore {
    constructor() {
        this.state = {
            activeQuestionIndex: null,
            expandedSections: new Set(),
            openAdvancedPanels: new Set(),
            isRendering: false
        };

        this.eventHandlers = new Map();
        this.actionQueue = [];
        this.renderDebounceTimeout = null;
    }

    // Centralized question index management
    getActiveQuestion() {
        if (this.state.activeQuestionIndex === null) return null;
        return window.state?.questions?.[this.state.activeQuestionIndex] || null;
    }

    setActiveQuestion(index) {
        console.log('EditorCore: Setting active question to index', index);
        const oldIndex = this.state.activeQuestionIndex;
        this.state.activeQuestionIndex = index;

        // Update UI state in window for compatibility
        window.ui_state = window.ui_state || {};
        window.ui_state.active_question_index = index;

        // Update sidebar highlighting without re-render
        this.updateSidebarHighlight(index);

        // Only re-render panel if question actually changed
        if (oldIndex !== index) {
            console.log('EditorCore: Question changed, scheduling panel render');
            this.scheduleRender('panel');
        }
    }

    // Centralized action handling with proper indexing
    executeAction(actionType, ...args) {
        // Prevent actions during rendering
        if (this.state.isRendering) {
            this.actionQueue.push([actionType, ...args]);
            return;
        }

        try {
            switch (actionType) {
                case 'deleteQuestion':
                    this.deleteQuestion(args[0]);
                    break;
                case 'updateOption':
                    this.updateOption(args[0], args[1], args[2], args[3]);
                    break;
                case 'toggleSidebar':
                    this.toggleSidebarSection(args[0]);
                    break;
                // Add other actions as needed
                default:
                    console.warn('Unknown action type:', actionType);
            }
        } catch (error) {
            console.error('Action execution failed:', error);
        }
    }

    // Safe question deletion with proper index management
    deleteQuestion(questionIndex) {
        const questions = window.state?.questions;
        if (!questions || questionIndex < 0 || questionIndex >= questions.length) {
            console.error('Invalid question index for deletion:', questionIndex);
            return;
        }

        const questionId = questions[questionIndex]?.id || 'this question';
        if (!confirm(`Are you sure you want to delete question ${questionId}?`)) {
            return;
        }

        // Remove the question
        questions.splice(questionIndex, 1);

        // Update active index safely
        if (this.state.activeQuestionIndex >= questionIndex) {
            const newIndex = Math.max(0, this.state.activeQuestionIndex - 1);
            this.state.activeQuestionIndex = questions.length > 0 ? newIndex : null;
            window.ui_state.active_question_index = this.state.activeQuestionIndex;
        }

        // Trigger autosave and re-render
        this.scheduleAutosave();
        this.scheduleRender('full');
    }

    // Direct sidebar highlighting without re-render
    updateSidebarHighlight(activeIndex) {
        document.querySelectorAll('.question-item').forEach(item => {
            const itemIndex = parseInt(item.dataset.index);
            if (itemIndex === activeIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Centralized rendering with proper state preservation
    scheduleRender(type = 'full') {
        clearTimeout(this.renderDebounceTimeout);
        this.renderDebounceTimeout = setTimeout(() => {
            this.performRender(type);
        }, 10); // Small debounce to batch updates
    }

    performRender(type) {
        this.state.isRendering = true;

        try {
            if (type === 'full') {
                // Full re-render - preserve UI state
                this.preserveUIState();
                this.renderEditor();
                setTimeout(() => this.restoreUIState(), 0);
            } else if (type === 'panel') {
                // Panel-only re-render
                this.renderPanel();
            }
        } finally {
            this.state.isRendering = false;

            // Process queued actions
            while (this.actionQueue.length > 0) {
                const [actionType, ...args] = this.actionQueue.shift();
                this.executeAction(actionType, ...args);
            }
        }
    }

    preserveUIState() {
        // Save expanded sections
        this.state.expandedSections.clear();
        document.querySelectorAll('.collapsible-section.expanded').forEach(section => {
            const id = section.dataset.sectionId;
            if (id) this.state.expandedSections.add(id);
        });

        // Save open advanced panels
        this.state.openAdvancedPanels.clear();
        document.querySelectorAll('.advanced-options:not(.is-hidden)').forEach(panel => {
            if (panel.id) this.state.openAdvancedPanels.add(panel.id);
        });
    }

    restoreUIState() {
        // Restore expanded sections
        this.state.expandedSections.forEach(sectionId => {
            const section = document.querySelector(`[data-section-id="${sectionId}"]`);
            if (section) section.classList.add('expanded');
        });

        // Restore open advanced panels
        this.state.openAdvancedPanels.forEach(panelId => {
            const panel = document.getElementById(panelId);
            if (panel) panel.classList.remove('is-hidden');
        });
    }

    scheduleAutosave() {
        if (window.queueAutosave) {
            window.queueAutosave();
        }
    }

    // Import existing render functions
    renderEditor() {
        const hostEl = document.getElementById('prefield-content-host');
        if (hostEl && window.renderEditor) {
            window.renderEditor(hostEl);
        }
    }

    renderPanel() {
        console.log('EditorCore: Rendering panel for index', this.state.activeQuestionIndex);
        const panelHost = document.getElementById('editor-panel-host');
        const question = this.getActiveQuestion();

        console.log('EditorCore: Panel host exists:', !!panelHost);
        console.log('EditorCore: Question exists:', !!question);
        console.log('EditorCore: Question data:', question);
        console.log('EditorCore: window.renderEditorPanel available:', typeof window.renderEditorPanel);

        if (panelHost && question) {
            // Check if renderEditorPanel is available, if not use fallback
            if (typeof window.renderEditorPanel === 'function') {
                const actions = window.getAllEditorActions ? window.getAllEditorActions() : this.getEditorActions();

                console.log('EditorCore: Calling renderEditorPanel');
                window.renderEditorPanel({
                    hostEl: panelHost,
                    question: question,
                    questionIndex: this.state.activeQuestionIndex,
                    activeTab: window.ui_state?.active_tab || 'main',
                    actions: actions
                });
            } else {
                console.warn('EditorCore: renderEditorPanel not available, falling back to full render');
                this.renderEditor();
            }
        } else {
            console.warn('EditorCore: Cannot render panel - missing panelHost or question');
        }
    }

    getEditorActions() {
        // Return centralized actions that use this core system
        return {
            onDeleteQuestion: (index) => this.executeAction('deleteQuestion', index),
            onSelectQuestion: (index) => this.setActiveQuestion(index),
            onUpdateOption: (qIndex, optIndex, key, value) =>
                this.executeAction('updateOption', qIndex, optIndex, key, value),
            // Add other actions as needed
        };
    }

    // Single event delegation system
    initializeEventHandling() {
        // Remove existing handlers to prevent conflicts
        this.cleanupEventHandlers();

        // Single delegated event handler for all editor interactions
        const hostEl = document.getElementById('prefield-content-host');
        if (hostEl) {
            this.mainEventHandler = (e) => this.handleEvent(e);
            hostEl.addEventListener('click', this.mainEventHandler);
            this.eventHandlers.set('main', this.mainEventHandler);
        }
    }

    handleEvent(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const questionIndex = this.state.activeQuestionIndex;

        // Stop propagation to prevent conflicts
        e.stopPropagation();

        switch (action) {
            case 'delete-question':
                this.executeAction('deleteQuestion', questionIndex);
                break;
            case 'toggle-section':
                this.toggleSectionExpansion(target);
                break;
            // Add other cases as needed
        }
    }

    toggleSectionExpansion(target) {
        if (!target.closest('.collapsible-header')) return;

        const section = target.closest('.collapsible-section');
        if (section) {
            section.classList.toggle('expanded');

            // Update our state
            const sectionId = section.dataset.sectionId;
            if (sectionId) {
                if (section.classList.contains('expanded')) {
                    this.state.expandedSections.add(sectionId);
                } else {
                    this.state.expandedSections.delete(sectionId);
                }
            }
        }
    }

    cleanupEventHandlers() {
        this.eventHandlers.forEach((handler, key) => {
            const hostEl = document.getElementById('prefield-content-host');
            if (hostEl) {
                hostEl.removeEventListener('click', handler);
            }
        });
        this.eventHandlers.clear();
    }

    // Initialize the core system
    initialize() {
        // Set up centralized state
        this.state.activeQuestionIndex = window.ui_state?.active_question_index || null;

        // TEMPORARILY DISABLE EVENT HANDLING to prevent conflicts
        // this.initializeEventHandling();

        // Expose methods globally for compatibility
        window.editorCore = this;
        window.setActiveQuestion = (index) => this.setActiveQuestion(index);
        // DISABLE editorCore deleteQuestion to prevent conflicts
        // window.deleteQuestion = (index) => this.executeAction('deleteQuestion', index);
    }
}

// Create and export the singleton instance
export const editorCore = new EditorCore();

// TEMPORARILY DISABLED to prevent conflicts with main event system
// setTimeout(() => {
//     editorCore.initialize();
// }, 100);