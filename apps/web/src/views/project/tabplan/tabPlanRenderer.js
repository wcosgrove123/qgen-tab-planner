/**
 * Tab Plan Preview Renderer
 * Extensible system for generating live tab plan previews
 * Based on Python tabplan_writer.py format with room for advanced table evolution
 */

import { getQuestionOptions } from '../../../lib/tabPlanNets.js';
import { expandBaseLogic, getRawBaseLogic } from './logicExpander.js';
import { formatQuestionNets } from './netsFormatter.js';
import { getTabInstructions } from './instructionsExtractor.js';
import { getConditionsDescription } from '../../../lib/conditionalLogic.js';

// Column configuration matching Python export
const COLUMNS = [
    "Q#",
    "Base Verbiage",
    "Base Definition",
    "Nets (English & code #s)",
    "Additional Table Instructions"
];

const COL_WIDTHS = [80, 350, 250, 280, 300]; // pixels - 5 columns
const DEFAULT_BASE_VERB = "Total (qualified respondents)";

// Question type handlers registry (extensible)
const questionHandlers = new Map();
const dataExtractors = new Map();
const outputFormatters = new Map();

// Core renderer class
export class TabPlanRenderer {
    constructor(options = {}) {
        this.options = {
            theme: 'cue',
            zebraStripes: true,
            showSections: true,
            ...options
        };
    }

    // Plugin registration methods
    static registerQuestionType(type, handler) {
        questionHandlers.set(type, handler);
    }

    static registerDataExtractor(name, extractor) {
        dataExtractors.set(name, extractor);
    }

    static registerFormatter(name, formatter) {
        outputFormatters.set(name, formatter);
    }

    // Main render method
    render(hostEl, projectData) {
        const questions = this.getProcessedQuestions(projectData);
        const sections = this.groupQuestionsBySection(questions);
        const htmlContent = this.buildHTML(sections, projectData);

        hostEl.innerHTML = htmlContent;
        this.attachEventHandlers(hostEl);
    }

    // Process questions through extensible pipeline
    getProcessedQuestions(projectData) {
        const questions = projectData?.questions || window.state?.questions || [];

        console.log('🔍 Processing questions from Supabase:', questions.length);
        questions.forEach((q, index) => {
            console.log(`📋 Question ${index + 1}:`, {
                id: q.id,
                type: q.type,
                mode: q.mode,
                title: q.title || q.text,
                advancedTable: q.advancedTable,
                advanced_table_config: q.advanced_table_config,
                fullQuestion: q
            });
        });

        return questions
            .filter(q => this.shouldIncludeInTabPlan(q))
            .map(q => {
                const handler = this.getQuestionHandler(q.type);
                return handler.process(q, projectData);
            }).filter(Boolean);
    }

    // Determine if a question should be included in the tab plan
    shouldIncludeInTabPlan(question) {
        console.log('🔍 Tab Plan Filter Check:', {
            questionId: question.id,
            type: question.type,
            mode: question.mode,
            shouldInclude: true
        });

        // Hide text-only questions (informational content, no data collection)
        const textOnlyTypes = ['TXT_1', 'STXT_1'];
        if (textOnlyTypes.includes(question.type)) {
            console.log('❌ Filtering out text-only question:', question.id);
            return false;
        }

        // Hide questions in 'text' mode (text question type)
        if (question.mode === 'text') {
            console.log('❌ Filtering out text mode question:', question.id);
            return false;
        }

        console.log('✅ Including question in tab plan:', question.id);
        return true;
    }

    // Get appropriate handler for question type (extensible)
    getQuestionHandler(questionType) {
        console.log('🔧 Getting handler for question type:', questionType);
        console.log('📋 Available handlers:', Array.from(questionHandlers.keys()));

        // Check for registered handler
        if (questionHandlers.has(questionType)) {
            console.log('✅ Found specific handler for:', questionType);
            return questionHandlers.get(questionType);
        }

        // Check for advanced table types (future expansion)
        if (questionType?.includes('grid') || questionType?.includes('table')) {
            console.log('🔧 Using table handler for:', questionType);
            return questionHandlers.get('table') || new BasicQuestionHandler();
        }

        // Fallback to basic handler
        console.log('⚠️ Using basic handler for:', questionType);
        return questionHandlers.get('basic') || new BasicQuestionHandler();
    }

