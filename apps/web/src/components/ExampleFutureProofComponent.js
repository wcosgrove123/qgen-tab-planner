// Example of Future-Proof Component Implementation
// Use this as a template for all new interactive components

import {
    queueSave,
    updateElementState,
    animatePanel,
    handleDropdownChange,
    handleToggleButton,
    handleTextInput,
    setupEventDelegation,
    animateNewElement
} from '../utils/renderingUtils.js';

/**
 * Example: Feature Settings Component
 * Demonstrates all the future-proof patterns
 */
export class FeatureSettingsComponent {
    constructor(container, data, actions) {
        this.container = container;
        this.data = data;
        this.actions = actions;
        this.init();
    }

    init() {
        this.render();
        this.setupEventHandlers();
    }

    render() {
        this.container.innerHTML = `
            <div class="feature-settings-component" data-component="feature-settings">
                <!-- Toggle Button Example -->
                <div class="setting-group">
                    <label>Enable Feature</label>
                    <button class="toggle-btn ${this.data.enabled ? 'active' : ''}"
                            data-action="toggle-feature"
                            data-key="enabled">
                        ${this.data.enabled ? '✅ Enabled' : '❌ Disabled'}
                    </button>
                </div>

                <!-- Dropdown Example -->
                <div class="setting-group">
                    <label>Feature Mode</label>
                    <select data-action="change-mode" data-key="mode">
                        <option value="basic" ${this.data.mode === 'basic' ? 'selected' : ''}>Basic</option>
                        <option value="advanced" ${this.data.mode === 'advanced' ? 'selected' : ''}>Advanced</option>
                        <option value="expert" ${this.data.mode === 'expert' ? 'selected' : ''}>Expert</option>
                    </select>
                </div>

                <!-- Text Input Example -->
                <div class="setting-group">
                    <label>Feature Name</label>
                    <input type="text"
                           data-action="update-name"
                           data-key="name"
                           value="${this.data.name || ''}"
                           placeholder="Enter feature name">
                </div>

                <!-- Conditional Panel Example -->
                <div class="advanced-panel"
                     style="display: ${this.data.mode === 'advanced' || this.data.mode === 'expert' ? 'block' : 'none'}">
                    <h4>Advanced Settings</h4>
                    <div class="setting-group">
                        <label>Performance Mode</label>
                        <button class="toggle-btn ${this.data.highPerformance ? 'active' : ''}"
                                data-action="toggle-performance"
                                data-key="highPerformance">
                            ${this.data.highPerformance ? '🚀 High Performance' : '🐌 Standard'}
                        </button>
                    </div>
                </div>

                <!-- Dynamic List Example -->
                <div class="setting-group">
                    <label>Feature Items</label>
                    <div class="items-list" data-list="items">
                        ${(this.data.items || []).map((item, index) => `
                            <div class="item-row" data-item-index="${index}">
                                <input type="text"
                                       data-action="update-item"
                                       data-item-index="${index}"
                                       value="${item}"
                                       placeholder="Item ${index + 1}">
                                <button data-action="remove-item"
                                        data-item-index="${index}"
                                        class="remove-btn">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <button data-action="add-item" class="add-btn">+ Add Item</button>
                </div>
            </div>
        `;
    }

    setupEventHandlers() {
        const actionHandlers = {
            click: {
                'toggle-feature': (e) => this.handleToggleFeature(e),
                'toggle-performance': (e) => this.handleTogglePerformance(e),
                'add-item': (e) => this.handleAddItem(e),
                'remove-item': (e) => this.handleRemoveItem(e)
            },
            change: {
                'change-mode': (e) => this.handleModeChange(e)
            },
            input: {
                'update-name': (e) => this.handleNameInput(e),
                'update-item': (e) => this.handleItemInput(e)
            }
        };

        setupEventDelegation(this.container, actionHandlers);
    }

    // ✅ Future-Proof Handler Examples

    handleToggleFeature(e) {
        handleToggleButton(e.target, (newState) => {
            this.data.enabled = newState;
            e.target.textContent = newState ? '✅ Enabled' : '❌ Disabled';

            // Save with unique key
            queueSave(`feature-enabled-${this.data.id}`, () => {
                this.actions.updateFeature(this.data.id, 'enabled', newState);
            });
        });
    }

    handleTogglePerformance(e) {
        handleToggleButton(e.target, (newState) => {
            this.data.highPerformance = newState;
            e.target.textContent = newState ? '🚀 High Performance' : '🐌 Standard';

            queueSave(`feature-performance-${this.data.id}`, () => {
                this.actions.updateFeature(this.data.id, 'highPerformance', newState);
            });
        });
    }

    handleModeChange(e) {
        const newMode = e.target.value;

        // Update data immediately
        this.data.mode = newMode;

        // Update UI directly - show/hide advanced panel
        const advancedPanel = this.container.querySelector('.advanced-panel');
        const shouldShow = (newMode === 'advanced' || newMode === 'expert');

        animatePanel(advancedPanel, shouldShow);

        // Save with debouncing
        queueSave(`feature-mode-${this.data.id}`, () => {
            this.actions.updateFeature(this.data.id, 'mode', newMode);
        });
    }

    handleNameInput(e) {
        handleTextInput(e.target, (value) => {
            this.data.name = value;
        });

        // Save with longer delay for text inputs
        queueSave(`feature-name-${this.data.id}`, () => {
            this.actions.updateFeature(this.data.id, 'name', this.data.name);
        }, 1000);
    }

    handleItemInput(e) {
        const index = parseInt(e.target.dataset.itemIndex);
        const value = e.target.value;

        // Update data immediately
        if (!this.data.items) this.data.items = [];
        this.data.items[index] = value;

        // Debounced save
        queueSave(`feature-item-${this.data.id}-${index}`, () => {
            this.actions.updateFeature(this.data.id, 'items', this.data.items);
        }, 500);
    }

    handleAddItem(e) {
        e.preventDefault();
        e.stopPropagation();

        // Update data immediately
        if (!this.data.items) this.data.items = [];
        const newIndex = this.data.items.length;
        this.data.items.push('');

        // Add to DOM with smooth animation
        const itemsList = this.container.querySelector('.items-list');
        const newItemHTML = `
            <div class="item-row" data-item-index="${newIndex}" style="opacity: 0; transform: translateY(-10px);">
                <input type="text"
                       data-action="update-item"
                       data-item-index="${newIndex}"
                       value=""
                       placeholder="Item ${newIndex + 1}">
                <button data-action="remove-item"
                        data-item-index="${newIndex}"
                        class="remove-btn">×</button>
            </div>
        `;

        itemsList.insertAdjacentHTML('beforeend', newItemHTML);
        const newRow = itemsList.lastElementChild;

        // Smooth animation
        animateNewElement(newRow);

        // Focus the new input
        setTimeout(() => {
            newRow.querySelector('input').focus();
        }, 300);

        // Save with debouncing
        queueSave(`feature-add-item-${this.data.id}`, () => {
            this.actions.updateFeature(this.data.id, 'items', this.data.items);
        }, 1000);
    }

    handleRemoveItem(e) {
        e.preventDefault();
        e.stopPropagation();

        const index = parseInt(e.target.dataset.itemIndex);

        // Update data immediately
        if (!this.data.items) return;
        this.data.items.splice(index, 1);

        // Remove from DOM with animation
        const row = e.target.closest('.item-row');
        row.style.transition = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';

        setTimeout(() => {
            row.remove();
            // Update indices of remaining items
            this.updateItemIndices();
        }, 200);

        // Save with debouncing
        queueSave(`feature-remove-item-${this.data.id}`, () => {
            this.actions.updateFeature(this.data.id, 'items', this.data.items);
        }, 500);
    }

    updateItemIndices() {
        const itemRows = this.container.querySelectorAll('.item-row');
        itemRows.forEach((row, index) => {
            row.dataset.itemIndex = index;
            row.querySelector('input').dataset.itemIndex = index;
            row.querySelector('input').placeholder = `Item ${index + 1}`;
            row.querySelector('.remove-btn').dataset.itemIndex = index;
        });
    }

    // Public method to update data from external source
    updateData(newData) {
        this.data = { ...this.data, ...newData };
        // Only re-render if structural changes occurred
        if (this.hasStructuralChanges(newData)) {
            this.render();
            this.setupEventHandlers();
        }
    }

    hasStructuralChanges(newData) {
        // Define what constitutes a structural change requiring re-render
        return (
            newData.items && newData.items.length !== (this.data.items || []).length
        );
    }
}

// Usage Example:
/*
const container = document.getElementById('feature-settings');
const data = { enabled: true, mode: 'basic', name: 'My Feature', items: ['Item 1', 'Item 2'] };
const actions = {
    updateFeature: (id, key, value) => {
        // Your save logic here
        console.log('Saving:', id, key, value);
    }
};

const component = new FeatureSettingsComponent(container, data, actions);
*/