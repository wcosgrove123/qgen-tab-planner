/**
 * Table Validation Functions
 *
 * Validation logic for table questions, including force_per_column,
 * sum_equals_qid, and other table-specific validation rules.
 */

/**
 * Validates a table question based on its validation configuration
 * @param {Object} question - The question object
 * @param {Object} responses - Mock or actual responses for validation
 * @param {Function} findQuestionById - Function to find question by ID
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validateTableQuestion(question, responses = {}, findQuestionById = null) {
    const result = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (!question || question.mode !== 'table') {
        return result;
    }

    // Basic structure validation
    const structureValidation = validateTableStructure(question);
    if (!structureValidation.isValid) {
        result.isValid = false;
        result.errors.push(...structureValidation.errors);
    }

    // Validation rule-specific checks
    if (question.validation?.type) {
        const ruleValidation = validateTableRules(question, responses, findQuestionById);
        if (!ruleValidation.isValid) {
            result.isValid = false;
            result.errors.push(...ruleValidation.errors);
        }
        result.warnings.push(...ruleValidation.warnings);
    }

    // Dynamic column source validation
    if (question.grid?.columnSource?.qid) {
        const dynamicValidation = validateDynamicColumns(question, findQuestionById);
        if (!dynamicValidation.isValid) {
            result.isValid = false;
            result.errors.push(...dynamicValidation.errors);
        }
        result.warnings.push(...dynamicValidation.warnings);
    }

    return result;
}

/**
 * Validates basic table structure (rows, columns, type)
 * @param {Object} question - The question object
 * @returns {Object} Validation result
 */
export function validateTableStructure(question) {
    const result = {
        isValid: true,
        errors: [],
        warnings: []
    };

    // Check for grid existence
    if (!question.grid) {
        result.isValid = false;
        result.errors.push('Table question missing grid configuration');
        return result;
    }

    // Check for rows
    if (!Array.isArray(question.grid.rows) || question.grid.rows.length === 0) {
        result.isValid = false;
        result.errors.push('Table must have at least one row (statement)');
    } else {
        // Check for empty rows
        const emptyRows = question.grid.rows.filter((row, index) => !row || row.trim() === '');
        if (emptyRows.length > 0) {
            result.warnings.push(`Table has ${emptyRows.length} empty row(s)`);
        }
    }

    // Check for columns (unless using dynamic source)
    if (!question.grid.columnSource?.qid) {
        if (!Array.isArray(question.grid.cols) || question.grid.cols.length === 0) {
            result.isValid = false;
            result.errors.push('Table must have at least one column or use dynamic column source');
        } else {
            // Check for empty columns
            const emptyCols = question.grid.cols.filter((col, index) => !col || col.trim() === '');
            if (emptyCols.length > 0) {
                result.warnings.push(`Table has ${emptyCols.length} empty column(s)`);
            }
        }
    }

    // Check table type
    if (!question.type || !['grid_single', 'grid_multi', 'ranking'].includes(question.type)) {
        result.warnings.push('Table type not set or invalid, defaulting to single-select');
    }

    return result;
}

/**
 * Validates table-specific validation rules
 * @param {Object} question - The question object
 * @param {Object} responses - Response data for validation
 * @param {Function} findQuestionById - Function to find question by ID
 * @returns {Object} Validation result
 */
export function validateTableRules(question, responses, findQuestionById) {
    const result = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const validationType = question.validation?.type;

    switch (validationType) {
        case 'force_per_column':
            return validateForcePerColumn(question, responses);

        case 'sum_equals_qid':
            return validateSumEquals(question, responses, findQuestionById);

        default:
            result.warnings.push(`Unknown validation type: ${validationType}`);
            break;
    }

    return result;
}

/**
 * Validates force_per_column rule (at least one answer in each column)
 * @param {Object} question - The question object
 * @param {Object} responses - Response data
 * @returns {Object} Validation result
 */
export function validateForcePerColumn(question, responses) {
    const result = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const cols = question.grid?.cols || [];
    const rows = question.grid?.rows || [];

    if (cols.length === 0 || rows.length === 0) {
        result.isValid = false;
        result.errors.push('Cannot validate force_per_column: table has no rows or columns');
        return result;
    }

    // Check each column for at least one response
    const missingCols = [];

    cols.forEach((col, colIndex) => {
        const hasResponse = rows.some(row => {
            const responseKey = `${question.id}_${row}_${colIndex}`;
            return responses[responseKey];
        });

        if (!hasResponse) {
            missingCols.push(col || `Column ${colIndex + 1}`);
        }
    });

    if (missingCols.length > 0) {
        result.isValid = false;
        result.errors.push(`Missing responses in columns: ${missingCols.join(', ')}`);
    }

    return result;
}

