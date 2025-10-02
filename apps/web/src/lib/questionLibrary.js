/**
 * questionLibrary.js
 *
 * Question Library System for Q-Gen
 * Provides functionality to save, organize, and reuse questions across projects.
 * Supports client-based organization, search, tagging, and smart categorization.
 */

// --- CONSTANTS ---
const LIBRARY_STORAGE_KEY = 'qgen_question_library';
const LIBRARY_CATEGORIES = {
    screener: 'Screener Questions',
    demographics: 'Demographics',
    satisfaction: 'Satisfaction & Feedback',
    brand: 'Brand & Awareness',
    usage: 'Usage & Behavior',
    attitude: 'Attitudes & Opinions',
    preference: 'Preferences & Choice',
    numeric: 'Numeric & Scales',
    open: 'Open-ended',
    table: 'Grids & Tables',
    custom: 'Custom/Other'
};

// --- DATA STRUCTURE ---

/**
 * Library Question Structure:
 * {
 *   id: string,
 *   title: string,
 *   description: string,
 *   category: string,
 *   tags: string[],
 *   clientId: string,
 *   clientName: string,
 *   questionData: object, // The actual question object
 *   createdAt: timestamp,
 *   updatedAt: timestamp,
 *   usageCount: number,
 *   lastUsed: timestamp
 * }
 */

// --- CORE LIBRARY FUNCTIONS ---

/**
 * Gets the entire question library from storage
 * @returns {Array} Array of library questions
 */
export function getQuestionLibrary() {
    try {
        const stored = localStorage.getItem(LIBRARY_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading question library:', error);
        return [];
    }
}

/**
 * Saves the question library to storage
 * @param {Array} library - Array of library questions
 */
export function saveQuestionLibrary(library) {
    try {
        localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
    } catch (error) {
        console.error('Error saving question library:', error);
    }
}

/**
 * Adds a question to the library
 * @param {Object} question - The question object to save
 * @param {Object} metadata - Additional metadata (title, description, category, etc.)
 * @returns {string} The ID of the saved library question
 */
export function addQuestionToLibrary(question, metadata = {}) {
    console.log('addQuestionToLibrary called with:', { question, metadata });

    const library = getQuestionLibrary();
    console.log('Current library:', library);

    const libraryQuestion = {
        id: generateLibraryId(),
        title: metadata.title || question.text || 'Untitled Question',
        description: metadata.description || '',
        category: metadata.category || autoDetectCategory(question),
        tags: metadata.tags || autoGenerateTags(question),
        clientId: metadata.clientId || 'default',
        clientName: metadata.clientName || 'General',
        questionData: cleanQuestionForLibrary(question),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        usageCount: 0,
        lastUsed: null
    };

    console.log('Created library question:', libraryQuestion);

    library.push(libraryQuestion);
    saveQuestionLibrary(library);

    console.log('Library after save:', getQuestionLibrary());

    return libraryQuestion.id;
}

/**
 * Removes a question from the library
 * @param {string} libraryQuestionId - ID of the library question to remove
 */
export function removeQuestionFromLibrary(libraryQuestionId) {
    let library = getQuestionLibrary();
    library = library.filter(q => q.id !== libraryQuestionId);
    saveQuestionLibrary(library);
}

/**
 * Updates a question in the library
 * @param {string} libraryQuestionId - ID of the library question to update
 * @param {Object} updates - Updates to apply
 */
export function updateLibraryQuestion(libraryQuestionId, updates) {
    const library = getQuestionLibrary();
    const questionIndex = library.findIndex(q => q.id === libraryQuestionId);

    if (questionIndex !== -1) {
        library[questionIndex] = {
            ...library[questionIndex],
            ...updates,
            updatedAt: Date.now()
        };
        saveQuestionLibrary(library);
    }
}

/**
 * Gets a question from the library by ID
 * @param {string} libraryQuestionId - ID of the library question
 * @returns {Object|null} The library question or null if not found
 */
export function getLibraryQuestion(libraryQuestionId) {
    const library = getQuestionLibrary();
    return library.find(q => q.id === libraryQuestionId) || null;
}

/**
 * Inserts a library question into a project
 * @param {string} libraryQuestionId - ID of the library question
 * @param {Object} insertOptions - Options for insertion (generateNewId, etc.)
 * @returns {Object} The question object ready for insertion
 */
export function insertLibraryQuestion(libraryQuestionId, insertOptions = {}) {
    const libraryQuestion = getLibraryQuestion(libraryQuestionId);
    if (!libraryQuestion) return null;

    // Update usage statistics
    updateLibraryQuestion(libraryQuestionId, {
        usageCount: libraryQuestion.usageCount + 1,
        lastUsed: Date.now()
    });

    // Prepare question for insertion
    const question = JSON.parse(JSON.stringify(libraryQuestion.questionData));

    if (insertOptions.generateNewId !== false) {
        question.id = ''; // Let the editor generate a new ID
    }

    return question;
}

// --- SEARCH AND FILTERING ---

/**
 * Searches the question library
 * @param {Object} filters - Search filters
 * @returns {Array} Filtered library questions
 */
export function searchQuestionLibrary(filters = {}) {
    let library = getQuestionLibrary();

    // Text search
    if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        library = library.filter(q =>
            q.title.toLowerCase().includes(term) ||
            q.description.toLowerCase().includes(term) ||
            (q.questionData.text || '').toLowerCase().includes(term) ||
            q.tags.some(tag => tag.toLowerCase().includes(term))
        );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
        library = library.filter(q => q.category === filters.category);
    }

    // Client filter
    if (filters.clientId && filters.clientId !== 'all') {
        library = library.filter(q => q.clientId === filters.clientId);
    }

    // Question type filter
    if (filters.questionType && filters.questionType !== 'all') {
        library = library.filter(q => (q.questionData.mode || 'list') === filters.questionType);
    }

    // Sort results
    const sortBy = filters.sortBy || 'updatedAt';
    const sortDirection = filters.sortDirection || 'desc';

    library.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (sortBy === 'title') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (sortDirection === 'desc') {
            return bVal > aVal ? 1 : -1;
        } else {
            return aVal > bVal ? 1 : -1;
        }
    });

    return library;
}

