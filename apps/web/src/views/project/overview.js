// src/views/project/overview.js
import { saveProject } from '../../api/projects.js';
import { createProjectTemplate } from '../../api/templates.js';
import { openEditProjectModal } from '../models/createProject.js';
import { showImportModal } from './import/importModal.js';
import { logActivity, ACTIVITY_TYPES } from '../../lib/activityLogger.js';
import { exportToWord } from '../../lib/wordExporter.js';
import { downloadWordDocument } from '../../lib/docxGenerator.js';

export async function renderOverview(el) {
  const p = window.state?.project || {};
  const totalQuestions = window.state?.questions?.length || 0;

  function escapeHTML(s) {
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[m]));
  }

  // Helper to give date statuses a color pill
  const getStatusPill = (status) => {
    const styles = {
      // ✅ Green for "Done" states
      'Done': 'background: #dcfce7; color: #166534; border-color: #bbf7d0;',
      'Approved': 'background: #dcfce7; color: #166534; border-color: #bbf7d0;',

      // 🔵 Blue for "Active" states
      'In Progress': 'background: #dbeafe; color: #1e40af; border-color: #bfdbfe;',

      // 🟡 Yellow for "Pending" states
      'Draft': 'background: #fef9c3; color: #854d0e; border-color: #fde68a;',
      'Waiting for Approval': 'background: #fef9c3; color: #854d0e; border-color: #fde68a;',

      // 🔴 Red for "Problem" states
      'Blocked': 'background: #fee2e2; color: #991b1b; border-color: #fecaca;',
      'Overdue': 'background: #fee2e2; color: #991b1b; border-color: #fecaca;',

      // ⚫ Gray for "Inactive" states
      'Not Started': 'background: var(--surface-3); color: var(--muted); border-color: var(--line);',
    };
    return `<span class="pill" style="display: inline-flex; align-items: center; font-weight: 600; ${styles[status] || ''}">${escapeHTML(status)}</span>`;
  };

  // --- PREPARE DYNAMIC CONTENT ---

  const tagsHTML = (p.tags && p.tags.length > 0) ?
    p.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('') : '';

  const timelineHTML = (p.important_dates && p.important_dates.length > 0) ?
    p.important_dates.map(date => `
      <div class="stack timeline-item" style="justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--line);">
        <div>
          <strong>${escapeHTML(date.what)}</strong>
          <div class="muted" style="margin-top: 2px;">
            Due: ${date.when || 'N/A'} • Assigned: ${escapeHTML(date.who) || 'N/A'}
          </div>
        </div>
        ${getStatusPill(date.status)}
      </div>
    `).join('') :
    '<div class="pv-empty">No key dates have been set.</div>';

  const notesHTML = p.notes ?
    `<blockquote style="margin: 0; padding: 0 .8em; border-left: 3px solid var(--line); color: var(--muted); white-space: pre-wrap;">${escapeHTML(p.notes)}</blockquote>` :
    '<div class="pv-empty">No notes for this project.</div>';

  const teamHTML = (p.roles && p.roles.length > 0) ?
    p.roles.map(role => `
      <div class="stack team-item" style="justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--line);">
          <span>${escapeHTML(role.person)}</span>
          <span class="tag">${escapeHTML(role.role)}</span>
      </div>
    `).join('') :
    '<div class="pv-empty">No roles assigned.</div>';

  // --- FINAL ASSEMBLY ---

  el.innerHTML = `
    <style>
      .timeline-item:last-child, .team-item:last-child { border-bottom: none !important; }
      .section-heading { margin-top: 0; margin-bottom: 16px; color: var(--muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
      .metadata-value { font-size: 1.2rem; display: block; color: var(--brand-primary); font-weight: 600; }
      .content-section + .content-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--line); }
      .pv-empty { color: var(--muted); font-style: italic; padding: 12px 0; }
    </style>
    <div class="workbench" style="margin: 0 auto; margin-top: 24px;">
      <div class="card" style="display: grid; grid-template-columns: 2fr 1fr; overflow: hidden;">

        <div class="left-column" style="padding: 32px 40px;">
          <div class="content-section" style="padding-top:0; border-top:none;">
            <h2 style="margin-top:0; margin-bottom: 4px;">${escapeHTML(p.name || 'Untitled Project')}</h2>
            <p class="muted" style="font-size: 1.1rem; margin-top: 0;">
              ${escapeHTML(p.client || 'No Client')}
              ${p.client ? `<button class="btn ghost" style="margin-left: 8px; padding: 2px 8px;" id="view-client-profile">View Profile</button>` : ''}
            </p>
            ${tagsHTML ? `<div class="stack" style="gap: 6px; margin-top: 12px;">${tagsHTML}</div>` : ''}
          </div>

          <div class="content-section">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 24px;">
              <div><div class="muted">Status</div><strong class="metadata-value">${escapeHTML(p.status)}</strong></div>
              <div><div class="muted">Project Type</div><strong class="metadata-value">${escapeHTML(p.project_type) || 'N/A'}</strong></div>
              <div><div class="muted">Last Updated</div><strong class="metadata-value">${new Date(p.updated_at).toLocaleDateString()}</strong></div>
              <div><div class="muted">Total Questions</div><strong class="metadata-value">${totalQuestions}</strong></div>
            </div>
          </div>

          <div class="content-section">
            <h3 class="section-heading">Project Timeline</h3>
            <div class="timeline-list">${timelineHTML}</div>
          </div>

          <div class="content-section">
            <h3 class="section-heading">Notes</h3>
            ${notesHTML}
          </div>
        </div>

        <div class="right-column" style="padding: 32px 40px; border-left: 1px solid var(--line); background-color: var(--surface-3);">
          <div class="content-section" style="padding-top:0; border-top:none;">
            <h3 class="section-heading" style="margin-top:0;">Team</h3>
            <div class="team-list">${teamHTML}</div>
          </div>

          <div class="content-section">
            <h3 class="section-heading">Actions & Exports</h3>
            <div style="display: grid; gap: 8px;">
                <button class="btn" id="overview-import-questionnaire">📥 Import Questionnaire</button>

                <button class="btn primary" id="overview-export-questionnaire" style="margin-top: 16px;">📄 Export Questionnaire</button>

                <div class="section-heading" style="margin-top: 16px; margin-bottom: 8px;">Project Management</div>
                <button class="btn" id="overview-save-template">📋 Save as Template</button>
                <button class="btn" id="overview-duplicate-project">📋 Duplicate Project</button>
            </div>
            <button class="btn primary" id="edit-project-details" style="width: 100%; padding: 12px; margin-top: 16px;">Edit Project Details</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // --- EVENT HANDLERS ---

  // Export questionnaire (show format selection modal)
  const exportBtn = el.querySelector('#overview-export-questionnaire');
  if (exportBtn) {
    exportBtn.onclick = () => showExportModal();
  }

  // Import questionnaire
  const importBtn = el.querySelector('#overview-import-questionnaire');
  if (importBtn) {
    importBtn.onclick = () => {
      showImportModal((questionnaire, importMode) => {
        // Handle the imported questionnaire
        handleQuestionnaireImport(questionnaire, importMode);
      });
    };
  }


  // Edit project details
  const editBtn = el.querySelector('#edit-project-details');
  if (editBtn) {
    editBtn.onclick = async () => {
      await openEditProjectModal(p);
    };
  }

  // Save as template
  const templateBtn = el.querySelector('#overview-save-template');
  if (templateBtn) {
    templateBtn.onclick = () => openSaveAsTemplateModal(p);
  }

  // Duplicate project
  const duplicateBtn = el.querySelector('#overview-duplicate-project');
  if (duplicateBtn) {
    duplicateBtn.onclick = () => duplicateCurrentProject();
  }

  // View client profile
  const clientBtn = el.querySelector('#view-client-profile');
  if (clientBtn) {
    clientBtn.onclick = () => openClientProfile(p.client);
  }
}

// Handle questionnaire import
async function handleQuestionnaireImport(questionnaire, importMode) {
  try {
    switch (importMode) {
      case 'replace':
        // Replace entire project with imported questionnaire
        window.state.project.name = questionnaire.title;
        window.state.project.description = questionnaire.description || '';
        window.state.questions = questionnaire.questions || [];
        break;

      case 'append':
        // Add questions to current project
        const existingQuestions = window.state.questions || [];
        const newQuestions = questionnaire.questions || [];

        // Generate new IDs for imported questions to avoid conflicts
        let questionCounter = existingQuestions.length + 1;
        newQuestions.forEach(q => {
          if (!q.id || existingQuestions.some(existing => existing.id === q.id)) {
            q.id = questionCounter < 5 ? `S${questionCounter}` : `Q${questionCounter - 4}`;
            questionCounter++;
          }
        });

        window.state.questions = [...existingQuestions, ...newQuestions];
        break;

      case 'new':
        // Create new project with imported questionnaire
        const newProjectId = 'proj_' + Date.now().toString(36);
        window.state.project = {
          id: newProjectId,
          name: questionnaire.title,
          description: questionnaire.description || '',
          client: window.state.project.client || 'Default Client',
          createdAt: Date.now()
        };
        window.state.questions = questionnaire.questions || [];
        break;
    }

    // Save the project
    await saveProject(window.state, window.ui_state);

    // Re-render the overview
    await renderOverview(document.querySelector('.main-content'));

    // Show success message
    const questionCount = questionnaire.questions?.length || 0;
    alert(`Successfully imported ${questionCount} questions! You can now edit them in the Questions tab.`);

  } catch (error) {
    console.error('Error handling questionnaire import:', error);
    alert('Failed to import questionnaire. Please try again.');
  }
}

// Helper functions
function downloadJSON() {
  const data = {
    project: window.state.project,
    globals: window.state.globals,
    questions: window.state.questions
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(window.state.project?.name || 'project').replace(/[^\w\-]+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);

  // Log export activity
  logActivity({
    ...ACTIVITY_TYPES.PROJECT_EXPORTED,
    title: `Project "${window.state.project?.name}" exported as JSON`,
    data: {
      projectId: window.state.project?.id,
      projectName: window.state.project?.name,
      exportType: 'JSON'
    }
  });
}

function postAndDownload(url, filename) {
  const data = {
    project: window.state.project,
    globals: window.state.globals,
    questions: window.state.questions
  };

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.blob();
  })
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    // Log export activity
    const exportType = filename.includes('.qre') ? 'QRE' :
                      filename.includes('tab') ? 'Tab Plan' : 'File';
    logActivity({
      ...ACTIVITY_TYPES.PROJECT_EXPORTED,
      title: `Project "${window.state.project?.name}" exported as ${exportType}`,
      data: {
        projectId: window.state.project?.id,
        projectName: window.state.project?.name,
        exportType: exportType
      }
    });
  })
  .catch(err => {
    console.error('Download failed:', err);
    alert(`Failed to generate ${filename}. Make sure the backend server is running.`);
  });
}

async function openClientProfile(clientName) {
  alert(`Client profile for "${clientName}" - This feature will be implemented in a future update.`);
}

/**
 * Opens a modal to save the current project as a template
 */
function openSaveAsTemplateModal(project) {
  // Remove existing modal if present
  const existingModal = document.getElementById('saveTemplateModal');
  if (existingModal) existingModal.remove();

  const modalHTML = `
    <div id="saveTemplateModal" class="modal" role="dialog" aria-modal="true">
      <div class="modal-panel" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Save as Template</h3>
          <button class="icon-btn" id="template-close-btn" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <label class="field">
            <span>Template Name</span>
            <input id="template-name" type="text" placeholder="e.g., Brand Tracker Template" value="${project.name} Template" />
          </label>
          <label class="field">
            <span>Description</span>
            <textarea id="template-description" rows="3" placeholder="Describe what this template is for and when to use it..."></textarea>
          </label>
          <label class="field">
            <span>Category</span>
            <select id="template-category">
              <option value="General">General</option>
              <option value="Brand Tracker">Brand Tracker</option>
              <option value="Concept Test">Concept Test</option>
              <option value="Claims Test">Claims Test</option>
              <option value="UX Research">UX Research</option>
              <option value="Custom">Custom</option>
            </select>
          </label>
          <label class="field">
            <input type="checkbox" id="template-public" />
            <span>Make this template available to other users</span>
          </label>
        </div>
        <div class="modal-footer">
          <button id="template-cancel-btn" class="btn ghost">Cancel</button>
          <button id="template-save-btn" class="btn primary">Save Template</button>
        </div>
      </div>
      <div class="modal-backdrop"></div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('saveTemplateModal');

  // Event handlers
  modal.querySelector('#template-close-btn').onclick = () => closeTemplateModal();
  modal.querySelector('#template-cancel-btn').onclick = () => closeTemplateModal();
  modal.querySelector('.modal-backdrop').onclick = () => closeTemplateModal();
  modal.querySelector('#template-save-btn').onclick = () => saveCurrentProjectAsTemplate();

  // Show modal
  modal.classList.remove('is-hidden');
  modal.querySelector('#template-name').focus();
}

