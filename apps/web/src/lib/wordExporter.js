/**
 * wordExporter.js
 *
 * Professional Word Document Export System for QGen Tab Planner V3
 * Exports questionnaires by creating a structured document model.
 */
import { exportToDocx } from './docxGenerator.js';

// --- MAIN EXPORT FUNCTION ---

export async function exportToWord(project, questions, options = {}) {
    try {
        const sortedQuestions = [...questions].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

        // Check both question_id and id fields for screener detection
        const screenerQuestions = sortedQuestions.filter(q => {
            const questionId = (q.question_id || q.id || '').toString().toUpperCase();
            return questionId.startsWith('S');
        });

        const mainQuestions = sortedQuestions.filter(q => {
            const questionId = (q.question_id || q.id || '').toString().toUpperCase();
            return !questionId.startsWith('S');
        });

        const docDefinition = [];

        // Add document header
        buildDocumentHeader(project, docDefinition);

        // Add screener section
        if (screenerQuestions.length > 0) {
            docDefinition.push({ text: 'SCREENER', style: 'heading' });
            screenerQuestions.forEach(question => {
                buildQuestionContent(question, questions, docDefinition);
                docDefinition.push({ text: '' }); // Spacer
            });
        }

        // Add main survey section
        if (mainQuestions.length > 0) {
            docDefinition.push({ text: 'MAIN SURVEY', style: 'heading' });
            mainQuestions.forEach(question => {
                buildQuestionContent(question, questions, docDefinition);
                docDefinition.push({ text: '' }); // Spacer
            });
        }

        // Generate and return the Word document blob
        return await exportToDocx(docDefinition, project);

    } catch (error) {
        console.error('Error exporting to Word:', error);
        throw new Error(`Word export failed: ${error.message}`);
    }
}

// --- DOCUMENT STRUCTURE BUILDERS ---

function buildDocumentHeader(project, docDefinition) {
    docDefinition.push({ text: `Project: ${project.name || 'Untitled Project'}`, bold: true });
    docDefinition.push({ text: `Version: ${project.version || '1.0'}` });
    docDefinition.push({ text: `Date: ${new Date().toLocaleDateString()}` });
    if (project.client) {
        docDefinition.push({ text: `Client: ${project.client}` });
    }
    docDefinition.push({ text: `Status: ${project.status || 'Draft'}` });
    docDefinition.push({ text: '' }); // Spacer
}

function buildQuestionContent(question, allQuestions, docDefinition) {
    // Question ID and text
    buildQuestionHeader(question, docDefinition);

    // Technical specifications
    buildTechnicalSpecifications(question, docDefinition);

    // Randomization instruction
    buildRandomizationInstruction(question, docDefinition);

    // Response options or Table
    const questionMode = question.question_mode || question.mode;
    if (questionMode === 'table' || questionMode === 'advanced_table') {
        buildTableStructure(question, allQuestions, docDefinition);
    } else {
        buildResponseOptions(question, docDefinition);
    }

    // Special instructions
    buildSpecialInstructions(question, docDefinition);

    // Conditional logic
    buildConditionalLogic(question, allQuestions, docDefinition);
}

function buildQuestionHeader(question, docDefinition) {
    const questionId = question.question_id || question.id || 'Q_UNKNOWN';
    const questionMode = question.question_mode || question.mode;
    // Convert HTML to Word formatting instead of stripping it
    const questionText = question.question_text || question.text || '';

    const textRuns = [];

    // Skip question ID for text questions (they're just informational notes)
    if (questionMode !== 'text') {
        textRuns.push({ text: `${questionId}. `, bold: true });
    }

    // Convert HTML to formatted text runs
    const formattedRuns = convertHtmlToTextRuns(questionText);
    textRuns.push(...formattedRuns);

    // Add instruction text at the end for list questions
    const instructionText = getInlineInstructionText(question);
    if (instructionText) {
        textRuns.push({ text: ` ${instructionText}`, bold: false, color: '000000' });
    }

    docDefinition.push({ children: textRuns });
}

function getInlineInstructionText(question) {
    const questionMode = question.question_mode || question.mode;
    const questionType = question.question_type || question.type;

    if (questionMode === 'list') {
        return questionType === 'multi' ? '(Select all that apply.)' : '(Please select one.)';
    }

    return null; // No inline instruction for other question types
}

function buildRandomizationInstruction(question, docDefinition) {
    const randomization = question.randomization || {};

    if (randomization.mode === 'shuffle') {
        docDefinition.push({ text: 'Randomize list', color: '0000FF', bold: false });
    } else if (randomization.mode === 'alphabetize' || randomization.mode === 'alpha' || randomization.mode === 'sort') {
        docDefinition.push({ text: 'Alphabetize', color: '0000FF', bold: false });
    }
}

