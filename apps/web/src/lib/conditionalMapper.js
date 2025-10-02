/**
 * conditionalMapper.js
 *
 * SIMPLIFIED MAPPING FOR COMPLEX RELATIONSHIPS
 * One function to rule them all - automatically maps any question type to any other question type
 * with the most appropriate conditional logic operators and value handlers.
 */

/**
 * Universal question type mapping - handles ANY to ANY relationship
 * @param {Object} sourceQuestion - The source question object
 * @param {Object} targetQuestion - The target question object
 * @param {string} operator - The operator being used
 * @param {any} value - The value(s) to compare
 * @returns {Object} - Simplified relationship mapping
 */
export function mapRelationship(sourceQuestion, targetQuestion, operator, value) {
  const sourceType = getUnifiedType(sourceQuestion);
  const targetType = getUnifiedType(targetQuestion);

  return {
    source: sourceType,
    target: targetType,
    operators: getValidOperators(sourceType),
    valueType: getValueType(sourceType),
    evaluator: getEvaluator(sourceType, operator),
    complexity: getComplexityLevel(sourceType, targetType)
  };
}

/**
 * Unified type system - reduces all question types to core data types
 */
function getUnifiedType(question) {
  const type = question?.type || question?.mode || 'unknown';

  // Reduce complexity to 4 core types
  const typeMap = {
    // CHOICE types (single/multi selection)
    'single': 'choice',
    'multi': 'choice',
    'scale': 'choice',
    'grid_single': 'choice',
    'grid_multi': 'choice',
    'ranking': 'choice',
    'repeated': 'choice',

    // NUMBER types
    'numeric': 'number',
    'slider': 'number',

    // TEXT types
    'text': 'text',
    'textarea': 'text',
    'open': 'text',

    // COMPLEX types (everything else)
    'table': 'complex',
    'matrix': 'complex',
    'drag_drop': 'complex'
  };

  return typeMap[type] || 'complex';
}

/**
 * Get valid operators for any unified type
 */
function getValidOperators(unifiedType) {
  const operatorSets = {
    choice: ['==', '!=', 'in', 'not_in', 'is_empty', 'is_not_empty'],
    number: ['==', '!=', '>', '>=', '<', '<=', 'between', 'is_empty', 'is_not_empty'],
    text: ['==', '!=', 'contains', 'not_contains', 'is_empty', 'is_not_empty'],
    complex: ['is_empty', 'is_not_empty'] // Minimal for unsupported
  };

  return operatorSets[unifiedType] || operatorSets.complex;
}

/**
 * Get the value input type needed
 */
function getValueType(unifiedType) {
  return {
    choice: 'options',    // Show checkboxes/dropdowns of available options
    number: 'numeric',    // Show number inputs
    text: 'text',        // Show text inputs
    complex: 'none'      // No value input needed
  }[unifiedType];
}

/**
 * Get the evaluation function for this type/operator combo
 */
function getEvaluator(unifiedType, operator) {
  return (sourceValue, compareValue) => {
    // Handle empty checks first
    if (operator === 'is_empty') return !sourceValue || sourceValue === '';
    if (operator === 'is_not_empty') return sourceValue && sourceValue !== '';

    // Type-specific evaluation
    switch (unifiedType) {
      case 'choice':
        return evaluateChoice(sourceValue, compareValue, operator);
      case 'number':
        return evaluateNumber(sourceValue, compareValue, operator);
      case 'text':
        return evaluateText(sourceValue, compareValue, operator);
      default:
        return false;
    }
  };
}

/**
 * Choice evaluation (handles single/multi/scale/grid/etc.)
 */
function evaluateChoice(sourceValue, compareValue, operator) {
  const sourceArray = Array.isArray(sourceValue) ? sourceValue : [sourceValue];
  const compareArray = Array.isArray(compareValue) ? compareValue : [compareValue];

  switch (operator) {
    case '==': return sourceArray.some(v => compareArray.includes(String(v)));
    case '!=': return !sourceArray.some(v => compareArray.includes(String(v)));
    case 'in': return sourceArray.some(v => compareArray.includes(String(v)));
    case 'not_in': return !sourceArray.some(v => compareArray.includes(String(v)));
    default: return false;
  }
}

