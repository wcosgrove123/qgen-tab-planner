/**
 * wordExportTemplates.js
 *
 * Standardized templates and wording for Word document exports
 * Clear, explicit language that conveys the intent without exact matching
 */

// --- STANDARDIZED INSTRUCTION TEMPLATES ---

export const INSTRUCTION_TEMPLATES = {
    // Single/Multi select instructions
    SINGLE_SELECT: 'SELECT ONE',
    MULTI_SELECT: 'SELECT ALL THAT APPLY',
    SINGLE_SELECT_DROPDOWN: 'SELECT ONE FROM DROPDOWN',

    // Numeric input instructions
    NUMERIC_INPUT: 'ENTER NUMBER',
    NUMERIC_DROPDOWN: 'SELECT NUMBER FROM DROPDOWN',
    NUMERIC_RANGE: (min, max) => `ENTER NUMBER (${min} TO ${max})`,
    NUMERIC_AGE: 'ENTER AGE IN YEARS',
    NUMERIC_PERCENTAGE: 'ENTER PERCENTAGE (0-100)',

    // Text input instructions
    TEXT_BOX_OPEN: 'ENTER TEXT',
    TEXT_BOX_LIMITED: (limit) => `ENTER TEXT (MAXIMUM ${limit} CHARACTERS)`,
    TEXT_AREA_LARGE: 'ENTER DETAILED RESPONSE',

    // Scale instructions
    LIKERT_SCALE: (points) => `RATE ON ${points}-POINT SCALE`,
    AGREEMENT_SCALE: 'RATE AGREEMENT LEVEL',
    SATISFACTION_SCALE: 'RATE SATISFACTION LEVEL',
    FREQUENCY_SCALE: 'RATE FREQUENCY',
    IMPORTANCE_SCALE: 'RATE IMPORTANCE',

    // Table/Grid instructions
    TABLE_SINGLE: 'SELECT ONE ANSWER FOR EACH ROW',
    TABLE_MULTI: 'SELECT ALL THAT APPLY FOR EACH ROW',
    RANKING_TABLE: 'RANK ITEMS IN ORDER OF PREFERENCE',
    MATRIX_GRID: 'COMPLETE THE GRID',

    // Special conditions
    RANDOMIZE: 'RANDOMIZE ORDER OF OPTIONS',
    RANDOMIZE_EXCEPT_LAST: 'RANDOMIZE ORDER (EXCEPT LAST OPTION)',
    TERMINATE_IF: (codes) => `TERMINATE INTERVIEW IF ${codes}`,
    EXCLUSIVE_OPTION: (code) => `OPTION ${code} IS EXCLUSIVE`,
    ANCHOR_BOTTOM: (code) => `ANCHOR OPTION ${code} TO BOTTOM`,
    ANCHOR_TOP: (code) => `ANCHOR OPTION ${code} TO TOP`,

    // Conditional logic
    SHOW_IF: 'SHOW THIS QUESTION ONLY IF',
    HIDE_IF: 'HIDE THIS QUESTION IF',
    SKIP_IF: 'SKIP THIS QUESTION IF'
};

// --- QUESTION TYPE PROCESSORS ---

/**
 * Processes different question types with standardized templates
 */