    // Group questions into sections (Screener, Main Survey)
    groupQuestionsBySection(questions) {
        const sections = new Map();

        questions.forEach(q => {
            const sectionName = this.getSectionName(q.id);
            if (!sections.has(sectionName)) {
                sections.set(sectionName, []);
            }
            sections.get(sectionName).push(q);
        });

        return sections;
    }

    getSectionName(qid) {
        const id = String(qid || '').trim().toUpperCase();
        return id.startsWith('S') ? 'Screener' : 'Main Survey';
    }

    // Build HTML structure
    buildHTML(sections, projectData) {
        const project = projectData?.project || window.state?.globals || {};

        const headerHTML = this.buildHeader(project);
        const tableHTML = this.buildTable(sections);
        const footerHTML = this.buildFooter();

        const fullHTML = `
            <div class="tab-plan-preview" id="tabPlanPreview">
                ${headerHTML}
                ${tableHTML}
                ${footerHTML}
            </div>
        `;

        return fullHTML;
    }

    buildHeader(project) {
        // Get project data from window.state if not passed directly
        const projectData = project || window.state?.globals || {};
        const projectName = projectData.name || window.state?.project?.name || 'Untitled Project';
        const projectType = projectData.project_type || window.state?.project?.project_type || '';
        const client = projectData.client || window.state?.project?.client || '';

        // Build title with project type if available
        const title = projectType ? `${projectName}: ${projectType}` : projectName;

        // Count questions from our current data structure
        const questionCount = (window.state?.questions || []).length;

        return `
            <div class="tab-plan-header">
                <h2 class="tab-plan-title">${escapeHTML(title)}</h2>
                <div class="tab-plan-meta">
                    ${client ? `<span class="meta-item">Client: ${escapeHTML(client)}</span>` : ''}
                    <span class="meta-item">Questions: ${questionCount}</span>
                    <span class="meta-item">Generated: ${new Date().toLocaleDateString()}</span>
                </div>
                <div class="tab-plan-notes">
                    <p>• Provide a banner by banner tables</p>
                    <p>• Provide means and medians and stats for all numeric questions</p>
                    <p>• Excel – 2 files: No freqs, just percentages. Zero decimals with a % sign.</p>
                    <p>• Need SPSS File</p>
                </div>
            </div>
        `;
    }

    buildTable(sections) {
        let tableHTML = `
            <div class="tab-plan-table">
                ${this.buildTableHeader()}
        `;

        let rowIndex = 0;
        for (const [sectionName, questions] of sections) {
            // Skip empty sections
            if (questions.length === 0) {
                continue;
            }

            if (this.options.showSections) {
                tableHTML += this.buildSectionHeader(sectionName);
            }

            questions.forEach(q => {
                const isEven = rowIndex % 2 === 0;
                tableHTML += this.buildQuestionRow(q, isEven);
                rowIndex++;

                // Add summary rows for complex questions (like Likert with 3+ statements)
                if (q.summaryRows) {
                    q.summaryRows.forEach(summaryRow => {
                        const isEvenSummary = rowIndex % 2 === 0;
                        tableHTML += this.buildQuestionRow(summaryRow, isEvenSummary);
                        rowIndex++;
                    });
                }
            });
        }

        tableHTML += `
            </div>
        `;

        return tableHTML;
    }

