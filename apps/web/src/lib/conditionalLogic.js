/**
 * conditionalLogic.js
 *
 * Comprehensive conditional logic engine for Q-Gen questionnaire builder.
 * Handles show_if/hide_if conditions, multi-rule support, mathematical expressions,
 * and cross-question dependencies.
 */

// --- CONDITION OPERATORS ---
export const OPERATORS = {
  '==': 'equals',
  '!=': 'not equals',
  '>': 'greater than',
  '>=': 'greater than or equal',
  '<': 'less than',
  '<=': 'less than or equal',
  'in': 'contains any of',
  'not_in': 'does not contain any of',
  'contains': 'text contains',
  'not_contains': 'text does not contain',
  'is_empty': 'is empty',
  'is_not_empty': 'is not empty',
  'between': 'is between'
};

export const LOGICAL_OPERATORS = {
  'AND': 'All conditions must be true',
  'OR': 'Any condition can be true'
};

// --- CONDITION EVALUATION ENGINE ---

/**
 * Evaluates a single condition rule against current responses
 * @param {Object} rule - The condition rule to evaluate
 * @param {Object} responses - Current question responses (mock or real)
 * @param {Array} questions - Array of all questions for reference
 * @returns {boolean} - True if condition is met
 */
export function evaluateConditionRule(rule, responses, questions) {
  try {
    const { source_qid, operator, values, value2 } = rule;

    // Skip evaluation for incomplete rules (this is normal during editing)
    if (!source_qid || !operator || source_qid.trim() === '') {
      return true; // Default to showing question for incomplete rules
    }

    const sourceResponse = responses[source_qid];
    const sourceQuestion = questions.find(q => q.id === source_qid);

    // Handle empty/missing responses
    if (operator === 'is_empty') {
      return !sourceResponse || sourceResponse === '';
    }
    if (operator === 'is_not_empty') {
      return sourceResponse && sourceResponse !== '';
    }

    // If no response exists, most conditions fail (except is_empty)
    if (sourceResponse === undefined || sourceResponse === null || sourceResponse === '') {
      return false;
    }

    // Get the comparison values and filter out empty strings
    const targetValues = Array.isArray(values) ? values.filter(v => v !== null && v !== undefined && v !== '') : [values].filter(v => v !== null && v !== undefined && v !== '');

    // For operators that need values, return true if no valid values (incomplete rule)
    if (operator !== 'is_empty' && operator !== 'is_not_empty' && targetValues.length === 0) {
      return true; // Default to showing question for incomplete rules
    }

    switch (operator) {
      case '==':
        return targetValues.some(val => String(sourceResponse) === String(val));

      case '!=':
        return !targetValues.some(val => String(sourceResponse) === String(val));

      case '>':
        return parseFloat(sourceResponse) > parseFloat(targetValues[0]);

      case '>=':
        return parseFloat(sourceResponse) >= parseFloat(targetValues[0]);

      case '<':
        return parseFloat(sourceResponse) < parseFloat(targetValues[0]);

      case '<=':
        return parseFloat(sourceResponse) <= parseFloat(targetValues[0]);

      case 'in':
        // For multi-select questions, check if any selected values match
        if (Array.isArray(sourceResponse)) {
          return sourceResponse.some(resp => targetValues.includes(String(resp)));
        }
        return targetValues.includes(String(sourceResponse));

      case 'not_in':
        if (Array.isArray(sourceResponse)) {
          return !sourceResponse.some(resp => targetValues.includes(String(resp)));
        }
        return !targetValues.includes(String(sourceResponse));

      case 'contains':
        return targetValues.some(val => String(sourceResponse).toLowerCase().includes(String(val).toLowerCase()));

      case 'not_contains':
        return !targetValues.some(val => String(sourceResponse).toLowerCase().includes(String(val).toLowerCase()));

      case 'between':
        const numResponse = parseFloat(sourceResponse);
        const min = parseFloat(targetValues[0]);
        const max = parseFloat(value2 || targetValues[1]);
        return numResponse >= min && numResponse <= max;

      default:
        console.warn('Unknown operator:', operator);
        return false;
    }
  } catch (error) {
    console.error('Error evaluating condition rule:', error, rule);
    return false;
  }
}

