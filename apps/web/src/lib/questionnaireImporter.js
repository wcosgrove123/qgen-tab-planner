/**
 * questionnaireImporter.js
 *
 * Questionnaire Import System for Q-Gen
 * Supports importing questionnaires from various formats:
 * - Word documents (.docx)
 * - Excel files (.xlsx)
 * - JSON exports from other tools
 * - CSV question lists
 * - Plain text formats
 */

// --- SUPPORTED IMPORT FORMATS ---
export const IMPORT_FORMATS = {
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    JSON: 'application/json',
    CSV: 'text/csv',
    TXT: 'text/plain'
};

// --- QUESTION TYPE DETECTION PATTERNS ---
const QUESTION_PATTERNS = {
    // Single/Multi select patterns
    singleSelect: /\b(select one|choose one|single response|radio)\b/i,
    multiSelect: /\b(select all|check all|multiple response|checkbox)\b/i,

    // Scale patterns
    likertScale: /\b(strongly disagree|disagree|agree|strongly agree|scale|rating)\b/i,
    numericScale: /\b(\d+\s*point\s*scale|\d+\s*to\s*\d+)\b/i,

    // Open-ended patterns
    openEnded: /\b(please specify|explain|describe|comments?|other.*specify)\b/i,

    // Numeric patterns
    numeric: /\b(age|year|amount|number|quantity|percent|%)\b/i,

    // Table/Grid patterns
    table: /\b(rate each|for each.*rate|grid|matrix)\b/i,

    // Termination patterns
    terminate: /\b(terminate|end survey|not eligible|disqualify)\b/i
};

// --- OPTION DETECTION PATTERNS ---
const OPTION_PATTERNS = {
    numbered: /^\s*(\d+)\.\s*(.+)$/,
    lettered: /^\s*([a-zA-Z])\.\s*(.+)$/,
    bulleted: /^\s*[•·▪▫-]\s*(.+)$/,
    bracketed: /^\s*\[([^\]]+)\]\s*(.+)$/
};

// --- MAIN IMPORT FUNCTION ---

/**
 * Imports a questionnaire from various file formats
 * @param {File} file - The uploaded file
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Parsed questionnaire data
 */
export async function importQuestionnaire(file, options = {}) {
    const fileType = file.type || getFileTypeFromExtension(file.name);

    console.log('Importing questionnaire:', { fileName: file.name, fileType, size: file.size });

    try {
        let rawContent;

        switch (fileType) {
            case IMPORT_FORMATS.DOCX:
                rawContent = await parseWordDocument(file);
                break;
            case IMPORT_FORMATS.XLSX:
                rawContent = await parseExcelDocument(file);
                break;
            case IMPORT_FORMATS.JSON:
                rawContent = await parseJsonFile(file);
                break;
            case IMPORT_FORMATS.CSV:
                rawContent = await parseCsvFile(file);
                break;
            case IMPORT_FORMATS.TXT:
                rawContent = await parseTextFile(file);
                break;
            default:
                throw new Error(`Unsupported file format: ${fileType}`);
        }

        // Parse content into questionnaire structure
        const questionnaire = parseContentToQuestionnaire(rawContent, options);

        // Validate and clean up the questionnaire
        const validatedQuestionnaire = validateImportedQuestionnaire(questionnaire);

        console.log('Successfully imported questionnaire:', validatedQuestionnaire);
        return validatedQuestionnaire;

    } catch (error) {
        console.error('Error importing questionnaire:', error);
        throw new Error(`Failed to import questionnaire: ${error.message}`);
    }
}

// --- FORMAT-SPECIFIC PARSERS ---

/**
 * Parses a Word document (.docx)
 */
async function parseWordDocument(file) {
    // DOCX files are ZIP archives containing XML - proper parsing requires a library
    // For now, we'll provide a helpful error message and suggest alternatives
    throw new Error(`Word documents (.docx) contain complex formatting that requires special processing.

Please try one of these alternatives:
• Copy and paste your questionnaire text into a .txt file
• Save your Word document as Plain Text (.txt) from Word
• Export to CSV format if your questions are in a table
• Use "Save As" → "Web Page, Filtered" in Word, then upload the resulting text

We're working on better Word document support!`);
}

/**
 * Parses an Excel document (.xlsx)
 */
async function parseExcelDocument(file) {
    // Simplified Excel parsing - in production use a library like xlsx
    const text = await file.text();
    return { type: 'spreadsheet', content: text, originalFormat: 'xlsx' };
}

/**
 * Parses a JSON file
 */
async function parseJsonFile(file) {
    const text = await file.text();
    const json = JSON.parse(text);
    return { type: 'json', content: json, originalFormat: 'json' };
}