    buildTableHeader() {
        return `
            <div class="tab-plan-header-row">
                <div class="tab-plan-header-cell single-column">
                    <div class="column-grid">
                        ${COLUMNS.map((col, i) => `
                            <div class="grid-header-cell">${col}</div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    buildSectionHeader(sectionName) {
        return `
            <div class="tab-plan-section-header">
                <div class="section-title single-column">
                    <div class="section-title-text">${sectionName}</div>
                </div>
            </div>
        `;
    }

    buildQuestionRow(questionData, isEven) {
        const zebraClass = (this.options.zebraStripes && isEven) ? 'zebra' : '';

        return `
            <div class="tab-plan-row ${zebraClass}" data-qid="${questionData.id}">
                <div class="tab-plan-cell single-column">
                    <div class="column-grid">
                        <div class="grid-cell qid-cell">${escapeHTML(questionData.id || '')}</div>
                        <div class="grid-cell base-verb-cell">${questionData.baseVerbiage || DEFAULT_BASE_VERB}</div>
                        <div class="grid-cell base-def-cell">${escapeHTML(questionData.baseDefinition || '')}</div>
                        <div class="grid-cell nets-cell">${escapeHTML(questionData.nets || '')}</div>
                        <div class="grid-cell instructions-cell">${escapeHTML(questionData.additionalInstructions || '')}</div>
                    </div>
                </div>
            </div>
        `;
    }

    buildFooter() {
        return `
            <div class="tab-plan-footer">
                <div class="footer-left">Cue Insights | Confidential</div>
                <div class="footer-right">${new Date().toLocaleString()}</div>
            </div>
        `;
    }

    attachEventHandlers(hostEl) {
        // Add real-time update handlers here
        // Listen for question changes, condition updates, etc.
        this.setupRealTimeUpdates(hostEl);
    }

    setupRealTimeUpdates(hostEl) {
        // Watch for changes to questions and re-render affected rows
        if (window.state) {
            // Hook into the existing state change system
            const originalQueueAutosave = window.queueAutosave;
            window.queueAutosave = (...args) => {
                if (originalQueueAutosave) originalQueueAutosave(...args);
                this.scheduleUpdate(hostEl);
            };
        }
    }

    scheduleUpdate(hostEl) {
        // Debounced update to prevent excessive re-renders
        clearTimeout(this._updateTimeout);
        this._updateTimeout = setTimeout(() => {
            this.render(hostEl, { questions: window.state?.questions || [] });
        }, 500);
    }
}

// Basic question handler (default)
class BasicQuestionHandler {
    process(question, projectData) {
        return {
            id: question.id,
            type: question.type,
            baseVerbiage: this.extractBaseVerbiage(question),
            baseDefinition: this.extractBaseDefinition(question),
            nets: this.extractNets(question),
            additionalInstructions: this.extractInstructions(question)
        };
    }

    extractBaseVerbiage(question) {
        // Base Verbiage = cleaned-up human-readable conditional logic
        try {
            if (!question.conditions || question.conditions.mode === 'none' ||
                !question.conditions.rules || question.conditions.rules.length === 0) {
                return DEFAULT_BASE_VERB;
            }

            // Get the full description and clean up HTML
            const description = getConditionsDescription(question.conditions, window.state?.questions || []);
            if (description === 'No conditions set') {
                return DEFAULT_BASE_VERB;
            }

            // Clean up HTML content - remove spans, pipes, etc.
            return this.cleanHTMLForDisplay(description);
        } catch (e) {
            console.warn('Error extracting base verbiage for', question.id, e);
            return DEFAULT_BASE_VERB;
        }
    }

    extractBaseDefinition(question) {
        // Base Definition = raw conditional logic equation (like "S4 = 1,2")
        try {
            if (!question.conditions || question.conditions.mode === 'none' ||
                !question.conditions.rules || question.conditions.rules.length === 0) {
                return '';
            }

            // Extract just the raw equation part
            return this.extractRawConditionEquation(question.conditions);
        } catch (e) {
            console.warn('Error extracting base definition for', question.id, e);
            return '';
        }
    }

