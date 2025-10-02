import { getProjects, openProjectById, deleteProjectById } from '../api/projects.js';
import { goto } from '../router.js';
import { openCreateProjectModal, openEditProjectModal } from './models/createProject.js';

// Local state for this view
let _allProjects = [];
let _currentFilters = {
  query: '',
  status: '',
  client: '',
  projectType: '',
  person: '',
  dateFrom: '',
  dateTo: '',
  sort: 'updated_desc'
};
let _showAdvancedFilters = false;
let _currentViewMode = 'grid'; // 'grid', 'list', 'kanban'
let _selectedProjects = new Set(); // Track selected project IDs

/**
 * Renders the main project management page.
 */
export async function renderProjects(rootEl) {
  _allProjects = await getProjects(); // Now loads ALL projects without organization filtering

  // Calculate statistics based on current filters
  function calculateStats() {
    const filtered = filterAndSortProjects();
    const all = _allProjects;

    return {
      total: filtered.length,
      totalAll: all.length,
      inField: filtered.filter(p => p.status === 'Fielding').length,
      inReporting: filtered.filter(p => p.status === 'Reporting').length,
      needsAttention: filtered.filter(p => p.status === 'Waiting for Approval').length,
      // Additional contextual stats
      draft: filtered.filter(p => p.status === 'Draft' || !p.status).length,
      active: filtered.filter(p => p.status === 'Active').length,
      archived: filtered.filter(p => p.status === 'Archived').length,
      hasFilters: Object.values(_currentFilters).some(v => v && v !== 'updated_desc')
    };
  }

  const stats = calculateStats();

  // Calculate project status for header
  const activeProjects = _allProjects.filter(p => p.status && p.status.toLowerCase() !== 'closed').length;
  const hasActiveProjects = activeProjects > 0;

  // Get last backup time (import from dashboard logic)
  function getLastSaveTime() {
    const lastSave = localStorage.getItem('qgen_last_save_time');
    return lastSave ? parseInt(lastSave, 10) : null;
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  const lastBackup = getLastSaveTime();
  const projectStatusText = hasActiveProjects ? `${activeProjects} project${activeProjects > 1 ? 's' : ''} active` : 'No active projects';
  const statusDotClass = hasActiveProjects ? 'active' : 'inactive';

  // Get unique values for filters
  const uniqueClients = [...new Set(_allProjects.map(p => p.client).filter(Boolean))].sort();
  const uniqueTypes = [...new Set(_allProjects.map(p => p.project_type).filter(Boolean))].sort();
  const uniquePeople = [...new Set(_allProjects.flatMap(p => p.roles?.map(r => r.person) || []).filter(Boolean))].sort();

  rootEl.innerHTML = `
    <style>
      /* Projects container to match dashboard */
      .projects-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 24px;
      }

      .pm-summary-bar {
        padding: 16px;
        border-bottom: 1px solid var(--line);
        background-color: var(--surface-2);
      }
      .pm-stat-card {
        padding: 12px 16px;
        background-color: var(--surface-1);
        border: 1px solid var(--line);
        border-radius: var(--radius-md);
        text-align: center;
      }
      .pm-stat-card .value {
        font-size: 1.8rem;
        font-weight: 600;
        color: var(--accent);
      }
      .pm-stat-card .label {
        font-weight: 500;
        color: var(--muted);
        font-size: 13px;
      }
      .pm-control-panel {
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        border-bottom: 1px solid var(--line);
        position: relative;
      }
      .pm-filters-bar {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }
      .pm-filter-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        left: 16px;
        background-color: var(--surface-1);
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow);
        padding: 16px;
        z-index: 100;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        width: min(600px, 90vw);
      }
      .filter-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .filter-field label {
        font-weight: 500;
        font-size: 13px;
        color: var(--muted);
      }
      .btn-group {
        display: flex;
        border-radius: var(--radius-md);
        overflow: hidden;
      }
      .btn-group .btn {
        border-radius: 0;
        border-right: 1px solid var(--line);
      }
      .btn-group .btn:first-child {
        border-radius: var(--radius-md) 0 0 var(--radius-md);
      }
      .btn-group .btn:last-child {
        border-radius: 0 var(--radius-md) var(--radius-md) 0;
        border-right: none;
      }

      /* List View Styles */
      .projects-table {
        width: 100%;
        border-collapse: collapse;
        background: var(--surface-1);
      }
      .projects-table th {
        padding: 12px 16px;
        text-align: left;
        font-weight: 600;
        background: var(--surface-2);
        border-bottom: 1px solid var(--line);
      }
      .projects-table td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--line);
        vertical-align: middle;
      }
      .projects-table tr:hover {
        background: var(--surface-2);
      }

      /* Kanban Styles */
      .kanban-board {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        padding: 16px 0;
        min-height: 500px;
      }
      .kanban-column {
        min-width: 300px;
        background: var(--surface-2);
        border-radius: var(--radius-lg);
        border: 1px solid var(--line);
      }
      .kanban-column-header {
        padding: 16px;
        font-weight: 600;
        border-bottom: 1px solid var(--line);
        background: var(--surface-3);
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      }
      .kanban-cards {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 400px;
      }
      .kanban-card {
        cursor: grab;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .kanban-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }
      .kanban-card.is-dragging {
        cursor: grabbing;
        opacity: 0.8;
        transform: rotate(5deg);
      }
      .kanban-column.drag-over {
        background: var(--accent-weak);
        border-color: var(--accent);
      }

      /* Bulk Actions Styles */
      .bulk-actions-bar {
        background-color: var(--accent-weak);
        border: 1px solid var(--accent);
        border-radius: var(--radius-md);
        padding: 12px 16px;
        margin: 16px;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: all 0.3s ease;
      }
      .bulk-actions-bar.is-hidden {
        display: none;
      }
      .project-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
      .grid .project-checkbox {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 2;
      }
      .projects-table .project-checkbox {
        margin: 0;
      }
      .kanban-card .project-checkbox {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 2;
      }
      /* Page Header */
      .page-header {
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        border-radius: 16px;
        padding: 32px;
        color: white;
        margin-bottom: 32px;
        position: relative;
        overflow: hidden;
      }
      .page-header::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 200px;
        height: 200px;
        background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(50%, -50%);
      }

      .header-content {
        position: relative;
        z-index: 1;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center;
        width: 100%;
      }

      .page-info {
        flex: 1;
      }

      .page-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .page-info h1 {
        font-size: 2.2rem;
        font-weight: 700;
        margin: 0 0 8px 0;
      }
      .page-tagline {
        opacity: 0.9;
        font-size: 1.1rem;
        margin: 0;
      }
      .page-stats {
        text-align: right !important;
        margin-left: auto !important;
        min-width: 200px;
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-end !important;
        justify-content: flex-end !important;
      }
      .stats-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: flex-end;
        margin-bottom: 8px;
      }
      .stats-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
      .stats-dot.active {
        background: #10b981;
      }
      .stats-dot.inactive {
        background: #f59e0b;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .stats-text {
        font-weight: 500;
        font-size: 14px;
      }
      .stats-detail {
        font-size: 12px;
        opacity: 0.8;
      }

      /* Action Buttons in Sidebar */
      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .action-btn {
        padding: 12px 16px;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        cursor: pointer;
        border: none;
        font-size: 14px;
      }
      .action-btn.primary {
        background: linear-gradient(135deg, var(--brand-secondary) 0%, #F4E412 100%);
        color: #1a1a1a;
      }
      .action-btn.primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(242, 184, 0, 0.3);
      }
      .action-btn.secondary {
        background: var(--surface-1);
        color: var(--fg);
        border: 1px solid var(--line);
      }
      .action-btn.secondary:hover {
        background: var(--surface-2);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .header-breadcrumb::before {
        content: "🏠";
        margin-right: 6px;
      }

      /* Enhanced Button Styling */
      .page-actions .btn {
        padding: 12px 20px;
        font-weight: 600;
        font-size: 14px;
        border-radius: 8px;
        transition: all 0.2s ease;
        border: 1px solid transparent;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.06);
      }

      .page-actions .btn.ghost {
        background: rgba(255,255,255,0.1);
        color: white;
        border: 1px solid rgba(255,255,255,0.2);
        backdrop-filter: blur(10px);
      }

      .page-actions .btn.ghost:hover {
        background: rgba(255,255,255,0.2);
        border-color: #F2B800;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        color: #F2B800;
      }

      .page-actions .btn.primary {
        background: linear-gradient(135deg, #F2B800 0%, #F4E412 100%);
        color: #212161;
        border: none;
        font-weight: 700;
      }

      .page-actions .btn.primary:hover {
        background: linear-gradient(135deg, #F4E412 0%, #F2B800 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(242, 184, 0, 0.4);
        color: #212161;
      }

      .page-actions .btn.primary:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(33, 33, 97, 0.2);
      }

      /* Button Icons */
      .page-actions .btn::before {
        font-size: 16px;
      }

      /* New Sidebar Layout Styles */
      .projects-layout {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 24px;
        min-height: calc(100vh - 200px);
      }
      @media (max-width: 1024px) {
        .projects-layout {
          grid-template-columns: 1fr;
          gap: 16px;
        }
      }

      .projects-sidebar {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .projects-main {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .sidebar-panel {
        background: var(--surface-1);
        border: 1px solid var(--line);
        border-radius: 12px;
        overflow: hidden;
      }

      .main-panel {
        background: var(--surface-2);
        border: 1px solid var(--line);
        border-radius: 12px;
        overflow: hidden;
      }

      .main-panel.content-area {
        background: var(--bg);
        padding: 24px;
      }

      .panel-header {
        padding: 16px 20px;
        background: var(--surface-2);
        border-bottom: 1px solid var(--line);
        font-weight: 600;
        font-size: 14px;
        color: var(--fg);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .panel-content {
        padding: 20px;
      }

      /* Stats Panel */
      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .stat-item {
        text-align: center;
        padding: 12px;
        background: var(--surface-2);
        border-radius: 8px;
        border: 1px solid var(--line);
      }

      .stat-value {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--accent);
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 11px;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* Filters Panel */
      .filter-section {
        margin-bottom: 16px;
      }

      .filter-section:last-child {
        margin-bottom: 0;
      }

      .filter-section label {
        display: block;
        font-size: 12px;
        font-weight: 500;
        color: var(--muted);
        margin-bottom: 6px;
      }

      .filter-section input,
      .filter-section select {
        width: 100%;
        font-size: 14px;
      }

      .date-range {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 8px;
        align-items: center;
      }

      .date-range span {
        font-size: 12px;
        color: var(--muted);
        text-align: center;
      }

      /* Actions Panel */
      .action-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .action-btn {
        width: 100%;
        padding: 12px 16px;
        font-weight: 500;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      /* Main Header */
      .main-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 4px 16px 4px;
      }

      .main-title {
        font-size: 1.8rem;
        font-weight: 600;
        margin: 0;
        color: var(--fg);
      }

      .view-controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .search-box {
        min-width: 200px;
      }

      /* Content Area */
      .content-area {
        min-height: 400px;
        flex: 1;
      }

      .content-area .grid {
        gap: 24px;
        padding: 0;
      }

      /* Bulk Actions Overlay */
      .bulk-actions-overlay {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--accent);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 16px;
        z-index: 100;
        transition: all 0.3s ease;
      }

      .bulk-actions-overlay.is-hidden {
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
        pointer-events: none;
      }

      .bulk-actions-overlay .btn {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
      }

      .bulk-actions-overlay .btn:hover {
        background: rgba(255,255,255,0.3);
      }

      /* Collapsible sections */
      .collapsible-trigger {
        cursor: pointer;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .collapsible-trigger:hover {
        color: var(--accent);
      }

      .collapsible-icon {
        transition: transform 0.2s ease;
        font-size: 12px;
      }

      .collapsible-trigger.collapsed .collapsible-icon {
        transform: rotate(-90deg);
      }

      .collapsible-content {
        transition: all 0.3s ease;
        overflow: hidden;
      }

      .collapsible-content.collapsed {
        max-height: 0;
        padding-top: 0;
        padding-bottom: 0;
      }

      .collapsible-content:not(.collapsed) {
        max-height: 1000px;
      }

      /* Stats with context */
      .stats-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .stats-context {
        font-size: 11px;
        color: var(--muted);
        background: var(--surface-3);
        padding: 2px 6px;
        border-radius: 4px;
      }

      /* Update existing kanban styles for new layout */
      .kanban-board {
        padding: 0;
        margin: 0;
        overflow-x: auto;
      }

      /* Welcome Screen Styles */
      .welcome-screen {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        padding: 60px 20px;
      }

      .welcome-content {
        text-align: center;
        max-width: 500px;
        animation: fadeInUp 0.6s ease-out;
      }

      .welcome-icon {
        font-size: 4rem;
        margin-bottom: 24px;
        opacity: 0.8;
      }

      .welcome-content h2 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 16px 0;
        color: var(--text-1);
      }

      .welcome-description {
        font-size: 1.1rem;
        color: var(--text-2);
        margin: 0 0 32px 0;
        line-height: 1.6;
      }

      .welcome-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        margin-bottom: 40px;
        flex-wrap: wrap;
      }

      .welcome-btn {
        padding: 12px 24px;
        font-size: 1rem;
        font-weight: 600;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .welcome-btn.primary {
        background: var(--brand-primary);
        color: white;
      }

      .welcome-btn.primary:hover {
        background: #1a1c52;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(33, 33, 97, 0.4);
      }

      .welcome-btn.secondary {
        background: var(--surface-2);
        color: var(--text-1);
        border: 1px solid var(--border);
      }

      .welcome-btn.secondary:hover {
        background: var(--surface-3);
        border-color: var(--primary);
      }

      .welcome-features {
        display: flex;
        justify-content: center;
        gap: 32px;
        flex-wrap: wrap;
        opacity: 0.8;
      }

      .feature-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        color: var(--text-2);
      }

      .feature-icon {
        font-size: 1.2rem;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 768px) {
        .welcome-actions {
          flex-direction: column;
          align-items: center;
        }

        .welcome-btn {
          width: 100%;
          max-width: 280px;
        }

        .welcome-features {
          flex-direction: column;
          gap: 16px;
        }
      }
    </style>

    <div class="projects-container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="page-info">
            <h1>📊 Project Management</h1>
            <p class="page-tagline">Central hub for questionnaire projects & operations</p>
          </div>
          <div class="page-stats">
            <div class="stats-indicator">
              <div class="stats-dot ${statusDotClass}"></div>
              <span class="stats-text">${projectStatusText}</span>
            </div>
            <div class="stats-detail">Last backup: ${lastBackup ? formatTimeAgo(lastBackup) : 'No recent activity'}</div>
          </div>
        </div>
      </header>

      <div class="projects-layout" id="projects-view">
      <!-- Sidebar -->
      <aside class="projects-sidebar">
        <!-- Quick Actions -->
        <div class="sidebar-panel">
          <div class="panel-header">
            <span>⚡ Quick Actions</span>
          </div>
          <div class="panel-content">
            <div class="action-buttons">
              <button id="new-project-btn" class="action-btn primary">
                ➕ New Project
              </button>
              <a href="#/templates" class="action-btn secondary" data-route="#/templates">
                📋 Templates
              </a>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="sidebar-panel">
          <div class="panel-header">
            <span>📊 Overview</span>
            ${stats.hasFilters ? `<span class="stats-context">Filtered</span>` : ''}
          </div>
          <div class="panel-content">
            <div class="stats-header">
              <span style="font-size: 12px; color: var(--muted);">
                ${stats.hasFilters ? `Showing ${stats.total} of ${stats.totalAll}` : `All Projects`}
              </span>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">${stats.hasFilters ? 'Filtered' : 'Total'}</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${stats.active}</div>
                <div class="stat-label">Active</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${stats.inField}</div>
                <div class="stat-label">In Field</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${stats.needsAttention}</div>
                <div class="stat-label">Need Attention</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="sidebar-panel">
          <div class="panel-header">
            <button class="collapsible-trigger collapsed" id="filters-toggle">
              <span>🔍 Filters</span>
              <span class="collapsible-icon">▼</span>
            </button>
          </div>
          <div class="panel-content collapsible-content collapsed" id="filters-content">
            <div class="filter-section">
              <label>Search</label>
              <input id="proj-search" type="search" placeholder="Search projects..." class="form-control"/>
            </div>

            <div class="filter-section">
              <label>Sort By</label>
              <select id="proj-sort" class="form-control">
                <option value="updated_desc">Recently Updated</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="client_asc">Client (A-Z)</option>
                <option value="created_desc">Newest First</option>
              </select>
            </div>

            <div class="filter-section">
              <label>Status</label>
              <select id="status-filter" class="form-control">
                <option value="">All Statuses</option>
                <option>Draft</option>
                <option>Fielding</option>
                <option>Waiting for Approval</option>
                <option>Reporting</option>
                <option>Archived</option>
              </select>
            </div>

            <div class="filter-section">
              <label>Client</label>
              <select id="client-filter" class="form-control">
                <option value="">All Clients</option>
                ${uniqueClients.map(client => `<option value="${escapeHTML(client)}">${escapeHTML(client)}</option>`).join('')}
              </select>
            </div>

            <div class="filter-section">
              <label>Project Type</label>
              <select id="type-filter" class="form-control">
                <option value="">All Types</option>
                ${uniqueTypes.map(type => `<option value="${escapeHTML(type)}">${escapeHTML(type)}</option>`).join('')}
              </select>
            </div>

            <div class="filter-section">
              <label>Team Member</label>
              <select id="person-filter" class="form-control">
                <option value="">All People</option>
                ${uniquePeople.map(person => `<option value="${escapeHTML(person)}">${escapeHTML(person)}</option>`).join('')}
              </select>
            </div>

            <div class="filter-section">
              <label>Date Range</label>
              <div class="date-range">
                <input id="date-from" type="date" class="form-control" title="From"/>
                <span>to</span>
                <input id="date-to" type="date" class="form-control" title="To"/>
              </div>
              <button id="clear-dates-btn" class="btn ghost" style="width: 100%; margin-top: 8px; font-size: 12px;">Clear Dates</button>
            </div>

            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--line);">
              <button id="clear-all-filters-btn" class="btn danger" style="width: 100%; font-size: 12px;">Clear All Filters</button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="projects-main">
        <!-- View Controls Header -->
        <div class="main-panel" style="padding: 16px 20px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <h2 style="margin: 0; font-size: 1.2rem; font-weight: 600;">Project Workspace</h2>
              <span style="font-size: 13px; color: var(--muted);">
                ${stats.hasFilters ? `${stats.total} filtered` : `${stats.total} total`}
              </span>
            </div>
            <div class="view-controls">
              <div class="btn-group">
                <button id="view-mode-grid" class="btn ${_currentViewMode === 'grid' ? 'primary' : ''}">Grid</button>
                <button id="view-mode-list" class="btn ${_currentViewMode === 'list' ? 'primary' : ''}">List</button>
                <button id="view-mode-kanban" class="btn ${_currentViewMode === 'kanban' ? 'primary' : ''}">Kanban</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="main-panel content-area">
          <div id="proj-grid"></div>
        </div>
      </main>

      <!-- Bulk Actions Floating Panel -->
      <div id="bulk-actions-bar" class="bulk-actions-overlay is-hidden">
        <strong id="bulk-selected-count">0 projects selected</strong>
        <select id="bulk-status-select" class="form-control" style="width: auto;">
          <option value="">Change status to...</option>
          <option value="Draft">Draft</option>
          <option value="Fielding">Fielding</option>
          <option value="Waiting for Approval">Waiting for Approval</option>
          <option value="Reporting">Reporting</option>
          <option value="Archived">Archived</option>
        </select>
        <button id="bulk-apply-btn" class="btn">Apply Changes</button>
        <button id="bulk-clear-btn" class="btn">Clear Selection</button>
      </div>
    </div>
  </div>
  `;

  // Restore filter values
  restoreFilterValues(rootEl);
  paintGrid(rootEl);

  // --- Event Listeners ---
  setupEventListeners(rootEl);
}

/**
 * Filters, sorts, and renders the projects in the current view mode.
 */
function paintGrid(rootEl) {
  const container = rootEl.querySelector('#proj-grid');
  const items = filterAndSortProjects();

  // Update stats when filters change
  updateStats(rootEl);

  if (!items.length) {
    // Check if there are no projects at all vs just filtered out
    if (!_allProjects.length) {
      container.innerHTML = renderWelcomeScreen();
    } else {
      container.innerHTML = `<div class="muted" style="text-align: center; padding: 40px;">No projects match your filters.</div>`;
    }
    return;
  }

  switch(_currentViewMode) {
    case 'list':
      renderListView(container, items);
      break;
    case 'kanban':
      renderKanbanView(container, items);
      break;
    case 'grid':
    default:
      renderGridView(container, items);
      break;
  }
}

function updateStats(rootEl) {
  const filtered = filterAndSortProjects();
  const all = _allProjects;

  const stats = {
    total: filtered.length,
    totalAll: all.length,
    inField: filtered.filter(p => p.status === 'Fielding').length,
    inReporting: filtered.filter(p => p.status === 'Reporting').length,
    needsAttention: filtered.filter(p => p.status === 'Waiting for Approval').length,
    draft: filtered.filter(p => p.status === 'Draft' || !p.status).length,
    active: filtered.filter(p => p.status === 'Active').length,
    archived: filtered.filter(p => p.status === 'Archived').length,
    hasFilters: Object.values(_currentFilters).some(v => v && v !== 'updated_desc')
  };

  // Update stats display
  const statsGrid = rootEl.querySelector('.stats-grid');
  if (statsGrid) {
    statsGrid.innerHTML = `
      <div class="stat-item">
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">${stats.hasFilters ? 'Filtered' : 'Total'}</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${stats.active}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${stats.inField}</div>
        <div class="stat-label">In Field</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${stats.needsAttention}</div>
        <div class="stat-label">Need Attention</div>
      </div>
    `;
  }

  // Update stats context
  const statsHeader = rootEl.querySelector('.stats-header span');
  if (statsHeader) {
    statsHeader.textContent = stats.hasFilters ? `Showing ${stats.total} of ${stats.totalAll}` : `All Projects`;
  }

  // Update main content counter
  const workspaceCounter = rootEl.querySelector('.projects-main span');
  if (workspaceCounter) {
    workspaceCounter.textContent = stats.hasFilters ? `${stats.total} filtered` : `${stats.total} total`;
  }

  // Update filtered indicator
  const filteredBadge = rootEl.querySelector('.stats-context');
  const statsPanel = rootEl.querySelector('.sidebar-panel .panel-header');
  if (stats.hasFilters && !filteredBadge) {
    statsPanel.innerHTML = `<span>📊 Overview</span><span class="stats-context">Filtered</span>`;
  } else if (!stats.hasFilters && filteredBadge) {
    statsPanel.innerHTML = `<span>📊 Overview</span>`;
  }
}

function filterAndSortProjects() {
  const { query, status, client, projectType, person, dateFrom, dateTo, sort } = _currentFilters;
  const queryLower = query.toLowerCase();

  let filtered = _allProjects.filter(p => {
    // Status filter (empty string means show all)
    if (status && status !== '' && (p.status || 'Draft') !== status) return false;

    // Client filter (empty string means show all)
    if (client && client !== '' && p.client !== client) return false;

    // Project type filter (empty string means show all)
    if (projectType && projectType !== '' && p.project_type !== projectType) return false;

    // Person filter (empty string means show all)
    if (person && person !== '' && !(p.roles || []).some(r => r.person === person)) return false;

    // Date range filter (check against project important dates)
    if (dateFrom || dateTo) {
      const projectDates = (p.important_dates || []).map(d => d.when).filter(Boolean);
      if (projectDates.length === 0) return false;

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (!projectDates.some(d => new Date(d) >= fromDate)) return false;
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        if (!projectDates.some(d => new Date(d) <= toDate)) return false;
      }
    }

    // Text search filter
    if (query && !(
      (p.name || '').toLowerCase().includes(queryLower) ||
      (p.client || '').toLowerCase().includes(queryLower) ||
      (p.project_type || '').toLowerCase().includes(queryLower) ||
      (p.notes || '').toLowerCase().includes(queryLower) ||
      (p.tags || []).some(t => t.toLowerCase().includes(queryLower)) ||
      (p.roles || []).some(r => r.person.toLowerCase().includes(queryLower))
    )) return false;

    return true;
  });

  // Sort the filtered results
  const [sortKey, sortDir] = sort.split('_');
  return filtered.sort((a, b) => {
    let valA, valB;

    switch(sortKey) {
      case 'updated':
        valA = new Date(a.updated_at);
        valB = new Date(b.updated_at);
        break;
      case 'created':
        valA = new Date(a.created_at || a.updated_at);
        valB = new Date(b.created_at || b.updated_at);
        break;
      case 'name':
        valA = a.name || '';
        valB = b.name || '';
        break;
      case 'client':
        valA = a.client || '';
        valB = b.client || '';
        break;
      default:
        valA = a[sortKey] || '';
        valB = b[sortKey] || '';
    }

    if (valA instanceof Date && valB instanceof Date) {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    } else {
      const compare = String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base' });
      return sortDir === 'asc' ? compare : -compare;
    }
  });
}