function buildTechnicalSpecifications(question, docDefinition) {
    let specText = '';
    const questionMode = question.question_mode || question.mode;
    const questionType = question.question_type || question.type;

    // Skip list questions as they now have inline instructions
    if (questionMode === 'numeric') {
        // Check if it's a dropdown numeric question or numeric select/range
        const numericConfig = question.numeric || {};
        const numericType = numericConfig.type;


        if (numericType === 'ranges') {
            // This is numeric select/range - always shows as SELECT ONE
            specText = 'SELECT ONE';
        } else if (numericType === 'dropdown') {
            // This is numeric input with dropdown enabled
            specText = 'SELECT FROM DROP DOWN';
        } else {
            // This is regular numeric input
            specText = 'ENTER NUMBER';
        }
    } else if (questionMode === 'table' || questionMode === 'advanced_table') {
        specText = getTableInstruction(question);
    } else if (questionMode === 'open') {
        specText = 'ENTER TEXT';
    }

    if (specText) {
        docDefinition.push({ text: specText, color: '0000FF' });
    }
}

function getTableInstruction(question) {
    const questionType = question.question_type || question.type;
    if (questionType === 'ranking') return 'RANK ITEMS IN ORDER OF PREFERENCE';
    if (questionType === 'multi' || questionType === 'grid_multi') return 'SELECT ALL THAT APPLY FOR EACH ROW';
    return 'SELECT ONE ANSWER FOR EACH ROW';
}


function buildResponseOptions(question, docDefinition) {
    const questionOptions = getQuestionOptions(question);

    questionOptions.forEach((option, index) => {
        // Convert HTML formatting instead of stripping it
        const optionLabel = option.option_label || option.label || '';

        const children = [{ text: `${index + 1}. ` }];

        // Add formatted option label
        const formattedLabelRuns = convertHtmlToTextRuns(optionLabel);
        children.push(...formattedLabelRuns);

        // Collect option behaviors - separate terminate (red) from others (blue)
        const blueBehaviors = [];
        const hasTerminate = option.terminate;

        if (option.exclusive) {
            blueBehaviors.push('Exclusive');
        }
        if (option.must_select) {
            blueBehaviors.push('Must select');
        }
        if (option.lock_randomize) {
            blueBehaviors.push('Lock');
        }
        if (option.anchor === 'bottom') {
            blueBehaviors.push('anchor to bottom');
        }

        // Add blue behaviors if any exist
        if (blueBehaviors.length > 0) {
            const behaviorText = `[${blueBehaviors.join(', ')}]`;
            children.push({ text: ` ${behaviorText}`, color: '0000FF', bold: false });
        }

        // Add red terminate behavior separately
        if (hasTerminate) {
            children.push({ text: ' [Terminate]', color: 'FF0000', bold: false });
        }
        docDefinition.push({ children, style: 'list' });
    });

    // Add "must select to continue" validation if enabled
    const globalMustSelect = question.globalMustSelect;
    if (globalMustSelect && globalMustSelect.enabled && globalMustSelect.conditions && globalMustSelect.conditions.length > 0) {
        const operator = globalMustSelect.operator || 'OR';
        const optionCodes = globalMustSelect.conditions.map(condition => condition.optionCode).join(` ${operator} `);
        const validationText = `MUST SELECT OPTIONS ${optionCodes} TO CONTINUE`;

        docDefinition.push({ text: validationText, color: 'FFA500', bold: true, size: 18 }); // Orange color, smaller font (9pt)
    }
}

function buildTableStructure(question, allQuestions, docDefinition) {
    // Resolve rows and columns for both regular and advanced tables
    const resolvedData = resolveTableData(question, allQuestions);
    const { rows, cols, sourcingInfo } = resolvedData;

    // Add dynamic sourcing information if present
    if (sourcingInfo.length > 0) {
        sourcingInfo.forEach(info => {
            docDefinition.push({ text: info, color: '0000FF' });
        });
        docDefinition.push({ text: '' }); // Spacer
    }

    // Build the table if we have both rows and columns
    if (rows.length > 0 && cols.length > 0) {
        const tableHeader = ['Statements'].concat(cols);
        const tableRows = rows.map(rowLabel => {
            // Ensure rowLabel is a string to prevent errors
            const label = (typeof rowLabel === 'object' && rowLabel.label) ? rowLabel.label : String(rowLabel);
            return [label].concat(Array(cols.length).fill(''));
        });

        docDefinition.push({
            type: 'table',
            data: [tableHeader, ...tableRows]
        });
    }
}