/**
 * Evaluates a complete condition set with multiple rules and logical operators
 * @param {Object} conditions - The conditions object from a question
 * @param {Object} responses - Current question responses
 * @param {Array} questions - Array of all questions
 * @returns {boolean} - True if all conditions are met
 */
export function evaluateConditions(conditions, responses, questions) {
  try {
    if (!conditions || conditions.mode === 'none' || !conditions.rules || conditions.rules.length === 0) {
      return true; // No conditions means always show
    }

    const { rules, logic = 'AND' } = conditions;

    if (rules.length === 0) return true;
    if (rules.length === 1) {
      return evaluateConditionRule(rules[0], responses, questions);
    }

    // Evaluate all rules
    const results = rules.map(rule => evaluateConditionRule(rule, responses, questions));

    // Apply logical operator
    if (logic === 'OR') {
      return results.some(result => result === true);
    } else { // Default to AND
      return results.every(result => result === true);
    }
  } catch (error) {
    console.error('Error evaluating conditions:', error, conditions);
    return true; // Default to showing question if evaluation fails
  }
}

/**
 * Determines if a question should be visible based on its conditions
 * @param {Object} question - The question to check
 * @param {Object} responses - Current responses
 * @param {Array} questions - All questions array
 * @returns {boolean} - True if question should be visible
 */
export function shouldShowQuestion(question, responses, questions) {
  try {
    if (!question || !question.conditions || question.conditions.mode === 'none') {
      return true; // No conditions = always show
    }

    // Additional safety check for incomplete conditions
    if (!question.conditions.rules || !Array.isArray(question.conditions.rules) || question.conditions.rules.length === 0) {
      return true; // No rules = always show
    }

    // Check if any rules are complete (have source_qid)
    const hasCompleteRules = question.conditions.rules.some(rule => rule.source_qid && rule.source_qid.trim() !== '');
    if (!hasCompleteRules) {
      return true; // No complete rules = always show
    }

    const conditionResult = evaluateConditions(question.conditions, responses, questions);

    // Apply the condition mode
    switch (question.conditions.mode) {
      case 'show_if':
        return conditionResult;
      case 'hide_if':
        return !conditionResult;
      default:
        return true;
    }
  } catch (error) {
    console.error('Error checking question visibility:', error, question);
    return true; // Default to showing question
  }
}

// --- MATHEMATICAL EXPRESSION EVALUATION ---

/**
 * Safely evaluates mathematical expressions in conditions
 * @param {string} expression - Mathematical expression to evaluate
 * @param {Object} responses - Current responses for variable substitution
 * @returns {number|null} - Result of evaluation or null if invalid
 */
export function evaluateMathExpression(expression, responses) {
  try {
    if (!expression || typeof expression !== 'string') return null;

    // Replace question references with actual values
    let processedExpression = expression;

    // Replace {Q1}, {Q2}, etc. with actual response values
    processedExpression = processedExpression.replace(/\{([A-Z0-9_]+)\}/g, (match, qid) => {
      const value = responses[qid];
      return value !== undefined ? parseFloat(value) || 0 : 0;
    });

    // Basic safety check - only allow numbers, operators, parentheses
    if (!/^[0-9+\-*/(). ]+$/.test(processedExpression)) {
      console.warn('Invalid math expression:', processedExpression);
      return null;
    }

    // Evaluate using Function constructor (safer than eval)
    const result = new Function('return ' + processedExpression)();
    return isNaN(result) ? null : result;
  } catch (error) {
    console.error('Error evaluating math expression:', error, expression);
    return null;
  }
}

// --- CONDITION BUILDING HELPERS ---

/**
 * Creates a new empty condition rule
 * @returns {Object} - Empty condition rule structure
 */
export function createEmptyConditionRule() {
  return {
    source_qid: '',
    operator: '==',
    values: [''],
    value2: '' // For between operator
  };
}

/**
 * Creates a default conditions object for a question
 * @returns {Object} - Default conditions structure
 */
export function createDefaultConditions() {
  return {
    mode: 'none', // 'none', 'show_if', 'hide_if'
    logic: 'AND', // 'AND', 'OR'
    rules: []
  };
}