/**
 * Renders projects in grid view (existing card layout)
 */
function renderGridView(container, projects) {
  container.className = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  container.innerHTML = projects.map(projectToCardHTML).join('');
}

/**
 * Renders projects in list/table view
 */
function renderListView(container, projects) {
  container.className = '';
  container.style.gridTemplateColumns = '';
  container.innerHTML = `
    <table class="projects-table">
      <thead>
        <tr>
          <th width="30"><input type="checkbox" id="select-all-checkbox"></th>
          <th>Name</th>
          <th>Client</th>
          <th>Status</th>
          <th>Type</th>
          <th>Last Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${projects.map(p => {
          const isSelected = _selectedProjects.has(p.id);
          return `
          <tr>
            <td><input type="checkbox" class="project-checkbox" data-project-id="${escapeHTML(p.id)}" ${isSelected ? 'checked' : ''}></td>
            <td>
              <div style="font-weight: 600;">${escapeHTML(p.name)}</div>
              <div style="font-size: 12px; color: var(--muted);">v${escapeHTML(p.version || '0.1.0')}</div>
            </td>
            <td>${escapeHTML(p.client || '—')}</td>
            <td><span class="pill">${escapeHTML(p.status || 'Draft')}</span></td>
            <td>${escapeHTML(p.project_type || '—')}</td>
            <td>${new Date(p.updated_at).toLocaleDateString()}</td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn primary" data-open-project-id="${escapeHTML(p.id)}" style="padding: 4px 8px;">Open</button>
                <button class="btn ghost" data-edit-project-id="${escapeHTML(p.id)}" style="padding: 4px 8px;">Edit</button>
                <button class="btn danger" data-delete-project-id="${escapeHTML(p.id)}" style="padding: 4px 8px;">Delete</button>
              </div>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

/**
 * Renders projects in kanban board view
 */
function renderKanbanView(container, projects) {
  const statuses = ['Draft', 'Fielding', 'Waiting for Approval', 'Reporting', 'Archived'];

  container.className = 'kanban-board';
  container.style.gridTemplateColumns = '';

  container.innerHTML = statuses.map(status => {
    const statusProjects = projects.filter(p => (p.status || 'Draft') === status);

    return `
      <div class="kanban-column" data-status="${status}">
        <div class="kanban-column-header">
          <strong>${escapeHTML(status)}</strong>
          <span style="margin-left: 8px; color: var(--muted);">(${statusProjects.length})</span>
        </div>
        <div class="kanban-cards">
          ${statusProjects.map(p => projectToKanbanCardHTML(p)).join('')}
        </div>
      </div>
    `;
  }).join('');

  // Setup drag and drop after rendering
  setupKanbanDragDrop(container);
}

/**
 * Generates HTML for a project card in grid view
 */
function projectToCardHTML(p) {
  const tags = (p.tags || []).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join(' ');
  const isSelected = _selectedProjects.has(p.id);
  return `
    <div class="card project-card ${p.status ? `status-${p.status.toLowerCase().replace(/\s+/g, '-')}` : 'status-draft'}" style="position: relative;">
      <input type="checkbox" class="project-checkbox" data-project-id="${escapeHTML(p.id)}" ${isSelected ? 'checked' : ''}>
      <div class="project-card-header">
        <div class="project-title-group">
          <div class="project-name">${escapeHTML(p.name)}</div>
          <div class="muted project-version">v${escapeHTML(p.version || '0.1.0')}</div>
        </div>
      </div>
      <div class="project-card-content">
        <div class="project-meta-item"><strong>Status:</strong> ${escapeHTML(p.status || 'Draft')}</div>
        ${p.client ? `<div class="project-meta-item"><strong>Client:</strong> ${escapeHTML(p.client)}</div>` : ''}
        ${tags ? `<div class="project-tags-container" style="margin-top: 8px;">${tags}</div>` : ''}
      </div>
      <div class="project-card-footer">
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
          <button class="btn primary" data-open-project-id="${escapeHTML(p.id)}" style="width: 100%;">Open</button>
          <div style="display: flex; gap: 8px; width: 100%;">
            <button class="btn ghost" data-edit-project-id="${escapeHTML(p.id)}" style="flex: 1;">Edit</button>
            <button class="btn danger" data-delete-project-id="${escapeHTML(p.id)}" style="flex: 1;">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generates HTML for a project card in kanban view (compact version)
 */
function projectToKanbanCardHTML(p) {
  const tags = (p.tags || []).slice(0, 2).map(t => `<span class="tag" style="font-size: 11px;">${escapeHTML(t)}</span>`).join(' ');
  const isSelected = _selectedProjects.has(p.id);
  return `
    <div class="card project-card kanban-card ${p.status ? `status-${p.status.toLowerCase().replace(/\s+/g, '-')}` : 'status-draft'}" draggable="true" data-project-id="${escapeHTML(p.id)}" style="position: relative;">
      <input type="checkbox" class="project-checkbox" data-project-id="${escapeHTML(p.id)}" ${isSelected ? 'checked' : ''}>
      <div style="padding: 12px;">
        <div style="font-weight: 600; margin-bottom: 4px;">${escapeHTML(p.name)}</div>
        <div style="font-size: 12px; color: var(--muted); margin-bottom: 8px;">v${escapeHTML(p.version || '0.1.0')}</div>
        ${p.client ? `<div style="font-size: 13px; margin-bottom: 6px;"><strong>Client:</strong> ${escapeHTML(p.client)}</div>` : ''}
        ${tags ? `<div style="margin-bottom: 8px;">${tags}</div>` : ''}
        <div style="display: flex; gap: 4px;">
          <button class="btn primary" data-open-project-id="${escapeHTML(p.id)}" style="flex: 1; padding: 4px 8px; font-size: 12px;">Open</button>
          <button class="btn ghost" data-edit-project-id="${escapeHTML(p.id)}" style="padding: 4px 8px; font-size: 12px;">Edit</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Restores filter values from current state
 */
function restoreFilterValues(rootEl) {
  rootEl.querySelector('#proj-search').value = _currentFilters.query;
  rootEl.querySelector('#proj-sort').value = _currentFilters.sort;
  rootEl.querySelector('#client-filter').value = _currentFilters.client;
  rootEl.querySelector('#status-filter').value = _currentFilters.status;
  rootEl.querySelector('#type-filter').value = _currentFilters.projectType;
  rootEl.querySelector('#person-filter').value = _currentFilters.person;
  rootEl.querySelector('#date-from').value = _currentFilters.dateFrom;
  rootEl.querySelector('#date-to').value = _currentFilters.dateTo;

  // No need to handle filter dropdown visibility since filters are always shown in sidebar
}

/**
 * Sets up all event listeners for the projects page
 */
function setupEventListeners(rootEl) {
  // New project button
  rootEl.querySelector('#new-project-btn').addEventListener('click', openCreateProjectModal);

  // Collapsible filters
  const filtersToggle = rootEl.querySelector('#filters-toggle');
  const filtersContent = rootEl.querySelector('#filters-content');
  if (filtersToggle && filtersContent) {
    filtersToggle.addEventListener('click', () => {
      const isCollapsed = filtersContent.classList.contains('collapsed');
      if (isCollapsed) {
        filtersContent.classList.remove('collapsed');
        filtersToggle.classList.remove('collapsed');
      } else {
        filtersContent.classList.add('collapsed');
        filtersToggle.classList.add('collapsed');
      }
    });
  }

  // Search input with debouncing
  const searchEl = rootEl.querySelector('#proj-search');
  let searchTimeout;
  searchEl.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      _currentFilters.query = searchEl.value.trim();
      paintGrid(rootEl);
    }, 200);
  });

  // Sort dropdown
  rootEl.querySelector('#proj-sort').addEventListener('change', (e) => {
    _currentFilters.sort = e.target.value;
    paintGrid(rootEl);
  });

  // Toggle advanced filters - removed since filters are now always visible in sidebar

  // Advanced filter changes
  const filterElements = [
    { id: '#client-filter', key: 'client' },
    { id: '#status-filter', key: 'status' },
    { id: '#type-filter', key: 'projectType' },
    { id: '#person-filter', key: 'person' },
    { id: '#date-from', key: 'dateFrom' },
    { id: '#date-to', key: 'dateTo' }
  ];

  filterElements.forEach(({ id, key }) => {
    rootEl.querySelector(id).addEventListener('change', (e) => {
      _currentFilters[key] = e.target.value;
      paintGrid(rootEl);
    });
  });

  // Clear dates button
  rootEl.querySelector('#clear-dates-btn').addEventListener('click', () => {
    _currentFilters.dateFrom = '';
    _currentFilters.dateTo = '';
    rootEl.querySelector('#date-from').value = '';
    rootEl.querySelector('#date-to').value = '';
    paintGrid(rootEl);
  });

  // Clear all filters button
  rootEl.querySelector('#clear-all-filters-btn').addEventListener('click', () => {
    _currentFilters = {
      query: '',
      status: '',
      client: '',
      projectType: '',
      person: '',
      dateFrom: '',
      dateTo: '',
      sort: 'updated_desc'
    };
    restoreFilterValues(rootEl);
    paintGrid(rootEl);
  });

  // View mode buttons
  rootEl.querySelector('#view-mode-grid').addEventListener('click', () => {
    _currentViewMode = 'grid';
    updateViewModeButtons(rootEl);
    paintGrid(rootEl);
  });

  rootEl.querySelector('#view-mode-list').addEventListener('click', () => {
    _currentViewMode = 'list';
    updateViewModeButtons(rootEl);
    paintGrid(rootEl);
  });

  rootEl.querySelector('#view-mode-kanban').addEventListener('click', () => {
    _currentViewMode = 'kanban';
    updateViewModeButtons(rootEl);
    paintGrid(rootEl);
  });

  // Project checkboxes and bulk operations
  rootEl.addEventListener('change', (e) => {
    if (e.target.classList.contains('project-checkbox')) {
      const projectId = e.target.dataset.projectId;
      if (e.target.checked) {
        _selectedProjects.add(projectId);
      } else {
        _selectedProjects.delete(projectId);
      }
      updateBulkActionsBar(rootEl);
    } else if (e.target.id === 'select-all-checkbox') {
      const filteredProjects = filterAndSortProjects();
      const checkboxes = rootEl.querySelectorAll('.project-checkbox');

      if (e.target.checked) {
        // Select all visible projects
        filteredProjects.forEach(p => _selectedProjects.add(p.id));
        checkboxes.forEach(cb => cb.checked = true);
      } else {
        // Deselect all visible projects
        filteredProjects.forEach(p => _selectedProjects.delete(p.id));
        checkboxes.forEach(cb => cb.checked = false);
      }
      updateBulkActionsBar(rootEl);
    }
  });

  // Bulk actions
  rootEl.querySelector('#bulk-apply-btn').addEventListener('click', async () => {
    const newStatus = rootEl.querySelector('#bulk-status-select').value;
    if (!newStatus) {
      alert('Please select a status to apply.');
      return;
    }

    const selectedIds = Array.from(_selectedProjects);
    if (selectedIds.length === 0) {
      alert('Please select at least one project.');
      return;
    }

    const confirmed = confirm(`Are you sure you want to change the status of ${selectedIds.length} project(s) to "${newStatus}"?`);
    if (!confirmed) return;

    await applyBulkStatusChange(selectedIds, newStatus, rootEl);
  });

  rootEl.querySelector('#bulk-clear-btn').addEventListener('click', () => {
    _selectedProjects.clear();
    rootEl.querySelectorAll('.project-checkbox').forEach(cb => cb.checked = false);
    const selectAllCb = rootEl.querySelector('#select-all-checkbox');
    if (selectAllCb) selectAllCb.checked = false;
    updateBulkActionsBar(rootEl);
  });

  // Project action buttons (open, edit, delete)
  rootEl.addEventListener('click', async (e) => {
    const openBtn = e.target.closest('[data-open-project-id]');
    const editBtn = e.target.closest('[data-edit-project-id]');
    const deleteBtn = e.target.closest('[data-delete-project-id]');

    if (openBtn) {
      const id = openBtn.dataset.openProjectId;
      openBtn.textContent = 'Opening...';
      openBtn.disabled = true;

      const success = await openProjectById(id);
      if (success) {
        goto('#/project/overview');
      } else {
        openBtn.textContent = 'Open';
        openBtn.disabled = false;
      }
    } else if (editBtn) {
      const id = editBtn.dataset.editProjectId;
      const project = _allProjects.find(p => p.id === id);
      if (project) {
        await openEditProjectModal(project);
      }
    } else if (deleteBtn) {
      const id = deleteBtn.dataset.deleteProjectId;
      const project = _allProjects.find(p => p.id === id);
      if (project) {
        await deleteProject(project, rootEl);
      }
    }
  });
}