    // Helper function to clean HTML and make readable
    cleanHTMLForDisplay(htmlText) {
        if (!htmlText) return '';

        // Create a temporary element to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = htmlText;

        // Replace pipe indicators with their readable text
        const pipeElements = temp.querySelectorAll('.pipe-indicator');
        pipeElements.forEach(pipe => {
            const pipeCode = pipe.dataset.pipeCode;
            const questionId = pipe.dataset.questionId;

            // Try to resolve the pipe to actual text
            const resolvedText = this.resolvePipeText(pipeCode, questionId);
            pipe.replaceWith(document.createTextNode(resolvedText));
        });

        // Get clean text content
        return temp.textContent || temp.innerText || htmlText;
    }

    // Helper function to extract raw condition equation
    extractRawConditionEquation(conditions) {
        if (!conditions.rules || conditions.rules.length === 0) {
            return '';
        }

        const equations = conditions.rules.map(rule => {
            const qid = rule.source_qid || '';
            const operator = rule.operator || '==';
            const values = Array.isArray(rule.values) ? rule.values : [rule.values];

            // Simple operator mapping
            const opMap = {
                '==': '=',
                '!=': '≠',
                '>': '>',
                '>=': '≥',
                '<': '<',
                '<=': '≤',
                'in': '=',
                'not_in': '≠'
            };

            const displayOp = opMap[operator] || operator;
            const valuesList = values.filter(v => v !== null && v !== undefined && v !== '').join(',');

            return `${qid} ${displayOp} ${valuesList}`;
        });

        const logic = conditions.logic === 'OR' ? ' OR ' : ' AND ';
        return equations.join(logic);
    }

    // Helper function to resolve pipe text
    resolvePipeText(pipeCode, questionId) {
        try {
            // This is a simplified version - you might want to enhance this
            // to actually resolve the pipe codes to real option text
            if (pipeCode && pipeCode.includes(':')) {
                const parts = pipeCode.split(':');
                if (parts.length > 1) {
                    return parts[1].replace(/[{}]/g, ''); // Remove braces, return codes
                }
            }
            return pipeCode || questionId || 'selected options';
        } catch (e) {
            return 'selected options';
        }
    }

    extractNets(question) {
        // Default: format nets from Tab Plan
        try {
            return formatQuestionNets(question) || '';
        } catch (e) {
            console.warn('Error formatting nets for', question.id, e);
            return '';
        }
    }

    extractInstructions(question) {
        // Default: get from Tab Plan textarea
        try {
            return getTabInstructions(question) || '';
        } catch (e) {
            console.warn('Error extracting instructions for', question.id, e);
            return '';
        }
    }
}

// Register default handlers
TabPlanRenderer.registerQuestionType('basic', new BasicQuestionHandler());
TabPlanRenderer.registerQuestionType('single', new BasicQuestionHandler());
TabPlanRenderer.registerQuestionType('multi', new BasicQuestionHandler());
TabPlanRenderer.registerQuestionType('numeric', new BasicQuestionHandler());

// Advanced table handlers (placeholder for future)
class TableQuestionHandler extends BasicQuestionHandler {
    process(question, projectData) {
        const basicData = super.process(question, projectData);

        // Future: Add advanced table processing
        if (question.advancedTable) {
            return this.processAdvancedTable(basicData, question, projectData);
        }

        return basicData;
    }

    processAdvancedTable(basicData, question, projectData) {
        // Placeholder for future advanced table processing
        // Will handle: multi_source tables, complex nets, conditional logic
        return {
            ...basicData,
            // Future fields:
            // matrixInstructions: processMatrixInstructions(question.advancedTable),
            // conditionalRules: processConditionalRules(question.advancedTable.conditionalLogic),
            // customProcessing: true
        };
    }
}

TabPlanRenderer.registerQuestionType('table', new TableQuestionHandler());
TabPlanRenderer.registerQuestionType('grid_single', new TableQuestionHandler());
TabPlanRenderer.registerQuestionType('grid_multi', new TableQuestionHandler());

// Likert handler with auto-enhancement (matching Python logic)
class LikertQuestionHandler extends BasicQuestionHandler {
    process(question, projectData) {
        const basicData = super.process(question, projectData);

        // Auto-detect Likert and enhance
        if (this.isLikertQuestion(question)) {
            return this.enhanceLikertQuestion(basicData, question);
        }

        return basicData;
    }

