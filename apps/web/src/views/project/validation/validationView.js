/**
 * validationView.js
 *
 * Main validation view page that shows comprehensive project validation results.
 * This creates a dedicated validator page similar to the legacy system.
 */

import { renderValidationPanel } from './validationPanel.js';
import { validateProject } from '../../../lib/validation.js';

/**
 * Renders the main validation view page
 * @param {HTMLElement} hostEl - Container element
 * @param {Object} project - Current project data
 * @param {Function} onNavigateToQuestion - Callback to navigate to specific question
 */
export function renderValidationView({ hostEl, project, onNavigateToQuestion }) {
    const questions = project?.questions || [];

    hostEl.innerHTML = `
        <div class="validation-view">
            <!-- Page Header -->
            <div class="page-header">
                <div class="page-title-section">
                    <h1 class="page-title">
                        <span class="page-icon">🔍</span>
                        Project Validator
                    </h1>
                    <p class="page-description">
                        Comprehensive validation of your questionnaire to ensure quality and export readiness.
                    </p>
                </div>

                <div class="page-actions">
                    <button class="btn secondary" data-action="refresh-validation">
                        🔄 Refresh
                    </button>
                    <button class="btn primary" data-action="back-to-editor">
                        ← Back to Editor
                    </button>
                </div>
            </div>

            <!-- Project Summary -->
            <div class="project-summary">
                <div class="summary-card">
                    <div class="summary-icon">📋</div>
                    <div class="summary-content">
                        <div class="summary-number">${questions.length}</div>
                        <div class="summary-label">Total Questions</div>
                    </div>
                </div>

                <div class="summary-card">
                    <div class="summary-icon">🔤</div>
                    <div class="summary-content">
                        <div class="summary-number">${questions.filter(q => q.mode === 'list').length}</div>
                        <div class="summary-label">List Questions</div>
                    </div>
                </div>

                <div class="summary-card">
                    <div class="summary-icon">🔢</div>
                    <div class="summary-content">
                        <div class="summary-number">${questions.filter(q => q.mode === 'numeric').length}</div>
                        <div class="summary-label">Numeric Questions</div>
                    </div>
                </div>

                <div class="summary-card">
                    <div class="summary-icon">📊</div>
                    <div class="summary-content">
                        <div class="summary-number">${questions.filter(q => q.mode === 'table').length}</div>
                        <div class="summary-label">Table Questions</div>
                    </div>
                </div>

                <div class="summary-card">
                    <div class="summary-icon">📝</div>
                    <div class="summary-content">
                        <div class="summary-number">${questions.filter(q => q.mode === 'open_end').length}</div>
                        <div class="summary-label">Open Questions</div>
                    </div>
                </div>
            </div>

            <!-- Validation Controls -->
            <div class="validation-controls">
                <div class="controls-row">
                    <div class="filter-controls">
                        <select class="filter-select" data-filter="severity">
                            <option value="all">All Issues</option>
                            <option value="error">Errors Only</option>
                            <option value="warning">Warnings Only</option>
                            <option value="info">Info Only</option>
                        </select>

                        <select class="filter-select" data-filter="category">
                            <option value="all">All Categories</option>
                            <option value="structure">Structure</option>
                            <option value="content">Content</option>
                            <option value="accessibility">Accessibility</option>
                            <option value="flow">Logic Flow</option>
                            <option value="compliance">Brand Compliance</option>
                        </select>
                    </div>

                    <div class="search-controls">
                        <input type="text" class="search-input" placeholder="Search issues..." data-action="search-issues">
                        <button class="btn secondary" data-action="clear-filters">Clear Filters</button>
                    </div>
                </div>

                <div class="bulk-actions">
                    <button class="btn secondary" data-action="expand-all">Expand All</button>
                    <button class="btn secondary" data-action="collapse-all">Collapse All</button>
                    <button class="btn secondary" data-action="export-report">Export Report</button>
                </div>
            </div>

            <!-- Validation Results -->
            <div class="validation-results-container">
                <!-- This will be populated by renderValidationPanel -->
            </div>

            <!-- Quick Actions -->
            <div class="validation-quick-actions">
                <div class="quick-actions-header">
                    <h3>Quick Actions</h3>
                    <p>Common validation fixes and tools</p>
                </div>

                <div class="quick-actions-grid">
                    <div class="quick-action-card" data-action="fix-missing-ids">
                        <div class="action-icon">🏷️</div>
                        <div class="action-content">
                            <h4>Auto-Generate Missing IDs</h4>
                            <p>Automatically generate question IDs for questions missing them</p>
                        </div>
                    </div>

                    <div class="quick-action-card" data-action="fix-option-codes">
                        <div class="action-icon">🔢</div>
                        <div class="action-content">
                            <h4>Auto-Number Option Codes</h4>
                            <p>Generate sequential codes (1,2,3...) for options missing codes</p>
                        </div>
                    </div>

                    <div class="quick-action-card" data-action="check-duplicates">
                        <div class="action-icon">👯</div>
                        <div class="action-content">
                            <h4>Find Duplicate Content</h4>
                            <p>Identify questions or options with duplicate text</p>
                        </div>
                    </div>

                    <div class="quick-action-card" data-action="export-issues">
                        <div class="action-icon">📤</div>
                        <div class="action-content">
                            <h4>Export Issues Report</h4>
                            <p>Download a detailed report of all validation issues</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Render the validation panel
    const validationContainer = hostEl.querySelector('.validation-results-container');
    renderValidationPanel({
        hostEl: validationContainer,
        questions,
        onNavigateToQuestion
    });

    // Validation state
    let currentFilters = {
        severity: 'all',
        category: 'all',
        searchTerm: ''
    };

    // Helper function to re-render with filters
    function renderWithFilters() {
        renderValidationPanel({
            hostEl: validationContainer,
            questions,
            onNavigateToQuestion,
            filters: currentFilters
        });
    }

    // Event handlers
    hostEl.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;

        switch (action) {
            case 'refresh-validation':
                renderWithFilters();
                break;

            case 'back-to-editor':
                if (window.location.hash.includes('/validator')) {
                    window.location.hash = window.location.hash.replace('/validator', '/pre-field');
                }
                break;

            case 'fix-missing-ids':
                fixMissingQuestionIds(questions);
                break;

            case 'fix-option-codes':
                fixMissingOptionCodes(questions);
                break;

            case 'check-duplicates':
                showDuplicateReport(questions);
                break;

            case 'export-issues':
                exportValidationReport(questions);
                break;

            case 'clear-filters':
                currentFilters = { severity: 'all', category: 'all', searchTerm: '' };
                hostEl.querySelector('[data-filter="severity"]').value = 'all';
                hostEl.querySelector('[data-filter="category"]').value = 'all';
                hostEl.querySelector('[data-action="search-issues"]').value = '';
                renderWithFilters();
                break;

            case 'expand-all':
                hostEl.querySelectorAll('.issue-group').forEach(group => {
                    group.classList.add('expanded');
                });
                break;

            case 'collapse-all':
                hostEl.querySelectorAll('.issue-group').forEach(group => {
                    group.classList.remove('expanded');
                });
                break;

            case 'export-report':
                exportDetailedValidationReport(questions);
                break;
        }
    });

    // Filter change handlers
    hostEl.addEventListener('change', (e) => {
        const filterType = e.target.dataset.filter;
        if (filterType) {
            currentFilters[filterType] = e.target.value;
            renderWithFilters();
        }
    });

    // Search input handler
    hostEl.addEventListener('input', (e) => {
        if (e.target.dataset.action === 'search-issues') {
            currentFilters.searchTerm = e.target.value.toLowerCase();
            renderWithFilters();
        }
    });
}

/**
 * Auto-generates missing question IDs
 */
function fixMissingQuestionIds(questions) {
    let hasChanges = false;
    const existingIds = new Set(questions.map(q => q.id).filter(Boolean));

    questions.forEach((question, index) => {
        if (!question.id || !question.id.trim()) {
            // Generate new ID
            let newId;
            let counter = index + 1;

            // Try screener first (S1, S2, etc.)
            if (index < 5) {
                do {
                    newId = `S${counter}`;
                    counter++;
                } while (existingIds.has(newId));
            } else {
                // Main questions (Q1, Q2, etc.)
                counter = 1;
                do {
                    newId = `Q${counter}`;
                    counter++;
                } while (existingIds.has(newId));
            }

            question.id = newId;
            existingIds.add(newId);
            hasChanges = true;
        }
    });

    if (hasChanges) {
        alert('Missing question IDs have been generated. Please review and save your project.');
        // Trigger a re-render
        window.location.reload();
    } else {
        alert('No missing question IDs found.');
    }
}

/**
 * Auto-generates missing option codes
 */
function fixMissingOptionCodes(questions) {
    let hasChanges = false;

    questions.forEach(question => {
        if (question.options && question.options.length > 0) {
            question.options.forEach((option, index) => {
                if (!option.code || !option.code.toString().trim()) {
                    option.code = (index + 1).toString();
                    hasChanges = true;
                }
            });
        }
    });

    if (hasChanges) {
        alert('Missing option codes have been generated. Please review and save your project.');
        window.location.reload();
    } else {
        alert('No missing option codes found.');
    }
}

/**
 * Shows duplicate content report
 */
function showDuplicateReport(questions) {
    const duplicates = [];

    // Check for duplicate question text
    const questionTexts = {};
    questions.forEach((q, index) => {
        if (q.text && q.text.trim()) {
            const text = q.text.trim().toLowerCase();
            if (questionTexts[text]) {
                duplicates.push(`Duplicate question text: "${q.text}" (${questionTexts[text].id} and ${q.id})`);
            } else {
                questionTexts[text] = { id: q.id, index };
            }
        }
    });

    if (duplicates.length > 0) {
        alert(`Found ${duplicates.length} duplicate(s):\n\n${duplicates.join('\n')}`);
    } else {
        alert('No duplicate content found.');
    }
}

/**
 * Exports validation report
 */
function exportValidationReport(questions) {
    alert('Basic validation report export feature coming soon!');
}

/**
 * Exports detailed validation report with filtering
 */
function exportDetailedValidationReport(questions) {
    const issues = validateProject(questions);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

    // Create CSV content
    const headers = ['Question ID', 'Severity', 'Type', 'Message', 'Category'];
    const rows = issues.map(issue => [
        issue.questionId || 'Project',
        issue.severity,
        issue.type || 'general',
        `"${issue.message.replace(/"/g, '""')}"`,
        getIssueCategory(issue.type)
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Gets category for issue type
 */
function getIssueCategory(type) {
    const categoryMap = {
        duplicate_id: 'Structure',
        missing_id: 'Structure',
        missing_text: 'Structure',
        missing_options: 'Content',
        missing_labels: 'Content',
        code_gaps: 'Content',
        accessibility: 'Accessibility',
        circular_dependency: 'Logic Flow',
        inconsistent_reference: 'Logic Flow',
        brand_compliance: 'Brand Compliance',
        survey_length: 'Performance',
        question_count: 'Performance'
    };
    return categoryMap[type] || 'General';
}