/**
 * Parses a CSV file
 */
async function parseCsvFile(file) {
    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    return { type: 'csv', content: lines, originalFormat: 'csv' };
}

/**
 * Parses a plain text file
 */
async function parseTextFile(file) {
    const text = await file.text();
    return { type: 'text', content: text, originalFormat: 'txt' };
}

// --- CONTENT PARSING TO QUESTIONNAIRE ---

/**
 * Converts parsed content into questionnaire structure
 */
function parseContentToQuestionnaire(rawContent, options) {
    switch (rawContent.type) {
        case 'text':
            return parseTextToQuestionnaire(rawContent.content, options);
        case 'json':
            return parseJsonToQuestionnaire(rawContent.content, options);
        case 'csv':
            return parseCsvToQuestionnaire(rawContent.content, options);
        default:
            throw new Error(`Unsupported content type: ${rawContent.type}`);
    }
}

/**
 * Parses text content into questionnaire
 */
function parseTextToQuestionnaire(text, options) {
    console.log('Parsing text to questionnaire. Text length:', text.length);
    console.log('First 500 chars:', text.substring(0, 500));

    const questions = [];
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    console.log('Total lines to process:', lines.length);
    console.log('Sample lines:', lines.slice(0, 10));

    let currentQuestion = null;
    let currentOptions = [];
    let questionCounter = 1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        console.log(`Line ${i}: "${line.substring(0, 100)}${line.length > 100 ? '...' : ''}"`);
        console.log(`  - isHeaderLine: ${isHeaderLine(line)}`);
        console.log(`  - isQuestionLine: ${isQuestionLine(line)}`);

        // Skip headers and metadata
        if (isHeaderLine(line)) {
            console.log('  - Skipping header line');
            continue;
        }

        // Detect question start
        if (isQuestionLine(line)) {
            console.log('  - Found question line!');

            // Save previous question if exists
            if (currentQuestion) {
                currentQuestion.options = currentOptions;
                questions.push(finalizeQuestion(currentQuestion));
                console.log('  - Saved previous question:', currentQuestion.id);
            }

            // Start new question
            currentQuestion = parseQuestionLine(line, questionCounter++);
            console.log('  - Started new question:', currentQuestion);
            currentOptions = [];
        }
        // Detect option lines
        else if (currentQuestion && isOptionLine(line)) {
            console.log('  - Found option line');
            const option = parseOptionLine(line, currentOptions.length + 1);
            if (option) {
                currentOptions.push(option);
                console.log('  - Added option:', option);
            }
        }
        // Handle continuation lines
        else if (currentQuestion && line.length > 0) {
            console.log('  - Adding continuation text');
            currentQuestion.text += ' ' + line;
        }
        // If no current question but line looks substantial, make it a question
        else if (!currentQuestion && line.length > 20 && !isHeaderLine(line)) {
            console.log('  - Converting substantial line to question');
            currentQuestion = {
                id: questionCounter < 5 ? `S${questionCounter}` : `Q${questionCounter - 4}`,
                text: line,
                mode: detectQuestionType(line),
                type: detectQuestionSubtype(line, detectQuestionType(line)),
                options: [],
                conditions: { mode: 'none', rules: [] }
            };
            questionCounter++;
            currentOptions = [];
        }
    }

    // Don't forget the last question
    if (currentQuestion) {
        currentQuestion.options = currentOptions;
        questions.push(finalizeQuestion(currentQuestion));
        console.log('  - Saved final question:', currentQuestion.id);
    }

    console.log('Final questions array:', questions);

    return {
        title: options.title || 'Imported Questionnaire',
        description: options.description || 'Imported from ' + (options.fileName || 'external file'),
        questions: questions,
        metadata: {
            importedAt: Date.now(),
            originalFormat: options.originalFormat || 'unknown',
            questionCount: questions.length
        }
    };
}

/**
 * Parses JSON content into questionnaire
 */
function parseJsonToQuestionnaire(json, options) {
    // Handle different JSON formats
    if (json.questions && Array.isArray(json.questions)) {
        // Standard Q-Gen format
        return {
            title: json.title || 'Imported Questionnaire',
            description: json.description || 'Imported JSON questionnaire',
            questions: json.questions.map((q, index) => normalizeQuestion(q, index + 1)),
            metadata: {
                importedAt: Date.now(),
                originalFormat: 'json',
                questionCount: json.questions.length
            }
        };
    } else if (Array.isArray(json)) {
        // Array of questions
        return {
            title: 'Imported Questionnaire',
            description: 'Imported from JSON array',
            questions: json.map((q, index) => normalizeQuestion(q, index + 1)),
            metadata: {
                importedAt: Date.now(),
                originalFormat: 'json',
                questionCount: json.length
            }
        };
    } else {
        throw new Error('Unrecognized JSON questionnaire format');
    }
}

