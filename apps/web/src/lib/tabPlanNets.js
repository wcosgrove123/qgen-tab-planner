/**
 * Tab Plan Nets Library
 * Core functionality for managing nets (grouped codes and numeric ranges) in tab plans
 */

// Likert Scale Defaults
function getDefaultLikertLabels(mode, points = 5) {
    const defaults = {
        'likert_agreement': {
            3: ['Disagree', 'Neither Agree nor Disagree', 'Agree'],
            5: ['Strongly Disagree', 'Disagree', 'Neither Agree nor Disagree', 'Agree', 'Strongly Agree'],
            7: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neither Agree nor Disagree', 'Somewhat Agree', 'Agree', 'Strongly Agree']
        },
        'likert_sentiment': {
            3: ['Dissatisfied', 'Neither', 'Satisfied'],
            5: ['Very Dissatisfied', 'Dissatisfied', 'Neither', 'Satisfied', 'Very Satisfied'],
            7: ['Very Dissatisfied', 'Dissatisfied', 'Somewhat Dissatisfied', 'Neither', 'Somewhat Satisfied', 'Satisfied', 'Very Satisfied']
        },
        'likert_custom': {
            3: ['Low', 'Medium', 'High'],
            5: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
            7: ['Very Low', 'Low', 'Somewhat Low', 'Medium', 'Somewhat High', 'High', 'Very High']
        }
    };

    const modeDefaults = defaults[mode] || defaults['likert_custom'];
    return modeDefaults[points] || modeDefaults[5]; // Default to 5-point if points not found
}

// Net Type Helpers
export function isNumericQuestion(q) {
    const type = String(q?.type || "").toLowerCase();
    const isNumericType = type.startsWith("numeric") || type === "num";

    // Check for mode-based numeric questions (modern approach)
    const isModeNumeric = q?.mode === 'numeric';

    // Additional check for numeric questions with dropdown subtype
    const hasNumericConfig = q?.numeric && typeof q.numeric === 'object';

    console.log(`isNumericQuestion check: type="${q?.type}", mode="${q?.mode}", isNumericType=${isNumericType}, isModeNumeric=${isModeNumeric}, hasNumericConfig=${hasNumericConfig}`);

    return isNumericType || isModeNumeric || (hasNumericConfig && ['input', 'dropdown', 'range', 'select'].includes(q.numeric.type));
}

export function isCodesQuestion(q) {
    const type = q?.type || '';

    // Standard codes questions
    if (['single', 'multi', 'grid_single', 'grid_multi'].includes(type)) {
        return true;
    }

    // Likert scale questions are also codes questions
    if (isLikertScale(q)) {
        return true;
    }

    return false;
}

export function isLikertScale(q) {
    // Strategy: Universal Likert detection that works for ANY scale type
    // including single/multi select, advanced tables, and explicit Likert modes

    // 1. Check for explicit Likert modes (legacy support)
    const mode = q?.mode;
    if (['likert_agreement', 'likert_sentiment', 'likert_custom'].includes(mode)) {
        return true;
    }

    // 2. Check for scale questions with enough points (4+)
    const scalePoints = q?.scale?.points;
    if (scalePoints && scalePoints >= 4) {
        return true;
    }

    // 3. Universal pattern detection for ALL question types (including advanced tables)
    const options = getAllQuestionOptions(q); // Use enhanced version
    if (options.length >= 4) {
        return detectLikertPattern(options);
    }

    return false;
}

