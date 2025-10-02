// --- IMPORTS ---
import { getPeople, saveProject, openProjectById } from '../../api/projects.js';
import { getProjectTemplates, createProjectFromTemplate } from '../../api/templates.js';
import { setStatus } from '../../lib/status.js';
import { goto, renderRoute } from '../../router.js';

// --- HELPER UTILITIES (migrated from legacy code) ---

function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[m]));
}

function uuid_generate_v4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// --- MODAL & DOM MANIPULATION ---

/**
 * Renders the modal's HTML structure into the document body if it doesn't already exist.
 * This makes the module self-contained.
 */
function ensureModalInDOM() {
    if (document.getElementById('createProjectModal')) return;

    const modalHTML = `
    <div id="createProjectModal" class="modal is-hidden" role="dialog" aria-modal="true" aria-labelledby="cp-title">
      <div class="modal-panel" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 id="cp-title">Create Project</h3>
          <button class="modal-close-btn" id="cp-close-btn" aria-label="Close">
            <span class="close-icon">✕</span>
            <span class="close-text">Close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="field">
            <span>Start From Template (Optional)</span>
            <select id="cp-template">
              <option value="">Create blank project</option>
            </select>
            <small class="muted">Choose a template to pre-fill project structure and questions.</small>
          </div>
          <label class="field">
            <span>Project Name</span>
            <input id="cp-name" type="text" placeholder="e.g., INFUSE Claims Test" />
          </label>
          <label class="field">
            <span>Client</span>
            <input id="cp-client" type="text" placeholder="e.g., Kenvue / JJIV" />
          </label>
          <div class="stack" style="gap: 12px; grid-template-columns: 1fr 1fr; display: grid;">
            <label class="field">
              <span>Status</span>
              <select id="cp-status">
                <option value="Draft" selected>Draft</option>
                <option value="Pre-Field">Pre-Field</option>
                <option value="Fielding">Fielding</option>
                <option value="Reporting">Reporting</option>
                <option value="Waiting for Approval">Waiting for Approval</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Archived">Archived</option>
              </select>
            </label>
            <label class="field">
              <span>Project Type</span>
              <select id="cp-project-type">
                <option value="">Select a type...</option>
                <option value="Brand Tracker">Brand Tracker</option>
                <option value="Ad Hoc">Ad Hoc</option>
                <option value="Concept Test">Concept Test</option>
                <option value="Claims Test">Claims Test</option>
                <option value="UX Research">UX Research</option>
                <option value="__custom__">-- Add Custom Type --</option>
              </select>
              <input type="text" id="cp-project-type-custom" class="is-hidden" placeholder="Enter custom type" style="margin-top: 8px;" />
            </label>
          </div>
          <div class="field">
            <span>Roles</span>
            <div id="cp-roles-container" style="display: grid; gap: 8px; margin-top: 4px;"></div>
            <button id="add-role-btn" type="button" class="btn" style="margin-top: 8px;">+ Add Role</button>
          </div>
          <div class="field">
            <span>Important Dates</span>
            <div id="cp-dates-container" style="display: grid; gap: 12px; margin-top: 4px;"></div>
            <button id="add-date-btn" type="button" class="btn" style="margin-top: 8px;">+ Add Date</button>
          </div>
          <label class="field">
            <span>Tags</span>
            <input id="cp-tags" type="text" placeholder="e.g., pharma, skincare, Q3-2025" />
            <small class="muted">Separate tags with commas.</small>
          </label>
          <label class="field">
            <span>Notes</span>
            <textarea id="cp-notes" rows="3" placeholder="Any context, constraints, deliverables…"></textarea>
          </label>
        </div>
        <div class="modal-footer">
          <button id="cp-cancel-btn" class="btn ghost">Cancel</button>
          <button id="cp-create-btn" class="btn primary">Create Project</button>
        </div>
      </div>
      <div id="cp-backdrop" class="modal-backdrop"></div>
    </div>
  `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Opens the modal for editing an existing project
 */
export async function openEditProjectModal(project) {
    await openProjectModal(project);
}

/**
 * The main exported function to open and initialize the create project modal.
 */
export async function openCreateProjectModal() {
    await openProjectModal();
}

/**
 * Internal function to open the modal in create or edit mode
 */
async function openProjectModal(existingProject = null) {
    ensureModalInDOM();

    const f = (id) => document.getElementById(id);
    const modal = f('createProjectModal');
    const isEditing = !!existingProject;

    // --- 1. Set up modal for edit or create mode ---
    if (isEditing) {
        modal.dataset.editingProjectId = existingProject.id;
        f('cp-title').textContent = 'Edit Project';
        modal.querySelector('.btn.primary').textContent = 'Update Project';
    } else {
        delete modal.dataset.editingProjectId;
        f('cp-title').textContent = 'Create Project';
        modal.querySelector('.btn.primary').textContent = 'Create Project';
    }

    // --- 2. Load Templates (only for create mode) ---
    if (!isEditing) {
        const templates = await getProjectTemplates();
        const templateSelect = f('cp-template');
        templateSelect.innerHTML = '<option value="">Create blank project</option>';

        if (templates.length > 0) {
            const categories = [...new Set(templates.map(t => t.category))];
            categories.forEach(category => {
                const categoryTemplates = templates.filter(t => t.category === category);
                if (categoryTemplates.length > 0) {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = category;
                    categoryTemplates.forEach(template => {
                        const option = document.createElement('option');
                        option.value = template.id;
                        option.textContent = template.name;
                        optgroup.appendChild(option);
                    });
                    templateSelect.appendChild(optgroup);
                }
            });
        }

        // Check if we should auto-select a template (coming from template library)
        const preSelectedTemplateId = sessionStorage.getItem('useTemplateId');
        if (preSelectedTemplateId) {
            templateSelect.value = preSelectedTemplateId;
            sessionStorage.removeItem('useTemplateId');
            // Auto-fill fields from template
            await fillFieldsFromTemplate(preSelectedTemplateId);
        }
    }

    // --- 3. Clear or Fill Fields ---
    f('cp-name').value = existingProject?.name || '';
    f('cp-client').value = existingProject?.client || '';
    f('cp-notes').value = existingProject?.notes || '';
    f('cp-tags').value = existingProject?.tags ? existingProject.tags.join(', ') : '';
    f('cp-status').value = existingProject?.status || 'Draft';
    f('cp-roles-container').innerHTML = '';
    f('cp-dates-container').innerHTML = '';

    // Reset project type dropdown
    const projectTypeSelect = f('cp-project-type');
    const customTypeInput = f('cp-project-type-custom');

    if (existingProject?.project_type) {
        // Check if it's a standard type
        const standardTypes = ['Brand Tracker', 'Ad Hoc', 'Concept Test', 'Claims Test', 'UX Research'];
        if (standardTypes.includes(existingProject.project_type)) {
            projectTypeSelect.value = existingProject.project_type;
            customTypeInput.classList.add('is-hidden');
            customTypeInput.value = '';
        } else {
            // It's a custom type
            projectTypeSelect.value = '__custom__';
            customTypeInput.classList.remove('is-hidden');
            customTypeInput.value = existingProject.project_type;
        }
    } else {
        projectTypeSelect.value = '';
        customTypeInput.classList.add('is-hidden');
        customTypeInput.value = '';
    }

    // Hide template field during edit mode
    const templateField = f('cp-template').closest('.field');
    if (isEditing) {
        templateField.style.display = 'none';
    } else {
        templateField.style.display = 'block';
    }

    // --- 2. Wire Up Event Listeners ---
    f('cp-create-btn').onclick = createProjectFromModal;
    f('cp-cancel-btn').onclick = closeCreateProjectModal;
    f('cp-close-btn').onclick = closeCreateProjectModal;
    f('cp-backdrop').onclick = closeCreateProjectModal;

    // Template selection handler
    if (!isEditing) {
        f('cp-template').onchange = async (e) => {
            const templateId = e.target.value;
            if (templateId) {
                await fillFieldsFromTemplate(templateId);
            } else {
                // Clear fields when switching back to blank project
                clearAllFields();
            }
        };
    }

    projectTypeSelect.onchange = () => {
        customTypeInput.classList.toggle('is-hidden', projectTypeSelect.value !== '__custom__');
        if (projectTypeSelect.value === '__custom__') customTypeInput.focus();
    };

    f('add-role-btn').onclick = addRoleRow;
    f('add-date-btn').onclick = () => addDateRow(f('cp-dates-container'));

    // --- 3. Populate existing roles and dates if editing ---
    if (isEditing && existingProject.roles) {
        for (const role of existingProject.roles) {
            await addRoleRow(role);
        }
    }

    if (isEditing && existingProject.important_dates) {
        for (const date of existingProject.important_dates) {
            await addDateRow(f('cp-dates-container'), date);
        }
    }

    // --- 4. Show Modal ---
    document.querySelector('header')?.classList.add('content-blur');
    document.getElementById('view-root')?.classList.add('content-blur');
    modal.classList.remove('is-hidden');
    f('cp-name').focus();
}

/**
 * Hides the modal and removes blur effects.
 */
export function closeCreateProjectModal() {
    const modal = document.getElementById('createProjectModal');
    if (modal) {
        modal.classList.add('is-hidden');
        document.querySelector('header')?.classList.remove('content-blur');
        document.getElementById('view-root')?.classList.remove('content-blur');

        // Clean up edit mode state for next time
        delete modal.dataset.editingProjectId;
        document.getElementById('cp-title').textContent = 'Create Project';
        modal.querySelector('.btn.primary').textContent = 'Create Project';
    }
}

/**
 * Handles the form submission for creating or updating a project.
 */
async function createProjectFromModal() {
    const modal = document.getElementById('createProjectModal');
    const editingProjectId = modal.dataset.editingProjectId;

    try {
        const f = (id) => document.getElementById(id);

        // Check if creating from template
        const templateId = !editingProjectId ? f('cp-template')?.value : null;
        if (templateId) {
            await createProjectFromTemplateFlow(templateId);
            return;
        }

        const name = (f('cp-name')?.value || '').trim();
        const client = (f('cp-client')?.value || '').trim();
        const notes = (f('cp-notes')?.value || '').trim();
        const status = (f('cp-status')?.value || 'Draft');

        let projectTypeName = '';
        const projectTypeSelect = f('cp-project-type');
        if (projectTypeSelect.value === '__custom__') {
            projectTypeName = (f('cp-project-type-custom')?.value || '').trim();
        } else {
            projectTypeName = (projectTypeSelect?.value || '').trim();
        }

        const important_dates = [];
        document.querySelectorAll('#cp-dates-container .date-row').forEach(row => {
            const whatSelect = row.querySelector('.date-what-select');
            let whatValue = whatSelect.value;
            if (whatValue === '__custom__') {
                whatValue = row.querySelector('.date-what-custom').value.trim();
            }
            const dateEntry = {
                id: row.dataset.dateId || uuid_generate_v4(),
                what: whatValue,
                when: row.querySelector('.date-when-input').value || null,
                who: row.querySelector('.date-who-select').value || null,
                status: row.querySelector('.date-status-select').value || 'Not Started'
            };
            if (dateEntry.what && dateEntry.when) important_dates.push(dateEntry);
        });

        const tagsInput = (f('cp-tags')?.value || '').trim();
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(Boolean) : [];

        const roles = [];
        document.querySelectorAll('#cp-roles-container .role-row').forEach(row => {
            const role = row.querySelector('.role-input').value;
            const personSelect = row.querySelector('.person-input');
            const newPersonInput = row.querySelector('.new-person-input');
            let person = '';
            if (personSelect.value === '__new__' && newPersonInput.value.trim() !== '') {
                person = newPersonInput.value.trim();
                // We'll handle adding new people in the saveProject function
            } else if (personSelect.value && personSelect.value !== '__new__') {
                person = personSelect.value;
            }
            if (role && person) roles.push({ role, person });
        });
        
        if (editingProjectId) {
            // Load existing project and update it
            const success = await openProjectById(editingProjectId);
            if (!success) {
                throw new Error('Failed to load existing project for editing');
            }

            // Update the loaded project with new values
            window.state.project.name = name || 'Untitled';
            window.state.project.client = client;
            window.state.project.status = status;
            window.state.project.project_type = projectTypeName;
            window.state.project.notes = notes;
            window.state.project.tags = tags;
            window.state.project.roles = roles;
            window.state.project.important_dates = important_dates;
            window.state.project.updated_at = new Date().toISOString();
        } else {
            // Create new project object in global state
            window.state.project = {
                id: uuid_generate_v4(),
                name: name || 'Untitled',
                client: client,
                version: '0.1.0',
                status: status,
                project_type: projectTypeName,
                notes: notes,
                tags: tags,
                roles: roles,
                important_dates: important_dates,
                favorite: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            window.state.questions = [];
            window.state.globals = {
                default_base_verbiage: "Total (qualified respondents)",
                default_base_definition: "",
                scale_buckets: {},
                rules: {},
                banners: []
            };
            window.ui_state.active_question_index = null;
            window.ui_state.active_project_id = window.state.project.id;
        }

        // Call the new, modern save function from our API module
        await saveProject(window.state, window.ui_state);

        closeCreateProjectModal();
        setStatus(editingProjectId ? 'Project updated.' : 'Project created.', true);

        if (!editingProjectId) {
            goto('#/project/overview');
        } else {
            await renderRoute();
        }

    } catch (error) {
        console.error('Error creating/updating project:', error);
        setStatus(`Failed to ${editingProjectId ? 'update' : 'create'} project: ${error.message}`, false);
    }
}

// --- TEMPLATE HELPER FUNCTIONS ---

/**
 * Creates a project from template with user customizations
 */
async function createProjectFromTemplateFlow(templateId) {
    try {
        const templates = await getProjectTemplates();
        const template = templates.find(t => t.id === templateId);

        if (!template) {
            throw new Error('Template not found');
        }

        const f = (id) => document.getElementById(id);

        // Get user customizations from form
        const customizations = {
            name: (f('cp-name')?.value || '').trim() || `${template.name} Project`,
            client: (f('cp-client')?.value || '').trim(),
            status: f('cp-status')?.value || 'Draft'
        };

        // Create project from template
        const projectData = createProjectFromTemplate(template, customizations);

        // Set global state
        window.state.project = projectData.project;
        window.state.questions = projectData.questions;
        window.state.globals = projectData.globals;
        window.ui_state.active_question_index = null;
        window.ui_state.active_project_id = projectData.project.id;

        // Save to database
        await saveProject(window.state, window.ui_state);

        closeCreateProjectModal();
        setStatus(`Project created from template "${template.name}".`, true);
        goto('#/project/overview');

    } catch (error) {
        console.error('Error creating project from template:', error);
        setStatus(`Failed to create project from template: ${error.message}`, false);
    }
}

/**
 * Fills modal fields with data from selected template
 */
async function fillFieldsFromTemplate(templateId) {
    try {
        const templates = await getProjectTemplates();
        const template = templates.find(t => t.id === templateId);

        if (!template) return;

        const f = (id) => document.getElementById(id);
        const templateData = template.template_data;
        const project = templateData.project;

        // Pre-fill fields with template data
        if (!f('cp-name').value) {
            f('cp-name').value = `${template.name} Project`;
        }

        if (project.client && !f('cp-client').value) {
            f('cp-client').value = project.client;
        }

        if (project.project_type) {
            const projectTypeSelect = f('cp-project-type');
            const standardTypes = ['Brand Tracker', 'Ad Hoc', 'Concept Test', 'Claims Test', 'UX Research'];
            if (standardTypes.includes(project.project_type)) {
                projectTypeSelect.value = project.project_type;
            } else {
                projectTypeSelect.value = '__custom__';
                f('cp-project-type-custom').classList.remove('is-hidden');
                f('cp-project-type-custom').value = project.project_type;
            }
        }

        if (project.notes && !f('cp-notes').value) {
            f('cp-notes').value = project.notes;
        }

        if (project.tags && project.tags.length > 0 && !f('cp-tags').value) {
            f('cp-tags').value = project.tags.join(', ');
        }

        // Clear and populate roles
        f('cp-roles-container').innerHTML = '';
        if (project.roles && project.roles.length > 0) {
            for (const role of project.roles) {
                await addRoleRow(role);
            }
        }

        // Clear and populate dates
        f('cp-dates-container').innerHTML = '';
        if (project.important_dates && project.important_dates.length > 0) {
            for (const date of project.important_dates) {
                await addDateRow(f('cp-dates-container'), date);
            }
        }

    } catch (error) {
        console.error('Error filling fields from template:', error);
    }
}

/**
 * Clears all modal fields
 */
function clearAllFields() {
    const f = (id) => document.getElementById(id);

    f('cp-name').value = '';
    f('cp-client').value = '';
    f('cp-notes').value = '';
    f('cp-tags').value = '';
    f('cp-status').value = 'Draft';
    f('cp-project-type').value = '';
    f('cp-project-type-custom').classList.add('is-hidden');
    f('cp-project-type-custom').value = '';
    f('cp-roles-container').innerHTML = '';
    f('cp-dates-container').innerHTML = '';
}

// --- DYNAMIC ROW HELPERS ---

/**
 * Adds a new row for assigning a role and person.
 * @param {object} [roleData={}] - Optional existing role data to pre-fill
 */
async function addRoleRow(roleData = {}) {
    const container = document.getElementById('cp-roles-container');
    const roleRow = document.createElement('div');
    roleRow.className = 'stack role-row';
    roleRow.style.gap = '8px';

    const peopleData = await getPeople(); // Fetch from API
    const peopleOptions = peopleData.map(person => `<option value="${escapeHTML(person.name)}">${escapeHTML(person.name)}</option>`).join('');

    roleRow.innerHTML = `
      <select class="role-input form-control" style="flex: 1;">
        <option value="Project Lead">Project Lead</option>
        <option value="Project Manager" selected>Project Manager</option>
        <option value="Project Director">Project Director</option>
        <option value="Communications">Communications</option>
        <option value="QC">QC</option>
      </select>
      <div class="person-selector" style="flex: 2; display: flex; gap: 8px;">
        <select class="person-input form-control" style="flex: 1;">
          <option value="">Select person...</option>
          ${peopleOptions}
          <option value="__new__">-- Add New Person --</option>
        </select>
        <input type="text" class="new-person-input is-hidden form-control" placeholder="New Person's Name" style="flex: 1;" />
      </div>
      <button type="button" class="btn danger remove-role-btn">✕</button>
    `;
    container.appendChild(roleRow);

    const personSelect = roleRow.querySelector('.person-input');
    const newPersonInput = roleRow.querySelector('.new-person-input');
    const roleInput = roleRow.querySelector('.role-input');

    // Pre-fill existing data
    if (roleData.role) {
        roleInput.value = roleData.role;
    }

    if (roleData.person) {
        // Check if the person exists in the dropdown
        const existsInDropdown = Array.from(personSelect.options).some(option => option.value === roleData.person);
        if (existsInDropdown) {
            personSelect.value = roleData.person;
        } else {
            // It's a custom person
            personSelect.value = '__new__';
            newPersonInput.classList.remove('is-hidden');
            newPersonInput.value = roleData.person;
        }
    }

    personSelect.onchange = () => newPersonInput.classList.toggle('is-hidden', personSelect.value !== '__new__');
    roleRow.querySelector('.remove-role-btn').onclick = () => roleRow.remove();
}

/**
 * Adds a new, empty row for defining an important project date.
 * @param {HTMLElement} container - The DOM element to append the new row to.
 * @param {object} [dateData={}] - Optional data to pre-fill the row.
 */
async function addDateRow(container, dateData = {}) {
    const dateRow = document.createElement('div');
    dateRow.className = 'stack date-row';
    dateRow.style.cssText = 'gap: 8px; align-items: flex-end;';

    const peopleData = await getPeople();
    const peopleOptions = peopleData.map(p => `<option value="${escapeHTML(p.name)}">${escapeHTML(p.name)}</option>`).join('');

    const standardWhats = ["Questionnaire", "Tab Sheet", "Banners", "Reporting", "Data Processing", "QCing", "Approved By", "Due"];
    const isCustomWhat = dateData.what && !standardWhats.includes(dateData.what);

    if (dateData.id) dateRow.dataset.dateId = dateData.id;

    dateRow.innerHTML = `
      <label class="field" style="flex: 2;">
        <span style="font-size: 12px; color: var(--muted);">What</span>
        <select class="date-what-select form-control">
          <option value="">Select task...</option>
          ${standardWhats.map(w => `<option value="${w}">${w}</option>`).join('')}
          <option value="__custom__">Custom...</option>
        </select>
        <input type="text" class="date-what-custom ${isCustomWhat ? '' : 'is-hidden'} form-control" placeholder="Custom task name" style="margin-top: 4px;" />
      </label>
      <label class="field" style="flex: 1.5;">
        <span style="font-size: 12px; color: var(--muted);">When</span>
        <input type="date" class="date-when-input form-control" value="${dateData.when || ''}" />
      </label>
      <label class="field" style="flex: 1.5;">
        <span style="font-size: 12px; color: var(--muted);">Who</span>
        <select class="date-who-select form-control"><option value="">Assign to...</option>${peopleOptions}</select>
      </label>
      <label class="field" style="flex: 1.5;">
        <span style="font-size: 12px; color: var(--muted);">Status</span>
        <select class="date-status-select form-control">
          <option>Not Started</option><option>In Progress</option><option>Draft</option><option>Approved</option><option>Done</option>
        </select>
      </label>
      <button type="button" class="btn danger remove-date-btn">✕</button>
    `;
    container.appendChild(dateRow);

    const whatSelect = dateRow.querySelector('.date-what-select');
    const customWhatInput = dateRow.querySelector('.date-what-custom');
    if (isCustomWhat) {
        whatSelect.value = '__custom__';
        customWhatInput.value = dateData.what;
    } else {
        whatSelect.value = dateData.what || '';
    }

    dateRow.querySelector('.date-who-select').value = dateData.who || '';
    dateRow.querySelector('.date-status-select').value = dateData.status || 'Not Started';
    whatSelect.onchange = () => customWhatInput.classList.toggle('is-hidden', whatSelect.value !== '__custom__');
    dateRow.querySelector('.remove-date-btn').onclick = () => dateRow.remove();
}

