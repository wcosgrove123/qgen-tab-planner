/**
 * saveQuestionModal.js
 *
 * Modal interface for saving questions to the library.
 * Provides form inputs for metadata and categorization.
 */

import { addQuestionToLibrary, getLibraryClients, LIBRARY_CATEGORIES } from '../../../lib/questionLibrary.js';

/**
 * Shows a modal to save a question to the library
 * @param {Object} question - The question object to save
 * @param {Function} onSaved - Callback when question is saved
 */
export function showSaveQuestionModal(question, onSaved) {
    const clients = getLibraryClients();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-panel" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3>📚 Save Question to Library</h3>
                <button class="icon-btn" onclick="this.closest('.modal').remove()" aria-label="Close">✕</button>
            </div>

            <div class="modal-body">
                <form class="save-question-form">
                    <!-- Question Preview -->
                    <div class="question-preview" style="margin-bottom: 20px; padding: 16px; background: var(--surface-3); border-radius: 8px;">
                        <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Question Preview</h4>
                        <div class="preview-content" style="font-size: 13px;">
                            <div class="question-id" style="font-weight: 600; color: var(--accent); margin-bottom: 6px;">
                                ${question.id || 'No ID'}
                            </div>
                            <div class="question-text" style="margin-bottom: 10px; color: var(--fg);">
                                ${question.text || 'No question text'}
                            </div>

                            ${question.options ? `
                                <div class="question-options" style="margin-bottom: 10px;">
                                    <strong style="font-size: 12px;">Options:</strong>
                                    <ul style="margin: 4px 0 0 16px; font-size: 12px; color: var(--muted);">
                                        ${question.options.slice(0, 3).map(opt =>
                                            `<li>${opt.code}: ${opt.label}</li>`
                                        ).join('')}
                                        ${question.options.length > 3 ? `<li>... and ${question.options.length - 3} more</li>` : ''}
                                    </ul>
                                </div>
                            ` : ''}

                            <div class="question-type" style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 500;">
                                Type: ${question.mode || 'list'} ${question.type ? `(${question.type})` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Library Information -->
                    <div class="form-section">
                        <h4 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; border-bottom: 1px solid var(--line); padding-bottom: 6px;">
                            Library Information
                        </h4>

                        <div class="form-group" style="margin-bottom: 12px;">
                            <label for="question-title" style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px;">
                                Title *
                            </label>
                            <input type="text"
                                   id="question-title"
                                   name="title"
                                   value="${escapeHTML(question.text || '')}"
                                   placeholder="Enter a descriptive title..."
                                   style="width: 100%; padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface-2); font-size: 13px;"
                                   required>
                            <small style="display: block; margin-top: 2px; font-size: 11px; color: var(--muted);">
                                This will be displayed in the library browser
                            </small>
                        </div>

                        <div class="form-group" style="margin-bottom: 12px;">
                            <label for="question-description" style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px;">
                                Description
                            </label>
                            <textarea id="question-description"
                                      name="description"
                                      placeholder="Optional description or notes about this question..."
                                      rows="2"
                                      style="width: 100%; padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface-2); font-size: 13px; resize: vertical; min-height: 60px;"></textarea>
                        </div>

                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                            <div class="form-group">
                                <label for="question-category" style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px;">
                                    Category *
                                </label>
                                <select id="question-category"
                                        name="category"
                                        style="width: 100%; padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface-2); font-size: 13px;"
                                        required>
                                    ${Object.entries(LIBRARY_CATEGORIES).map(([key, label]) => `
                                        <option value="${key}" ${autoSelectCategory(question, key) ? 'selected' : ''}>
                                            ${label}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="question-client" style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px;">
                                    Client
                                </label>
                                <select id="question-client"
                                        name="clientId"
                                        style="width: 100%; padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface-2); font-size: 13px;">
                                    <option value="default">General</option>
                                    ${clients.map(client => `
                                        <option value="${client.id}">${client.name}</option>
                                    `).join('')}
                                    <option value="custom">+ Add New Client</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 12px;">
                            <label for="question-tags" style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px;">
                                Tags
                            </label>
                            <input type="text"
                                   id="question-tags"
                                   name="tags"
                                   value="${generateAutoTags(question).join(', ')}"
                                   placeholder="Enter tags separated by commas..."
                                   style="width: 100%; padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface-2); font-size: 13px;">
                            <small style="display: block; margin-top: 2px; font-size: 11px; color: var(--muted);">
                                Tags help with searching and organization
                            </small>
                        </div>

                        <!-- Custom Client Option -->
                        <div class="form-group" id="custom-client-group" style="display: none; margin-bottom: 12px;">
                            <label for="custom-client" style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px;">
                                New Client Name
                            </label>
                            <input type="text"
                                   id="custom-client"
                                   name="customClient"
                                   placeholder="Enter new client name..."
                                   style="width: 100%; padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface-2); font-size: 13px;">
                        </div>
                    </div>
                </form>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn ghost" onclick="this.closest('.modal').remove()">
                    Cancel
                </button>
                <button type="button" class="btn primary" data-action="save">
                    💾 Save to Library
                </button>
            </div>
        </div>
        <div class="modal-backdrop" onclick="this.closest('.modal').remove()"></div>
    `;

    document.body.appendChild(modal);

    // Set up event handlers
    setupModalEventHandlers(modal, question, onSaved);

    // Focus the title input
    setTimeout(() => {
        modal.querySelector('#question-title').focus();
    }, 100);
}

/**
 * Sets up event handlers for the save modal
 */
function setupModalEventHandlers(modal, question, onSaved) {
    const form = modal.querySelector('.save-question-form');
    const clientSelect = modal.querySelector('#question-client');
    const customClientGroup = modal.querySelector('#custom-client-group');

    // Client selection change
    clientSelect.addEventListener('change', () => {
        const showCustom = clientSelect.value === 'custom';
        customClientGroup.style.display = showCustom ? 'block' : 'none';
        if (showCustom) {
            modal.querySelector('#custom-client').focus();
        }
    });

    // Add custom client option if not present
    if (!Array.from(clientSelect.options).some(opt => opt.value === 'custom')) {
        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = '+ Add New Client';
        clientSelect.appendChild(customOption);
    }

    // Modal event handlers
    modal.addEventListener('click', (e) => {
        console.log('Modal clicked:', e.target, 'Action:', e.target.dataset.action);
        const action = e.target.dataset.action;

        switch (action) {
            case 'save':
                console.log('Save button clicked, calling saveQuestionToLibrary');
                saveQuestionToLibrary(modal, question, onSaved);
                break;
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveQuestionToLibrary(modal, question, onSaved);
    });
}

/**
 * Saves the question to the library with form data
 */
function saveQuestionToLibrary(modal, question, onSaved) {
    console.log('saveQuestionToLibrary called with:', { modal, question, onSaved });

    const form = modal.querySelector('.save-question-form');
    if (!form) {
        console.error('Form not found in modal');
        return;
    }

    const formData = new FormData(form);
    console.log('Form data:', Object.fromEntries(formData));

    // Validate required fields
    const title = formData.get('title')?.trim();
    const category = formData.get('category');

    console.log('Validation check:', { title, category });

    if (!title) {
        alert('Please enter a title for the question');
        modal.querySelector('#question-title')?.focus();
        return;
    }

    if (!category) {
        alert('Please select a category');
        modal.querySelector('#question-category')?.focus();
        return;
    }

    // Prepare metadata
    const metadata = {
        title: title,
        description: formData.get('description').trim(),
        category: category,
        tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean)
    };

    // Handle client selection
    let clientId = formData.get('clientId');
    let clientName = '';

    if (clientId === 'custom') {
        const customClient = formData.get('customClient').trim();
        if (!customClient) {
            alert('Please enter a name for the new client');
            modal.querySelector('#custom-client').focus();
            return;
        }
        clientId = generateClientId(customClient);
        clientName = customClient;
    } else if (clientId === 'default') {
        clientName = 'General';
    } else {
        // Find client name from existing clients
        const clients = getLibraryClients();
        const client = clients.find(c => c.id === clientId);
        clientName = client ? client.name : 'Unknown';
    }

    metadata.clientId = clientId;
    metadata.clientName = clientName;

    try {
        console.log('About to call addQuestionToLibrary with:', { question, metadata });
        const libraryQuestionId = addQuestionToLibrary(question, metadata);
        console.log('Library question saved with ID:', libraryQuestionId);

        // Show success message
        showSuccessMessage(modal, 'Question saved to library successfully!');

        // Close modal after short delay
        setTimeout(() => {
            modal.remove();
            if (onSaved) {
                onSaved(libraryQuestionId, metadata);
            }
        }, 1500);

    } catch (error) {
        console.error('Error saving question to library:', error);
        alert('Failed to save question to library. Please try again.');
    }
}

/**
 * Shows a success message in the modal
 */
function showSuccessMessage(modal, message) {
    const existingMessage = modal.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        margin-top: 12px;
        padding: 10px 12px;
        background: #10b981;
        color: white;
        border-radius: 6px;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    successDiv.innerHTML = `
        <span style="font-size: 14px;">✅</span>
        <span>${message}</span>
    `;

    const modalBody = modal.querySelector('.modal-body');
    modalBody.appendChild(successDiv);
}

// --- UTILITY FUNCTIONS ---

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function autoSelectCategory(question, categoryKey) {
    const text = (question.text || '').toLowerCase();
    const id = (question.id || '').toLowerCase();

    switch (categoryKey) {
        case 'screener':
            return id.startsWith('s') || text.includes('qualify') || text.includes('screen');
        case 'demographics':
            return text.includes('age') || text.includes('gender') || text.includes('income');
        case 'satisfaction':
            return text.includes('satisf') || text.includes('rating') || text.includes('recommend');
        case 'brand':
            return text.includes('brand') || text.includes('aware') || text.includes('familiar');
        case 'usage':
            return text.includes('use') || text.includes('frequency') || text.includes('often');
        case 'numeric':
            return question.mode === 'numeric';
        case 'open':
            return question.mode === 'open_end';
        case 'table':
            return question.mode === 'table';
        default:
            return false;
    }
}

function generateAutoTags(question) {
    const tags = [];

    if (question.mode) tags.push(question.mode);
    if (question.type) tags.push(question.type);
    if (question.scale?.points) tags.push(`${question.scale.points}-point`);
    if (question.options?.length) tags.push(`${question.options.length}-options`);
    if (question.conditions?.mode !== 'none') tags.push('conditional');

    return tags;
}

function generateClientId(clientName) {
    return clientName.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 20);
}