function resolveTableData(question, allQuestions) {
    let rows = [];
    let cols = [];
    let sourcingInfo = [];

    // Determine if this is an advanced table or regular table
    const questionMode = question.question_mode || question.mode;
    const isAdvancedTable = questionMode === 'advanced_table';
    const tableConfig = isAdvancedTable ? question.advancedTable : question.grid;

    if (!tableConfig) {
        return { rows: [], cols: [], sourcingInfo: [] };
    }

    // Resolve rows
    if (tableConfig.rowSource?.qid) {
        const sourceQuestion = findQuestionById(allQuestions, tableConfig.rowSource.qid);
        if (sourceQuestion) {
            const isSelectedRowsType = isDynamicSelectedType(question, 'rows');

            if (isSelectedRowsType) {
                // For "Dynamic Selected Rows", show placeholder text like preview
                const sourceOptions = getQuestionOptions(sourceQuestion);
                rows = sourceOptions.slice(0, 3).map((_, index) => `Selection ${index + 1} from ${tableConfig.rowSource.qid}`);
                if (sourceOptions.length > 3) {
                    rows.push('Etc...');
                }
            } else {
                // For "Dynamic Simple Rows", show actual option labels
                const sourceOptions = getQuestionOptions(sourceQuestion);
                const excludeSet = new Set(
                    (tableConfig.rowSource.exclude || '')
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean)
                );

                rows = sourceOptions
                    .filter(opt => !excludeSet.has(opt.code || opt.option_code))
                    .map(opt => opt.label || opt.option_label);
            }

            sourcingInfo.push(`ROWS SOURCED FROM: ${tableConfig.rowSource.qid}`);
            if (tableConfig.rowSource.exclude) {
                sourcingInfo.push(`EXCLUDE ROW OPTIONS: ${tableConfig.rowSource.exclude}`);
            }
        } else {
            rows = [`Error: Row source "${tableConfig.rowSource.qid}" not found`];
        }
    } else {
        rows = tableConfig.rows || [];
    }

    // Resolve columns
    if (tableConfig.columnSource?.qid) {
        const sourceQuestion = findQuestionById(allQuestions, tableConfig.columnSource.qid);
        if (sourceQuestion) {
            const isSelectedColumnsType = isDynamicSelectedType(question, 'columns');

            if (isSelectedColumnsType) {
                // For "Dynamic Selected Columns", show placeholder text like preview
                const sourceOptions = getQuestionOptions(sourceQuestion);
                cols = sourceOptions.slice(0, 3).map((_, index) => `Selection ${index + 1} from ${tableConfig.columnSource.qid}`);
                if (sourceOptions.length > 3) {
                    cols.push('Etc...');
                }
            } else {
                // For "Dynamic Simple Columns", show actual option labels
                const sourceOptions = getQuestionOptions(sourceQuestion);
                const excludeSet = new Set(
                    (tableConfig.columnSource.exclude || '')
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean)
                );

                cols = sourceOptions
                    .filter(opt => !excludeSet.has(opt.code || opt.option_code))
                    .map(opt => opt.label || opt.option_label);
            }

            sourcingInfo.push(`COLUMNS SOURCED FROM: ${tableConfig.columnSource.qid}`);
            if (tableConfig.columnSource.exclude) {
                sourcingInfo.push(`EXCLUDE COLUMN OPTIONS: ${tableConfig.columnSource.exclude}`);
            }
        } else {
            cols = [`Error: Column source "${tableConfig.columnSource.qid}" not found`];
        }
    } else {
        cols = tableConfig.cols || [];
    }

    return { rows, cols, sourcingInfo };
}

function findQuestionById(questions, questionId) {
    return questions.find(q =>
        (q.question_id === questionId) ||
        (q.id === questionId) ||
        (q.qid === questionId)
    );
}

function isDynamicSelectedType(question, dimension) {
    // Check table variation for "Selected" types
    const tableVariation = question.advancedTable?.tableVariation;

    if (dimension === 'rows') {
        return tableVariation === 'Dynamic Selected Rows';
    } else if (dimension === 'columns') {
        return tableVariation === 'Dynamic Selected Columns';
    }

    // Fallback: check source configuration mode
    const questionMode = question.question_mode || question.mode;
    if (dimension === 'rows') {
        return questionMode === 'dynamic_selected_rows';
    } else if (dimension === 'columns') {
        return questionMode === 'dynamic_selected_columns';
    }

    return false;
}