// Enhanced option getter that handles ALL question types including advanced tables
export function getAllQuestionOptions(q) {
    console.log('=== getAllQuestionOptions DEBUG ===');
    console.log('Input question:', !!q);

    if (!q) {
        console.log('No question, returning empty');
        return [];
    }

    // Standard options (single/multi)
    console.log('Checking standard options...', Array.isArray(q.options), q.options?.length);
    if (Array.isArray(q.options) && q.options.length) {
        console.log('Found standard options:', q.options);
        const result = q.options.map((opt, i) => ({
            code: String(opt.code ?? (i + 1)),
            label: String(opt.label ?? ''),
            text: String(opt.label ?? '')
        }));
        console.log('Returning standard options:', result);
        return result;
    }

    // Advanced table columns (table mode questions)
    console.log('Checking table mode...', q.mode === 'table', Array.isArray(q.grid?.cols), q.grid?.cols?.length);
    console.log('Checking advanced_table mode...', q.mode === 'advanced_table', Array.isArray(q.grid?.cols), q.grid?.cols?.length);
    console.log('Checking advancedTable.cols...', Array.isArray(q.advancedTable?.cols), q.advancedTable?.cols?.length);

    if ((q.mode === 'table' || q.mode === 'advanced_table') && Array.isArray(q.grid?.cols) && q.grid.cols.length) {
        console.log('Found table mode columns:', q.grid.cols);
        const result = q.grid.cols.map((col, i) => ({
            code: String(i + 1),
            label: String(col ?? ''),
            text: String(col ?? '')
        }));
        console.log('Returning table columns as options:', result);
        return result;
    }

    // NEW: Check advancedTable.cols if grid.cols is empty (fixes preset likert questions)
    if (q.mode === 'advanced_table' && Array.isArray(q.advancedTable?.cols) && q.advancedTable.cols.length) {
        console.log('Found advancedTable columns:', q.advancedTable.cols);
        const result = q.advancedTable.cols.map((col, i) => ({
            code: String(i + 1),
            label: String(col ?? ''),
            text: String(col ?? '')
        }));
        console.log('Returning advancedTable columns as options:', result);
        return result;
    }

    // Regular grid questions
    console.log('Checking grid type...', q.type?.includes('grid'), Array.isArray(q.grid?.cols), q.grid?.cols?.length);
    if (q.type?.includes('grid') && Array.isArray(q.grid?.cols) && q.grid.cols.length) {
        console.log('Found grid columns:', q.grid.cols);
        const result = q.grid.cols.map((col, i) => ({
            code: String(i + 1),
            label: String(col ?? ''),
            text: String(col ?? '')
        }));
        console.log('Returning grid columns as options:', result);
        return result;
    }

    // Scale labels (existing Likert questions)
    console.log('Checking scale labels...', Array.isArray(q.scale?.labels), q.scale?.labels?.length);
    if (Array.isArray(q.scale?.labels) && q.scale.labels.length) {
        console.log('Found scale labels:', q.scale.labels);
        const result = q.scale.labels.map((label, i) => ({
            code: String(i + 1),
            label: String(label ?? ''),
            text: String(label ?? '')
        }));
        console.log('Returning scale labels as options:', result);
        return result;
    }

    console.log('No options found in any category');
    return [];
}