/**
 * Validates sum_equals_qid rule (sum of responses equals target question value)
 * @param {Object} question - The question object
 * @param {Object} responses - Response data
 * @param {Function} findQuestionById - Function to find question by ID
 * @returns {Object} Validation result
 */
export function validateSumEquals(question, responses, findQuestionById) {
    const result = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const targetQid = question.validation?.target;

    if (!targetQid) {
        result.isValid = false;
        result.errors.push('sum_equals_qid validation requires a target question ID');
        return result;
    }

    if (!findQuestionById) {
        result.warnings.push('Cannot validate sum_equals_qid: question lookup function not available');
        return result;
    }

    const targetQuestion = findQuestionById(targetQid);
    if (!targetQuestion) {
        result.isValid = false;
        result.errors.push(`Target question "${targetQid}" not found`);
        return result;
    }

    // Check if target question is numeric
    const isNumeric = targetQuestion.type && targetQuestion.type.startsWith('numeric');
    if (!isNumeric) {
        result.warnings.push(`Target question "${targetQid}" is not numeric, validation may not work as expected`);
    }

    // Get target value from responses
    const targetValue = responses[targetQid];
    if (targetValue === undefined || targetValue === null) {
        result.warnings.push(`No response found for target question "${targetQid}"`);
        return result;
    }

    // Calculate sum of table responses
    const rows = question.grid?.rows || [];
    const cols = question.grid?.cols || [];
    let totalSum = 0;

    rows.forEach(row => {
        cols.forEach((col, colIndex) => {
            const responseKey = `${question.id}_${row}_${colIndex}`;
            const value = parseFloat(responses[responseKey]) || 0;
            totalSum += value;
        });
    });

    const targetNum = parseFloat(targetValue) || 0;
    if (Math.abs(totalSum - targetNum) > 0.01) { // Allow for floating point precision
        result.isValid = false;
        result.errors.push(`Table sum (${totalSum}) does not equal target value (${targetNum})`);
    }

    return result;
}

/**
 * Validates dynamic column configuration
 * @param {Object} question - The question object
 * @param {Function} findQuestionById - Function to find question by ID
 * @returns {Object} Validation result
 */
export function validateDynamicColumns(question, findQuestionById) {
    const result = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const columnSource = question.grid?.columnSource;
    if (!columnSource) {
        return result;
    }

    if (!columnSource.qid) {
        result.isValid = false;
        result.errors.push('Dynamic column source requires a source question ID');
        return result;
    }

    if (!findQuestionById) {
        result.warnings.push('Cannot validate dynamic columns: question lookup function not available');
        return result;
    }

    const sourceQuestion = findQuestionById(columnSource.qid);
    if (!sourceQuestion) {
        result.isValid = false;
        result.errors.push(`Source question "${columnSource.qid}" not found`);
        return result;
    }

    // Check if source question has selectable options
    const hasOptions = Array.isArray(sourceQuestion.options) && sourceQuestion.options.length > 0;
    const hasGridCols = Array.isArray(sourceQuestion.grid?.cols) && sourceQuestion.grid.cols.length > 0;
    const hasScaleLabels = Array.isArray(sourceQuestion.scale?.labels) && sourceQuestion.scale.labels.length > 0;

    if (!hasOptions && !hasGridCols && !hasScaleLabels) {
        result.isValid = false;
        result.errors.push(`Source question "${columnSource.qid}" has no selectable options`);
    }

    // Validate exclude list format
    if (columnSource.exclude) {
        const excludeList = String(columnSource.exclude).split(',').map(s => s.trim()).filter(Boolean);
        if (excludeList.length > 0) {
            result.warnings.push(`Excluding ${excludeList.length} option(s) from source question`);
        }
    }

    return result;
}

/**
 * Gets validation summary for display in UI
 * @param {Object} question - The question object
 * @param {Object} responses - Response data (optional)
 * @param {Function} findQuestionById - Function to find question by ID (optional)
 * @returns {Object} Summary object with counts and messages
 */
export function getTableValidationSummary(question, responses = {}, findQuestionById = null) {
    const validation = validateTableQuestion(question, responses, findQuestionById);

    return {
        isValid: validation.isValid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.isValid
            ? 'Table configuration is valid'
            : `${validation.errors.length} error(s) found`
    };
}