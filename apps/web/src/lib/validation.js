/**
 * validation.js
 *
 * Comprehensive validation system for Q-Gen questionnaire builder.
 * Provides real-time validation, project-level checks, and error reporting
 * for ensuring survey quality and data integrity.
 */

// --- VALIDATION SEVERITY LEVELS ---
export const SEVERITY = {
    ERROR: 'error',    // Critical issues that prevent export
    WARNING: 'warning', // Issues that should be reviewed
    INFO: 'info'       // Informational notices
};

// --- CORE VALIDATION FUNCTIONS ---

/**
 * Validates a single question based on its validation rules
 * @param {Object} question - The question object to validate
 * @param {Object} allResponses - Map of current survey responses
 * @param {Array} questions - All questions for reference
 * @returns {Object|null} Validation result or null if no validation needed
 */
export function runQuestionValidation(question, allResponses, questions) {
    if (!question.validation) {
        return null; // No validation rules for this question
    }

    // Sum Equals QID Validation
    if (question.validation.type === 'sum_equals_qid') {
        const targetQid = question.validation.target;
        const targetSum = Number(allResponses[targetQid] || 0);

        let currentSum = 0;
        (question.options || []).forEach(opt => {
            const fieldId = `${question.id}_${opt.code}`;
            currentSum += Number(allResponses[fieldId] || 0);
        });

        const isValid = currentSum === targetSum;

        return {
            isValid: isValid,
            severity: isValid ? SEVERITY.INFO : SEVERITY.ERROR,
            message: `The sum must equal ${targetSum}. Current sum: ${currentSum}`,
            currentSum: currentSum,
            targetSum: targetSum
        };
    }

    // Per-Option Range Validation
    if (question.validation.type === 'per_option_range') {
        const selectedOptionCode = allResponses[question.id];
        const enteredAmount = parseFloat(allResponses[`${question.id}_amount`]);

        if (!selectedOptionCode || isNaN(enteredAmount)) {
            return null; // Not enough info to validate yet
        }

        const selectedOption = (question.options || []).find(o =>
            String(o.code) === String(selectedOptionCode)
        );
        const rule = selectedOption?.validation_range;

        if (!rule) return null; // No rule for this option

        // Check Min/Max
        if ((rule.min !== null && enteredAmount < rule.min) ||
            (rule.max !== null && enteredAmount > rule.max)) {
            return {
                isValid: false,
                severity: SEVERITY.ERROR,
                message: `Amount must be between ${rule.min} and ${rule.max}`
            };
        }

        // Check Decimals
        if (rule.decimals && rule.decimals.length > 0) {
            const decimalPart = enteredAmount % 1;
            const allowedDecimals = rule.decimals.map(d => d / 10);
            if (!allowedDecimals.includes(decimalPart)) {
                return {
                    isValid: false,
                    severity: SEVERITY.ERROR,
                    message: `Amount must end in .${rule.decimals.join(' or .')}`
                };
            }
        }

        return { isValid: true, severity: SEVERITY.INFO };
    }

    // Table Column Validation
    if (question.mode === 'table' && question.validation?.type === 'force_per_column') {
        const cols = question.grid?.cols || [];
        const missingCols = [];

        cols.forEach((col, colIndex) => {
            const hasResponse = (question.grid?.rows || []).some(row =>
                allResponses[`${question.id}_${row}_${colIndex}`]
            );
            if (!hasResponse) missingCols.push(col);
        });

        return {
            isValid: missingCols.length === 0,
            severity: missingCols.length === 0 ? SEVERITY.INFO : SEVERITY.ERROR,
            message: missingCols.length === 0 ?
                'All columns completed' :
                `Please answer for: ${missingCols.join(', ')}`
        };
    }

    return null; // Unknown validation type
}

/**
 * Comprehensive project-level validation
 * @param {Array} questions - Array of all questions
 * @returns {Array} Array of validation issues
 */
