import { getProjectTemplates, deleteProjectTemplate, updateProjectTemplate } from '../api/templates.js';
import { openCreateProjectModal } from './models/createProject.js';

/**
 * Template Library - Manages project templates
 */
export async function renderTemplates(rootEl) {
  const templates = await getProjectTemplates();

  rootEl.innerHTML = `
    <style>
      .template-card {
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        background: var(--surface-1);
        transition: all 0.2s ease;
        position: relative;
      }
      .template-card:hover {
        border-color: var(--accent);
        box-shadow: var(--shadow);
      }
      .template-header {
        padding: 16px 20px 12px;
        border-bottom: 1px solid var(--line);
      }
      .template-name {
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 4px;
        color: var(--fg);
      }
      .template-category {
        display: inline-block;
        padding: 2px 8px;
        background: var(--accent-weak);
        color: var(--accent);
        border-radius: var(--radius-sm);
        font-size: 12px;
        font-weight: 500;
      }
      .template-content {
        padding: 16px 20px;
      }
      .template-description {
        color: var(--muted);
        line-height: 1.5;
        margin-bottom: 12px;
      }
      .template-stats {
        display: flex;
        gap: 16px;
        font-size: 13px;
        color: var(--muted);
        margin-bottom: 12px;
      }
      .template-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      .template-actions button {
        padding: 6px 12px;
        font-size: 13px;
      }
      .templates-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .templates-filters {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--muted);
      }
      .empty-state svg {
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
    </style>

    <section class="container" id="templates-view">
      <div class="templates-header">
        <div>
          <h2 style="margin: 0;">Project Templates</h2>
          <p class="muted" style="margin: 8px 0 0 0;">Reusable project structures and configurations</p>
        </div>
        <div class="templates-filters">
          <select id="template-category-filter" class="form-control">
            <option value="">All Categories</option>
          </select>
          <input id="template-search" type="search" placeholder="Search templates..." class="form-control" style="width: 240px;" />
          <a href="#/projects" class="btn ghost">Back to Projects</a>
        </div>
      </div>

      <div class="card">
        <div class="card-content">
          <div id="templates-grid" class="grid" style="grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
            <!-- Templates will be rendered here -->
          </div>
        </div>
      </div>
    </section>
  `;

  // Populate category filter
  const categories = [...new Set(templates.map(t => t.category))].sort();
  const categoryFilter = rootEl.querySelector('#template-category-filter');
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Initial render
  renderTemplateGrid(rootEl, templates);

  // Set up event listeners
  setupTemplateEventListeners(rootEl, templates);
}

/**
 * Renders the template grid
 */
function renderTemplateGrid(rootEl, allTemplates) {
  const grid = rootEl.querySelector('#templates-grid');
  const searchQuery = rootEl.querySelector('#template-search').value.toLowerCase();
  const categoryFilter = rootEl.querySelector('#template-category-filter').value;

  // Filter templates
  let filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery) ||
      (template.description || '').toLowerCase().includes(searchQuery);
    const matchesCategory = !categoryFilter || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (filteredTemplates.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <h3>No templates found</h3>
        <p>Create your first template by saving an existing project as a template.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredTemplates.map(template => renderTemplateCard(template)).join('');
}

/**
 * Renders a single template card
 */