export const QUESTION_TYPE_PROCESSORS = {

    // List questions (single/multi select)
    list: (question) => {
        const instructions = [];
        const specialNotes = [];

        // Basic instruction
        if (question.question_type === 'multi') {
            instructions.push(INSTRUCTION_TEMPLATES.MULTI_SELECT);
        } else {
            instructions.push(INSTRUCTION_TEMPLATES.SINGLE_SELECT);
        }

        // Randomization
        const randomization = question.randomization || {};
        if (randomization.randomize_options) {
            if (randomization.anchor_last) {
                specialNotes.push(INSTRUCTION_TEMPLATES.RANDOMIZE_EXCEPT_LAST);
            } else {
                specialNotes.push(INSTRUCTION_TEMPLATES.RANDOMIZE);
            }
        }

        return { instructions, specialNotes };
    },

    // Numeric questions
    numeric: (question) => {
        const instructions = [];
        const numConfig = question.numeric_enhanced_config || question.numeric_config || {};

        // Input type
        if (numConfig.input_type === 'dropdown') {
            instructions.push(INSTRUCTION_TEMPLATES.NUMERIC_DROPDOWN);
        } else {
            // Specific numeric types
            if (numConfig.type === 'age') {
                instructions.push(INSTRUCTION_TEMPLATES.NUMERIC_AGE);
            } else if (numConfig.type === 'percentage') {
                instructions.push(INSTRUCTION_TEMPLATES.NUMERIC_PERCENTAGE);
            } else if (numConfig.min != null || numConfig.max != null) {
                instructions.push(INSTRUCTION_TEMPLATES.NUMERIC_RANGE(
                    numConfig.min ?? 'NO MINIMUM',
                    numConfig.max ?? 'NO MAXIMUM'
                ));
            } else {
                instructions.push(INSTRUCTION_TEMPLATES.NUMERIC_INPUT);
            }
        }

        return { instructions, specialNotes: [] };
    },

    // Open text questions
    open: (question) => {
        const instructions = [];
        const openConfig = question.open_config || {};

        if (openConfig.max && openConfig.limit_kind === 'characters') {
            instructions.push(INSTRUCTION_TEMPLATES.TEXT_BOX_LIMITED(openConfig.max));
        } else if (openConfig.max && openConfig.max > 500) {
            instructions.push(INSTRUCTION_TEMPLATES.TEXT_AREA_LARGE);
        } else {
            instructions.push(INSTRUCTION_TEMPLATES.TEXT_BOX_OPEN);
        }

        return { instructions, specialNotes: [] };
    },

    // Table/Grid questions
    table: (question) => {
        const instructions = [];
        const gridConfig = question.grid_config || {};

        // Determine table type
        if (question.question_type === 'ranking') {
            instructions.push(INSTRUCTION_TEMPLATES.RANKING_TABLE);
        } else if (question.question_type === 'multi') {
            instructions.push(INSTRUCTION_TEMPLATES.TABLE_MULTI);
        } else {
            instructions.push(INSTRUCTION_TEMPLATES.TABLE_SINGLE);
        }

        // Add validation requirements
        const validation = question.validation || {};
        if (validation.force_per_column) {
            instructions.push('ANSWER REQUIRED FOR EACH COLUMN');
        }
        if (validation.force_per_row) {
            instructions.push('ANSWER REQUIRED FOR EACH ROW');
        }

        return { instructions, specialNotes: [] };
    },

    // Scale questions
    scale: (question) => {
        const instructions = [];
        const scaleConfig = question.scale_config || {};

        const points = scaleConfig.points || 5;

        // Specific scale types
        if (scaleConfig.scale_type === 'agreement') {
            instructions.push(INSTRUCTION_TEMPLATES.AGREEMENT_SCALE);
        } else if (scaleConfig.scale_type === 'satisfaction') {
            instructions.push(INSTRUCTION_TEMPLATES.SATISFACTION_SCALE);
        } else if (scaleConfig.scale_type === 'frequency') {
            instructions.push(INSTRUCTION_TEMPLATES.FREQUENCY_SCALE);
        } else if (scaleConfig.scale_type === 'importance') {
            instructions.push(INSTRUCTION_TEMPLATES.IMPORTANCE_SCALE);
        } else {
            instructions.push(INSTRUCTION_TEMPLATES.LIKERT_SCALE(points));
        }

        return { instructions, specialNotes: [] };
    }
};

// --- OPTION FORMATTING ---

/**
 * Formats response options with proper numbering and special notations
 */
export function formatResponseOptions(question) {
    const options = getQuestionOptions(question);
    const formattedOptions = [];
    const specialInstructions = [];

    options.forEach((option, index) => {
        let optionNumber = index + 1;
        let optionText = option.option_label || option.label || option.text || '';
        let specialMarkers = [];

        // Handle custom codes
        if (option.option_code && option.option_code !== String(optionNumber)) {
            optionNumber = option.option_code;
        }

        // Special option types
        if (option.is_terminate) {
            specialMarkers.push('<red>TERMINATE</red>');
            specialInstructions.push(INSTRUCTION_TEMPLATES.TERMINATE_IF(optionNumber));
        }

        if (option.is_exclusive) {
            specialMarkers.push('<red>EXCLUSIVE</red>');
            specialInstructions.push(INSTRUCTION_TEMPLATES.EXCLUSIVE_OPTION(optionNumber));
        }

        // Anchoring
        if (option.anchor_position === 'bottom') {
            specialInstructions.push(INSTRUCTION_TEMPLATES.ANCHOR_BOTTOM(optionNumber));
        } else if (option.anchor_position === 'top') {
            specialInstructions.push(INSTRUCTION_TEMPLATES.ANCHOR_TOP(optionNumber));
        }

        // Format final option text
        const finalText = `${optionNumber}. ${optionText}${specialMarkers.length > 0 ? ' ' + specialMarkers.join(' ') : ''}`;
        formattedOptions.push(finalText);
    });

    return { options: formattedOptions, specialInstructions };
}