    isLikertQuestion(question) {
        // NEW: Primary detection using table taxonomy
        if (question.table_type?.startsWith('likert_')) {
            return true;
        }

        // FALLBACK: Legacy detection for non-migrated questions
        const type = question.question_type?.toLowerCase() || question.type?.toLowerCase() || '';
        const mode = question.mode?.toLowerCase() || '';
        const hasStatements = question.statements?.length > 0;
        const hasScale = question.scale?.labels?.length > 0;

        // Check for advanced table Likert modes (preset library)
        const isAdvancedTableLikert = question.mode === 'advanced_table' &&
            ['likert_agreement', 'likert_sentiment', 'likert_custom'].includes(question.advancedTable?.tableVariation);

        // Additional check: Advanced table OR grid questions with Likert-like column patterns
        const hasLikertColumns = (question.mode === 'advanced_table' || type.startsWith('grid')) &&
            (question.advancedTable?.cols?.length >= 4 || question.grid?.cols?.length >= 4) &&
            this.detectLikertColumnPattern(question.advancedTable?.cols || question.grid?.cols || []);

        // CRITICAL: Check for grid_single questions that are actually advanced tables with mode
        const isGridWithAdvancedMode = (type === 'grid_single' || type === 'grid_multi') &&
            mode === 'advanced_table' &&
            hasLikertColumns;

        console.log('🔍 Likert Detection Debug:', {
            questionId: question.id,
            table_type: question.table_type,
            type,
            mode,
            hasStatements,
            hasScale,
            isAdvancedTableLikert,
            hasLikertColumns,
            isGridWithAdvancedMode,
            tableVariation: question.advancedTable?.tableVariation,
            advancedTableCols: question.advancedTable?.cols,
            gridCols: question.grid?.cols
        });

        return type.startsWith('likert') || (hasStatements && hasScale) || isAdvancedTableLikert || hasLikertColumns || isGridWithAdvancedMode;
    }

    // Helper method to detect Likert scale column patterns
    detectLikertColumnPattern(cols) {
        if (!cols || cols.length < 4) return false;

        const colText = cols.join(' ').toLowerCase();

        // Check for common Likert patterns
        const likertPatterns = [
            // Satisfaction patterns
            ['dissatisfied', 'satisfied'],
            ['very dissatisfied', 'very satisfied'],

            // Agreement patterns
            ['disagree', 'agree'],
            ['strongly disagree', 'strongly agree'],

            // Frequency patterns
            ['never', 'always'],
            ['rarely', 'frequently'],

            // Quality patterns
            ['poor', 'excellent'],
            ['very poor', 'very good'],

            // General scale indicators
            ['neither', 'neutral'],
            ['somewhat', 'very']
        ];

        return likertPatterns.some(pattern =>
            pattern.every(keyword => colText.includes(keyword))
        );
    }