function renderTemplateCard(template) {
  const createdDate = new Date(template.created_at).toLocaleDateString();
  const updatedDate = new Date(template.updated_at).toLocaleDateString();
  const questionsCount = (template.template_data?.questions || []).length;

  return `
    <div class="template-card" data-template-id="${escapeHTML(template.id)}">
      <div class="template-header">
        <div class="template-name">${escapeHTML(template.name)}</div>
        <span class="template-category">${escapeHTML(template.category)}</span>
      </div>
      <div class="template-content">
        <div class="template-description">
          ${template.description ? escapeHTML(template.description) : '<em>No description provided</em>'}
        </div>
        <div class="template-stats">
          <span>📝 ${questionsCount} questions</span>
          <span>📅 Created ${createdDate}</span>
          ${template.is_public ? '<span>🌐 Public</span>' : '<span>🔒 Private</span>'}
        </div>
        <div class="template-actions">
          <button class="btn primary use-template-btn" data-template-id="${escapeHTML(template.id)}">
            Use Template
          </button>
          <button class="btn ghost edit-template-btn" data-template-id="${escapeHTML(template.id)}">
            Edit
          </button>
          <button class="btn danger delete-template-btn" data-template-id="${escapeHTML(template.id)}">
            Delete
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Sets up event listeners for the template library
 */
function setupTemplateEventListeners(rootEl, allTemplates) {
  // Search functionality
  const searchInput = rootEl.querySelector('#template-search');
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderTemplateGrid(rootEl, allTemplates);
    }, 300);
  });

  // Category filter
  rootEl.querySelector('#template-category-filter').addEventListener('change', () => {
    renderTemplateGrid(rootEl, allTemplates);
  });

  // Template actions
  rootEl.addEventListener('click', async (e) => {
    const templateId = e.target.dataset.templateId;
    if (!templateId) return;

    const template = allTemplates.find(t => t.id === templateId);
    if (!template) return;

    if (e.target.classList.contains('use-template-btn')) {
      await useTemplate(template);
    } else if (e.target.classList.contains('edit-template-btn')) {
      await editTemplate(template, rootEl, allTemplates);
    } else if (e.target.classList.contains('delete-template-btn')) {
      await deleteTemplate(template, rootEl, allTemplates);
    }
  });
}

/**
 * Creates a new project from a template
 */
async function useTemplate(template) {
  try {
    // Set a flag that we want to use this specific template
    sessionStorage.setItem('useTemplateId', template.id);

    // Open the create project modal, which will auto-select this template
    await openCreateProjectModal();

    // The modal will handle the rest via the template selection logic we already built
  } catch (error) {
    console.error('Failed to use template:', error);
    alert(`Failed to use template: ${error.message}`);
  }
}

/**
 * Opens an edit modal for a template
 */
async function editTemplate(template, rootEl, allTemplates) {
  const modalHTML = `
    <div id="editTemplateModal" class="modal" role="dialog" aria-modal="true">
      <div class="modal-panel" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Edit Template</h3>
          <button class="icon-btn" id="edit-template-close-btn" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <label class="field">
            <span>Template Name</span>
            <input id="edit-template-name" type="text" value="${escapeHTML(template.name)}" />
          </label>
          <label class="field">
            <span>Description</span>
            <textarea id="edit-template-description" rows="3">${escapeHTML(template.description || '')}</textarea>
          </label>
          <label class="field">
            <span>Category</span>
            <select id="edit-template-category">
              <option value="General" ${template.category === 'General' ? 'selected' : ''}>General</option>
              <option value="Brand Tracker" ${template.category === 'Brand Tracker' ? 'selected' : ''}>Brand Tracker</option>
              <option value="Concept Test" ${template.category === 'Concept Test' ? 'selected' : ''}>Concept Test</option>
              <option value="Claims Test" ${template.category === 'Claims Test' ? 'selected' : ''}>Claims Test</option>
              <option value="UX Research" ${template.category === 'UX Research' ? 'selected' : ''}>UX Research</option>
              <option value="Custom" ${template.category === 'Custom' ? 'selected' : ''}>Custom</option>
            </select>
          </label>
          <label class="field">
            <input type="checkbox" id="edit-template-public" ${template.is_public ? 'checked' : ''} />
            <span>Make this template available to other users</span>
          </label>
        </div>
        <div class="modal-footer">
          <button id="edit-template-cancel-btn" class="btn ghost">Cancel</button>
          <button id="edit-template-save-btn" class="btn primary">Update Template</button>
        </div>
      </div>
      <div class="modal-backdrop"></div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = document.getElementById('editTemplateModal');

  // Event handlers
  modal.querySelector('#edit-template-close-btn').onclick = () => modal.remove();
  modal.querySelector('#edit-template-cancel-btn').onclick = () => modal.remove();
  modal.querySelector('.modal-backdrop').onclick = () => modal.remove();

  modal.querySelector('#edit-template-save-btn').onclick = async () => {
    try {
      const updates = {
        name: document.getElementById('edit-template-name').value.trim(),
        description: document.getElementById('edit-template-description').value.trim(),
        category: document.getElementById('edit-template-category').value,
        is_public: document.getElementById('edit-template-public').checked
      };

      if (!updates.name) {
        alert('Please enter a template name.');
        return;
      }

      await updateProjectTemplate(template.id, updates);

      // Update local template data
      Object.assign(template, updates);

      modal.remove();
      renderTemplateGrid(rootEl, allTemplates);
      alert('Template updated successfully!');

    } catch (error) {
      console.error('Failed to update template:', error);
      alert(`Failed to update template: ${error.message}`);
    }
  };

  modal.classList.remove('is-hidden');
  modal.querySelector('#edit-template-name').focus();
}

/**
 * Deletes a template with confirmation
 */
async function deleteTemplate(template, rootEl, allTemplates) {
  const confirmed = confirm(`Are you sure you want to delete the template "${template.name}"?\n\nThis action cannot be undone.`);
  if (!confirmed) return;

  try {
    await deleteProjectTemplate(template.id);

    // Remove from local array
    const index = allTemplates.findIndex(t => t.id === template.id);
    if (index !== -1) {
      allTemplates.splice(index, 1);
    }

    renderTemplateGrid(rootEl, allTemplates);
    alert('Template deleted successfully.');

  } catch (error) {
    console.error('Failed to delete template:', error);
    alert(`Failed to delete template: ${error.message}`);
  }
}

function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[m]));
}