/**
 * Gets library statistics
 * @returns {Object} Statistics about the library
 */
export function getLibraryStats() {
    const library = getQuestionLibrary();

    const stats = {
        totalQuestions: library.length,
        questionsByCategory: {},
        questionsByClient: {},
        questionsByType: {},
        mostUsed: library.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5),
        recentlyAdded: library.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
    };

    // Count by category
    Object.values(LIBRARY_CATEGORIES).forEach(category => {
        stats.questionsByCategory[category] = 0;
    });

    library.forEach(q => {
        // Category stats
        const categoryName = LIBRARY_CATEGORIES[q.category] || q.category;
        stats.questionsByCategory[categoryName] = (stats.questionsByCategory[categoryName] || 0) + 1;

        // Client stats
        stats.questionsByClient[q.clientName] = (stats.questionsByClient[q.clientName] || 0) + 1;

        // Type stats
        const questionType = q.questionData.mode || 'list';
        stats.questionsByType[questionType] = (stats.questionsByType[questionType] || 0) + 1;
    });

    return stats;
}

// --- UTILITY FUNCTIONS ---

/**
 * Generates a unique ID for library questions
 * @returns {string} Unique library question ID
 */
function generateLibraryId() {
    return 'lib_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Auto-detects the category of a question
 * @param {Object} question - The question object
 * @returns {string} Detected category
 */
function autoDetectCategory(question) {
    const text = (question.text || '').toLowerCase();
    const id = (question.id || '').toLowerCase();

    // Screener detection
    if (id.startsWith('s') || text.includes('qualify') || text.includes('screen')) {
        return 'screener';
    }

    // Demographics detection
    if (text.includes('age') || text.includes('gender') || text.includes('income') ||
        text.includes('education') || text.includes('occupation')) {
        return 'demographics';
    }

    // Satisfaction detection
    if (text.includes('satisf') || text.includes('rating') || text.includes('recommend')) {
        return 'satisfaction';
    }

    // Brand detection
    if (text.includes('brand') || text.includes('aware') || text.includes('familiar')) {
        return 'brand';
    }

    // Usage detection
    if (text.includes('use') || text.includes('frequency') || text.includes('often')) {
        return 'usage';
    }

    // Question type based categorization
    if (question.mode === 'numeric') return 'numeric';
    if (question.mode === 'open_end') return 'open';
    if (question.mode === 'table') return 'table';

    return 'custom';
}

/**
 * Auto-generates tags for a question
 * @param {Object} question - The question object
 * @returns {Array} Generated tags
 */
function autoGenerateTags(question) {
    const tags = [];

    // Add question type tag
    if (question.mode) {
        tags.push(question.mode);
    }

    // Add question subtype tag
    if (question.type) {
        tags.push(question.type);
    }

    // Add scale information
    if (question.scale && question.scale.points) {
        tags.push(`${question.scale.points}-point`);
    }

    // Add option count for list questions
    if (question.options && question.options.length > 0) {
        tags.push(`${question.options.length}-options`);
    }

    // Add conditional logic tag
    if (question.conditions && question.conditions.mode !== 'none') {
        tags.push('conditional');
    }

    return tags;
}

/**
 * Cleans a question object for library storage
 * @param {Object} question - The original question
 * @returns {Object} Cleaned question object
 */
function cleanQuestionForLibrary(question) {
    const cleaned = JSON.parse(JSON.stringify(question));

    // Remove project-specific data
    delete cleaned.id; // Will be regenerated on insertion

    // Clean up any temporary or UI-specific properties
    delete cleaned._expanded;
    delete cleaned._selected;
    delete cleaned._validation;

    return cleaned;
}

/**
 * Gets unique clients from the library
 * @returns {Array} Array of client objects {id, name, questionCount}
 */
export function getLibraryClients() {
    const library = getQuestionLibrary();
    const clientMap = {};

    library.forEach(q => {
        if (!clientMap[q.clientId]) {
            clientMap[q.clientId] = {
                id: q.clientId,
                name: q.clientName,
                questionCount: 0
            };
        }
        clientMap[q.clientId].questionCount++;
    });

    return Object.values(clientMap).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Exports the library to JSON
 * @returns {string} JSON string of the library
 */
export function exportLibrary() {
    const library = getQuestionLibrary();
    return JSON.stringify(library, null, 2);
}

/**
 * Imports library questions from JSON
 * @param {string} jsonData - JSON string containing library questions
 * @param {Object} options - Import options (merge, replace, etc.)
 */
export function importLibrary(jsonData, options = {}) {
    try {
        const importedQuestions = JSON.parse(jsonData);
        let currentLibrary = getQuestionLibrary();

        if (options.replace) {
            currentLibrary = importedQuestions;
        } else {
            // Merge - add questions that don't already exist
            importedQuestions.forEach(imported => {
                const exists = currentLibrary.some(existing =>
                    existing.title === imported.title &&
                    existing.clientId === imported.clientId
                );

                if (!exists) {
                    imported.id = generateLibraryId(); // Ensure unique ID
                    currentLibrary.push(imported);
                }
            });
        }

        saveQuestionLibrary(currentLibrary);
        return { success: true, imported: importedQuestions.length };
    } catch (error) {
        console.error('Error importing library:', error);
        return { success: false, error: error.message };
    }
}

// Export categories for use in UI
export { LIBRARY_CATEGORIES };