export function validateProject(questions) {
    const issues = [];

    // 1) Mode sanity check
    questions.forEach(q => {
        if (q.mode && !['list', 'numeric', 'table', 'open_end', 'text'].includes(q.mode)) {
            issues.push({
                severity: SEVERITY.ERROR,
                questionId: q.id,
                message: `Invalid mode "${q.mode}" (must be list | numeric | table | open_end | text)`
            });
        }
    });

    // 2) Question ID validation
    const questionIds = questions.map(q => q.id).filter(Boolean);
    const duplicateIds = questionIds.filter((id, index, arr) => arr.indexOf(id) !== index);

    if (duplicateIds.length > 0) {
        [...new Set(duplicateIds)].forEach(id => {
            issues.push({
                severity: SEVERITY.ERROR,
                questionId: id,
                message: `Duplicate question ID: ${id}`
            });
        });
    }

    // 3) Question text validation
    questions.forEach(q => {
        if (!q.text || !q.text.trim()) {
            issues.push({
                severity: SEVERITY.ERROR,
                questionId: q.id,
                message: 'Question text is required'
            });
        }
    });

    // 4) Options validation
    questions.forEach(q => {
        if (q.mode === 'list' && (!q.options || q.options.length === 0)) {
            issues.push({
                severity: SEVERITY.ERROR,
                questionId: q.id,
                message: 'List questions must have at least one option'
            });
            return;
        }

        const codes = (q.options || []).map(o => o.code).filter(v => v !== undefined && v !== null && v !== '');
        const labels = (q.options || []).map(o => o.label || '');

        // Check for duplicate codes
        const duplicateCodes = codes.filter((v, i, a) => a.indexOf(v) !== i);
        if (duplicateCodes.length) {
            issues.push({
                severity: SEVERITY.ERROR,
                questionId: q.id,
                message: `Duplicate option codes: ${[...new Set(duplicateCodes)].join(', ')}`
            });
        }

        // Check for code gaps
        if (codes.length > 1) {
            const sorted = [...codes].map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
            for (let i = 1; i < sorted.length; i++) {
                if (sorted[i] - sorted[i - 1] > 1) {
                    issues.push({
                        severity: SEVERITY.WARNING,
                        questionId: q.id,
                        message: `Code gap between ${sorted[i - 1]} and ${sorted[i]}`
                    });
                    break;
                }
            }
        }

        // Check for missing labels
        labels.forEach((label, index) => {
            if (!String(label).trim()) {
                issues.push({
                    severity: SEVERITY.ERROR,
                    questionId: q.id,
                    message: `Option ${index + 1} missing label`
                });
            }
        });
    });

    // 5) Numeric configuration validation
    const validUnits = new Set([
        'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years',
        'count', 'currency', 'percentage', 'custom', ''
    ]);

    questions.forEach(q => {
        const isNumeric = q.mode === 'numeric' || (q.type || '').startsWith('numeric');
        if (!isNumeric) return;

        const n = q.numeric || {};
        if (n.unit && !validUnits.has(n.unit)) {
            issues.push({
                severity: SEVERITY.ERROR,
                questionId: q.id,
                message: `Invalid numeric unit "${n.unit}"`
            });
        }

        if (n.min != null && n.max != null && Number(n.min) > Number(n.max)) {
            issues.push({
                severity: SEVERITY.ERROR,
                questionId: q.id,
                message: 'Numeric minimum cannot be greater than maximum'
            });
        }

        if (n.placeholder && typeof n.placeholder !== 'string') {
            issues.push({
                severity: SEVERITY.WARNING,
                questionId: q.id,
                message: 'Numeric placeholder should be text'
            });
        }
    });

    // 6) Open-end configuration validation
    questions.forEach(q => {
        if (q.mode === 'open_end') {
            const k = q.open?.limit_kind;
            if (k && !['words', 'characters', 'sentences'].includes(k)) {
                issues.push({
                    severity: SEVERITY.WARNING,
                    questionId: q.id,
                    message: `Invalid open limit kind "${k}"`
                });
            }

            const { min, max } = q.open || {};
            if (min != null && max != null && Number(min) > Number(max)) {
                issues.push({
                    severity: SEVERITY.WARNING,
                    questionId: q.id,
                    message: 'Open-end minimum cannot be greater than maximum'
                });
            }
        }
    });

    // 7) Table validation
    questions.forEach(q => {
        if (q.mode === 'table') {
            const grid = q.grid || {};

            if (!grid.rows || grid.rows.length === 0) {
                issues.push({
                    severity: SEVERITY.ERROR,
                    questionId: q.id,
                    message: 'Table questions must have at least one row'
                });
            }

            if (!grid.cols || grid.cols.length === 0) {
                if (!grid.columnSource) {
                    issues.push({
                        severity: SEVERITY.ERROR,
                        questionId: q.id,
                        message: 'Table questions must have columns or a column source'
                    });
                }
            }
        }
    });

    // 8) Cross-question reference validation
    questions.forEach((q, qi) => {
        if (q.conditions && q.conditions.rules) {
            q.conditions.rules.forEach(rule => {
                if (rule.source_qid) {
                    const refIndex = questions.findIndex(x => x.id === rule.source_qid);
                    if (refIndex > qi) {
                        issues.push({
                            severity: SEVERITY.ERROR,
                            questionId: q.id,
                            message: `Condition references future question ${rule.source_qid}`
                        });
                    }
                    if (refIndex === -1) {
                        issues.push({
                            severity: SEVERITY.ERROR,
                            questionId: q.id,
                            message: `Condition references unknown question ${rule.source_qid}`
                        });
                    }
                }
            });
        }
    });

    // 9) Likert scale validation
    questions.forEach(q => {
        if (q.scale?.points && q.scale.labels && q.scale.labels.length) {
            if (q.scale.labels.length !== q.scale.points) {
                issues.push({
                    severity: SEVERITY.WARNING,
                    questionId: q.id,
                    message: `${q.scale.points} scale points but ${q.scale.labels.length} labels provided`
                });
            }
        }
    });

    // 10) Terminate options validation
    questions.forEach(q => {
        const hasTerminate = (q.options || []).some(o => o.terminate);
        if (hasTerminate && (q.exports?.tab_plan?.nets_text || '').trim()) {
            issues.push({
                severity: SEVERITY.WARNING,
                questionId: q.id,
                message: 'Question has terminate options but also has nets text'
            });
        }
    });

    // 11) Advanced validation checks
    issues.push(...validateQuestionFlow(questions));
    issues.push(...validateLogicalConsistency(questions));
    issues.push(...validateSurveyLength(questions));
    issues.push(...validateAccessibility(questions));
    issues.push(...validateBrandCompliance(questions));

    return issues;
}