// Smart Likert pattern detection
function detectLikertPattern(options) {
    const labels = options.map(opt => String(opt.label || '').toLowerCase());
    const joinedText = labels.join(' ');

    // Enhanced Likert keyword patterns
    const likertPatterns = [
        // Agreement patterns
        ['strongly disagree', 'disagree', 'agree', 'strongly agree'],
        ['strongly', 'disagree', 'agree'],
        ['completely disagree', 'disagree', 'agree', 'completely agree'],

        // Satisfaction patterns
        ['very dissatisfied', 'dissatisfied', 'satisfied', 'very satisfied'],
        ['extremely dissatisfied', 'dissatisfied', 'satisfied', 'extremely satisfied'],
        ['unsatisfied', 'satisfied'],

        // Frequency patterns
        ['never', 'rarely', 'sometimes', 'often', 'always'],
        ['never', 'occasionally', 'frequently', 'always'],

        // Likelihood patterns
        ['very unlikely', 'unlikely', 'likely', 'very likely'],
        ['extremely unlikely', 'unlikely', 'likely', 'extremely likely'],

        // Quality/Rating patterns
        ['very poor', 'poor', 'good', 'very good', 'excellent'],
        ['terrible', 'poor', 'fair', 'good', 'excellent'],

        // Importance patterns
        ['not important', 'important', 'very important'],
        ['unimportant', 'important', 'extremely important'],

        // Intensity patterns
        ['not at all', 'slightly', 'moderately', 'very', 'extremely'],
        ['none', 'little', 'some', 'lot', 'great deal']
    ];

    // Check if any pattern matches
    for (const pattern of likertPatterns) {
        const matchCount = pattern.filter(keyword => joinedText.includes(keyword)).length;
        if (matchCount >= Math.ceil(pattern.length * 0.6)) { // 60% match threshold
            console.log(`Detected Likert pattern: ${pattern} (${matchCount}/${pattern.length} matches)`);
            return true;
        }
    }

    // Fallback: Check for scale-like numeric progression or symmetric patterns
    if (labels.length >= 4) {
        // Check for symmetric patterns (negative -> neutral -> positive)
        const hasNegative = labels.some(l =>
            l.includes('not') || l.includes('dis') || l.includes('un') ||
            l.includes('never') || l.includes('poor') || l.includes('bad') ||
            l.includes('low') || l.includes('weak')
        );
        const hasPositive = labels.some(l =>
            l.includes('very') || l.includes('good') || l.includes('excellent') ||
            l.includes('high') || l.includes('strong') || l.includes('always') ||
            l.includes('extremely')
        );
        const hasNeutral = labels.some(l =>
            l.includes('neutral') || l.includes('neither') || l.includes('moderate') ||
            l.includes('medium') || l.includes('sometimes') || l.includes('fair')
        );

        if ((hasNegative && hasPositive) || (hasNeutral && (hasNegative || hasPositive))) {
            console.log('Detected symmetric Likert scale pattern');
            return true;
        }
    }

    return false;
}

export function generateT2BNets(q) {
    if (!isLikertScale(q)) {
        return [];
    }

    const options = getQuestionOptions(q);
    const numOptions = options.length;

    // Only generate for 4+ point scales
    if (numOptions < 4) {
        return [];
    }

    const nets = [];

    // T2B (Top 2 Box) - Last 2 options (most positive)
    const t2bCodes = options.slice(-2).map(opt => opt.code);
    const t2bLabels = options.slice(-2).map(opt => opt.label).join(' + ');
    nets.push(createCodesNet({
        label: 'T2B',
        codes: t2bCodes
    }));

    // B2B (Bottom 2 Box) - First 2 options (most negative)
    const b2bCodes = options.slice(0, 2).map(opt => opt.code);
    const b2bLabels = options.slice(0, 2).map(opt => opt.label).join(' + ');
    nets.push(createCodesNet({
        label: 'B2B',
        codes: b2bCodes
    }));

    console.log('Generated T2B/B2B nets for Likert scale:', {
        questionId: q.id,
        numOptions,
        t2bCodes,
        b2bCodes,
        t2bLabels,
        b2bLabels
    });

    return nets;
}

export function generateT3BNets(q) {
    if (!isLikertScale(q)) {
        return [];
    }

    const options = getQuestionOptions(q);
    const numOptions = options.length;

    // Only generate for 6+ point scales (need at least 6 points for meaningful T3B/B3B)
    if (numOptions < 6) {
        return [];
    }

    const nets = [];

    // T3B (Top 3 Box) - Last 3 options (most positive)
    const t3bCodes = options.slice(-3).map(opt => opt.code);
    const t3bLabels = options.slice(-3).map(opt => opt.label).join(' + ');
    nets.push(createCodesNet({
        label: 'T3B',
        codes: t3bCodes
    }));

    // B3B (Bottom 3 Box) - First 3 options (most negative)
    const b3bCodes = options.slice(0, 3).map(opt => opt.code);
    const b3bLabels = options.slice(0, 3).map(opt => opt.label).join(' + ');
    nets.push(createCodesNet({
        label: 'B3B',
        codes: b3bCodes
    }));

    console.log('Generated T3B/B3B nets for Likert scale:', {
        questionId: q.id,
        numOptions,
        t3bCodes,
        b3bCodes,
        t3bLabels,
        b3bLabels
    });

    return nets;
}

