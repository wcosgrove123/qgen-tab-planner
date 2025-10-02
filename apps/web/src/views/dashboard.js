import { getProjects } from '../api/projects.js';
import { getRecentActivities, logActivity, ACTIVITY_TYPES } from '../lib/activityLogger.js';

export async function renderDashboard(el) {
    // DEBUG: Confirm this function is running
    console.log('🎨 DASHBOARD: Rendering with modern enhancements...');

    // Fetch projects for dashboard analytics
    const projects = await getProjects();

    // Core metrics
    const analytics = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'Active').length,
        fieldingProjects: projects.filter(p => p.status === 'Fielding').length,
        completedProjects: projects.filter(p => p.status === 'Reporting').length,
        lastBackup: getLastSaveTime(),
        topClient: getTopClient(projects)
    };

    // Recent activity
    const recentActivity = getRecentActivities(5);

    // Add session start activity if this is a fresh load
    if (recentActivity.length === 0 || !sessionStorage.getItem('qgen_session_logged')) {
        logActivity({
            ...ACTIVITY_TYPES.SESSION_STARTED,
            title: 'Session started',
            data: { timestamp: new Date().toISOString() }
        });
        sessionStorage.setItem('qgen_session_logged', 'true');
    }

    el.innerHTML = `
        <style>
            .dashboard-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 32px 24px;
            }

            .dashboard-header {
                margin-bottom: 32px;
            }

            .dashboard-title {
                font-size: 1.75rem;
                font-weight: 600;
                color: var(--fg);
                margin: 0 0 8px 0;
            }

            .dashboard-subtitle {
                color: var(--muted);
                font-size: 0.95rem;
            }

            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 20px;
                margin-bottom: 32px;
            }

            .dashboard-container .metric-card {
                background: var(--surface-1);
                border: 1px solid var(--line);
                border-radius: 12px;
                padding: 20px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                position: relative;
                overflow: hidden;
            }

            .dashboard-container .metric-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: var(--accent);
                transform: scaleY(0);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .dashboard-container .metric-card:hover::before {
                transform: scaleY(1);
            }

            .dashboard-container .metric-card:hover {
                border-color: var(--accent) !important;
                transform: translateY(-4px) !important;
                box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important;
            }

            .metric-value {
                font-size: 2rem;
                font-weight: 700;
                color: var(--accent);
                margin-bottom: 6px;
            }

            .metric-label {
                color: var(--muted);
                font-size: 0.9rem;
                font-weight: 500;
            }

            .content-grid {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 24px;
                margin-bottom: 32px;
            }

            @media (max-width: 968px) {
                .content-grid {
                    grid-template-columns: 1fr;
                }
            }

            .dashboard-container .panel {
                background: var(--surface-1);
                border: 1px solid var(--line);
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            .dashboard-container .panel:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important;
            }

            .panel-header {
                padding: 16px 20px;
                border-bottom: 1px solid var(--line);
                background: var(--surface-2);
                font-weight: 600;
                font-size: 0.95rem;
            }

            .dashboard-container .activity-item {
                padding: 14px 20px;
                border-bottom: 1px solid var(--line);
                display: flex;
                gap: 12px;
                align-items: flex-start;
                transition: background 0.2s ease !important;
            }

            .dashboard-container .activity-item:last-child {
                border-bottom: none;
            }

            .dashboard-container .activity-item:hover {
                background: var(--surface-2) !important;
            }

            .activity-icon {
                width: 28px;
                height: 28px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                flex-shrink: 0;
            }

            .activity-content {
                flex: 1;
                min-width: 0;
            }

            .activity-title {
                font-weight: 500;
                margin-bottom: 3px;
                font-size: 0.9rem;
            }

            .activity-meta {
                font-size: 0.8rem;
                color: var(--muted);
            }

            .info-row {
                padding: 14px 20px;
                border-bottom: 1px solid var(--line);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .info-row:last-child {
                border-bottom: none;
            }

            .info-label {
                font-weight: 500;
                color: var(--fg);
                font-size: 0.9rem;
            }

            .info-value {
                font-weight: 600;
                color: var(--accent);
                font-size: 0.9rem;
            }

            .dashboard-container .cta-button {
                display: block;
                background: var(--accent);
                border-radius: 12px;
                padding: 24px;
                color: white;
                text-decoration: none;
                text-align: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                border: none;
                width: 100%;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }

            .dashboard-container .cta-button::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                transform: translate(-50%, -50%);
                transition: width 0.6s ease, height 0.6s ease;
            }

            .dashboard-container .cta-button:hover::before {
                width: 300px;
                height: 300px;
            }

            .dashboard-container .cta-button:hover {
                background: var(--accent-hover);
                transform: translateY(-2px) !important;
                box-shadow: 0 8px 20px rgba(0,0,0,0.2) !important;
                color: white;
            }

            .dashboard-container .cta-button:active {
                transform: translateY(0) !important;
            }

            .cta-title {
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 6px;
            }

            .cta-subtitle {
                opacity: 0.95;
                font-size: 0.9rem;
            }

            .empty-state {
                padding: 40px 20px;
                text-align: center;
                color: var(--muted);
            }

            .empty-state-icon {
                font-size: 2.5rem;
                margin-bottom: 12px;
                opacity: 0.5;
            }

            .empty-state-text {
                font-size: 0.9rem;
            }
        </style>

        <div class="dashboard-container" data-version="modern-v1">
            <!-- Header -->
            <div class="dashboard-header">
                <h1 class="dashboard-title">Dashboard</h1>
                <p class="dashboard-subtitle">Welcome back. Here's an overview of your projects.</p>
            </div>

            <!-- Key Metrics -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${analytics.totalProjects}</div>
                    <div class="metric-label">Total Projects</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${analytics.activeProjects}</div>
                    <div class="metric-label">Active</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${analytics.fieldingProjects}</div>
                    <div class="metric-label">In Field</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${analytics.completedProjects}</div>
                    <div class="metric-label">Reporting</div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="content-grid">
                <!-- Recent Activity -->
                <div class="panel">
                    <div class="panel-header">Recent Activity</div>
                    ${recentActivity.length > 0 ? recentActivity.map(activity => `
                        <div class="activity-item">
                            <div class="activity-icon" style="background: ${activity.bgColor}; color: ${activity.textColor};">
                                ${activity.icon}
                            </div>
                            <div class="activity-content">
                                <div class="activity-title">${activity.title}</div>
                                <div class="activity-meta">${activity.time}</div>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state">
                            <div class="empty-state-icon">📋</div>
                            <div class="empty-state-text">No recent activity</div>
                        </div>
                    `}
                </div>

                <!-- Project Info -->
                <div class="panel">
                    <div class="panel-header">Project Details</div>
                    ${analytics.topClient ? `
                        <div class="info-row">
                            <span class="info-label">Most Active Client</span>
                            <span class="info-value">${analytics.topClient}</span>
                        </div>
                    ` : ''}
                    <div class="info-row">
                        <span class="info-label">Last Activity</span>
                        <span class="info-value">${analytics.lastBackup ? formatTimeAgo(analytics.lastBackup) : 'None'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">System Status</span>
                        <span class="info-value" style="color: #10b981;">Operational</span>
                    </div>
                </div>
            </div>

            <!-- Call to Action -->
            <a href="#/projects" class="cta-button" data-route="#/projects">
                <div class="cta-title">Go to Projects</div>
                <div class="cta-subtitle">Manage questionnaires, banners, and tab plans</div>
            </a>
        </div>
    `;
}

// Helper functions
function getLastSaveTime() {
    const lastSave = localStorage.getItem('qgen_last_save_time');
    return lastSave ? new Date(parseInt(lastSave)) : null;
}

function getTopClient(projects) {
    const clientCounts = {};
    projects.forEach(p => {
        if (p.client) {
            clientCounts[p.client] = (clientCounts[p.client] || 0) + 1;
        }
    });
    const topClient = Object.keys(clientCounts).reduce((a, b) =>
        clientCounts[a] > clientCounts[b] ? a : b, null
    );
    return topClient;
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}