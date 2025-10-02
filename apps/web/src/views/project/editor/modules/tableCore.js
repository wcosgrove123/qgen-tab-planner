/**
 * Table Core Functions
 *
 * Core functionality for table question type management, migrated from legacy code
 * and adapted to work with the new modular architecture.
 */

/**
 * Synchronizes table grid data with question statements and scale
 * @param {Object} question - The question object with grid data
 */
export function syncTableFacets(question) {
    if (question.mode === 'table' && question.grid) {
        // Sync statements from grid rows
        question.statements = [...(question.grid.rows || [])];

        // Ensure scale object exists and sync from grid columns
        question.scale = question.scale || {};
        question.scale.labels = [...(question.grid.cols || [])];
        question.scale.points = question.grid.cols?.length || question.scale.points || null;
    }
}

/**
 * Analyzes a question object and returns its specific table variation name
 * @param {Object} question - The question object
 * @returns {string} The name of the table variation or an empty string
 */
export function getTableVariationName(question) {
    if (question.mode !== 'table') {
        return ''; // Not a table question
    }

    // Check for Dynamic Column Matrix first, as it's a primary feature
    if (question.grid?.columnSource?.qid) {
        return 'Dynamic Column Matrix';
    }

    const cols = question.grid?.cols || [];

    // Check for Applies/Does Not Apply pattern
    if (cols.length === 2 && /applies/i.test(cols[0]) && /not apply/i.test(cols[1])) {
        return 'Applies/Does Not Apply';
    }

    // Check for ranking table
    if (question.type === 'ranking') {
        return 'Ranking Table';
    }

    // Check for agreement scales
    if (cols.length >= 3) {
        const hasAgreement = cols.some(col =>
            /agree|disagree/i.test(col) ||
            /strongly|somewhat/i.test(col)
        );
        if (hasAgreement) {
            return 'Agreement Scale';
        }
    }

    // Check for satisfaction scales
    if (cols.length >= 3) {
        const hasSatisfaction = cols.some(col =>
            /satisfied|dissatisfied/i.test(col) ||
            /very|somewhat/i.test(col)
        );
        if (hasSatisfaction) {
            return 'Satisfaction Scale';
        }
    }

    // Check for frequency scales
    if (cols.length >= 3) {
        const hasFrequency = cols.some(col =>
            /always|never|sometimes|often|rarely/i.test(col)
        );
        if (hasFrequency) {
            return 'Frequency Scale';
        }
    }

    // Default based on selection type
    if (question.type === 'grid_multi') {
        return 'Multi-Select Table';
    }

    return 'Single-Select Table';
}

/**
 * Ensures a question has proper grid structure with defaults
 * @param {Object} question - The question object
 */
export function ensureTableGrid(question) {
    if (question.mode === 'table') {
        // Initialize grid if it doesn't exist
        if (!question.grid) {
            question.grid = {
                rows: question.statements || [],
                cols: question.scale?.labels || []
            };
        }

        // Ensure arrays exist
        if (!Array.isArray(question.grid.rows)) {
            question.grid.rows = [];
        }
        if (!Array.isArray(question.grid.cols)) {
            question.grid.cols = [];
        }

        // Set default table type if not specified
        if (!question.type || !['grid_single', 'grid_multi', 'ranking'].includes(question.type)) {
            question.type = 'grid_single';
        }
    }
}

/**
 * Harmonizes question type based on table mode and configuration
 * @param {Object} question - The question object
 */
export function harmonizeTableType(question) {
    if (question.mode === 'table') {
        ensureTableGrid(question);

        // Sync grid data back to legacy format for compatibility
        question.statements = [...question.grid.rows];
        question.scale = question.scale || {};
        question.scale.labels = [...question.grid.cols];
        question.scale.points = question.grid.cols.length || question.scale.points || null;

        // Set appropriate type based on current configuration
        if (question.type === 'grid_multi') {
            question.type = 'grid_multi';
        } else if (question.type === 'ranking') {
            question.type = 'ranking';
        } else {
            question.type = 'grid_single';
        }
    }
}

/**
 * Gets selectable options for a table question
 * @param {Object} question - The question object
 * @returns {Array} Array of {code, label} objects
 */
export function getTableOptions(question) {
    if (!question || question.mode !== 'table') {
        return [];
    }

    // Check for dynamic column source first
    if (question.grid?.columnSource?.qid) {
        // This would need to resolve the source question
        // For now, return empty array - will be handled by dynamic column logic
        return [];
    }

    // Use grid columns
    if (Array.isArray(question.grid?.cols) && question.grid.cols.length) {
        return question.grid.cols.map((label, index) => ({
            code: String(index + 1),
            label: String(label || '')
        }));
    }

    return [];
}

/**
 * Updates table variation name and syncs data
 * @param {Object} question - The question object
 */
export function updateTableVariation(question) {
    if (question.mode === 'table') {
        question.table_variation = getTableVariationName(question);
        syncTableFacets(question);
        harmonizeTableType(question);
    }
}

/**
 * Resolves preview columns for dynamic column sources
 * @param {Object} question - The question object
 * @param {Function} findQuestionById - Function to find question by ID
 * @returns {Array} Array of column labels for preview
 */
export function resolvePreviewColumns(question, findQuestionById) {
    if (!question || question.mode !== 'table') {
        return [];
    }

    // Handle dynamic column source
    if (question.grid?.columnSource?.qid) {
        const sourceQuestion = findQuestionById(question.grid.columnSource.qid);
        if (sourceQuestion) {
            const exclude = new Set(String(question.grid.columnSource.exclude || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean));

            // Get options from source question
            const sourceOptions = getQuestionOptions(sourceQuestion);
            return sourceOptions
                .filter(opt => !exclude.has(opt.code))
                .map(opt => opt.label);
        } else {
            return [`Error: QID "${question.grid?.columnSource?.qid}" not found.`];
        }
    }

    // Use static columns
    return Array.isArray(question.grid?.cols) ? question.grid.cols : [];
}

/**
 * Helper function to get question options (imported from legacy logic)
 * @param {Object} question - The question object
 * @returns {Array} Array of {code, label} objects
 */
function getQuestionOptions(question) {
    if (!question) return [];

    // Check for explicit options array
    if (Array.isArray(question.options) && question.options.length) {
        return question.options.map((option, index) => ({
            code: String(option.code ?? (index + 1)),
            label: String(option.label ?? '')
        }));
    }

    // Check for grid columns (table questions)
    if (Array.isArray(question.grid?.cols) && question.grid.cols.length) {
        return question.grid.cols.map((label, index) => ({
            code: String(index + 1),
            label: String(label ?? '')
        }));
    }

    // Check for scale labels (likert questions)
    if (Array.isArray(question.scale?.labels) && question.scale.labels.length) {
        return question.scale.labels.map((label, index) => ({
            code: String(index + 1),
            label: String(label ?? '')
        }));
    }

    return [];
}