export function autoConfigureNetsForScale(q, scalePoints) {
    console.log('Auto-configuring nets for scale:', { questionId: q?.id, scalePoints });

    // Clear existing nets first
    ensureTabBucket(q);
    q.tab.nets = [];

    let nets = [];

    if (scalePoints === 3) {
        // 3pt scales: No nets (can't make meaningful T2B with only 3 points)
        console.log('3pt scale detected - no nets configured');
        return [];
    } else if (scalePoints === 5) {
        // 5pt scales: T2B/B2B
        nets = generateT2BNets(q);
        console.log('5pt scale detected - configured T2B/B2B nets');
    } else if (scalePoints === 7 || scalePoints === 10) {
        // 7pt and 10pt scales: T3B/B3B
        nets = generateT3BNets(q);
        console.log(`${scalePoints}pt scale detected - configured T3B/B3B nets`);
    }

    // Add nets to question
    if (nets.length > 0) {
        q.tab.nets = nets;
        syncNetsWithQuestion(q);
        console.log('Added nets to question:', nets);
    }

    return nets;
}

// Net Constructors
export function createCodesNet({ label = null, codes = [] }) {
    const uniq = Array.from(new Set((codes || []).map(c => String(c))));
    return { kind: "codes", label: label ? String(label) : null, codes: uniq };
}

export function createRangeNet({ min, max, operator = '-', value1, value2, label = null }) {
    if (operator && value1 !== undefined) {
        // New operator-based format
        return {
            kind: "range",
            label: label,
            operator: operator,
            value1: Number(value1),
            value2: operator === '-' ? Number(value2) : null
        };
    } else {
        // Legacy min/max format
        const mn = Number(min), mx = Number(max);
        return { kind: "range", min: mn, max: mx, label: label };
    }
}

// Tab Bucket Management
export function ensureTabBucket(q) {
    if (!q) return null;
    if (!q.tab || typeof q.tab !== 'object') {
        q.tab = { nets: [], instructions: "" };
    } else {
        q.tab.nets = Array.isArray(q.tab.nets) ? q.tab.nets : [];
        q.tab.instructions = typeof q.tab.instructions === "string" ? q.tab.instructions : "";
    }
    return q.tab;
}

// Option Label Lookup
export function getOptionLabel(qid, code) {
    const questions = window.state?.questions || [];
    const q = questions.find(question => question.id === qid);
    if (!q) return String(code || '');

    // First try standard options
    const opt = (q.options || []).find(o => String(o.code || '') === String(code || ''));
    if (opt) {
        return opt.label || opt.text || String(code);
    }

    // For advanced table and grid questions, get all options and find by code
    const allOptions = getAllQuestionOptions(q);
    const foundOption = allOptions.find(o => String(o.code || '') === String(code || ''));
    return foundOption ? (foundOption.label || foundOption.text || String(code)) : String(code || '');
}

// Net Synchronization
export function syncNetsWithQuestion(q) {
    const tab = ensureTabBucket(q);
    if (!tab) return null;

    // For codes-nets, drop codes that no longer exist; for ranges, coerce & validate.
    tab.nets = (tab.nets || []).map(net => {
        if (net?.kind === "codes") {
            const labelOf = (code) => getOptionLabel(q.id, code);
            const kept = (net.codes || []).map(String).filter(c => !!labelOf(c));
            if (!kept.length) return null;
            return { kind: "codes", label: (net.label || null), codes: Array.from(new Set(kept)) };
        }
        if (net?.kind === "range") {
            // Handle new operator structure
            if (net.operator) {
                const v1 = Number(net.value1);
                if (!Number.isFinite(v1)) {
                    return null;
                }
                if (net.operator === '-') {
                    const v2 = Number(net.value2);
                    if (!Number.isFinite(v2) || v1 > v2) {
                        return null;
                    }
                }
                return net;
            }

            // Fallback for old min/max structure
            const mn = Number(net.min), mx = Number(net.max);
            if (Number.isFinite(mn) && Number.isFinite(mx) && mn <= mx) {
                return { kind: "range", min: mn, max: mx, label: net.label };
            }

            return null;
        }
        return null; // unknown kinds are dropped
    }).filter(Boolean);

    return tab;
}

