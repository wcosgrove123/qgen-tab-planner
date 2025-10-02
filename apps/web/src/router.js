import { getProjects, openProjectById, closeProject } from './api/projects.js';
import { isAuthenticated, getAuthState, signOut } from './lib/auth.js';

import { renderDashboard } from './views/dashboard.js';
import { renderProjects } from './views/projects.js';
import { renderTemplates } from './views/templates.js';
import { renderProjectShell } from './views/project/shell.js';
import { renderAuth } from './views/auth.js';
import { renderProfile } from './views/profile.js';

// Helper to change the URL hash, which triggers the 'hashchange' event
export const goto = (hash) => {
  if (!hash.startsWith('#/')) hash = '#/' + hash.replace(/^#?\/?/, '');
  if (location.hash !== hash) location.hash = hash;
};

export async function renderRoute() {
  const root = document.getElementById('view-root');
  if (!root) return;

  try {
    const hash = (location.hash || '#/dashboard').split('?')[0];
    const authState = getAuthState();

    // Handle authentication routes
    if (hash.startsWith('#/auth/')) {
      const authMode = hash.split('/')[2] || 'signin';
      await renderAuth(root, authMode);
      return;
    }

    // Check if user is authenticated for protected routes
    if (!isAuthenticated()) {
      // Allow public routes
      if (hash === '#/' || hash === '#/auth' || hash.startsWith('#/auth/')) {
        goto('#/auth/signin');
        return;
      }
      // Redirect to sign in for protected routes
      goto('#/auth/signin');
      return;
    }

    // User is authenticated - proceed with protected routes
    const isProjectRoute = hash.startsWith('#/project/');

    if (isProjectRoute) {
      if (window.ui_state?.active_project_id) {
        await renderProjectShell(root, hash);
      } else {
        console.warn('No active project; redirecting to dashboard.');
        goto('#/dashboard');
      }
    } else {
      if (window.ui_state?.active_project_id) {
        await closeProject(false);
      }

      if (hash.startsWith('#/projects')) {
        await renderProjects(root);
      } else if (hash.startsWith('#/templates')) {
        await renderTemplates(root);
      } else if (hash.startsWith('#/profile')) {
        await renderProfile(root);
      } else if (hash.startsWith('#/clients')) {
        root.innerHTML = `<div class="container"><h2>Clients</h2><p>Coming soon.</p></div>`;
      } else if (hash.startsWith('#/analytics')) {
        root.innerHTML = `<div class="container"><h2>Analytics</h2><p>Coming soon.</p></div>`;
      } else {
        await renderDashboard(root);
      }
    }

    await updateHeaderState();
    highlightNav();

  } catch (e) {
    console.error("Routing error:", e);
    root.innerHTML = `<div class="error">${e.stack}</div>`;
    try { await renderDashboard(root); } catch {}
  }
}

export function initRouter() {
  window.addEventListener('hashchange', renderRoute);

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#/"], [data-route]');
    if (a) {
      e.preventDefault();
      const next = a.getAttribute('href') || a.getAttribute('data-route');
      if (next) goto(next);
    }
  });
}