/**
 * Closes the save template modal
 */
function closeTemplateModal() {
  const modal = document.getElementById('saveTemplateModal');
  if (modal) modal.remove();
}

/**
 * Saves the current project as a template
 */
async function saveCurrentProjectAsTemplate() {
  try {
    const name = document.getElementById('template-name').value.trim();
    const description = document.getElementById('template-description').value.trim();
    const category = document.getElementById('template-category').value;
    const isPublic = document.getElementById('template-public').checked;

    if (!name) {
      alert('Please enter a template name.');
      return;
    }

    const templateData = {
      name: name,
      description: description,
      category: category,
      is_public: isPublic,
      template_data: {
        project: {
          ...window.state.project,
          // Remove unique identifiers and timestamps
          id: null,
          created_at: null,
          updated_at: null,
          favorite: false
        },
        questions: window.state.questions || [],
        globals: window.state.globals || {}
      }
    };

    const template = await createProjectTemplate(templateData);

    closeTemplateModal();
    alert(`Template "${name}" saved successfully!`);

  } catch (error) {
    console.error('Failed to save template:', error);
    alert(`Failed to save template: ${error.message}`);
  }
}

/**
 * Duplicates the current project
 */
async function duplicateCurrentProject() {
  try {
    const originalProject = window.state.project;
    const confirmed = confirm(`Create a copy of "${originalProject.name}"?`);

    if (!confirmed) return;

    // Create duplicated project data
    const duplicatedProject = {
      ...originalProject,
      id: 'proj_' + Math.random().toString(36).substr(2, 9),
      name: `${originalProject.name} Copy`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      favorite: false,
      // Regenerate IDs for dates
      important_dates: (originalProject.important_dates || []).map(date => ({
        ...date,
        id: 'date_' + Math.random().toString(36).substr(2, 9)
      }))
    };

    // Duplicate questions with new IDs
    const duplicatedQuestions = (window.state.questions || []).map(q => ({
      ...q,
      id: 'q_' + Math.random().toString(36).substr(2, 9),
      project_id: duplicatedProject.id
    }));

    // Create new project state
    const newState = {
      project: duplicatedProject,
      questions: duplicatedQuestions,
      globals: { ...window.state.globals }
    };

    const newUiState = {
      ...window.ui_state,
      active_project_id: duplicatedProject.id,
      active_question_index: null
    };

    // Save the duplicated project
    await saveProject(newState, newUiState);

    // Set as current project and navigate
    window.state = newState;
    window.ui_state = newUiState;

    alert(`Project duplicated as "${duplicatedProject.name}"`);

    // Re-render the overview to show the new project
    const overviewEl = document.querySelector('#view-root');
    if (overviewEl) {
      renderOverview(overviewEl);
    }

  } catch (error) {
    console.error('Failed to duplicate project:', error);
    alert(`Failed to duplicate project: ${error.message}`);
  }
}