// Sync all questions
export function syncAllNets() {
    const questions = window.state?.questions || [];
    questions.forEach(syncNetsWithQuestion);
}

// Net Management Functions
export function addNet(questionIndex, net, saveCallback = null) {
    const questions = window.state?.questions || [];
    const q = questions[questionIndex];
    if (!q) return false;

    ensureTabBucket(q);
    q.tab.nets.push(net);
    syncNetsWithQuestion(q);

    // Trigger save if callback is provided
    if (saveCallback && typeof saveCallback === 'function') {
        saveCallback(questionIndex, 'tab', q.tab);
    } else if (window.currentEditorActions?.onUpdateQuestion) {
        window.currentEditorActions.onUpdateQuestion(questionIndex, 'tab', q.tab);
    }

    return true;
}

export function updateNet(questionIndex, netIndex, updatedNet, saveCallback = null) {
    const questions = window.state?.questions || [];
    const q = questions[questionIndex];
    if (!q || !q.tab?.nets?.[netIndex]) return false;

    q.tab.nets[netIndex] = updatedNet;
    syncNetsWithQuestion(q);

    // Trigger save if callback is provided
    if (saveCallback && typeof saveCallback === 'function') {
        saveCallback(questionIndex, 'tab', q.tab);
    } else if (window.currentEditorActions?.onUpdateQuestion) {
        window.currentEditorActions.onUpdateQuestion(questionIndex, 'tab', q.tab);
    }

    return true;
}

export function deleteNet(questionIndex, netIndex, saveCallback = null) {
    const questions = window.state?.questions || [];
    const q = questions[questionIndex];
    if (!q || !q.tab?.nets) return false;

    q.tab.nets.splice(netIndex, 1);
    syncNetsWithQuestion(q);

    // Trigger save if callback is provided
    if (saveCallback && typeof saveCallback === 'function') {
        saveCallback(questionIndex, 'tab', q.tab);
    } else if (window.currentEditorActions?.onUpdateQuestion) {
        window.currentEditorActions.onUpdateQuestion(questionIndex, 'tab', q.tab);
    }

    return true;
}