/**
 * Real-time field validation for individual inputs
 * @param {string} fieldType - Type of field being validated
 * @param {any} value - Current field value
 * @param {Object} context - Additional context for validation
 * @returns {Object|null} Validation result
 */
export function validateField(fieldType, value, context = {}) {
    switch (fieldType) {
        case 'questionId':
            if (!value || !value.trim()) {
                return {
                    isValid: false,
                    severity: SEVERITY.ERROR,
                    message: 'Question ID is required'
                };
            }
            if (!/^[A-Z]\d+$/.test(value)) {
                return {
                    isValid: false,
                    severity: SEVERITY.WARNING,
                    message: 'Question ID should follow format like S1, Q1, etc.'
                };
            }
            break;

        case 'optionCode':
            if (!value || !value.trim()) {
                return {
                    isValid: false,
                    severity: SEVERITY.ERROR,
                    message: 'Option code is required'
                };
            }
            if (isNaN(Number(value))) {
                return {
                    isValid: false,
                    severity: SEVERITY.WARNING,
                    message: 'Option codes should typically be numeric'
                };
            }
            break;

        case 'optionLabel':
            if (!value || !value.trim()) {
                return {
                    isValid: false,
                    severity: SEVERITY.ERROR,
                    message: 'Option label is required'
                };
            }
            break;

        case 'numericRange':
            if (value !== '' && isNaN(Number(value))) {
                return {
                    isValid: false,
                    severity: SEVERITY.ERROR,
                    message: 'Must be a valid number'
                };
            }
            if (context.min !== undefined && context.max !== undefined) {
                const num = Number(value);
                const min = Number(context.min);
                const max = Number(context.max);
                if (!isNaN(num) && !isNaN(min) && !isNaN(max) && min > max) {
                    return {
                        isValid: false,
                        severity: SEVERITY.ERROR,
                        message: 'Minimum cannot be greater than maximum'
                    };
                }
            }
            break;
    }

    return { isValid: true, severity: SEVERITY.INFO };
}

/**
 * Builds mock responses for testing validation rules
 * @param {Array} questions - Array of questions
 * @returns {Object} Mock response data
 */
export function buildMockResponses(questions) {
    const mockResponses = {};

    questions.forEach((q, index) => {
        if (q.id) {
            // Create realistic mock responses based on question type
            if (q.id.match(/S6_\d/)) {
                // Child count questions - use realistic numbers
                mockResponses[q.id] = Math.floor(Math.random() * 3) + 1;
            } else if (Array.isArray(q.options) && q.options.length > 0) {
                mockResponses[q.id] = q.options[0].code || '1';
            } else if (q.mode === 'numeric' || (q.type || '').includes('numeric')) {
                mockResponses[q.id] = '25'; // Default numeric value
            } else {
                mockResponses[q.id] = 'Sample response';
            }
        }
    });

    return mockResponses;
}

