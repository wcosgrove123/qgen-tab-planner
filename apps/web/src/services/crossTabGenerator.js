/**
 * Cross-Tabulation Generator
 * Executes tab banner plans against SPSS data to generate cross-tabulation tables
 *
 * PURPOSE:
 * - Takes banner plan blueprint (H1 categories + H2 equations)
 * - Applies equations to SPSS data to filter subgroups
 * - Generates cross-tab tables (rows from tab sheet, columns from banners)
 *
 * WORKFLOW:
 * 1. Load banner plan from database (banner_definitions -> banner_groups -> banner_columns)
 * 2. Parse SPSS data (codes.csv with numeric responses)
 * 3. For each banner column, evaluate equation to filter respondents
 * 4. For each tab sheet row, calculate statistics across banner columns
 * 5. Export as Excel/CSV with professional formatting
 *
 * Created: 2025-09-30
 */

import Papa from 'papaparse';

/**
 * Parse equation string and evaluate against data row
 * Supports: =, !=, >, <, >=, <=, ranges (1-9), multiple values (1,2,3)
 *
 * @param {string} equation - Equation like "S7=2", "Q1>5", "S1=1,2,3", "Q1=1-9"
 * @param {Object} dataRow - Single row from SPSS data
 * @returns {boolean} - True if row matches equation
 */
export function evaluateEquation(equation, dataRow) {
  if (!equation || !dataRow) return false;

  // Remove whitespace
  equation = equation.trim();

  // Parse equation format: VARIABLE OPERATOR VALUE
  const patterns = [
    { regex: /^([A-Za-z0-9_]+)\s*>=\s*(.+)$/, op: '>=' },
    { regex: /^([A-Za-z0-9_]+)\s*<=\s*(.+)$/, op: '<=' },
    { regex: /^([A-Za-z0-9_]+)\s*!=\s*(.+)$/, op: '!=' },
    { regex: /^([A-Za-z0-9_]+)\s*>\s*(.+)$/, op: '>' },
    { regex: /^([A-Za-z0-9_]+)\s*<\s*(.+)$/, op: '<' },
    { regex: /^([A-Za-z0-9_]+)\s*=\s*(.+)$/, op: '=' }
  ];

  for (const pattern of patterns) {
    const match = equation.match(pattern.regex);
    if (match) {
      const [, variable, valueStr] = match;
      const operator = pattern.op;
      const cellValue = dataRow[variable];

      // Handle missing data
      if (cellValue === undefined || cellValue === null || cellValue === '') {
        return false;
      }

      // Parse value(s)
      // Check for range: "1-9"
      if (valueStr.includes('-') && !valueStr.startsWith('-')) {
        const [min, max] = valueStr.split('-').map(v => parseFloat(v.trim()));
        if (!isNaN(min) && !isNaN(max)) {
          const numValue = parseFloat(cellValue);
          return numValue >= min && numValue <= max;
        }
      }

      // Check for multiple values: "1,2,3"
      if (valueStr.includes(',')) {
        const values = valueStr.split(',').map(v => v.trim());
        if (operator === '=') {
          return values.includes(String(cellValue));
        } else if (operator === '!=') {
          return !values.includes(String(cellValue));
        }
      }

      // Single value comparison
      const compareValue = parseFloat(valueStr);
      const numValue = parseFloat(cellValue);

      // Try numeric comparison first
      if (!isNaN(numValue) && !isNaN(compareValue)) {
        switch (operator) {
          case '=': return numValue === compareValue;
          case '!=': return numValue !== compareValue;
          case '>': return numValue > compareValue;
          case '<': return numValue < compareValue;
          case '>=': return numValue >= compareValue;
          case '<=': return numValue <= compareValue;
        }
      }

      // Fall back to string comparison
      switch (operator) {
        case '=': return String(cellValue) === String(valueStr);
        case '!=': return String(cellValue) !== String(valueStr);
        default: return false;
      }
    }
  }

  console.warn('Could not parse equation:', equation);
  return false;
}

/**
 * Evaluate compound equation with AND/OR logic
 * Supports: "S7=2 & Q1>5", "S1=1 | S1=2", "S7=2 & (Q1=1-9 | Q1>15)"
 *
 * @param {string} compoundEquation - Complex equation with &/| operators
 * @param {Object} dataRow - Single row from SPSS data
 * @returns {boolean} - True if row matches compound equation
 */
export function evaluateCompoundEquation(compoundEquation, dataRow) {
  if (!compoundEquation) return false;

  // Handle parentheses recursively (future enhancement)
  // For now, support simple AND/OR chains

  // Split by OR first (lower precedence)
  if (compoundEquation.includes('|')) {
    const orParts = compoundEquation.split('|');
    return orParts.some(part => evaluateCompoundEquation(part.trim(), dataRow));
  }

  // Split by AND (higher precedence)
  if (compoundEquation.includes('&')) {
    const andParts = compoundEquation.split('&');
    return andParts.every(part => evaluateEquation(part.trim(), dataRow));
  }

  // Single equation
  return evaluateEquation(compoundEquation, dataRow);
}