/**
 * Parses CSV content into questionnaire
 */
function parseCsvToQuestionnaire(lines, options) {
    const questions = [];
    const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase());

    if (!headers || !headers.includes('question')) {
        throw new Error('CSV must have a "question" column');
    }

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const question = parseCsvRow(headers, values, i);
        if (question) {
            questions.push(question);
        }
    }

    return {
        title: 'Imported CSV Questionnaire',
        description: 'Imported from CSV file',
        questions: questions,
        metadata: {
            importedAt: Date.now(),
            originalFormat: 'csv',
            questionCount: questions.length
        }
    };
}

// --- QUESTION PARSING HELPERS ---

/**
 * Determines if a line is a header/metadata line
 */
function isHeaderLine(line) {
    const headerPatterns = [
        /^(title|survey|questionnaire):/i,
        /^(instructions?|note):/i,
        /^(date|version):/i,
        /^\s*$/,
        /^[-=_]{3,}$/
    ];

    return headerPatterns.some(pattern => pattern.test(line));
}

/**
 * Determines if a line starts a new question
 */
function isQuestionLine(line) {
    const questionPatterns = [
        /^(q\d+|question\s*\d+)[\.\):\s]/i,
        /^\d+[\.\)]\s/,
        /^[a-zA-Z]+[\.\)]\s/,
        // More flexible patterns for various question formats
        /^\s*\d+\.\s*.{10,}/,  // Numbered questions with substantial text
        /^\s*Q\d+/i,             // Q1, Q2, etc.
        /^\s*[A-Z]\d+/,          // S1, D1, etc.
        /please\s+(rate|indicate|select|choose)/i, // Question-like phrases
        /how\s+(often|likely|satisfied)/i,
        /what\s+(is|are|would)/i,
        /which\s+(of\s+the\s+following)/i
    ];

    // Skip very short lines and obvious headers
    if (line.length < 10) return false;
    if (/^(instructions?|note|title|survey|questionnaire):/i.test(line)) return false;

    // Also check if it doesn't look like an option
    const notOptionPatterns = [
        /^\s*[a-z]\.\s/,  // lowercase options
        /^\s*[ivx]+\.\s/i, // roman numerals
        /^\s*[•·▪▫-]\s/    // bullet points
    ];

    return questionPatterns.some(pattern => pattern.test(line)) &&
           !notOptionPatterns.some(pattern => pattern.test(line));
}

/**
 * Determines if a line is an option/choice
 */
function isOptionLine(line) {
    return Object.values(OPTION_PATTERNS).some(pattern => pattern.test(line));
}

/**
 * Parses a question line into a question object
 */
function parseQuestionLine(line, questionNumber) {
    // Extract question ID and text
    const idMatch = line.match(/^(q\d+|question\s*\d+|[a-zA-Z]+|\d+)[\.\):\s]/i);
    const id = idMatch ? idMatch[1].replace(/\s+/g, '').toUpperCase() : `Q${questionNumber}`;

    // Extract question text
    let text = line.replace(/^[^:\)\.]+[\.\):\s]*/, '').trim();

    // Auto-detect question type
    const mode = detectQuestionType(text);
    const type = detectQuestionSubtype(text, mode);

    return {
        id: id,
        text: text,
        mode: mode,
        type: type,
        options: [],
        conditions: { mode: 'none', rules: [] }
    };
}

/**
 * Parses an option line into an option object
 */
function parseOptionLine(line, optionNumber) {
    for (const [patternName, pattern] of Object.entries(OPTION_PATTERNS)) {
        const match = line.match(pattern);
        if (match) {
            const code = match[1] || optionNumber.toString();
            const label = match[2] || match[1];

            return {
                code: code,
                label: label.trim(),
                terminate: QUESTION_PATTERNS.terminate.test(label)
            };
        }
    }

    // Fallback - treat whole line as label
    return {
        code: optionNumber.toString(),
        label: line.trim(),
        terminate: QUESTION_PATTERNS.terminate.test(line)
    };
}

/**
 * Detects question type from text
 */
function detectQuestionType(text) {
    if (QUESTION_PATTERNS.table.test(text)) return 'table';
    if (QUESTION_PATTERNS.numeric.test(text)) return 'numeric';
    if (QUESTION_PATTERNS.openEnded.test(text)) return 'open';
    if (QUESTION_PATTERNS.multiSelect.test(text)) return 'list';
    return 'list'; // Default to list
}

/**
 * Detects question subtype
 */