/**
 * Validates a condition rule for completeness and correctness
 * @param {Object} rule - The condition rule to validate
 * @param {Array} questions - Available questions for reference
 * @returns {Object} - Validation result with success flag and errors
 */
export function validateConditionRule(rule, questions) {
  const errors = [];

  if (!rule.source_qid) {
    errors.push('Source question is required');
  } else {
    const sourceQuestion = questions.find(q => q.id === rule.source_qid);
    if (!sourceQuestion) {
      errors.push('Source question not found');
    }
  }

  if (!rule.operator) {
    errors.push('Operator is required');
  } else if (!OPERATORS[rule.operator]) {
    errors.push('Invalid operator');
  }

  if (rule.operator === 'between') {
    if (!rule.values || !rule.values[0] || !rule.value2) {
      errors.push('Between operator requires two values');
    }
  } else if (rule.operator !== 'is_empty' && rule.operator !== 'is_not_empty') {
    if (!rule.values || rule.values.length === 0 || !rule.values[0]) {
      errors.push('Comparison value is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets available source questions for condition building
 * @param {number} currentQuestionIndex - Index of current question
 * @param {Array} questions - All questions
 * @returns {Array} - Array of questions that can be used as condition sources
 */
export function getAvailableSourceQuestions(currentQuestionIndex, questions) {
  return questions
    .slice(0, currentQuestionIndex) // Only prior questions
    .filter(q => q.id && q.id.trim()) // Must have an ID
    .map(q => ({
      id: q.id,
      text: q.question_text || q.text || 'Untitled Question',
      type: q.type || q.mode,
      options: getQuestionOptionsForConditions(q),
      supportLevel: getQuestionConditionalSupport(q)
    }));
}

/**
 * Determines the level of conditional logic support for a question type
 * @param {Object} question - The question to check
 * @returns {string} - 'full', 'partial', or 'coming_soon'
 */
export function getQuestionConditionalSupport(question) {
  const type = question.type || question.mode;

  // Fully supported question types
  if (['single', 'multi', 'scale', 'grid_single', 'grid_multi'].includes(type)) {
    return 'full';
  }

  // Partially supported (basic operators only)
  if (['numeric', 'text', 'textarea', 'open', 'repeated'].includes(type)) {
    return 'partial';
  }

  // Coming soon (complex question types)
  if (['ranking', 'table', 'matrix', 'drag_drop', 'slider'].includes(type)) {
    return 'coming_soon';
  }

  // Unknown types default to coming soon
  return 'coming_soon';
}

/**
 * Gets options/values available for a source question in conditions
 * @param {Object} question - The source question
 * @returns {Array} - Available options/values for this question
 */
function getQuestionOptionsForConditions(question) {
  if (!question) return [];

  const type = question.type || question.mode;

  // For questions with explicit options (single, multi)
  if (question.options && question.options.length > 0) {
    return question.options.map(opt => ({
      code: opt.code || opt.value,
      label: opt.label || opt.text
    }));
  }

  // For grid questions
  if (question.grid && question.grid.cols && question.grid.cols.length > 0) {
    return question.grid.cols.map((col, index) => ({
      code: String(index + 1),
      label: col
    }));
  }

  // For scale questions
  if (question.scale && question.scale.points) {
    const options = [];
    for (let i = 1; i <= question.scale.points; i++) {
      const label = question.scale.labels && question.scale.labels[i-1]
        ? question.scale.labels[i-1]
        : String(i);
      options.push({ code: String(i), label });
    }
    return options;
  }

  // For numeric questions
  if (type === 'numeric' || type === 'number') {
    return [
      { code: '0', label: '0' },
      { code: '1', label: '1' },
      { code: '5', label: '5' },
      { code: '10', label: '10' },
      { code: '100', label: '100' }
    ];
  }

  // For text questions
  if (type === 'text' || type === 'textarea' || type === 'open_end') {
    return [];
  }

  // For repeated options
  if (type === 'repeated' && question.repeated && question.repeated.columns) {
    return question.repeated.columns.map((col, index) => ({
      code: String(index + 1),
      label: col || `Column ${index + 1}`
    }));
  }

  return [];
}

/**
 * Gets available operators for a specific question type
 * @param {string} questionType - The type of the source question
 * @returns {Object} - Filtered operators object
 */
export function getOperatorsForQuestionType(questionType) {
  const baseOperators = {
    '==': 'equals',
    '!=': 'not equals',
    'is_empty': 'is empty',
    'is_not_empty': 'is not empty'
  };

  const numericOperators = {
    '>': 'greater than',
    '>=': 'greater than or equal',
    '<': 'less than',
    '<=': 'less than or equal',
    'between': 'is between'
  };

  const textOperators = {
    'contains': 'text contains',
    'not_contains': 'text does not contain'
  };

  const multiOperators = {
    'in': 'contains any of',
    'not_in': 'does not contain any of'
  };

  switch (questionType) {
    case 'single':
    case 'scale':
      return { ...baseOperators, ...multiOperators };

    case 'multi':
    case 'grid_multi':
      return { ...baseOperators, ...multiOperators };

    case 'numeric':
    case 'number':
      return { ...baseOperators, ...numericOperators };

    case 'text':
    case 'textarea':
    case 'open':
      return { ...baseOperators, ...textOperators };

    case 'grid_single':
    case 'ranking':
      return { ...baseOperators, ...multiOperators, ...numericOperators };

    case 'repeated':
      return { ...baseOperators, ...multiOperators };

    default:
      return baseOperators; // Minimal set for unsupported types
  }
}

// --- CONDITION PREVIEW HELPERS ---

/**
 * Generates a human-readable description of a condition rule
 * @param {Object} rule - The condition rule
 * @param {Array} questions - All questions for reference
 * @returns {string} - Human-readable condition description
 */
export function getConditionRuleDescription(rule, questions) {
  try {
    const sourceQuestion = questions.find(q => q.id === rule.source_qid);
    const questionText = sourceQuestion ?
      (sourceQuestion.question_text || sourceQuestion.text || rule.source_qid) :
      rule.source_qid;

    const operatorText = OPERATORS[rule.operator] || rule.operator;

    if (rule.operator === 'is_empty' || rule.operator === 'is_not_empty') {
      return `${questionText} ${operatorText}`;
    }

    if (rule.operator === 'between') {
      const val1 = rule.values && rule.values[0] ? rule.values[0] : '';
      const val2 = rule.value2 || '';
      return `${questionText} is between ${val1} and ${val2}`;
    }

    const values = Array.isArray(rule.values) ? rule.values : [rule.values];
    const filteredValues = values.filter(Boolean);

    // Convert option codes to full text labels if possible
    let valueTexts = filteredValues;
    if (sourceQuestion) {
      const sourceOptions = getQuestionOptionsForConditions(sourceQuestion);
      if (sourceOptions && sourceOptions.length > 0) {
        valueTexts = filteredValues.map(val => {
          const option = sourceOptions.find(opt => opt.code === val);
          return option ? option.label : val;
        });
      }
    }

    const valueText = valueTexts.join(', ');

    return `${questionText} ${operatorText} ${valueText}`;
  } catch (error) {
    console.error('Error generating condition description:', error);
    return 'Invalid condition';
  }
}

/**
 * Generates a complete description of all conditions for a question
 * @param {Object} conditions - The conditions object
 * @param {Array} questions - All questions for reference
 * @returns {string} - Complete conditions description
 */
export function getConditionsDescription(conditions, questions) {
  try {
    if (!conditions || conditions.mode === 'none' || !conditions.rules || conditions.rules.length === 0) {
      return 'No conditions set';
    }

    const modeText = conditions.mode === 'show_if' ? 'Show if' : 'Hide if';
    const logicText = conditions.logic === 'OR' ? 'OR' : 'AND';

    const ruleDescriptions = conditions.rules.map(rule =>
      getConditionRuleDescription(rule, questions)
    );

    if (ruleDescriptions.length === 1) {
      return `${modeText}: ${ruleDescriptions[0]}`;
    }

    return `${modeText}: ${ruleDescriptions.join(` ${logicText} `)}`;
  } catch (error) {
    console.error('Error generating conditions description:', error);
    return 'Invalid conditions';
  }
}