function buildSpecialInstructions(question, docDefinition) {
    // Add numeric termination logic - look for simple terminate config
    const questionMode = question.question_mode || question.mode;
    if (questionMode === 'numeric') {
        const numericConfig = question.numeric || {};


        // Check for simple termination rules (the "TERMINATE IF..." section)
        if (numericConfig.terminateCondition && numericConfig.terminateValue !== null && numericConfig.terminateValue !== undefined) {
            const operator = numericConfig.terminateCondition;
            const value = numericConfig.terminateValue;

            let terminationText = '';
            switch (operator) {
                case 'Less than':
                case 'lt':
                    terminationText = `TERMINATE IF <${value}`;
                    break;
                case 'Less than or equal to':
                case 'lte':
                    terminationText = `TERMINATE IF ≤${value}`;
                    break;
                case 'Greater than':
                case 'gt':
                    terminationText = `TERMINATE IF >${value}`;
                    break;
                case 'Greater than or equal to':
                case 'gte':
                    terminationText = `TERMINATE IF ≥${value}`;
                    break;
                case 'Equal to':
                case 'eq':
                    terminationText = `TERMINATE IF =${value}`;
                    break;
                case 'Not equal to':
                case 'ne':
                    terminationText = `TERMINATE IF ≠${value}`;
                    break;
                default:
                    terminationText = `TERMINATE IF ${operator} ${value}`;
            }

            docDefinition.push({ text: terminationText, color: 'FF0000', bold: true });
        }
    }
}

function buildConditionalLogic(question, allQuestions, docDefinition) {
    const conditions = question.conditions;
    if (!conditions || conditions.mode === 'none' || !conditions.rules || conditions.rules.length === 0) {
        return;
    }

    const modeText = conditions.mode === 'show_if' ? 'SHOW IF' : 'HIDE IF';
    const logicConnector = conditions.logic === 'OR' ? ' OR ' : ' AND ';
    const conditionTexts = conditions.rules.map(rule => {
        const sourceId = rule.source_qid || rule.source;
        const values = Array.isArray(rule.values) ? rule.values.join(`/${logicConnector}`) : rule.values;
        return `${sourceId} ${rule.operator} ${values}`;
    }).join(logicConnector);

    docDefinition.push({ text: `[${modeText}: ${conditionTexts}]`, color: '0000FF', italics: true });
}

function getQuestionOptions(question) {
    if (question.options && Array.isArray(question.options)) return question.options;
    if (question.question_options && Array.isArray(question.question_options)) return question.question_options;
    if (question.list_config && question.list_config.options) return question.list_config.options;
    return [];
}

/**
 * Converts HTML to formatted text runs for Word export
 * Preserves bold, italic, underline formatting and handles piping syntax
 */
function convertHtmlToTextRuns(html) {
    if (!html) return [{ text: '' }];

    // Parse HTML formatting (including piping spans)
    return parseHtmlFormatting(html);
}

/**
 * Parses HTML formatting and converts to Word text runs
 */
function parseHtmlFormatting(html) {
    if (!html) return [{ text: '' }];

    try {
        const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
        const runs = [];

        function processNode(node, inheritedFormat = {}) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                if (text) {
                    runs.push({
                        text: text,
                        ...inheritedFormat
                    });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const format = { ...inheritedFormat };

                // Apply formatting based on HTML tags
                switch (node.tagName.toLowerCase()) {
                    case 'b':
                    case 'strong':
                        format.bold = true;
                        break;
                    case 'i':
                    case 'em':
                        format.italics = true;
                        break;
                    case 'u':
                        format.underline = {};
                        break;
                    case 'span':
                        // Check if this is a pipe-indicator span
                        if (node.classList.contains('pipe-indicator')) {
                            // This is piping syntax - format as blue, bold, small caps with <> brackets
                            const pipeText = node.textContent;
                            runs.push({
                                text: `<${pipeText}>`,
                                color: '0000FF',
                                bold: true,
                                smallCaps: true
                            });
                            return; // Don't process children since we handled the text
                        }

                        // Handle inline styles for regular spans
                        const style = node.getAttribute('style') || '';
                        if (style.includes('font-weight:') && style.includes('bold')) {
                            format.bold = true;
                        }
                        if (style.includes('font-style:') && style.includes('italic')) {
                            format.italics = true;
                        }
                        if (style.includes('text-decoration:') && style.includes('underline')) {
                            format.underline = {};
                        }
                        break;
                }

                // Process child nodes
                for (const child of node.childNodes) {
                    processNode(child, format);
                }
            }
        }

        processNode(doc.body.firstChild);

        return runs.length > 0 ? runs : [{ text: html }]; // Fallback to plain text
    } catch (error) {
        console.warn('Error parsing HTML formatting:', error);
        // Fallback to plain text
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return [{ text: doc.body.textContent || html }];
    }
}

/**
 * Utility to strip HTML tags from a string (kept for backward compatibility)
 */
function stripHtml(html) {
    if (!html) return '';
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}