// --- CONDITIONAL LOGIC FORMATTING ---

/**
 * Formats conditional logic with clear language
 */
export function formatConditionalLogic(question, allQuestions) {
    const conditions = question.conditions;

    if (!conditions || conditions.mode === 'none' || !conditions.rules || conditions.rules.length === 0) {
        return null;
    }

    const ruleDescriptions = conditions.rules.map(rule => {
        const sourceId = rule.source_qid;

        // Different operators
        switch (rule.operator) {
            case 'is_empty':
                return `${sourceId} WAS NOT ANSWERED`;
            case 'is_not_empty':
                return `${sourceId} WAS ANSWERED`;
            case 'between':
                return `${sourceId} IS BETWEEN ${rule.values?.[0] || ''} AND ${rule.value2 || ''}`;
            case '==':
            case 'equals':
                const values = Array.isArray(rule.values) ? rule.values : [rule.values];
                return `${sourceId} = ${values.filter(Boolean).join(' OR ')}`;
            case '!=':
            case 'not_equals':
                const notValues = Array.isArray(rule.values) ? rule.values : [rule.values];
                return `${sourceId} ≠ ${notValues.filter(Boolean).join(' AND ')}`;
            case '>':
                return `${sourceId} > ${rule.values?.[0] || ''}`;
            case '<':
                return `${sourceId} < ${rule.values?.[0] || ''}`;
            case '>=':
                return `${sourceId} ≥ ${rule.values?.[0] || ''}`;
            case '<=':
                return `${sourceId} ≤ ${rule.values?.[0] || ''}`;
            case 'in':
                const inValues = Array.isArray(rule.values) ? rule.values : [rule.values];
                return `${sourceId} = ${inValues.filter(Boolean).join(' OR ')}`;
            default:
                return `${sourceId} ${rule.operator} ${rule.values || ''}`;
        }
    });

    // Build final condition statement
    const modeText = conditions.mode === 'show_if' ? INSTRUCTION_TEMPLATES.SHOW_IF : INSTRUCTION_TEMPLATES.HIDE_IF;
    const logicConnector = conditions.logic === 'OR' ? ' OR ' : ' AND ';

    return `${modeText}: ${ruleDescriptions.join(logicConnector)}`;
}

// --- TABLE STRUCTURE FORMATTING ---

/**
 * Formats table/grid structure with clear layout
 */
export function formatTableStructure(question) {
    const gridConfig = question.grid_config || {};
    const content = [];

    // Dynamic source information first
    if (gridConfig.columnSource?.qid) {
        content.push(`<blue>COLUMNS SOURCED FROM: ${gridConfig.columnSource.qid}</blue>`);
        if (gridConfig.columnSource.exclude) {
            content.push(`<blue>EXCLUDE OPTIONS: ${gridConfig.columnSource.exclude}</blue>`);
        }
        content.push('');
    }

    // Static rows (statements)
    if (gridConfig.rows && gridConfig.rows.length > 0) {
        content.push('<blue>STATEMENTS/ROWS:</blue>');
        gridConfig.rows.forEach((row, index) => {
            content.push(`  ${String.fromCharCode(65 + index)}. ${row}`); // A, B, C, etc.
        });
        content.push('');
    }

    // Static columns (if no dynamic source)
    if (!gridConfig.columnSource?.qid && gridConfig.cols && gridConfig.cols.length > 0) {
        content.push('<blue>RESPONSE OPTIONS/COLUMNS:</blue>');
        gridConfig.cols.forEach((col, index) => {
            content.push(`  ${index + 1}. ${col}`);
        });
    }

    // Validation requirements
    const validation = question.validation || {};
    if (validation.force_per_column || validation.force_per_row) {
        content.push('');
        if (validation.force_per_column) {
            content.push('<red>REQUIRE ANSWER FOR EACH COLUMN</red>');
        }
        if (validation.force_per_row) {
            content.push('<red>REQUIRE ANSWER FOR EACH ROW</red>');
        }
    }

    return content;
}

// --- UTILITY FUNCTION ---

function getQuestionOptions(question) {
    if (question.options && Array.isArray(question.options)) {
        return question.options;
    }
    if (question.question_options && Array.isArray(question.question_options)) {
        return question.question_options;
    }
    if (question.list_config && question.list_config.options) {
        return question.list_config.options;
    }
    return [];
}