    enhanceLikertQuestion(basicData, question) {
        const statements = question.statements || [];
        const type = question.type?.toLowerCase() || '';
        const mode = question.mode?.toLowerCase() || '';

        const isAdvancedTableLikert = question.mode === 'advanced_table' &&
            ['likert_agreement', 'likert_sentiment', 'likert_custom'].includes(question.advancedTable?.tableVariation);

        // Check for Likert-like column pattern detection (both advancedTable and grid formats)
        const hasLikertColumns = (question.mode === 'advanced_table' || type.startsWith('grid')) &&
            (question.advancedTable?.cols?.length >= 4 || question.grid?.cols?.length >= 4) &&
            this.detectLikertColumnPattern(question.advancedTable?.cols || question.grid?.cols || []);

        // Check for grid questions that are actually advanced tables
        const isGridWithAdvancedMode = (type === 'grid_single' || type === 'grid_multi') &&
            mode === 'advanced_table' &&
            hasLikertColumns;

        // For advanced table Likert presets OR detected Likert patterns, always generate summary rows
        if (isAdvancedTableLikert || hasLikertColumns || isGridWithAdvancedMode) {
            return this.enhanceAdvancedTableLikert(basicData, question);
        }

        // Auto-add default nets if missing for regular Likert
        if (!basicData.nets) {
            basicData.nets = statements.length <= 2 ? "Net: T2B, B2B" : "Net: T2B, B2B";
        }

        // Auto-add instructions for multi-statement Likerts
        if (statements.length >= 3 && !basicData.additionalInstructions) {
            basicData.additionalInstructions = "Provide mean, show 1 table for each statement";
        }

        // Generate summary rows for 3+ statement Likerts
        if (statements.length >= 3) {
            const qPrefix = (question.id || '').replace('.', '_');
            basicData.summaryRows = ['TB', 'T2B', 'B2B', 'BB', 'Mean'].map(key => ({
                id: `${qPrefix}_${key} Summary`,
                specialVerbiage: '',
                baseVerbiage: basicData.baseVerbiage,
                baseDefinition: '',
                nets: '',
                additionalInstructions: this.getLikertSummaryInstruction(key)
            }));
        }

        return basicData;
    }

    enhanceAdvancedTableLikert(basicData, question) {
        console.log('🎯 Enhancing advanced table Likert question:', question.id);

        // NEW: Use table_metadata if available (preferred)
        const metadata = question.table_metadata;
        if (metadata?.auto_nets?.length) {
            const netTypes = metadata.auto_nets;
            basicData.nets = netTypes.join(', ');
            basicData.additionalInstructions = "Provide mean, show 1 table for each statement";

            // Generate summary rows using metadata
            const qPrefix = (question.id || '').replace('.', '_');
            const isT3B = netTypes.includes('T3B') || netTypes.includes('B3B');
            const netType = isT3B ? 'T3B' : 'T2B';
            const bottomNetType = isT3B ? 'B3B' : 'B2B';

            basicData.summaryRows = ['TB', netType, bottomNetType, 'BB', 'Mean'].map(key => ({
                id: `${qPrefix}_${key} Summary`,
                additionalInstructions: this.getLikertSummaryInstruction(key)
            }));

            console.log('✅ Used table_metadata for nets:', netTypes);
            return basicData;
        }

        // FALLBACK: Legacy detection for non-migrated questions
        const cols = question.advancedTable?.cols || question.grid?.cols || [];
        const scalePoints = cols.length;

        console.log('📊 Scale analysis (fallback):', {
            questionId: question.id,
            cols,
            scalePoints,
            source: question.advancedTable?.cols ? 'advancedTable' : 'grid'
        });

        // Determine T2B/T3B based on scale points
        const isT3B = scalePoints === 7 || scalePoints === 10;
        const netType = isT3B ? 'T3B' : 'T2B';
        const bottomNetType = isT3B ? 'B3B' : 'B2B';

        // Set main question nets and instructions
        basicData.nets = `${netType}, ${bottomNetType}`;
        basicData.additionalInstructions = "Provide mean, show 1 table for each statement";

        // Always generate summary rows for advanced table Likert presets
        const qPrefix = (question.id || '').replace(/\./g, '_');
        const summaryRows = ['TB', netType, bottomNetType, 'BB', 'Mean'].map(key => ({
            id: `${qPrefix}_${key} Summary`,
            type: question.type,
            baseVerbiage: basicData.baseVerbiage,
            baseDefinition: '',
            nets: '',
            additionalInstructions: this.getLikertSummaryInstruction(key)
        }));

        basicData.summaryRows = summaryRows;

        console.log('✅ Enhanced advanced table Likert question:', {
            questionId: question.id,
            scalePoints,
            netType,
            bottomNetType,
            summaryRowsCount: summaryRows.length,
            summaryRows: summaryRows.map(r => r.id)
        });

        return basicData;
    }