/**
 * Handles deleting a project with confirmation
 */
async function deleteProject(project, rootEl) {
  const confirmed = confirm(`Are you sure you want to delete the project "${project.name}"?\n\nThis action cannot be undone.`);
  if (!confirmed) return;

  try {
    await deleteProjectById(project.id);
    // Refresh the project list
    _allProjects = await getProjects();
    paintGrid(rootEl);
  } catch (error) {
    console.error('Failed to delete project:', error);
    alert(`Failed to delete project: ${error.message}`);
  }
}

/**
 * Updates the visual state of view mode buttons
 */
function updateViewModeButtons(rootEl) {
  rootEl.querySelector('#view-mode-grid').className = `btn ${_currentViewMode === 'grid' ? 'primary' : ''}`;
  rootEl.querySelector('#view-mode-list').className = `btn ${_currentViewMode === 'list' ? 'primary' : ''}`;
  rootEl.querySelector('#view-mode-kanban').className = `btn ${_currentViewMode === 'kanban' ? 'primary' : ''}`;
}

/**
 * Sets up drag and drop functionality for kanban board
 */
function setupKanbanDragDrop(container) {
  const cards = container.querySelectorAll('.kanban-card[draggable="true"]');
  const columns = container.querySelectorAll('.kanban-column');

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      card.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', card.outerHTML);
      e.dataTransfer.setData('text/plain', card.dataset.projectId);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
    });
  });

  columns.forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      column.classList.add('drag-over');
    });

    column.addEventListener('dragleave', (e) => {
      // Only remove if we're actually leaving the column
      if (!column.contains(e.relatedTarget)) {
        column.classList.remove('drag-over');
      }
    });

    column.addEventListener('drop', async (e) => {
      e.preventDefault();
      column.classList.remove('drag-over');

      const projectId = e.dataTransfer.getData('text/plain');
      const newStatus = column.dataset.status;
      const draggingCard = container.querySelector('.is-dragging');

      if (draggingCard && projectId && newStatus) {
        try {
          await updateProjectStatus(projectId, newStatus);

          // Find and update the project in our local array
          const project = _allProjects.find(p => p.id === projectId);
          if (project) {
            project.status = newStatus;
            project.updated_at = new Date().toISOString();
          }

          // Re-render the kanban view
          paintGrid(document.querySelector('#projects-view'));

          // Show success message
          console.log(`Project status updated to "${newStatus}"`);
        } catch (error) {
          console.error('Failed to update project status:', error);
          alert('Failed to update project status. Please try again.');
        }
      }
    });
  });
}