function detectQuestionSubtype(text, mode) {
    if (mode === 'list') {
        if (QUESTION_PATTERNS.multiSelect.test(text)) return 'multi';
        return 'single';
    }
    if (mode === 'numeric') {
        if (text.includes('age')) return 'numeric_count';
        if (text.includes('year')) return 'numeric_time';
        return 'numeric_open';
    }
    return null;
}

// --- VALIDATION AND CLEANUP ---

/**
 * Validates and cleans up imported questionnaire
 */
function validateImportedQuestionnaire(questionnaire) {
    const cleaned = {
        ...questionnaire,
        questions: questionnaire.questions.map((q, index) => cleanQuestion(q, index))
    };

    // Generate missing IDs
    cleaned.questions.forEach((q, index) => {
        if (!q.id || q.id.trim() === '') {
            q.id = index < 5 ? `S${index + 1}` : `Q${index - 4}`;
        }
    });

    return cleaned;
}

/**
 * Cleans and normalizes a question object
 */
function cleanQuestion(question, index) {
    const cleaned = {
        id: question.id || `Q${index + 1}`,
        text: question.text || '',
        mode: question.mode || 'list',
        type: question.type || 'single',
        options: question.options || [],
        conditions: question.conditions || { mode: 'none', rules: [] }
    };

    // Clean options
    cleaned.options = cleaned.options.map((opt, optIndex) => ({
        code: opt.code || (optIndex + 1).toString(),
        label: opt.label || `Option ${optIndex + 1}`,
        terminate: opt.terminate || false
    }));

    return cleaned;
}

/**
 * Finalizes question during parsing
 */
function finalizeQuestion(question) {
    // If no options detected but looks like a list question, add default options
    if (question.mode === 'list' && question.options.length === 0) {
        if (QUESTION_PATTERNS.multiSelect.test(question.text)) {
            question.options = [
                { code: '1', label: 'Yes', terminate: false },
                { code: '2', label: 'No', terminate: false }
            ];
        } else {
            // Look for common Yes/No patterns
            if (/\b(yes|no)\b/i.test(question.text)) {
                question.options = [
                    { code: '1', label: 'Yes', terminate: false },
                    { code: '2', label: 'No', terminate: false }
                ];
            }
        }
    }

    return question;
}

/**
 * Normalizes question from different formats
 */
function normalizeQuestion(question, index) {
    return {
        id: question.id || question.qid || `Q${index}`,
        text: question.text || question.question || question.title || '',
        mode: question.mode || question.type || 'list',
        type: question.subtype || question.questionType || 'single',
        options: normalizeOptions(question.options || question.choices || []),
        conditions: question.conditions || { mode: 'none', rules: [] }
    };
}

/**
 * Normalizes options from different formats
 */
function normalizeOptions(options) {
    if (!Array.isArray(options)) return [];

    return options.map((opt, index) => {
        if (typeof opt === 'string') {
            return {
                code: (index + 1).toString(),
                label: opt,
                terminate: false
            };
        }

        return {
            code: opt.code || opt.value || (index + 1).toString(),
            label: opt.label || opt.text || opt.option || '',
            terminate: opt.terminate || opt.disqualify || false
        };
    });
}

/**
 * Parses CSV row into question
 */
function parseCsvRow(headers, values, rowIndex) {
    const questionIndex = headers.indexOf('question');
    const typeIndex = headers.indexOf('type');
    const optionsIndex = headers.indexOf('options');

    if (questionIndex === -1 || !values[questionIndex]) return null;

    const question = {
        id: values[headers.indexOf('id')] || `Q${rowIndex}`,
        text: values[questionIndex],
        mode: values[typeIndex] || 'list',
        type: values[headers.indexOf('subtype')] || 'single',
        options: [],
        conditions: { mode: 'none', rules: [] }
    };

    // Parse options if provided
    if (optionsIndex !== -1 && values[optionsIndex]) {
        const optionText = values[optionsIndex];
        const options = optionText.split('|').map((opt, index) => ({
            code: (index + 1).toString(),
            label: opt.trim(),
            terminate: false
        }));
        question.options = options;
    }

    return question;
}

/**
 * Gets file type from extension
 */
function getFileTypeFromExtension(fileName) {
    const ext = fileName.toLowerCase().split('.').pop();
    const typeMap = {
        'docx': IMPORT_FORMATS.DOCX,
        'xlsx': IMPORT_FORMATS.XLSX,
        'json': IMPORT_FORMATS.JSON,
        'csv': IMPORT_FORMATS.CSV,
        'txt': IMPORT_FORMATS.TXT
    };
    return typeMap[ext] || IMPORT_FORMATS.TXT;
}