/**
 * Number evaluation (handles numeric/slider/etc.)
 */
function evaluateNumber(sourceValue, compareValue, operator) {
  const num = parseFloat(sourceValue);
  const compare = Array.isArray(compareValue) ? parseFloat(compareValue[0]) : parseFloat(compareValue);

  switch (operator) {
    case '==': return num === compare;
    case '!=': return num !== compare;
    case '>': return num > compare;
    case '>=': return num >= compare;
    case '<': return num < compare;
    case '<=': return num <= compare;
    case 'between':
      const min = parseFloat(compareValue[0] || compareValue.min);
      const max = parseFloat(compareValue[1] || compareValue.max);
      return num >= min && num <= max;
    default: return false;
  }
}

/**
 * Text evaluation (handles text/textarea/open/etc.)
 */
function evaluateText(sourceValue, compareValue, operator) {
  const source = String(sourceValue || '').toLowerCase();
  const compare = String(compareValue || '').toLowerCase();

  switch (operator) {
    case '==': return source === compare;
    case '!=': return source !== compare;
    case 'contains': return source.includes(compare);
    case 'not_contains': return !source.includes(compare);
    default: return false;
  }
}

/**
 * Get complexity level for relationship
 */
function getComplexityLevel(sourceType, targetType) {
  const complexity = {
    'choice-choice': 'simple',
    'choice-number': 'simple',
    'choice-text': 'simple',
    'number-choice': 'simple',
    'number-number': 'simple',
    'number-text': 'medium',
    'text-choice': 'medium',
    'text-number': 'medium',
    'text-text': 'simple'
  };

  const key = `${sourceType}-${targetType}`;
  return complexity[key] || 'complex';
}

/**
 * AUTO-CONFIGURATION
 * Automatically configure conditional logic for any question relationship
 */
export function autoConfigureConditional(sourceQuestion, targetQuestion) {
  const mapping = mapRelationship(sourceQuestion, targetQuestion);

  return {
    // Recommended operator for this relationship
    recommendedOperator: mapping.operators[0],

    // UI configuration
    ui: {
      showOperators: mapping.operators,
      valueInputType: mapping.valueType,
      complexity: mapping.complexity,
      helpText: getHelpText(mapping)
    },

    // Ready-to-use evaluator
    evaluate: mapping.evaluator
  };
}

/**
 * Generate helpful text for users
 */
function getHelpText(mapping) {
  const helpTexts = {
    'choice-choice': 'Compare selected options between questions',
    'choice-number': 'Show based on what was selected',
    'number-number': 'Compare numeric values',
    'text-text': 'Compare text responses',
    'complex': 'Advanced relationship - simplified to basic checks'
  };

  const key = `${mapping.source}-${mapping.target}`;
  return helpTexts[key] || 'Automatic relationship detection';
}

/**
 * UNIVERSAL QUESTION VALUE EXTRACTOR
 * Extracts the current value from any question type for evaluation
 */
export function extractQuestionValue(question, response) {
  const type = getUnifiedType(question);

  switch (type) {
    case 'choice':
      // Handle all choice-based questions uniformly
      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object') {
        // Handle grid responses: {row1: 'col1', row2: 'col2'} -> ['col1', 'col2']
        return Object.values(response);
      }
      return response ? [response] : [];

    case 'number':
      return parseFloat(response) || 0;

    case 'text':
      return String(response || '');

    default:
      return response;
  }
}

/**
 * ONE-LINER EVALUATION
 * Evaluate any conditional relationship in one function call
 */
export function evaluateRelationship(sourceQuestion, sourceResponse, operator, compareValue) {
  const mapping = mapRelationship(sourceQuestion, null, operator);
  const extractedValue = extractQuestionValue(sourceQuestion, sourceResponse);
  return mapping.evaluator(extractedValue, compareValue);
}