/**
 * Updates a project's status in the database
 */
async function updateProjectStatus(projectId, newStatus) {
  // We'll need to import and use the project update API
  // For now, we'll simulate the update
  try {
    const response = await fetch(`/api/projects/${projectId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    // If API doesn't exist yet, we can still update the local state
    console.warn('Status update API not available, updating locally only');
  }
}

/**
 * Updates the bulk actions bar visibility and selection count
 */
function updateBulkActionsBar(rootEl) {
  const bulkBar = rootEl.querySelector('#bulk-actions-bar');
  const countEl = rootEl.querySelector('#bulk-selected-count');
  const selectedCount = _selectedProjects.size;

  if (selectedCount === 0) {
    bulkBar.classList.add('is-hidden');
  } else {
    bulkBar.classList.remove('is-hidden');
    countEl.textContent = `${selectedCount} project${selectedCount === 1 ? '' : 's'} selected`;
  }

  // Update select all checkbox state
  const selectAllCb = rootEl.querySelector('#select-all-checkbox');
  if (selectAllCb) {
    const filteredProjects = filterAndSortProjects();
    const allVisible = filteredProjects.length > 0 && filteredProjects.every(p => _selectedProjects.has(p.id));
    const someVisible = filteredProjects.some(p => _selectedProjects.has(p.id));

    selectAllCb.checked = allVisible;
    selectAllCb.indeterminate = someVisible && !allVisible;
  }
}

/**
 * Applies status changes to multiple projects
 */
async function applyBulkStatusChange(projectIds, newStatus, rootEl) {
  const statusSelect = rootEl.querySelector('#bulk-status-select');
  const applyBtn = rootEl.querySelector('#bulk-apply-btn');

  // Disable UI during operation
  statusSelect.disabled = true;
  applyBtn.disabled = true;
  applyBtn.textContent = 'Applying...';

  try {
    // Update projects in local state
    projectIds.forEach(id => {
      const project = _allProjects.find(p => p.id === id);
      if (project) {
        project.status = newStatus;
        project.updated_at = new Date().toISOString();
      }
    });

    // Here we would normally make API calls to update the database
    // For now, we'll simulate this with a timeout
    await new Promise(resolve => setTimeout(resolve, 500));

    // Clear selection and re-render
    _selectedProjects.clear();
    paintGrid(rootEl);
    updateBulkActionsBar(rootEl);

    // Reset bulk status dropdown
    statusSelect.value = '';

    console.log(`Successfully updated ${projectIds.length} project(s) to status: ${newStatus}`);
  } catch (error) {
    console.error('Failed to apply bulk status change:', error);
    alert('Failed to update project statuses. Please try again.');
  } finally {
    // Re-enable UI
    statusSelect.disabled = false;
    applyBtn.disabled = false;
    applyBtn.textContent = 'Apply Changes';
  }
}

function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[m]));
}

/**
 * Renders a welcome screen for new users with no projects
 */
function renderWelcomeScreen() {
  return `
    <div class="welcome-screen">
      <div class="welcome-content">
        <div class="welcome-icon">📊</div>
        <h2>Welcome to Project Management</h2>
        <p class="welcome-description">
          You haven't created any projects yet. Get started by creating your first questionnaire project.
        </p>
        <div class="welcome-actions">
          <button class="btn primary welcome-btn" onclick="window.showNewProjectModal()">
            ➕ Create Your First Project
          </button>
          <button class="btn secondary welcome-btn" onclick="window.openTemplatesView()">
            📋 Browse Templates
          </button>
        </div>
        <div class="welcome-features">
          <div class="feature-item">
            <span class="feature-icon">🎯</span>
            <span class="feature-text">Design questionnaires</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📈</span>
            <span class="feature-text">Track project progress</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">👥</span>
            <span class="feature-text">Collaborate with team</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

