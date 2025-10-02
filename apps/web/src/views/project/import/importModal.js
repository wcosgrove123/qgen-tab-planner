/**
 * importModal.js
 *
 * Questionnaire Import Modal for Q-Gen
 * Provides file upload and import preview functionality
 */

import { importQuestionnaire, IMPORT_FORMATS } from '../../../lib/questionnaireImporter.js';

/**
 * Shows the questionnaire import modal
 * @param {Function} onImportComplete - Callback when import is complete
 */
export function showImportModal(onImportComplete) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-panel" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3>📥 Import Questionnaire</h3>
                <button class="icon-btn" onclick="this.closest('.modal').remove()" aria-label="Close">✕</button>
            </div>

            <div class="modal-body">
                <!-- File Upload Section -->
                <div class="import-section">
                    <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                        Select Questionnaire File
                    </h4>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: var(--muted);">
                        Upload a questionnaire file to automatically import questions and structure.
                    </p>

                    <div class="file-upload-area" id="file-upload-area">
                        <div class="upload-content">
                            <div class="upload-icon">📄</div>
                            <div class="upload-text">
                                <strong>Drag & drop your file here</strong><br>
                                or <button class="upload-link" id="browse-files">browse files</button>
                            </div>
                            <div class="upload-formats">
                                Supports: JSON, CSV, Text (.txt) - Word support coming soon!
                            </div>
                        </div>
                        <input type="file" id="file-input" style="display: none;"
                               accept=".json,.csv,.txt">
                    </div>

                    <div class="file-info" id="file-info" style="display: none;">
                        <div class="file-details">
                            <span class="file-name" id="file-name"></span>
                            <span class="file-size" id="file-size"></span>
                        </div>
                        <button class="remove-file" id="remove-file">✕</button>
                    </div>
                </div>

                <!-- Import Options -->
                <div class="import-options" id="import-options" style="display: none;">
                    <h4 style="margin: 16px 0 12px 0; font-size: 14px; font-weight: 600; border-top: 1px solid var(--line); padding-top: 16px;">
                        Import Options
                    </h4>

                    <div class="option-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px;">
                                Project Title
                            </label>
                            <input type="text" id="import-title" placeholder="Auto-detected title..."
                                   style="width: 100%; padding: 6px 8px; border: 1px solid var(--line); border-radius: 4px; font-size: 13px;">
                        </div>

                        <div class="form-group">
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px;">
                                Import Mode
                            </label>
                            <select id="import-mode" style="width: 100%; padding: 6px 8px; border: 1px solid var(--line); border-radius: 4px; font-size: 13px;">
                                <option value="replace">Replace current project</option>
                                <option value="append">Add to current project</option>
                                <option value="new">Create new project</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
                            <input type="checkbox" id="auto-detect-types" checked>
                            Auto-detect question types
                        </label>
                        <small style="display: block; margin-top: 2px; font-size: 11px; color: var(--muted);">
                            Automatically detect single/multi-select, scales, tables, etc.
                        </small>
                    </div>

                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
                            <input type="checkbox" id="preserve-formatting" checked>
                            Preserve text formatting
                        </label>
                        <small style="display: block; margin-top: 2px; font-size: 11px; color: var(--muted);">
                            Keep bold, italic, and line breaks from original document
                        </small>
                    </div>
                </div>

                <!-- Preview Section -->
                <div class="import-preview" id="import-preview" style="display: none;">
                    <h4 style="margin: 16px 0 12px 0; font-size: 14px; font-weight: 600; border-top: 1px solid var(--line); padding-top: 16px;">
                        Import Preview
                    </h4>
                    <div class="preview-content" id="preview-content">
                        <!-- Preview will be populated here -->
                    </div>
                </div>

                <!-- Import Status -->
                <div class="import-status" id="import-status" style="display: none;">
                    <div class="status-content">
                        <div class="status-icon" id="status-icon">⏳</div>
                        <div class="status-text" id="status-text">Processing file...</div>
                    </div>
                    <div class="status-progress" id="status-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn ghost" onclick="this.closest('.modal').remove()">
                    Cancel
                </button>
                <button type="button" class="btn primary" id="import-btn" disabled data-action="import">
                    📥 Import Questionnaire
                </button>
            </div>
        </div>
        <div class="modal-backdrop" onclick="this.closest('.modal').remove()"></div>
    `;

    document.body.appendChild(modal);

    // Set up event handlers
    setupImportModalHandlers(modal, onImportComplete);
}

/**
 * Sets up event handlers for the import modal
 */
function setupImportModalHandlers(modal, onImportComplete) {
    const fileInput = modal.querySelector('#file-input');
    const fileUploadArea = modal.querySelector('#file-upload-area');
    const browseButton = modal.querySelector('#browse-files');
    const fileInfo = modal.querySelector('#file-info');
    const importOptions = modal.querySelector('#import-options');
    const importPreview = modal.querySelector('#import-preview');
    const importStatus = modal.querySelector('#import-status');
    const importBtn = modal.querySelector('#import-btn');

    let selectedFile = null;
    let parsedQuestionnaire = null;

    // File browse click
    browseButton.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });

    // Drag and drop handlers
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('drag-over');
    });

    fileUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Remove file
    modal.querySelector('#remove-file')?.addEventListener('click', () => {
        selectedFile = null;
        parsedQuestionnaire = null;
        fileUploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        importOptions.style.display = 'none';
        importPreview.style.display = 'none';
        importBtn.disabled = true;
    });

    // Import button
    importBtn.addEventListener('click', () => {
        if (parsedQuestionnaire) {
            performImport();
        }
    });

    // Handle file selection
    async function handleFileSelect(file) {
        selectedFile = file;

        // Show file info
        modal.querySelector('#file-name').textContent = file.name;
        modal.querySelector('#file-size').textContent = formatFileSize(file.size);
        fileUploadArea.style.display = 'none';
        fileInfo.style.display = 'flex';
        importOptions.style.display = 'block';

        // Auto-fill title
        const titleInput = modal.querySelector('#import-title');
        titleInput.value = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

        // Show processing status
        showStatus('⏳', 'Processing file...', 0);

        try {
            // Parse the questionnaire
            parsedQuestionnaire = await importQuestionnaire(file, {
                autoDetectTypes: modal.querySelector('#auto-detect-types').checked,
                preserveFormatting: modal.querySelector('#preserve-formatting').checked,
                title: titleInput.value
            });

            // Show preview
            showPreview(parsedQuestionnaire);
            importBtn.disabled = false;
            showStatus('✅', 'Ready to import', 100);

        } catch (error) {
            console.error('Error parsing questionnaire:', error);
            showStatus('❌', `Error: ${error.message}`, 0);
            importBtn.disabled = true;
        }
    }

    // Show import status
    function showStatus(icon, text, progress) {
        modal.querySelector('#status-icon').textContent = icon;
        modal.querySelector('#status-text').textContent = text;
        modal.querySelector('#progress-fill').style.width = `${progress}%`;
        importStatus.style.display = 'block';

        if (progress === 100 || progress === 0) {
            setTimeout(() => {
                importStatus.style.display = 'none';
            }, 2000);
        }
    }

    // Show questionnaire preview
    function showPreview(questionnaire) {
        const previewContent = modal.querySelector('#preview-content');

        previewContent.innerHTML = `
            <div class="preview-summary">
                <div class="summary-stats">
                    <span class="stat-item">📋 ${questionnaire.questions.length} questions</span>
                    <span class="stat-item">📊 ${questionnaire.questions.filter(q => q.mode === 'table').length} tables</span>
                    <span class="stat-item">🔢 ${questionnaire.questions.filter(q => q.mode === 'numeric').length} numeric</span>
                    <span class="stat-item">📝 ${questionnaire.questions.filter(q => q.mode === 'open_end').length} open-ended</span>
                </div>
            </div>

            <div class="preview-questions">
                <h5 style="margin: 12px 0 8px 0; font-size: 13px;">Preview Questions:</h5>
                ${questionnaire.questions.slice(0, 5).map((q, index) => `
                    <div class="preview-question">
                        <div class="question-header">
                            <span class="question-id">${q.id}</span>
                            <span class="question-type">${q.mode} (${q.type || 'default'})</span>
                        </div>
                        <div class="question-text">${q.text}</div>
                        ${q.options && q.options.length > 0 ? `
                            <div class="question-options">
                                ${q.options.slice(0, 3).map(opt =>
                                    `<span class="option-preview">${opt.code}: ${opt.label}</span>`
                                ).join('')}
                                ${q.options.length > 3 ? `<span class="more-options">+${q.options.length - 3} more</span>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
                ${questionnaire.questions.length > 5 ? `
                    <div class="preview-more">
                        ... and ${questionnaire.questions.length - 5} more questions
                    </div>
                ` : ''}
            </div>
        `;

        importPreview.style.display = 'block';
    }

    // Perform the actual import
    function performImport() {
        const importMode = modal.querySelector('#import-mode').value;
        const title = modal.querySelector('#import-title').value;

        showStatus('⏳', 'Importing questionnaire...', 50);

        try {
            // Update questionnaire title
            parsedQuestionnaire.title = title || parsedQuestionnaire.title;

            // Call the completion callback
            setTimeout(() => {
                showStatus('✅', 'Import complete!', 100);
                setTimeout(() => {
                    modal.remove();
                    onImportComplete(parsedQuestionnaire, importMode);
                }, 1000);
            }, 500);

        } catch (error) {
            console.error('Error importing questionnaire:', error);
            showStatus('❌', `Import failed: ${error.message}`, 0);
        }
    }
}

// --- UTILITY FUNCTIONS ---

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}