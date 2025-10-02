/**
 * Logic Expander Module
 * Converts conditional logic (Q1=1,2) to human-readable text (Age is 18-24 or 25-34)
 */

// Main expansion function
export function expandBaseLogic(question) {
    const rawLogic = getRawBaseLogic(question);
    if (!rawLogic) return null;

    try {
        return parseAndExpandLogic(rawLogic);
    } catch (error) {
        console.warn('Error expanding logic:', rawLogic, error);
        return null;
    }
}

// Extract raw conditional logic from question
function getRawBaseLogic(question) {
    // Check various possible sources for conditional logic

    // 1. From conditional logic panel (most likely source)
    const conditions = question.conditions;
    if (conditions && conditions.mode !== 'none') {
        return extractConditionsLogic(conditions);
    }

    // 2. From base definition if explicitly set
    if (question.base?.definition) {
        return question.base.definition;
    }

    // 3. From hide-if logic (legacy format)
    if (question.hideIf) {
        return question.hideIf;
    }

    return null;
}

// Extract logic from conditions object
function extractConditionsLogic(conditions) {
    const parts = [];

    // Handle show_if/hide_if modes
    if (conditions.mode === 'show_if' && conditions.logic) {
        parts.push(formatLogicExpression(conditions.logic));
    } else if (conditions.mode === 'hide_if' && conditions.logic) {
        parts.push(`NOT (${formatLogicExpression(conditions.logic)})`);
    }

    return parts.join(' AND ');
}

// Format a logic expression object into string
function formatLogicExpression(logic) {
    if (!logic) return '';

    const parts = [];

    // Handle AND conditions
    if (logic.all && logic.all.length > 0) {
        const andParts = logic.all.map(condition => formatSingleCondition(condition));
        parts.push(andParts.join(' AND '));
    }

    // Handle OR conditions
    if (logic.any && logic.any.length > 0) {
        const orParts = logic.any.map(condition => formatSingleCondition(condition));
        parts.push(`(${orParts.join(' OR ')})`);
    }

    return parts.join(' AND ');
}

// Format a single condition (Q1=1,2)
function formatSingleCondition(condition) {
    const qid = condition.qid;
    const operator = condition.operator || '=';
    const values = condition.codes || condition.values || [condition.value];

    if (values && values.length > 1) {
        return `${qid}=${values.join(',')}`;
    } else if (values && values.length === 1) {
        return `${qid}${operator}${values[0]}`;
    }

    return `${qid}${operator}${condition.value || ''}`;
}

// Parse and expand logic string to human readable
function parseAndExpandLogic(logicString) {
    if (!logicString) return null;

    try {
        // Split by AND/OR operators while preserving them
        const parts = tokenizeLogic(logicString);
        const expandedParts = parts.map(part => expandLogicPart(part));

        return expandedParts.join(' ').replace(/\s+/g, ' ').trim();
    } catch (error) {
        console.warn('Error parsing logic:', logicString, error);
        return logicString; // Return original if parsing fails
    }
}

// Tokenize logic string into parts
function tokenizeLogic(logicString) {
    // Simple tokenizer - can be enhanced for complex expressions
    return logicString
        .replace(/\s+AND\s+/g, ' AND ')
        .replace(/\s+OR\s+/g, ' OR ')
        .replace(/\s+NOT\s+/g, ' NOT ')
        .split(/\s+(AND|OR|NOT)\s+/)
        .filter(part => part.trim());
}

// Expand a single logic part (Q1=1,2 → Age is 18-24 or 25-34)
function expandLogicPart(part) {
    const trimmed = part.trim();

    // Pass through logical operators
    if (['AND', 'OR', 'NOT'].includes(trimmed.toUpperCase())) {
        return trimmed.toLowerCase();
    }

    // Handle parentheses groups
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        const inner = trimmed.slice(1, -1);
        return `(${parseAndExpandLogic(inner)})`;
    }

    // Parse condition: Q1=1,2 or S3≠5, etc.
    const conditionMatch = trimmed.match(/^([A-Z]\d+[A-Z]?)([=≠<>≤≥]+)(.+)$/i);
    if (conditionMatch) {
        const [, qid, operator, valueString] = conditionMatch;
        return expandCondition(qid, operator, valueString);
    }

    // If no match, return as-is
    return trimmed;
}

// Expand a single condition
function expandCondition(qid, operator, valueString) {
    const question = findQuestionById(qid);
    if (!question) {
        return `${qid}${operator}${valueString}`;
    }

    const questionText = question.text || qid;
    const values = valueString.split(',').map(v => v.trim());

    if (values.length === 1) {
        const optionLabel = getOptionLabel(question, values[0]);
        return formatSingleConditionExpansion(questionText, operator, optionLabel);
    } else {
        const optionLabels = values.map(v => getOptionLabel(question, v));
        return formatMultipleConditionExpansion(questionText, operator, optionLabels);
    }
}

// Format single condition expansion
function formatSingleConditionExpansion(questionText, operator, optionLabel) {
    const operatorText = getOperatorText(operator);
    return `${questionText} ${operatorText} ${optionLabel}`;
}

// Format multiple condition expansion
function formatMultipleConditionExpansion(questionText, operator, optionLabels) {
    if (operator === '=' || operator === '==') {
        if (optionLabels.length === 2) {
            return `${questionText} is ${optionLabels[0]} or ${optionLabels[1]}`;
        } else {
            const lastLabel = optionLabels.pop();
            return `${questionText} is ${optionLabels.join(', ')}, or ${lastLabel}`;
        }
    } else {
        const operatorText = getOperatorText(operator);
        return `${questionText} ${operatorText} ${optionLabels.join(', ')}`;
    }
}

// Get human-readable operator text
function getOperatorText(operator) {
    const operatorMap = {
        '=': 'is',
        '==': 'is',
        '≠': 'is not',
        '!=': 'is not',
        '>': 'is greater than',
        '<': 'is less than',
        '>=': 'is greater than or equal to',
        '≥': 'is greater than or equal to',
        '<=': 'is less than or equal to',
        '≤': 'is less than or equal to'
    };
    return operatorMap[operator] || operator;
}

// Get option label for a question and code
function getOptionLabel(question, code) {
    if (!question) return code;

    // Try different option sources
    const options = question.options ||
                   question.scale?.labels?.map((label, i) => ({ code: String(i + 1), label })) ||
                   (question.grid?.rows || []).map((row, i) => ({ code: String(i + 1), label: row })) ||
                   [];

    const option = options.find(opt => String(opt.code) === String(code));
    return option ? (option.label || option.text || code) : code;
}

// Find question by ID in current state
function findQuestionById(qid) {
    if (!window.state?.questions) return null;
    return window.state.questions.find(q =>
        (q.id || '').toUpperCase() === (qid || '').toUpperCase()
    );
}

// Export helper functions for testing
export {
    getRawBaseLogic,
    parseAndExpandLogic,
    expandCondition,
    getOperatorText
};