// --- (Your other helper functions like updateHeaderState, highlightNav, etc. remain unchanged) ---
export async function updateHeaderState() {
  const projectNameIndicator = document.getElementById('project-name-indicator');
  if (!projectNameIndicator) return;

  const authState = getAuthState();

  // If user is not authenticated, clear the header
  if (!isAuthenticated()) {
    projectNameIndicator.innerHTML = '';
    return;
  }

  if (window.ui_state?.active_project_id) {
    // If a project is open, just display its name as simple text.
    projectNameIndicator.innerHTML = ''; // Clear any previous dropdown
    projectNameIndicator.textContent = window.state?.project?.name || 'Project Loaded';
    projectNameIndicator.className = 'project-indicator';
  } else {
    // If no project is open, build and display the project selection dropdown.
    const projects = await getProjects();
    const options = projects.map(p => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join('');

    projectNameIndicator.innerHTML = `
      <select id="header-project-selector" class="project-selector-dropdown">
        <option value="" disabled selected>Select a Project...</option>
        ${options}
      </select>
    `;

    // Attach an event listener to the newly created dropdown.
    const selector = document.getElementById('header-project-selector');
    if (selector) {
      selector.addEventListener('change', async (e) => {
        if (e.target.value) {
          const success = await openProjectById(e.target.value);
          if (success) {
            // Navigate to project overview after opening
            goto('#/project/overview');
          }
        }
      });
    }
  }

  // Add user profile menu to actions area
  await updateUserProfile();
}

export function highlightNav() {
    // This function can be expanded later to highlight active navigation links
}

async function updateUserProfile() {
  const authState = getAuthState();

  if (!authState.user) return;

  // Debug: log the auth state
  console.log('Auth state in updateUserProfile:', authState);

  // If we don't have person data, create a simple logout button
  if (!authState.person) {
    let userProfileContainer = document.getElementById('user-profile-container');
    if (!userProfileContainer) {
      const actionsDiv = document.querySelector('header .actions');
      if (!actionsDiv) return;

      userProfileContainer = document.createElement('div');
      userProfileContainer.id = 'user-profile-container';
      userProfileContainer.className = 'user-profile-container';

      const globalSettingsContainer = actionsDiv.querySelector('.global-settings-container');
      actionsDiv.insertBefore(userProfileContainer, globalSettingsContainer);
    }

    userProfileContainer.innerHTML = `
      <style>
        .user-profile-container {
          position: relative;
          margin-left: 12px;
        }
        .simple-user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 500;
        }
        .logout-btn {
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      </style>
      <div class="simple-user-info">
        <span>${authState.user.email}</span>
        <button class="logout-btn" onclick="handleQuickSignOut()">Sign Out</button>
      </div>
    `;

    // Add global logout function
    if (!window.handleQuickSignOut) {
      window.handleQuickSignOut = async function() {
        const result = await signOut();
        if (result.success) {
          goto('#/auth/signin');
        }
      };
    }
    return;
  }

  // Find or create user profile container
  let userProfileContainer = document.getElementById('user-profile-container');
  if (!userProfileContainer) {
    // Insert after project name indicator
    const actionsDiv = document.querySelector('header .actions');
    if (!actionsDiv) return;

    userProfileContainer = document.createElement('div');
    userProfileContainer.id = 'user-profile-container';
    userProfileContainer.className = 'user-profile-container';

    // Insert before the global settings button
    const globalSettingsContainer = actionsDiv.querySelector('.global-settings-container');
    actionsDiv.insertBefore(userProfileContainer, globalSettingsContainer);
  }

  userProfileContainer.innerHTML = `
    <style>
      .user-profile-container {
        position: relative;
        margin-left: 12px;
      }

      .user-profile-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        font-weight: 500;
      }

      .user-profile-button:hover {
        background: rgba(255, 255, 255, 0.25);
      }

      .user-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #667eea;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 12px;
      }

      .user-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        min-width: 220px;
        z-index: 1000;
        overflow: hidden;
        display: none;
      }

      .user-dropdown.show {
        display: block;
      }

      .dropdown-header {
        padding: 16px;
        border-bottom: 1px solid #f3f4f6;
        background: #fafafa;
      }

      .dropdown-user-name {
        font-weight: 600;
        color: #111827;
        margin-bottom: 4px;
      }

      .dropdown-user-email {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 4px;
      }

      .dropdown-user-org {
        font-size: 12px;
        color: #9ca3af;
      }

      .dropdown-menu {
        padding: 8px;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s ease;
        font-size: 14px;
        color: #374151;
      }

      .dropdown-item:hover {
        background: #f3f4f6;
      }

      .dropdown-item.danger {
        color: #dc2626;
      }

      .dropdown-item.danger:hover {
        background: #fef2f2;
      }
    </style>

    <button class="user-profile-button" onclick="toggleUserDropdown()">
      <div class="user-avatar">${getInitials(authState.person.name)}</div>
      <span>${authState.person.name}</span>
      <span>▾</span>
    </button>

    <div class="user-dropdown" id="user-dropdown">
      <div class="dropdown-header">
        <div class="dropdown-user-name">${authState.person.name}</div>
        <div class="dropdown-user-email">${authState.person.email}</div>
        <div class="dropdown-user-org">${authState.organization?.name || 'Default Organization'}</div>
      </div>
      <div class="dropdown-menu">
        <div class="dropdown-item" onclick="editProfile()">
          <span>👤</span>
          <span>Edit Profile</span>
        </div>
        <div class="dropdown-item" onclick="showSettings()">
          <span>⚙️</span>
          <span>Settings</span>
        </div>
        <div class="dropdown-item" onclick="showHelp()">
          <span>❓</span>
          <span>Help & Support</span>
        </div>
        <div class="dropdown-item danger" onclick="handleSignOut()">
          <span>🚪</span>
          <span>Sign Out</span>
        </div>
      </div>
    </div>
  `;

  // Add global functions for dropdown actions
  if (!window.toggleUserDropdown) {
    window.toggleUserDropdown = function() {
      const dropdown = document.getElementById('user-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('show');
      }
    };

    window.handleSignOut = async function() {
      const result = await signOut();
      if (result.success) {
        goto('#/auth/signin');
      }
    };

    window.editProfile = function() {
      alert('Profile editing coming soon!');
    };

    window.showSettings = function() {
      alert('Settings coming soon!');
    };

    window.showHelp = function() {
      alert('Help & Support coming soon!');
    };

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('user-dropdown');
      const button = e.target.closest('.user-profile-button');

      if (!button && dropdown) {
        dropdown.classList.remove('show');
      }
    });
  }
}

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, s =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])
  );
}