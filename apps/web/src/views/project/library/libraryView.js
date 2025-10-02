/**
 * libraryView.js
 *
 * Main Question Library interface for Q-Gen
 * Provides a comprehensive library management interface with search, filtering,
 * categorization, and question insertion capabilities.
 */

import {
    getQuestionLibrary,
    searchQuestionLibrary,
    getLibraryStats,
    getLibraryClients,
    removeQuestionFromLibrary,
    updateLibraryQuestion,
    insertLibraryQuestion,
    exportLibrary,
    importLibrary,
    LIBRARY_CATEGORIES
} from '../../../lib/questionLibrary.js';

/**
 * Renders the main library view
 * @param {HTMLElement} hostEl - Container element
 * @param {Function} onInsertQuestion - Callback when question is inserted
 * @param {Function} onClose - Callback when library is closed
 */
export function renderLibraryView({ hostEl, onInsertQuestion, onClose }) {
    const stats = getLibraryStats();
    const clients = getLibraryClients();

    hostEl.innerHTML = `
        <div class="library-view">
            <!-- Library Header -->
            <div class="library-header">
                <div class="header-content">
                    <div class="header-title">
                        <h1>📚 Question Library</h1>
                        <p>Reuse and organize your frequently used questions</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn secondary" data-action="import-library">
                            📥 Import
                        </button>
                        <button class="btn secondary" data-action="export-library">
                            📤 Export
                        </button>
                        <button class="btn primary" data-action="close-library">
                            ← Back to Editor
                        </button>
                    </div>
                </div>

                <!-- Library Stats -->
                <div class="library-stats">
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalQuestions}</div>
                        <div class="stat-label">Total Questions</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${Object.keys(stats.questionsByClient).length}</div>
                        <div class="stat-label">Clients</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${Object.keys(stats.questionsByCategory).length}</div>
                        <div class="stat-label">Categories</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.mostUsed.length > 0 ? stats.mostUsed[0].usageCount : 0}</div>
                        <div class="stat-label">Most Used</div>
                    </div>
                </div>
            </div>

            <!-- Search and Filters -->
            <div class="library-controls">
                <div class="search-section">
                    <div class="search-box">
                        <input type="text" class="search-input" placeholder="Search questions..." data-filter="search">
                        <span class="search-icon">🔍</span>
                    </div>
                </div>

                <div class="filter-section">
                    <select class="filter-select" data-filter="category">
                        <option value="all">All Categories</option>
                        ${Object.entries(LIBRARY_CATEGORIES).map(([key, label]) =>
                            `<option value="${key}">${label}</option>`
                        ).join('')}
                    </select>

                    <select class="filter-select" data-filter="client">
                        <option value="all">All Clients</option>
                        ${clients.map(client =>
                            `<option value="${client.id}">${client.name} (${client.questionCount})</option>`
                        ).join('')}
                    </select>

                    <select class="filter-select" data-filter="type">
                        <option value="all">All Types</option>
                        <option value="list">List Questions</option>
                        <option value="numeric">Numeric</option>
                        <option value="table">Tables/Grids</option>
                        <option value="open">Open-ended</option>
                    </select>

                    <select class="filter-select" data-filter="sort">
                        <option value="updatedAt_desc">Recently Updated</option>
                        <option value="createdAt_desc">Recently Added</option>
                        <option value="title_asc">Title A-Z</option>
                        <option value="usageCount_desc">Most Used</option>
                    </select>
                </div>

                <div class="view-controls">
                    <button class="view-toggle ${getViewMode() === 'grid' ? 'active' : ''}"
                            data-action="set-view" data-view="grid">
                        ⊞ Grid
                    </button>
                    <button class="view-toggle ${getViewMode() === 'list' ? 'active' : ''}"
                            data-action="set-view" data-view="list">
                        ☰ List
                    </button>
                </div>
            </div>

            <!-- Library Content -->
            <div class="library-content">
                <div class="library-questions" data-view-mode="${getViewMode()}">
                    <!-- Questions will be rendered here -->
                </div>

                <div class="library-sidebar">
                    <!-- Quick Actions -->
                    <div class="sidebar-section">
                        <h3>Quick Actions</h3>
                        <div class="quick-actions">
                            <button class="action-btn" data-action="clear-filters">
                                🗑️ Clear Filters
                            </button>
                            <button class="action-btn" data-action="manage-categories">
                                🏷️ Manage Categories
                            </button>
                            <button class="action-btn" data-action="bulk-operations">
                                ⚡ Bulk Operations
                            </button>
                        </div>
                    </div>

                    <!-- Category Breakdown -->
                    <div class="sidebar-section">
                        <h3>Categories</h3>
                        <div class="category-list">
                            ${Object.entries(stats.questionsByCategory)
                                .filter(([_, count]) => count > 0)
                                .sort((a, b) => b[1] - a[1])
                                .map(([category, count]) => `
                                    <div class="category-item" data-action="filter-category" data-category="${category}">
                                        <span class="category-name">${category}</span>
                                        <span class="category-count">${count}</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>

                    <!-- Recently Used -->
                    ${stats.mostUsed.length > 0 ? `
                        <div class="sidebar-section">
                            <h3>Most Used</h3>
                            <div class="recent-questions">
                                ${stats.mostUsed.slice(0, 3).map(q => `
                                    <div class="recent-item" data-action="select-question" data-question-id="${q.id}">
                                        <div class="recent-title">${q.title}</div>
                                        <div class="recent-meta">${q.usageCount} uses</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // Initial render of questions
    renderQuestions(hostEl, {});

    // Event handlers
    setupLibraryEventHandlers(hostEl, onInsertQuestion, onClose);
}

/**
 * Renders the question list based on current filters
 */
function renderQuestions(hostEl, filters) {
    const questionsContainer = hostEl.querySelector('.library-questions');
    const viewMode = questionsContainer.dataset.viewMode;

    // Parse sort filter
    if (filters.sort) {
        const [sortBy, sortDirection] = filters.sort.split('_');
        filters.sortBy = sortBy;
        filters.sortDirection = sortDirection;
    }

    const questions = searchQuestionLibrary(filters);

    if (questions.length === 0) {
        questionsContainer.innerHTML = `
            <div class="no-questions">
                <div class="no-questions-icon">📝</div>
                <h3>No questions found</h3>
                <p>Try adjusting your search criteria or add some questions to your library.</p>
            </div>
        `;
        return;
    }

    const questionsHTML = questions.map(q => {
        const questionType = q.questionData.mode || 'list';
        const optionCount = q.questionData.options ? q.questionData.options.length : 0;

        if (viewMode === 'grid') {
            return `
                <div class="question-card" data-question-id="${q.id}">
                    <div class="card-header">
                        <div class="question-category">${LIBRARY_CATEGORIES[q.category] || q.category}</div>
                        <div class="question-actions">
                            <button class="action-icon" data-action="edit-question" data-question-id="${q.id}" title="Edit">
                                ✏️
                            </button>
                            <button class="action-icon" data-action="delete-question" data-question-id="${q.id}" title="Delete">
                                🗑️
                            </button>
                        </div>
                    </div>

                    <div class="card-content">
                        <h4 class="question-title">${escapeHTML(q.title)}</h4>
                        <p class="question-text">${escapeHTML(q.questionData.text || '')}</p>

                        <div class="question-meta">
                            <span class="meta-item">📊 ${questionType}</span>
                            ${optionCount > 0 ? `<span class="meta-item">🔢 ${optionCount} options</span>` : ''}
                            <span class="meta-item">👤 ${q.clientName}</span>
                        </div>

                        ${q.tags.length > 0 ? `
                            <div class="question-tags">
                                ${q.tags.slice(0, 3).map(tag =>
                                    `<span class="tag">${escapeHTML(tag)}</span>`
                                ).join('')}
                                ${q.tags.length > 3 ? `<span class="tag-more">+${q.tags.length - 3}</span>` : ''}
                            </div>
                        ` : ''}
                    </div>

                    <div class="card-footer">
                        <div class="question-stats">
                            <span class="stat">Used ${q.usageCount} times</span>
                            <span class="stat">Updated ${formatDate(q.updatedAt)}</span>
                        </div>
                        <button class="btn primary" data-action="insert-question" data-question-id="${q.id}">
                            Insert
                        </button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="question-row" data-question-id="${q.id}">
                    <div class="row-content">
                        <div class="row-main">
                            <h4 class="question-title">${escapeHTML(q.title)}</h4>
                            <p class="question-text">${escapeHTML(q.questionData.text || '')}</p>
                        </div>

                        <div class="row-meta">
                            <span class="meta-item">${LIBRARY_CATEGORIES[q.category] || q.category}</span>
                            <span class="meta-item">${questionType}</span>
                            <span class="meta-item">${q.clientName}</span>
                            <span class="meta-item">${q.usageCount} uses</span>
                        </div>
                    </div>

                    <div class="row-actions">
                        <button class="btn secondary small" data-action="edit-question" data-question-id="${q.id}">
                            Edit
                        </button>
                        <button class="btn primary small" data-action="insert-question" data-question-id="${q.id}">
                            Insert
                        </button>
                        <button class="action-icon" data-action="delete-question" data-question-id="${q.id}" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }
    }).join('');

    questionsContainer.innerHTML = questionsHTML;
}

/**
 * Sets up event handlers for the library interface
 */
function setupLibraryEventHandlers(hostEl, onInsertQuestion, onClose) {
    let currentFilters = {};

    // Filter change handlers
    hostEl.addEventListener('input', (e) => {
        if (e.target.dataset.filter) {
            const filterType = e.target.dataset.filter;
            currentFilters[filterType === 'search' ? 'searchTerm' : filterType] = e.target.value;
            renderQuestions(hostEl, currentFilters);
        }
    });

    hostEl.addEventListener('change', (e) => {
        if (e.target.dataset.filter) {
            const filterType = e.target.dataset.filter;
            currentFilters[filterType] = e.target.value;
            renderQuestions(hostEl, currentFilters);
        }
    });

    // Click handlers
    hostEl.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        const questionId = e.target.closest('[data-question-id]')?.dataset.questionId;

        switch (action) {
            case 'close-library':
                onClose();
                break;

            case 'insert-question':
                if (questionId && onInsertQuestion) {
                    const question = insertLibraryQuestion(questionId);
                    if (question) {
                        onInsertQuestion(question);
                        // Update the display to reflect new usage count
                        renderQuestions(hostEl, currentFilters);
                    }
                }
                break;

            case 'delete-question':
                if (questionId && confirm('Are you sure you want to delete this question from the library?')) {
                    removeQuestionFromLibrary(questionId);
                    renderQuestions(hostEl, currentFilters);
                }
                break;

            case 'edit-question':
                if (questionId) {
                    editLibraryQuestion(questionId, hostEl, currentFilters);
                }
                break;

            case 'set-view':
                const view = e.target.dataset.view;
                setViewMode(view);
                hostEl.querySelector('.library-questions').dataset.viewMode = view;
                hostEl.querySelectorAll('.view-toggle').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.view === view);
                });
                renderQuestions(hostEl, currentFilters);
                break;

            case 'clear-filters':
                currentFilters = {};
                hostEl.querySelectorAll('[data-filter]').forEach(input => {
                    input.value = input.type === 'select-one' ? 'all' : '';
                });
                renderQuestions(hostEl, currentFilters);
                break;

            case 'export-library':
                exportLibraryData();
                break;

            case 'import-library':
                importLibraryData();
                break;

            case 'filter-category':
                const category = e.target.dataset.category;
                // Find the category key from the display name
                const categoryKey = Object.entries(LIBRARY_CATEGORIES)
                    .find(([_, name]) => name === category)?.[0];
                if (categoryKey) {
                    currentFilters.category = categoryKey;
                    hostEl.querySelector('[data-filter="category"]').value = categoryKey;
                    renderQuestions(hostEl, currentFilters);
                }
                break;

            case 'select-question':
                if (questionId) {
                    // Scroll to and highlight the question
                    const questionEl = hostEl.querySelector(`[data-question-id="${questionId}"]`);
                    if (questionEl) {
                        questionEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        questionEl.classList.add('highlighted');
                        setTimeout(() => questionEl.classList.remove('highlighted'), 2000);
                    }
                }
                break;
        }
    });
}

// --- UTILITY FUNCTIONS ---

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

function getViewMode() {
    return localStorage.getItem('library_view_mode') || 'grid';
}

function setViewMode(mode) {
    localStorage.setItem('library_view_mode', mode);
}

function exportLibraryData() {
    const libraryData = exportLibrary();
    const blob = new Blob([libraryData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question-library-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importLibraryData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = importLibrary(e.target.result);
                if (result.success) {
                    alert(`Successfully imported ${result.imported} questions!`);
                    location.reload(); // Refresh to show imported questions
                } else {
                    alert(`Import failed: ${result.error}`);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function editLibraryQuestion(questionId, hostEl, currentFilters) {
    // This would open an edit modal - for now, just show an alert
    alert('Question editing feature coming soon!');
}