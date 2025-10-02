/**
 * Nets Formatter Module
 * Formats nets from Tab Plan editor into display format for tab plan preview
 */

// Main formatter function
export function formatQuestionNets(question) {
    const nets = question.tab?.nets || [];
    if (!nets.length) return '';

    try {
        return formatNetsArray(nets, question);
    } catch (error) {
        console.warn('Error formatting nets for', question.id, error);
        return '';
    }
}

// Format array of nets
function formatNetsArray(nets, question) {
    if (!nets.length) return '';

    // Special handling for T2B/B2B and T3B/B3B pairs
    const tbBbPair = detectTBBBPair(nets);
    if (tbBbPair) {
        return `Net: ${tbBbPair}`;
    }

    // Default formatting for other nets
    const formattedNets = nets.map(net => formatSingleNet(net, question)).filter(Boolean);

    if (!formattedNets.length) return '';

    // Join multiple nets with commas
    return `Net: ${formattedNets.join(', ')}`;
}

// Detect and format T2B/B2B or T3B/B3B pairs
function detectTBBBPair(nets) {
    if (nets.length !== 2) return null;

    const labels = nets.map(net => net.label).filter(Boolean);

    // Check for T2B/B2B pair
    if (labels.includes('T2B') && labels.includes('B2B')) {
        return 'T2B, B2B';
    }

    // Check for T3B/B3B pair
    if (labels.includes('T3B') && labels.includes('B3B')) {
        return 'T3B, B3B';
    }

    return null;
}

// Format a single net
function formatSingleNet(net, question) {
    if (!net || !net.kind) return null;

    if (net.kind === 'codes') {
        return formatCodesNet(net, question);
    } else if (net.kind === 'range') {
        return formatRangeNet(net, question);
    }

    return null;
}

// Format codes net (e.g., "Top 2 Box (4-5)")
function formatCodesNet(net, question) {
    const codes = net.codes || [];
    if (!codes.length) return null;

    // Get option labels for codes
    const labels = codes.map(code => getOptionLabel(question, code)).filter(Boolean);
    const codesList = codes.join(', ');

    // Use custom label if provided, otherwise create from labels
    if (net.label) {
        return `${net.label} (${codesList})`;
    } else if (labels.length) {
        const labelText = labels.length === 2 ? labels.join(' or ') : labels.join(', ');
        return `${labelText} (${codesList})`;
    } else {
        return `Codes ${codesList}`;
    }
}

// Format range net (e.g., "Ages 18-34", "65+", "Score > 7")
function formatRangeNet(net, question) {
    const operator = net.operator || '-';
    const value1 = net.value1;
    const value2 = net.value2;

    // Use custom label if provided
    if (net.label) {
        return net.label;
    }

    // Generate label based on operator
    switch (operator) {
        case '-':
            if (value2 != null) {
                return `${value1}–${value2}`;
            }
            return `${value1}`;

        case '+':
            return `${value1}+`;

        case '>':
            return `>${value1}`;

        case '<':
            return `<${value1}`;

        case '>=':
            return `≥${value1}`;

        case '<=':
            return `≤${value1}`;

        case 'exact':
            return `${value1} (exact)`;

        default:
            return `${value1}${value2 != null ? `–${value2}` : ''}`;
    }
}

// Enhanced Likert net formatting (T2B, B2B detection)
export function formatLikertNets(question) {
    const nets = question.tab?.nets || [];
    const statements = question.statements || [];
    const scaleLabels = question.scale?.labels || [];

    // Auto-detect T2B/B2B for Likert scales
    if (isLikertQuestion(question) && !nets.length) {
        return generateDefaultLikertNets(scaleLabels);
    }

    // Format existing nets
    return formatQuestionNets(question);
}

// Check if question is Likert-type
function isLikertQuestion(question) {
    const type = question.type?.toLowerCase() || '';
    const hasStatements = question.statements?.length > 0;
    const hasScale = question.scale?.labels?.length > 0;

    return type.startsWith('likert') || (hasStatements && hasScale);
}

// Generate default T2B/B2B nets for Likert scales
function generateDefaultLikertNets(scaleLabels) {
    if (!scaleLabels?.length) return 'Net: T2B, B2B';

    const numOptions = scaleLabels.length;

    if (numOptions >= 4) {
        // Standard T2B (top 2) and B2B (bottom 2)
        const t2bCodes = [numOptions - 1, numOptions].join(','); // e.g., "4,5" for 5-point scale
        const b2bCodes = [1, 2].join(','); // "1,2"

        return `Net: T2B (${t2bCodes}), B2B (${b2bCodes})`;
    } else {
        return 'Net: T2B, B2B';
    }
}

// Advanced nets formatting for complex tables (future expansion)
export function formatAdvancedTableNets(question) {
    const advancedTable = question.advancedTable;
    if (!advancedTable) {
        return formatQuestionNets(question);
    }

    // Future: Handle complex table nets
    // - Multi-source table nets
    // - Conditional nets based on source questions
    // - Matrix-specific net calculations

    return formatQuestionNets(question); // Fallback for now
}

// Custom net processing hooks (for future extension)
export function formatCustomNets(question, processor) {
    if (!processor) return formatQuestionNets(question);

    try {
        return processor.formatNets(question);
    } catch (error) {
        console.warn('Error in custom nets processor:', error);
        return formatQuestionNets(question); // Fallback
    }
}

// Get option label for a specific code
function getOptionLabel(question, code) {
    if (!question) return String(code);

    // Try different option sources based on question type
    let options = [];

    if (question.options) {
        options = question.options;
    } else if (question.scale?.labels) {
        options = question.scale.labels.map((label, i) => ({
            code: String(i + 1),
            label: label
        }));
    } else if (question.grid?.rows) {
        options = question.grid.rows.map((row, i) => ({
            code: String(i + 1),
            label: row
        }));
    }

    const option = options.find(opt => String(opt.code || '') === String(code));
    return option ? (option.label || option.text || String(code)) : String(code);
}

// Export additional utilities
export {
    formatNetsArray,
    formatSingleNet,
    formatCodesNet,
    formatRangeNet,
    isLikertQuestion,
    generateDefaultLikertNets
};