/**
 * Groups validation issues by severity
 * @param {Array} issues - Array of validation issues
 * @returns {Object} Issues grouped by severity
 */
export function groupIssuesBySeverity(issues) {
    return {
        errors: issues.filter(i => i.severity === SEVERITY.ERROR),
        warnings: issues.filter(i => i.severity === SEVERITY.WARNING),
        info: issues.filter(i => i.severity === SEVERITY.INFO)
    };
}

/**
 * Checks if project is ready for export
 * @param {Array} questions - Array of questions
 * @returns {Object} Export readiness status
 */
export function checkExportReadiness(questions) {
    const issues = validateProject(questions);
    const grouped = groupIssuesBySeverity(issues);

    return {
        isReady: grouped.errors.length === 0,
        errorCount: grouped.errors.length,
        warningCount: grouped.warnings.length,
        issues: issues
    };
}

// --- ADVANCED VALIDATION FUNCTIONS ---

/**
 * Validates question flow and logic dependencies
 * @param {Array} questions - Array of questions
 * @returns {Array} Array of flow-related issues
 */
export function validateQuestionFlow(questions) {
    const issues = [];

    // Check for circular dependencies in conditional logic
    const dependencies = new Map();
    questions.forEach((q, index) => {
        if (q.conditions && q.conditions.rules) {
            const deps = q.conditions.rules
                .map(rule => rule.source_qid)
                .filter(Boolean);
            if (deps.length > 0) {
                dependencies.set(q.id, deps);
            }
        }
    });

    // Detect circular dependencies using DFS
    function hasCycle(questionId, visited, stack) {
        if (!questionId || !dependencies.has(questionId)) return false;
        if (stack.has(questionId)) return true;
        if (visited.has(questionId)) return false;

        visited.add(questionId);
        stack.add(questionId);

        const deps = dependencies.get(questionId) || [];
        for (const dep of deps) {
            if (hasCycle(dep, visited, stack)) {
                return true;
            }
        }

        stack.delete(questionId);
        return false;
    }

    questions.forEach(q => {
        if (q.id && dependencies.has(q.id)) {
            const visited = new Set();
            const stack = new Set();
            if (hasCycle(q.id, visited, stack)) {
                issues.push({
                    severity: SEVERITY.ERROR,
                    questionId: q.id,
                    type: 'circular_dependency',
                    message: 'Question has circular dependency in conditional logic'
                });
            }
        }
    });

    // Check for orphaned questions (unreachable due to conditions)
    const reachableQuestions = new Set();
    questions.forEach((q, index) => {
        if (index === 0 || !q.conditions || q.conditions.mode === 'none') {
            reachableQuestions.add(q.id);
        }
    });

    // TODO: More sophisticated reachability analysis could be added here

    return issues;
}

/**
 * Validates logical consistency across questions
 * @param {Array} questions - Array of questions
 * @returns {Array} Array of consistency issues
 */
export function validateLogicalConsistency(questions) {
    const issues = [];

    // Check for inconsistent question types referencing each other
    questions.forEach(q => {
        if (q.grid && q.grid.columnSource) {
            const sourceQuestion = questions.find(sq => sq.id === q.grid.columnSource);
            if (sourceQuestion && sourceQuestion.mode !== 'list') {
                issues.push({
                    severity: SEVERITY.WARNING,
                    questionId: q.id,
                    type: 'inconsistent_reference',
                    message: `Column source "${q.grid.columnSource}" is not a list question`
                });
            }
        }
    });

    // Check for scale consistency across similar questions
    const scaleQuestions = questions.filter(q => q.scale && q.scale.points);
    if (scaleQuestions.length > 1) {
        const firstScale = scaleQuestions[0].scale.points;
        const inconsistentScales = scaleQuestions.filter(q => q.scale.points !== firstScale);
        if (inconsistentScales.length > 0) {
            issues.push({
                severity: SEVERITY.INFO,
                type: 'scale_inconsistency',
                message: `Survey uses mixed scale lengths (${firstScale}-point and others). Consider standardizing.`
            });
        }
    }

    return issues;
}

/**
 * Validates survey length and completion time
 * @param {Array} questions - Array of questions
 * @returns {Array} Array of length-related issues
 */