    getLikertSummaryInstruction(key) {
        const instructions = {
            "TB": "Show table for each statement with TB ratings data shown.",
            "T2B": "Show table for each statement with T2B ratings data shown.",
            "T3B": "Show table for each statement with T3B ratings data shown.",
            "B2B": "Show table for each statement with B2B ratings data shown.",
            "B3B": "Show table for each statement with B3B ratings data shown.",
            "BB": "Show table for each statement with BB ratings data shown.",
            "Mean": "Show table for each statement with mean data shown."
        };
        return instructions[key] || '';
    }
}

TabPlanRenderer.registerQuestionType('likert_agreement', new LikertQuestionHandler());
TabPlanRenderer.registerQuestionType('likert_sentiment', new LikertQuestionHandler());
TabPlanRenderer.registerQuestionType('likert_custom', new LikertQuestionHandler());
TabPlanRenderer.registerQuestionType('advanced_table', new LikertQuestionHandler());

// IMPORTANT: Register Likert handler for grid_single questions that might actually be advanced tables
TabPlanRenderer.registerQuestionType('grid_single', new LikertQuestionHandler());
TabPlanRenderer.registerQuestionType('grid_multi', new LikertQuestionHandler());

// Export singleton instance
export const tabPlanRenderer = new TabPlanRenderer();

// Export main render function for easy use
export function renderTabPlanPreview(hostEl, projectData = null) {
    try {
        tabPlanRenderer.render(hostEl, projectData || { questions: window.state?.questions || [] });
    } catch (error) {
        console.error('Error rendering tab plan preview:', error);
        hostEl.innerHTML = `
            <div class="tab-plan-error">
                <h3>Error Loading Tab Plan Preview</h3>
                <p>There was an error generating the tab plan preview. Please check the console for details.</p>
                <pre>${error.message}</pre>
            </div>
        `;
    }
}

// Helper functions
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function cleanQuestionText(text) {
    if (!text) return '';

    // Create a temporary div to parse HTML
    const div = document.createElement('div');
    div.innerHTML = text;

    // Keep only bold, italic, underline, and pipe formatting
    const allowedTags = ['b', 'strong', 'i', 'em', 'u', 'span'];
    const walker = document.createTreeWalker(
        div,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: function(node) {
                // Remove font styling but keep semantic formatting
                if (node.tagName.toLowerCase() === 'span') {
                    // Check if span has pipe formatting (contenteditable attributes)
                    const isPipe = node.hasAttribute('data-pipe-code') ||
                                  node.hasAttribute('data-question-id') ||
                                  node.className.includes('pipe-indicator');

                    if (!isPipe) {
                        // Remove non-pipe spans but keep content
                        return NodeFilter.FILTER_REJECT;
                    }
                }

                // Remove font-size, font-family styles
                if (node.style) {
                    node.style.fontSize = '';
                    node.style.fontFamily = '';
                }

                return allowedTags.includes(node.tagName.toLowerCase()) ?
                       NodeFilter.FILTER_ACCEPT :
                       NodeFilter.FILTER_REJECT;
            }
        }
    );

    // Clean unwanted elements while preserving text
    const elementsToRemove = [];
    let node;
    while (node = walker.nextNode()) {
        if (!allowedTags.includes(node.tagName.toLowerCase())) {
            elementsToRemove.push(node);
        }
    }

    // Replace unwanted elements with their text content
    elementsToRemove.forEach(el => {
        if (el.parentNode) {
            el.parentNode.replaceChild(document.createTextNode(el.textContent), el);
        }
    });

    // Get clean HTML (preserves bold/italic/underline/pipes)
    let cleanHTML = div.innerHTML;

    // Remove "Total (qualified respondents)" if it appears
    cleanHTML = cleanHTML.replace(/Total \(qualified respondents\)/gi, '').trim();

    return cleanHTML || '';
}