// Get question options (includes handling for different question types)
export function getQuestionOptions(q) {
    console.log('=== getQuestionOptions DEBUG ===');
    console.log('Input question:', q);

    if (!q) {
        console.log('No question provided, returning empty array');
        return [];
    }

    console.log('Question type:', q.type);
    console.log('Question mode:', q.mode);
    console.log('Has options:', !!q.options, q.options?.length || 0);
    console.log('Has grid:', !!q.grid);
    console.log('Grid cols:', q.grid?.cols?.length || 0, q.grid?.cols);
    console.log('Grid rows:', q.grid?.rows?.length || 0, q.grid?.rows);
    console.log('Has scale:', !!q.scale);
    console.log('Scale labels:', q.scale?.labels?.length || 0, q.scale?.labels);
    console.log('Scale points:', q.scale?.points);

    // Use the enhanced universal option getter
    const options = getAllQuestionOptions(q);
    console.log('getAllQuestionOptions returned:', options.length, 'options:', options);

    if (options.length > 0) {
        console.log('Returning options from getAllQuestionOptions');
        return options;
    }

    console.log('getAllQuestionOptions returned empty, trying fallbacks...');

    // Fallback: Handle legacy Likert questions with mode but missing scale.labels
    if (['likert_agreement', 'likert_sentiment', 'likert_custom'].includes(q?.mode)) {
        const defaultLabels = getDefaultLikertLabels(q.mode, q.scale?.points || 5);

        // Initialize missing scale structure
        if (!q.scale) q.scale = {};
        if (!q.scale.labels) q.scale.labels = defaultLabels;
        if (!q.scale.points) q.scale.points = defaultLabels.length;

        console.log(`Initialized missing Likert scale labels for ${q.mode}:`, defaultLabels);

        return defaultLabels.map((label, i) => ({
            code: String(i + 1),
            label: String(label ?? ''),
            text: String(label ?? '')
        }));
    }

    // Handle numeric questions
    if (isNumericQuestion(q)) {
        // For numeric questions, return ranges from nets if available
        if (q.tab?.nets?.length) {
            return q.tab.nets.map((net, i) => {
                if (net.kind === 'range') {
                    let label = net.label;
                    if (!label) {
                        if (net.operator === '-') {
                            label = `${net.value1} - ${net.value2}`;
                        } else if (net.operator === 'exact') {
                            label = `${net.value1} (exact)`;
                        } else {
                            const opMap = { '>=': '≥', '<=': '≤', '>': '>', '<': '<', '+': '+' };
                            label = `${opMap[net.operator] || net.operator} ${net.value1}`;
                        }
                    }
                    return {
                        code: `range_${i}`,
                        label: label,
                        text: label
                    };
                }
                return null;
            }).filter(Boolean);
        }
        // Default numeric ranges if no nets defined
        return [
            { code: 'low', label: 'Low', text: 'Low' },
            { code: 'medium', label: 'Medium', text: 'Medium' },
            { code: 'high', label: 'High', text: 'High' }
        ];
    }

    return [];
}

// Net Summary Text Generation
export function getNetSummaryText(net, q) {
    if (!net) return '';

    if (net.kind === 'codes') {
        const labels = net.codes.map(code => getOptionLabel(q.id, code) || `Code ${code}`).join(', ');
        return `Net: ${labels}`;
    } else if (net.kind === 'range') {
        switch (net.operator) {
            case '+':
                return `Net: ${net.value1}+`;
            case '>':
                return `Net: > ${net.value1}`;
            case '>=':
                return `Net: ≥ ${net.value1}`;
            case '<':
                return `Net: < ${net.value1}`;
            case '<=':
                return `Net: ≤ ${net.value1}`;
            case 'exact':
                return `Net: ${net.value1} (exact)`;
            case '-':
            default:
                return `Net: ${net.value1} - ${net.value2}`;
        }
    }

    return 'Unknown net type';
}

// Validation
export function validateNet(net, q) {
    const errors = [];

    if (!net.kind) {
        errors.push('Net must have a kind (codes or range)');
        return errors;
    }

    if (net.kind === 'codes') {
        if (!Array.isArray(net.codes) || net.codes.length === 0) {
            errors.push('Codes net must have at least one code selected');
        }
        // Validate codes exist in question
        const validCodes = new Set((q.options || []).map(o => String(o.code || '')));
        const invalidCodes = net.codes.filter(code => !validCodes.has(String(code)));
        if (invalidCodes.length > 0) {
            errors.push(`Invalid codes: ${invalidCodes.join(', ')}`);
        }
    } else if (net.kind === 'range') {
        if (net.operator) {
            const v1 = Number(net.value1);
            if (!Number.isFinite(v1)) {
                errors.push('First value must be a valid number');
            }
            if (net.operator === '-') {
                const v2 = Number(net.value2);
                if (!Number.isFinite(v2)) {
                    errors.push('Second value must be a valid number for range');
                } else if (v1 > v2) {
                    errors.push('First value must be less than or equal to second value');
                }
            }
        } else {
            // Legacy validation
            const min = Number(net.min);
            const max = Number(net.max);
            if (!Number.isFinite(min) || !Number.isFinite(max)) {
                errors.push('Min and max must be valid numbers');
            } else if (min > max) {
                errors.push('Min must be less than or equal to max');
            }
        }
    }

    return errors;
}