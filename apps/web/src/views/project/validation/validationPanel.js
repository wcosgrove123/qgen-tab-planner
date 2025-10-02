/**
 * validationPanel.js
 *
 * UI component for displaying validation results and issues.
 * Provides real-time feedback and comprehensive project validation.
 */

import { validateProject, groupIssuesBySeverity, checkExportReadiness, SEVERITY } from '../../../lib/validation.js';

/**
 * Renders the validation panel showing all project issues
 * @param {HTMLElement} hostEl - Container element
 * @param {Array} questions - Array of questions to validate
 * @param {Function} onNavigateToQuestion - Callback to navigate to specific question
 * @param {Object} filters - Filter options for issues
 */
export function renderValidationPanel({ hostEl, questions, onNavigateToQuestion, filters = {} }) {
    let issues = validateProject(questions);

    // Apply filters
    if (filters.severity && filters.severity !== 'all') {
        issues = issues.filter(issue => issue.severity === filters.severity);
    }

    if (filters.category && filters.category !== 'all') {
        const categoryMap = {
            structure: ['duplicate_id', 'missing_id', 'missing_text'],
            content: ['missing_options', 'missing_labels', 'code_gaps'],
            accessibility: ['accessibility'],
            flow: ['circular_dependency', 'inconsistent_reference'],
            compliance: ['brand_compliance', 'terminology']
        };
        const categoryTypes = categoryMap[filters.category] || [];
        issues = issues.filter(issue => categoryTypes.includes(issue.type));
    }

    if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchTerm = filters.searchTerm.toLowerCase();
        issues = issues.filter(issue =>
            issue.message.toLowerCase().includes(searchTerm) ||
            (issue.questionId || '').toLowerCase().includes(searchTerm)
        );
    }

    const grouped = groupIssuesBySeverity(issues);
    const exportStatus = checkExportReadiness(questions);

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case SEVERITY.ERROR: return '🚫';
            case SEVERITY.WARNING: return '⚠️';
            case SEVERITY.INFO: return 'ℹ️';
            default: return '•';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case SEVERITY.ERROR: return 'var(--danger)';
            case SEVERITY.WARNING: return '#f59e0b';
            case SEVERITY.INFO: return 'var(--accent)';
            default: return 'var(--muted)';
        }
    };

    hostEl.innerHTML = `
        <div class="validation-panel">
            <!-- Export Readiness Status -->
            <div class="validation-header">
                <div class="export-status ${exportStatus.isReady ? 'ready' : 'not-ready'}">
                    <div class="status-icon">
                        ${exportStatus.isReady ? '✅' : '❌'}
                    </div>
                    <div class="status-content">
                        <h3>${exportStatus.isReady ? 'Ready to Export' : 'Export Blocked'}</h3>
                        <p>${exportStatus.isReady ?
                            'All validation checks passed' :
                            `${exportStatus.errorCount} error${exportStatus.errorCount !== 1 ? 's' : ''} must be fixed before export`
                        }</p>
                    </div>
                </div>

                <div class="validation-summary">
                    <div class="summary-item">
                        <span class="count error-count">${grouped.errors.length}</span>
                        <span class="label">Errors</span>
                    </div>
                    <div class="summary-item">
                        <span class="count warning-count">${grouped.warnings.length}</span>
                        <span class="label">Warnings</span>
                    </div>
                    <div class="summary-item">
                        <span class="count info-count">${grouped.info.length}</span>
                        <span class="label">Info</span>
                    </div>
                </div>
            </div>

            <!-- Issues List -->
            <div class="validation-content">
                ${issues.length === 0 ? `
                    <div class="no-issues">
                        <div class="success-icon">🎉</div>
                        <h4>All Validation Checks Passed!</h4>
                        <p>Your questionnaire looks great and is ready for export.</p>
                    </div>
                ` : `
                    <div class="issues-list">
                        ${grouped.errors.length > 0 ? `
                            <div class="issue-group">
                                <h4 class="group-header error-header">
                                    🚫 Critical Errors (${grouped.errors.length})
                                </h4>
                                <p class="group-description">These issues must be fixed before export.</p>
                                ${grouped.errors.map(issue => `
                                    <div class="issue-item error-item" data-question-id="${issue.questionId || ''}">
                                        <div class="issue-content">
                                            <div class="issue-header">
                                                <span class="issue-icon">${getSeverityIcon(issue.severity)}</span>
                                                <span class="issue-question">${issue.questionId || 'Project'}</span>
                                            </div>
                                            <div class="issue-message">${issue.message}</div>
                                        </div>
                                        ${issue.questionId ? `
                                            <button class="issue-action-btn" data-action="navigate-to-question" data-question-id="${issue.questionId}">
                                                Fix →
                                            </button>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}

                        ${grouped.warnings.length > 0 ? `
                            <div class="issue-group">
                                <h4 class="group-header warning-header">
                                    ⚠️ Warnings (${grouped.warnings.length})
                                </h4>
                                <p class="group-description">These issues should be reviewed but won't prevent export.</p>
                                ${grouped.warnings.map(issue => `
                                    <div class="issue-item warning-item" data-question-id="${issue.questionId || ''}">
                                        <div class="issue-content">
                                            <div class="issue-header">
                                                <span class="issue-icon">${getSeverityIcon(issue.severity)}</span>
                                                <span class="issue-question">${issue.questionId || 'Project'}</span>
                                            </div>
                                            <div class="issue-message">${issue.message}</div>
                                        </div>
                                        ${issue.questionId ? `
                                            <button class="issue-action-btn" data-action="navigate-to-question" data-question-id="${issue.questionId}">
                                                Review →
                                            </button>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}

                        ${grouped.info.length > 0 ? `
                            <div class="issue-group">
                                <h4 class="group-header info-header">
                                    ℹ️ Information (${grouped.info.length})
                                </h4>
                                <p class="group-description">Additional information about your questionnaire.</p>
                                ${grouped.info.map(issue => `
                                    <div class="issue-item info-item" data-question-id="${issue.questionId || ''}">
                                        <div class="issue-content">
                                            <div class="issue-header">
                                                <span class="issue-icon">${getSeverityIcon(issue.severity)}</span>
                                                <span class="issue-question">${issue.questionId || 'Project'}</span>
                                            </div>
                                            <div class="issue-message">${issue.message}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `}

                <!-- Actions -->
                <div class="validation-actions">
                    <button class="btn secondary" data-action="re-validate">
                        🔄 Re-run Validation
                    </button>
                    ${exportStatus.isReady ? `
                        <button class="btn primary" data-action="export-project">
                            📤 Export Project
                        </button>
                    ` : `
                        <button class="btn primary" disabled title="Fix errors before export">
                            📤 Export Project
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;

    // Event handlers
    hostEl.addEventListener('click', (e) => {
        const action = e.target.dataset.action;

        if (action === 'navigate-to-question') {
            const questionId = e.target.dataset.questionId;
            if (questionId && onNavigateToQuestion) {
                onNavigateToQuestion(questionId);
            }
        } else if (action === 're-validate') {
            // Re-render the panel to refresh validation
            renderValidationPanel({ hostEl, questions, onNavigateToQuestion });
        } else if (action === 'export-project') {
            // Trigger export action
            if (exportStatus.isReady) {
                // This would typically call an export function
                console.log('Export project triggered');
            }
        }
    });
}

/**
 * Renders a compact validation status indicator
 * @param {HTMLElement} hostEl - Container element
 * @param {Array} questions - Array of questions to validate
 * @returns {Object} Validation status info
 */
export function renderValidationStatus({ hostEl, questions }) {
    const issues = validateProject(questions);
    const grouped = groupIssuesBySeverity(issues);
    const exportStatus = checkExportReadiness(questions);

    hostEl.innerHTML = `
        <div class="validation-status-compact">
            <div class="status-indicator ${exportStatus.isReady ? 'status-ready' : 'status-blocked'}">
                ${exportStatus.isReady ? '✅' : '❌'}
            </div>
            <div class="status-text">
                ${exportStatus.isReady ? 'Valid' : `${grouped.errors.length} error${grouped.errors.length !== 1 ? 's' : ''}`}
                ${grouped.warnings.length > 0 ? `, ${grouped.warnings.length} warning${grouped.warnings.length !== 1 ? 's' : ''}` : ''}
            </div>
        </div>
    `;

    return {
        isValid: exportStatus.isReady,
        errorCount: grouped.errors.length,
        warningCount: grouped.warnings.length,
        issues: issues
    };
}

/**
 * Renders inline validation feedback for a specific field
 * @param {HTMLElement} hostEl - Container element
 * @param {Object} validationResult - Result from field validation
 */
export function renderFieldValidation({ hostEl, validationResult }) {
    if (!validationResult || validationResult.isValid) {
        hostEl.innerHTML = '';
        hostEl.className = 'field-validation';
        return;
    }

    const severityClass = `validation-${validationResult.severity}`;

    hostEl.innerHTML = `
        <div class="validation-message ${severityClass}">
            <span class="validation-icon">${getSeverityIcon(validationResult.severity)}</span>
            <span class="validation-text">${validationResult.message}</span>
        </div>
    `;

    hostEl.className = `field-validation ${severityClass}`;
}

function getSeverityIcon(severity) {
    switch (severity) {
        case SEVERITY.ERROR: return '🚫';
        case SEVERITY.WARNING: return '⚠️';
        case SEVERITY.INFO: return 'ℹ️';
        default: return '•';
    }
}