/**
 * Filter SPSS data based on banner column equation
 *
 * @param {Array} spssData - Full SPSS dataset
 * @param {string} equation - Banner column equation
 * @returns {Array} - Filtered subset of data
 */
export function filterDataByEquation(spssData, equation) {
  if (!equation || equation === 'TOTAL') {
    return spssData; // Total column = all data
  }

  return spssData.filter(row => evaluateCompoundEquation(equation, row));
}

/**
 * Calculate frequency/percentage for a question across banner columns
 *
 * @param {string} questionVariable - Question ID (e.g., "Q1", "S7")
 * @param {Array} spssData - Full SPSS dataset
 * @param {Array} bannerColumns - Array of banner column definitions
 * @returns {Object} - Statistics for each banner column
 */
export function calculateQuestionStats(questionVariable, spssData, bannerColumns) {
  const results = {};

  for (const column of bannerColumns) {
    const filteredData = filterDataByEquation(spssData, column.equation);
    const base = filteredData.length;

    // Calculate frequency distribution
    const frequencies = {};
    filteredData.forEach(row => {
      const value = row[questionVariable];
      if (value !== undefined && value !== null && value !== '') {
        frequencies[value] = (frequencies[value] || 0) + 1;
      }
    });

    // Calculate percentages
    const percentages = {};
    Object.keys(frequencies).forEach(key => {
      percentages[key] = base > 0 ? (frequencies[key] / base * 100).toFixed(1) : 0;
    });

    results[column.id] = {
      columnName: column.name,
      equation: column.equation,
      base: base,
      frequencies: frequencies,
      percentages: percentages
    };
  }

  return results;
}

/**
 * Calculate mean/median/std dev for numeric questions
 *
 * @param {string} questionVariable - Question ID
 * @param {Array} spssData - Full SPSS dataset
 * @param {Array} bannerColumns - Array of banner column definitions
 * @returns {Object} - Statistics for each banner column
 */
export function calculateNumericStats(questionVariable, spssData, bannerColumns) {
  const results = {};

  for (const column of bannerColumns) {
    const filteredData = filterDataByEquation(spssData, column.equation);
    const values = filteredData
      .map(row => parseFloat(row[questionVariable]))
      .filter(v => !isNaN(v));

    const base = values.length;

    if (base === 0) {
      results[column.id] = {
        columnName: column.name,
        equation: column.equation,
        base: 0,
        mean: null,
        median: null,
        stdDev: null
      };
      continue;
    }

    // Calculate mean
    const mean = values.reduce((sum, v) => sum + v, 0) / base;

    // Calculate median
    const sorted = [...values].sort((a, b) => a - b);
    const median = base % 2 === 0
      ? (sorted[base / 2 - 1] + sorted[base / 2]) / 2
      : sorted[Math.floor(base / 2)];

    // Calculate standard deviation
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / base;
    const stdDev = Math.sqrt(variance);

    results[column.id] = {
      columnName: column.name,
      equation: column.equation,
      base: base,
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      stdDev: stdDev.toFixed(2)
    };
  }

  return results;
}

/**
 * Calculate Top-2-Box / Bottom-2-Box for Likert scales
 *
 * @param {string} questionVariable - Question ID
 * @param {Array} spssData - Full SPSS dataset
 * @param {Array} bannerColumns - Array of banner column definitions
 * @param {Array} topBoxCodes - Codes for top box (e.g., [1, 2] for "Strongly Agree" + "Agree")
 * @param {Array} bottomBoxCodes - Codes for bottom box (e.g., [4, 5])
 * @returns {Object} - T2B/B2B percentages for each banner column
 */
export function calculateTopBottomBox(questionVariable, spssData, bannerColumns, topBoxCodes, bottomBoxCodes) {
  const results = {};

  for (const column of bannerColumns) {
    const filteredData = filterDataByEquation(spssData, column.equation);
    const base = filteredData.length;

    if (base === 0) {
      results[column.id] = {
        columnName: column.name,
        equation: column.equation,
        base: 0,
        topBox: null,
        bottomBox: null
      };
      continue;
    }

    // Count top box
    const topCount = filteredData.filter(row => {
      const value = parseFloat(row[questionVariable]);
      return !isNaN(value) && topBoxCodes.includes(value);
    }).length;

    // Count bottom box
    const bottomCount = filteredData.filter(row => {
      const value = parseFloat(row[questionVariable]);
      return !isNaN(value) && bottomBoxCodes.includes(value);
    }).length;

    results[column.id] = {
      columnName: column.name,
      equation: column.equation,
      base: base,
      topBox: (topCount / base * 100).toFixed(1),
      bottomBox: (bottomCount / base * 100).toFixed(1)
    };
  }

  return results;
}

