/**
 * Activity Logger - Tracks real user activities for the company activity feed
 */

const ACTIVITY_STORAGE_KEY = 'qgen_activity_log';
const MAX_ACTIVITIES = 50; // Keep last 50 activities

/**
 * Log an activity event
 * @param {Object} activity - Activity data
 * @param {string} activity.type - Type of activity (project, question, system, etc.)
 * @param {string} activity.action - Action performed (created, updated, deleted, etc.)
 * @param {string} activity.title - Human-readable title
 * @param {string} activity.icon - Emoji icon
 * @param {string} activity.category - Category for grouping
 * @param {Object} activity.data - Additional data (project name, question id, etc.)
 * @param {boolean} activity.replaceDuplicates - Whether to replace existing activities for same project/action
 */
export function logActivity(activity) {
    const timestamp = new Date().toISOString();
    const activityEntry = {
        id: generateActivityId(),
        timestamp,
        ...activity
    };

    // Get existing activities
    let activities = getActivities();

    // Remove duplicates if specified (for project-level activities)
    if (activity.replaceDuplicates && activity.data?.projectId) {
        activities = activities.filter(existing =>
            !(existing.type === activity.type &&
              existing.action === activity.action &&
              existing.data?.projectId === activity.data.projectId)
        );
    }

    // Add new activity to beginning
    activities.unshift(activityEntry);

    // Keep only the most recent activities
    const trimmedActivities = activities.slice(0, MAX_ACTIVITIES);

    // Save to localStorage
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(trimmedActivities));

    return activityEntry;
}

/**
 * Get all activities from storage
 */
export function getActivities() {
    try {
        const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn('Failed to load activities:', error);
        return [];
    }
}

/**
 * Get recent activities for display
 * @param {number} limit - Number of activities to return
 */
export function getRecentActivities(limit = 6) {
    const activities = getActivities();
    return activities.slice(0, limit).map(activity => ({
        icon: activity.icon,
        bgColor: getActivityBgColor(activity.type),
        textColor: getActivityTextColor(activity.type),
        title: activity.title,
        time: formatTimeAgo(new Date(activity.timestamp)),
        category: activity.category
    }));
}

/**
 * Clear all activities (for testing/reset)
 */
export function clearActivities() {
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
}

/**
 * Generate unique activity ID
 */
function generateActivityId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Get background color based on activity type
 */
function getActivityBgColor(type) {
    const colors = {
        project: '#dbeafe',      // Blue
        export: '#dcfce7',       // Green
        system: '#ede9fe',       // Purple
        session: '#fef3c7',      // Yellow
        validation: '#fee2e2',   // Red
        tabplan: '#e0f2fe',      // Cyan
        default: '#f3f4f6'       // Gray
    };
    return colors[type] || colors.default;
}

/**
 * Get text color based on activity type
 */
function getActivityTextColor(type) {
    const colors = {
        project: '#1e40af',      // Blue
        export: '#166534',       // Green
        system: '#7c3aed',       // Purple
        session: '#92400e',      // Yellow
        validation: '#dc2626',   // Red
        tabplan: '#0369a1',      // Cyan
        default: '#374151'       // Gray
    };
    return colors[type] || colors.default;
}

/**
 * Format time ago (reuse from dashboard)
 */
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
        return 'Just now';
    } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else {
        return `${diffDays}d ago`;
    }
}

/**
 * Pre-defined activity types for consistency
 */
export const ACTIVITY_TYPES = {
    PROJECT_CREATED: {
        type: 'project',
        action: 'created',
        icon: '🆕',
        category: 'Projects',
        replaceDuplicates: false // Keep all creation events
    },
    PROJECT_UPDATED: {
        type: 'project',
        action: 'updated',
        icon: '📊',
        category: 'Projects',
        replaceDuplicates: true // Replace previous updates for same project
    },
    PROJECT_DELETED: {
        type: 'project',
        action: 'deleted',
        icon: '🗑️',
        category: 'Projects',
        replaceDuplicates: true // Replace any previous activities for deleted project
    },
    PROJECT_OPENED: {
        type: 'session',
        action: 'opened',
        icon: '📂',
        category: 'Session',
        replaceDuplicates: true // Replace previous opens for same project
    },
    PROJECT_CLOSED: {
        type: 'session',
        action: 'closed',
        icon: '📁',
        category: 'Session',
        replaceDuplicates: true // Replace previous closes for same project
    },
    PROJECT_EXPORTED: {
        type: 'export',
        action: 'exported',
        icon: '📤',
        category: 'Export',
        replaceDuplicates: true // Replace previous exports for same project
    },
    EXPORT_WORD: {
        type: 'export',
        action: 'word_export',
        icon: '📄',
        category: 'Export',
        replaceDuplicates: false // Keep all Word exports
    },
    TAB_PLAN_GENERATED: {
        type: 'tabplan',
        action: 'generated',
        icon: '📈',
        category: 'Analytics',
        replaceDuplicates: true // Replace previous tab plans for same project
    },
    VALIDATION_RUN: {
        type: 'validation',
        action: 'validated',
        icon: '✅',
        category: 'Quality Control',
        replaceDuplicates: true // Replace previous validations for same project
    },
    SESSION_STARTED: {
        type: 'session',
        action: 'started',
        icon: '🚀',
        category: 'System',
        replaceDuplicates: false // Keep session starts
    }
};