export function validateSurveyLength(questions) {
    const issues = [];

    // Estimate completion time
    let estimatedMinutes = 0;
    questions.forEach(q => {
        // Base time per question
        estimatedMinutes += 0.5;

        // Additional time based on question type
        if (q.mode === 'list') {
            estimatedMinutes += (q.options?.length || 0) * 0.1;
        } else if (q.mode === 'table') {
            const rows = q.grid?.rows?.length || 0;
            const cols = q.grid?.cols?.length || 0;
            estimatedMinutes += rows * cols * 0.15;
        } else if (q.mode === 'open_end') {
            estimatedMinutes += 1; // Open-ended takes longer
        }
    });

    if (estimatedMinutes > 15) {
        issues.push({
            severity: SEVERITY.WARNING,
            type: 'survey_length',
            message: `Survey estimated to take ${Math.round(estimatedMinutes)} minutes. Consider reducing length for better completion rates.`
        });
    }

    if (questions.length > 50) {
        issues.push({
            severity: SEVERITY.WARNING,
            type: 'question_count',
            message: `Survey has ${questions.length} questions. High question count may impact completion rates.`
        });
    }

    return issues;
}

/**
 * Validates accessibility compliance
 * @param {Array} questions - Array of questions
 * @returns {Array} Array of accessibility issues
 */
export function validateAccessibility(questions) {
    const issues = [];

    questions.forEach(q => {
        // Check for missing question text
        if (!q.text || q.text.trim().length === 0) {
            issues.push({
                severity: SEVERITY.ERROR,
                questionId: q.id,
                type: 'accessibility',
                message: 'Question missing text (required for screen readers)'
            });
        }

        // Check for very long question text
        if (q.text && q.text.length > 200) {
            issues.push({
                severity: SEVERITY.INFO,
                questionId: q.id,
                type: 'accessibility',
                message: 'Question text is quite long. Consider breaking into shorter segments for better readability.'
            });
        }

        // Check for missing option labels
        if (q.options) {
            q.options.forEach((option, index) => {
                if (!option.label || option.label.trim().length === 0) {
                    issues.push({
                        severity: SEVERITY.ERROR,
                        questionId: q.id,
                        type: 'accessibility',
                        message: `Option ${index + 1} missing label (required for screen readers)`
                    });
                }
            });
        }

        // Check for color-only differentiation warnings
        if (q.scale && q.scale.points && !q.scale.labels) {
            issues.push({
                severity: SEVERITY.INFO,
                questionId: q.id,
                type: 'accessibility',
                message: 'Scale question relies on visual cues only. Consider adding text labels for accessibility.'
            });
        }
    });

    return issues;
}

/**
 * Validates brand compliance and style guidelines
 * @param {Array} questions - Array of questions
 * @returns {Array} Array of brand compliance issues
 */
export function validateBrandCompliance(questions) {
    const issues = [];

    // Check for consistent terminology
    const terminologyIssues = [];
    const commonTerms = {
        'very satisfied': ['extremely satisfied', 'highly satisfied'],
        'somewhat satisfied': ['moderately satisfied', 'quite satisfied'],
        'not at all satisfied': ['completely dissatisfied', 'totally dissatisfied']
    };

    questions.forEach(q => {
        if (q.options) {
            q.options.forEach(option => {
                const label = (option.label || '').toLowerCase();
                Object.entries(commonTerms).forEach(([preferred, alternatives]) => {
                    if (alternatives.some(alt => label.includes(alt))) {
                        terminologyIssues.push({
                            questionId: q.id,
                            preferred: preferred,
                            found: option.label
                        });
                    }
                });
            });
        }
    });

    if (terminologyIssues.length > 0) {
        issues.push({
            severity: SEVERITY.INFO,
            type: 'brand_compliance',
            message: `Consider using consistent terminology across questions for better brand alignment.`
        });
    }

    // Check for professional language
    questions.forEach(q => {
        const text = (q.text || '').toLowerCase();
        const unprofessionalWords = ['awesome', 'cool', 'great', 'amazing'];
        const foundWords = unprofessionalWords.filter(word => text.includes(word));

        if (foundWords.length > 0) {
            issues.push({
                severity: SEVERITY.INFO,
                questionId: q.id,
                type: 'brand_compliance',
                message: `Consider more formal language: found "${foundWords.join(', ')}" which may not align with professional tone.`
            });
        }
    });

    return issues;
}