/**
 * Parse SPSS CSV file
 *
 * @param {File} file - CSV file object
 * @returns {Promise<Array>} - Parsed data array
 */
export async function parseSpssFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('✅ Parsed SPSS file:', results.data.length, 'rows');
        resolve(results.data);
      },
      error: (error) => {
        console.error('❌ Error parsing SPSS file:', error);
        reject(error);
      }
    });
  });
}

/**
 * Generate full cross-tabulation report
 *
 * @param {Object} tabPlan - Tab plan definition with questions array
 * @param {Object} bannerPlan - Banner plan with H1/H2 structure
 * @param {Array} spssData - Parsed SPSS data
 * @returns {Object} - Complete cross-tab report
 */
export function generateCrossTabReport(tabPlan, bannerPlan, spssData) {
  const report = {
    metadata: {
      projectName: tabPlan.projectName || 'Unnamed Project',
      bannerName: bannerPlan.name || 'Unnamed Banner',
      totalBase: spssData.length,
      generatedAt: new Date().toISOString()
    },
    tables: []
  };

  // Build banner columns array (Total + all H2 columns)
  const bannerColumns = [
    { id: 'TOTAL', name: 'Total', equation: 'TOTAL' }
  ];

  bannerPlan.banner_groups?.forEach(h1Group => {
    h1Group.banner_columns?.forEach(h2Column => {
      bannerColumns.push({
        id: h2Column.id,
        name: h2Column.name,
        equation: h2Column.equation || '',
        parentGroup: h1Group.name
      });
    });
  });

  // Generate table for each question in tab plan
  tabPlan.questions?.forEach(question => {
    const questionId = question.questionId || question.variable;
    const questionType = question.questionType || 'categorical';

    let tableData;

    if (questionType === 'numeric') {
      tableData = calculateNumericStats(questionId, spssData, bannerColumns);
    } else if (questionType === 'likert') {
      const topBoxCodes = question.topBoxCodes || [1, 2];
      const bottomBoxCodes = question.bottomBoxCodes || [4, 5];
      tableData = calculateTopBottomBox(questionId, spssData, bannerColumns, topBoxCodes, bottomBoxCodes);
    } else {
      tableData = calculateQuestionStats(questionId, spssData, bannerColumns);
    }

    report.tables.push({
      questionId: questionId,
      questionText: question.questionText || questionId,
      questionType: questionType,
      data: tableData
    });
  });

  return report;
}

/**
 * Export cross-tab report to CSV format
 *
 * @param {Object} report - Generated cross-tab report
 * @returns {string} - CSV string
 */
export function exportReportToCSV(report) {
  let csv = `Cross-Tabulation Report\n`;
  csv += `Project: ${report.metadata.projectName}\n`;
  csv += `Banner: ${report.metadata.bannerName}\n`;
  csv += `Total Base: ${report.metadata.totalBase}\n`;
  csv += `Generated: ${new Date(report.metadata.generatedAt).toLocaleString()}\n\n`;

  report.tables.forEach(table => {
    csv += `\n${table.questionId}: ${table.questionText}\n`;
    csv += `Type: ${table.questionType}\n\n`;

    // Header row
    const columnIds = Object.keys(table.data);
    csv += 'Column,';
    csv += columnIds.map(id => table.data[id].columnName).join(',') + '\n';

    csv += 'Equation,';
    csv += columnIds.map(id => table.data[id].equation || 'TOTAL').join(',') + '\n';

    csv += 'Base,';
    csv += columnIds.map(id => table.data[id].base).join(',') + '\n';

    // Data rows based on question type
    if (table.questionType === 'numeric') {
      csv += 'Mean,';
      csv += columnIds.map(id => table.data[id].mean || '-').join(',') + '\n';

      csv += 'Median,';
      csv += columnIds.map(id => table.data[id].median || '-').join(',') + '\n';

      csv += 'Std Dev,';
      csv += columnIds.map(id => table.data[id].stdDev || '-').join(',') + '\n';
    } else if (table.questionType === 'likert') {
      csv += 'Top Box %,';
      csv += columnIds.map(id => table.data[id].topBox || '-').join(',') + '\n';

      csv += 'Bottom Box %,';
      csv += columnIds.map(id => table.data[id].bottomBox || '-').join(',') + '\n';
    } else {
      // Categorical - show all response codes
      const allCodes = new Set();
      columnIds.forEach(id => {
        Object.keys(table.data[id].percentages || {}).forEach(code => allCodes.add(code));
      });

      [...allCodes].sort().forEach(code => {
        csv += `Code ${code} %,`;
        csv += columnIds.map(id => table.data[id].percentages?.[code] || '0.0').join(',') + '\n';
      });
    }

    csv += '\n';
  });

  return csv;
}