/**
 * Loads the Word export templates dynamically
 */
async function loadWordExportTemplates() {
  if (window.WordExportTemplates) {
    return; // Already loaded
  }

  try {
    // Dynamically import the templates
    const templateModule = await import('../../lib/wordExportTemplates.js');

    // Make templates globally available
    window.WordExportTemplates = {
      INSTRUCTION_TEMPLATES: templateModule.INSTRUCTION_TEMPLATES,
      QUESTION_TYPE_PROCESSORS: templateModule.QUESTION_TYPE_PROCESSORS,
      formatResponseOptions: templateModule.formatResponseOptions,
      formatConditionalLogic: templateModule.formatConditionalLogic,
      formatTableStructure: templateModule.formatTableStructure
    };

    console.log('Word export templates loaded successfully');
  } catch (error) {
    console.warn('Failed to load Word export templates:', error);
    // Will use fallback formatting in wordExporter.js
  }
}

/**
 * Shows the export format selection modal
 */
function showExportModal() {
  const modalHTML = `
    <div id="exportModal" class="modal" role="dialog" aria-modal="true">
      <div class="modal-panel" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Export Questionnaire</h3>
          <button class="icon-btn" id="export-close-btn" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <p style="color: var(--muted); margin-bottom: 20px;">Choose the export format for your questionnaire:</p>
          <div style="display: grid; gap: 16px;">
            <button class="btn large primary" id="export-word-btn" style="text-align: left; padding: 16px; border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">📄</span>
                <div>
                  <div style="font-weight: 600; font-size: 15px;">Word Document (.docx)</div>
                  <div style="color: var(--muted); font-size: 13px; margin-top: 2px;">
                    Professional format with proper styling, perfect for client review
                  </div>
                </div>
              </div>
            </button>
            <button class="btn large" id="export-json-btn" style="text-align: left; padding: 16px; border-radius: 8px; border: 2px solid var(--line);">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">💾</span>
                <div>
                  <div style="font-weight: 600; font-size: 15px;">JSON Data (.json)</div>
                  <div style="color: var(--muted); font-size: 13px; margin-top: 2px;">
                    Complete project data for backup or sharing between systems
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button id="export-cancel-btn" class="btn ghost">Cancel</button>
        </div>
      </div>
      <div class="modal-backdrop"></div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('exportModal');

  // Event handlers
  modal.querySelector('#export-close-btn').onclick = () => closeExportModal();
  modal.querySelector('#export-cancel-btn').onclick = () => closeExportModal();
  modal.querySelector('.modal-backdrop').onclick = () => closeExportModal();

  modal.querySelector('#export-word-btn').onclick = async () => {
    closeExportModal();
    await handleWordExport();
  };

  modal.querySelector('#export-json-btn').onclick = () => {
    closeExportModal();
    downloadJSON();
  };

  // Show modal
  modal.classList.remove('is-hidden');
}

/**
 * Closes the export modal
 */
function closeExportModal() {
  const modal = document.getElementById('exportModal');
  if (modal) modal.remove();
}

/**
 * Handles Word document export with loading state
 */
async function handleWordExport() {
  try {
    console.log('Starting Word document export...');

    const project = window.state?.project || {};
    const questions = window.state?.questions || [];

    if (questions.length === 0) {
      alert('No questions to export. Please add questions to your project first.');
      return;
    }

    // Show loading indicator
    const loadingToast = document.createElement('div');
    loadingToast.className = 'toast';
    loadingToast.innerHTML = '📄 Exporting questionnaire to Word...';
    document.body.appendChild(loadingToast);

    // Load the Word export templates
    await loadWordExportTemplates();

    // Generate the Word document
    const wordBlob = await exportToWord(project, questions, {
      includeMetadata: true,
      includeConditionalLogic: true,
      includeValidation: true
    });

    // Generate filename
    const safeName = (project.name || 'questionnaire').replace(/[^\w\-_]/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${safeName}_questionnaire_${timestamp}.doc`;

    // Download the file
    downloadWordDocument(wordBlob, filename);

    // Log the export activity
    await logActivity({
      ...ACTIVITY_TYPES.EXPORT_WORD,
      title: 'Questionnaire exported to Word',
      data: {
        projectId: project.id,
        projectName: project.name,
        questionCount: questions.length,
        filename: filename
      }
    });

    // Success toast
    loadingToast.innerHTML = '✅ Word document exported successfully!';
    setTimeout(() => {
      if (document.body.contains(loadingToast)) {
        document.body.removeChild(loadingToast);
      }
    }, 3000);

    console.log('Word document export completed successfully');

  } catch (error) {
    console.error('Word export error:', error);
    alert('Failed to export questionnaire to Word document. Please try again.');
  }
}
