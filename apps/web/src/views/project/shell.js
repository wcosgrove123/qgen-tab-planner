// src/views/project/shell.js
import { closeProject } from '../../api/projects.js';
import { renderOverview } from './overview.js';
// --- FIX: Import the new prefield view directly ---
import { renderPreField } from './prefield.js';
import { renderValidationView } from './validation/validationView.js';
import { renderLibraryView } from './library/libraryView.js';
import { renderReporting } from './report.js';
import { renderFielding } from './field.js';

export async function renderProjectShell(rootEl, hash) {
  const activeTab = (hash.split('/')[2] || 'overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>' },
    { id: 'pre-field', label: 'Pre-Field', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' },
    { id: 'fielding', label: 'Fielding', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>' },
    { id: 'reporting', label: 'Reporting', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>' },
  ];

  const moreItems = [
    { id: 'validator', label: 'Validator', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>' },
    { id: 'crosstabs', label: 'Cross-Tabs', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' },
    { id: 'library', label: 'Library', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>' },
    { id: 'preview', label: 'Preview', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' },
    { id: 'rules', label: 'Rules', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5z"></path><path d="M6 9.01V9"></path></svg>' },
    { id: 'export', label: 'Export', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' },
  ];

  const projectName = window.state?.project?.name || 'Project';
  const projectStatus = window.state?.project?.status || 'Draft';

  // Remove any padding/margin from root element
  rootEl.style.padding = '0';
  rootEl.style.margin = '0';

  rootEl.innerHTML = `
    <!-- Modern Top Bar with Hamburger -->
    <nav class="project-top-bar">
      <button class="hamburger-btn" data-action="toggle-nav" aria-label="Toggle Navigation">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div class="project-breadcrumb">
        <span class="project-name">${projectName}</span>
        <span class="breadcrumb-separator">›</span>
        <span class="active-section">${tabs.find(t => t.id === activeTab)?.label || 'Overview'}</span>
      </div>
      <button class="shell-tab close-project-btn" data-action="close-project">Close Project</button>
    </nav>

    <!-- Slide-Out Navigation Panel -->
    <div class="nav-panel-overlay" data-action="close-nav"></div>
    <aside class="nav-panel">
      <div class="nav-panel-header">
        <h3>Navigation</h3>
        <button class="nav-close-btn" data-action="close-nav" aria-label="Close Navigation">×</button>
      </div>

      <div class="nav-panel-body">
        <!-- Main Navigation -->
        <div class="nav-section">
          <div class="nav-section-label">Main Sections</div>
          ${tabs.map(({ id, label, icon }) => `
            <a href="#/project/${id}" class="nav-panel-item ${activeTab === id ? 'active' : ''}" data-route="#/project/${id}" data-action="nav-link">
              <span class="nav-item-icon">${icon}</span>
              <span class="nav-item-label">${label}</span>
              ${activeTab === id ? '<span class="nav-item-indicator"></span>' : ''}
            </a>
          `).join('')}
        </div>

        <!-- Divider -->
        <div class="nav-divider"></div>

        <!-- Tools Section -->
        <div class="nav-section">
          <div class="nav-section-label">Tools</div>
          ${moreItems.map(({ id, label, icon }) => `
            <a href="#/project/${id}" class="nav-panel-item ${activeTab === id ? 'active' : ''}" data-route="#/project/${id}" data-action="nav-link">
              <span class="nav-item-icon">${icon}</span>
              <span class="nav-item-label">${label}</span>
              ${activeTab === id ? '<span class="nav-item-indicator"></span>' : ''}
            </a>
          `).join('')}
        </div>

        <!-- Divider -->
        <div class="nav-divider"></div>

        <!-- Project Info -->
        <div class="nav-project-info">
          <div class="nav-info-label">Project Status</div>
          <div class="nav-info-value status-${projectStatus.toLowerCase().replace(/\s+/g, '-')}">${projectStatus}</div>
          <div class="nav-info-label" style="margin-top: 12px;">Last Updated</div>
          <div class="nav-info-value">${new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </aside>

    <div id="project-subview-host" class="container" style="padding: 0;"></div>
  `;

  const subRoot = rootEl.querySelector('#project-subview-host');

  // --- FIX: Call the imported renderPreField function ---
  switch(activeTab) {
    case 'overview': await renderOverview(subRoot); break;
    case 'pre-field': await renderPreField(subRoot); break; // This now uses the correct, modern view
    case 'validator':
      renderValidationView({
        hostEl: subRoot,
        project: window.state?.project || {},
        onNavigateToQuestion: (questionId) => {
          // Navigate back to pre-field and select the question
          window.location.hash = '#/project/pre-field';
          // You could add logic here to select the specific question
        }
      });
      break;
    case 'crosstabs':
      // Launch Shiny app for cross-tabs
      const projectId = window.state?.project?.id || 'No project loaded';

      subRoot.innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <h2 style="color: #212161; margin-bottom: 20px;">Cross-Tabulation & Reporting</h2>
          <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">
            Interactive data visualization and cross-tabulation powered by Python Shiny
          </p>

          <div style="background: #dbeafe; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; max-width: 600px; margin-left: auto; margin-right: auto;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase;">Your Project ID</h4>
            <div style="background: white; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 14px; color: #1e293b; display: flex; align-items: center; justify-content: space-between;">
              <code id="project-id-text" style="flex: 1;">${projectId}</code>
              <button id="copy-project-id" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 10px;">
                Copy
              </button>
            </div>
            <p style="color: #1e40af; font-size: 13px; margin: 10px 0 0 0;">Paste this ID in the Shiny app to load your banner plans</p>
          </div>

          <button
            id="launch-shiny-app"
            style="
              background: linear-gradient(135deg, #212161 0%, #3F6AB7 100%);
              color: white;
              padding: 15px 40px;
              font-size: 18px;
              font-weight: 600;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              transition: all 0.2s;
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.15)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)'"
          >
            Launch Reporting Dashboard
          </button>
          <div id="shiny-status" style="margin-top: 30px; color: #64748b;"></div>

          <div style="margin-top: 40px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto; background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h4 style="color: #212161; margin-top: 0;">Features:</h4>
            <ul style="color: #475569; line-height: 1.8;">
              <li><strong>Interactive Charts:</strong> Plotly visualizations with zoom, pan, hover</li>
              <li><strong>Complete Scales:</strong> Shows all Likert scale points (including 0%)</li>
              <li><strong>Cross-Tabulation:</strong> Load banner plans from database</li>
              <li><strong>Data Manipulation:</strong> Filter, analyze, recalculate</li>
              <li><strong>Export Everything:</strong> PNG charts, CSV data, Excel reports</li>
            </ul>

            <h4 style="color: #212161; margin-top: 20px;">How to Use:</h4>
            <ol style="color: #475569; line-height: 1.8;">
              <li>Click "Launch Reporting Dashboard" above</li>
              <li>Upload your SPSS <code>Labels.csv</code> and <code>Codes.csv</code> files</li>
              <li>Click any question to generate an interactive chart</li>
              <li>Paste your Project ID to load banner plans</li>
              <li>Click banner columns to filter data</li>
              <li>Export charts, data, or cross-tabs</li>
            </ol>

            <h4 style="color: #212161; margin-top: 20px;">Sample Files:</h4>
            <ul style="color: #475569; line-height: 1.8;">
              <li><strong>SPSS Data:</strong> <code>apps/web/examples/SPSS/</code></li>
              <li><strong>Banner Plans:</strong> Auto-loaded from database</li>
            </ul>
          </div>
        </div>
      `;

      // Add click handlers
      setTimeout(() => {
        const launchBtn = subRoot.querySelector('#launch-shiny-app');
        const statusDiv = subRoot.querySelector('#shiny-status');
        const copyBtn = subRoot.querySelector('#copy-project-id');
        const projectIdText = subRoot.querySelector('#project-id-text');

        // Copy Project ID button
        if (copyBtn && projectIdText) {
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(projectIdText.textContent).then(() => {
              const originalText = copyBtn.textContent;
              copyBtn.textContent = '✅ Copied!';
              setTimeout(() => {
                copyBtn.textContent = originalText;
              }, 2000);
            }).catch(err => {
              console.error('Failed to copy:', err);
              copyBtn.textContent = '❌ Failed';
            });
          });
        }

        if (launchBtn) {
          launchBtn.addEventListener('click', async () => {
            launchBtn.disabled = true;
            launchBtn.textContent = 'Starting Shiny app...';
            statusDiv.innerHTML = '<p style="color: #3F6AB7;">Checking if Shiny app is running...</p>';

            try {
              // Check if Shiny app is running on port 8000
              const checkResponse = await fetch('http://localhost:8000', { mode: 'no-cors' });

              // Open Shiny app in new window
              window.open('http://localhost:8000', '_blank', 'width=1600,height=1000');
              statusDiv.innerHTML = `
                <div style="color: #166534; background: #dcfce7; padding: 15px; border-radius: 6px; border: 1px solid #bbf7d0;">
                  ✅ Reporting Dashboard opened in new window!<br>
                  <small>If it didn't open, visit: <a href="http://localhost:8000" target="_blank" style="color: #166534; font-weight: 600;">http://localhost:8000</a></small>
                </div>
              `;
              launchBtn.disabled = false;
              launchBtn.textContent = 'Re-launch Reporting Dashboard';
            } catch (error) {
              console.error('Shiny app not running, showing instructions:', error);
              statusDiv.innerHTML = `
                <div style="color: #991b1b; background: #fee2e2; padding: 15px; border-radius: 6px; border: 1px solid #fecaca;">
                  ⚠️ Shiny app is not running yet. Please start it manually:<br><br>
                  <strong>Option 1: Double-click this file:</strong><br>
                  <code style="background: white; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 8px;">
                    shiny_app/START_REPORTING_APP.bat
                  </code><br><br>
                  <strong>Option 2: Install & Run (first time):</strong><br>
                  <code style="background: white; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 8px;">
                    shiny_app/INSTALL_AND_RUN.bat
                  </code><br><br>
                  <small style="display: block; margin-top: 8px;">
                    Then click "Launch Reporting Dashboard" again, or visit:
                    <a href="http://localhost:8000" target="_blank" style="color: #991b1b; font-weight: 600;">http://localhost:8000</a>
                  </small>
                </div>
              `;
              launchBtn.disabled = false;
              launchBtn.textContent = 'Launch Reporting Dashboard';
            }
          });
        }
      }, 100);
      break;
    case 'library':
      renderLibraryView({
        hostEl: subRoot,
        onInsertQuestion: (question) => {
          // Add the question to the current project
          if (window.state?.project?.questions) {
            window.state.project.questions.push(question);
            // Navigate back to editor to see the new question
            window.location.hash = '#/project/pre-field';
          }
        },
        onClose: () => {
          window.location.hash = '#/project/pre-field';
        }
      });
      break;
    case 'preview':
      subRoot.innerHTML = '<div class="container"><h2>Survey Preview</h2><p>Coming soon.</p></div>';
      break;
    case 'rules':
      subRoot.innerHTML = '<div class="container"><h2>Project Rules</h2><p>Coming soon.</p></div>';
      break;
    case 'export':
      subRoot.innerHTML = '<div class="container"><h2>Export Options</h2><p>Coming soon.</p></div>';
      break;
    case 'fielding': await renderFielding(subRoot); break;
    case 'reporting': await renderReporting(subRoot); break;
    default: await renderOverview(subRoot);
  }

  rootEl.querySelector('[data-action="close-project"]')?.addEventListener('click', closeProject);

  // Handle navigation panel toggle
  const hamburgerBtn = rootEl.querySelector('[data-action="toggle-nav"]');
  const navPanel = rootEl.querySelector('.nav-panel');
  const navOverlay = rootEl.querySelector('.nav-panel-overlay');
  const navCloseBtn = rootEl.querySelector('[data-action="close-nav"]');
  const navLinks = rootEl.querySelectorAll('[data-action="nav-link"]');

  function openNav() {
    navPanel.classList.add('open');
    navOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeNav() {
    navPanel.classList.remove('open');
    navOverlay.classList.remove('visible');
    document.body.style.overflow = ''; // Restore scrolling
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (navPanel.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  if (navCloseBtn) {
    navCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeNav();
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', (e) => {
      e.preventDefault();
      closeNav();
    });
  }

  // Close nav when clicking any navigation link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeNav();
    });
  });

  // Close nav on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navPanel.classList.contains('open')) {
      closeNav();
    }
  });

  // Apply status-based styling to project workspace
  applyProjectStatusStyling();

  // Implement hide-on-scroll navigation
  setupHideOnScroll(rootEl);
}

/**
 * Apply status-based colors to the project workspace sidebar
 */
function applyProjectStatusStyling() {
  const projectStatus = window.state?.project?.status;
  const editorSidebar = document.querySelector('#editor-sidebar-host');

  if (editorSidebar) {
    // Remove any existing status classes
    editorSidebar.classList.remove('status-draft', 'status-active', 'status-fielding', 'status-reporting', 'status-waiting-for-approval', 'status-archived');

    // Add the appropriate status class
    if (projectStatus) {
      const statusClass = `status-${projectStatus.toLowerCase().replace(/\s+/g, '-')}`;
      editorSidebar.classList.add(statusClass);
    } else {
      // Default to draft if no status
      editorSidebar.classList.add('status-draft');
    }
  }
}

/**
 * Hide navigation on scroll down, show on scroll up
 */
function setupHideOnScroll(rootEl) {
  const nav = rootEl.querySelector('.project-shell-nav');
  if (!nav) return;

  // Find the actual scrolling container - could be body, document, or a specific element
  const scrollContainer = document.documentElement || document.body;

  let lastScrollY = 0;
  let ticking = false;

  const handleScroll = () => {
    const currentScrollY = scrollContainer.scrollTop || window.pageYOffset || document.body.scrollTop || 0;

    // If scrolled more than 50px down and scrolling down, hide nav
    if (currentScrollY > 50 && currentScrollY > lastScrollY) {
      nav.classList.add('nav-hidden');
    }
    // If scrolling up, show nav
    else if (currentScrollY < lastScrollY) {
      nav.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  };

  // Listen on both window and document for maximum compatibility
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('scroll', onScroll, { passive: true });

  // Cleanup function (store it for potential cleanup later)
  nav._scrollCleanup = () => {
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('scroll', onScroll);
  };
}
