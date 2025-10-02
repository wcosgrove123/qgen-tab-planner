import { getAuthState, updateProfile, getCurrentUserProfile, updatePersonProfile } from '../lib/auth.js';
import { goto } from '../router.js';
import supabase from '../lib/supa.js';

export async function renderProfile(el) {
  const authState = getAuthState();

  if (!authState.user) {
    goto('#/auth/signin');
    return;
  }

  // Show loading state first
  el.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 400px;">
      <div style="text-align: center;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f4f6; border-radius: 50%; border-top-color: #667eea; animation: spin 1s ease-in-out infinite;"></div>
        <p style="margin-top: 16px; color: #6b7280;">Loading profile...</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;

  // Fetch complete profile data
  const profileResult = await getCurrentUserProfile();

  if (!profileResult.success) {
    el.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h2>Error Loading Profile</h2>
        <p>${profileResult.error}</p>
        <button onclick="goto('#/dashboard')" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Back to Dashboard</button>
      </div>
    `;
    return;
  }

  const { user, person, organization } = profileResult.data;

  el.innerHTML = `
    <style>
      .profile-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
      }

      /* Business Card Style Header */
      .business-card-header {
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        border-radius: 12px;
        padding: 32px;
        color: white;
        margin-bottom: 24px;
        display: flex;
        gap: 32px;
        box-shadow: 0 8px 32px rgba(30, 41, 59, 0.2);
        position: relative;
        overflow: hidden;
      }

      .business-card-header::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 200px;
        height: 200px;
        background: linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(50%, -50%);
      }

      .card-left {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        position: relative;
        z-index: 1;
      }

      .profile-avatar-large {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 600;
        border: 3px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }

      .company-logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .logo-circle {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .company-name {
        font-size: 0.875rem;
        font-weight: 500;
        opacity: 0.9;
        text-align: center;
      }

      .card-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
        position: relative;
        z-index: 1;
      }

      .name-title {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 16px;
      }

      .full-name {
        margin: 0 0 8px 0;
        font-size: 1.75rem;
        font-weight: 600;
        letter-spacing: -0.025em;
      }

      .professional-title {
        font-size: 1rem;
        font-weight: 500;
        opacity: 0.9;
        margin-bottom: 4px;
      }

      .department {
        font-size: 0.875rem;
        opacity: 0.8;
        font-weight: 400;
      }

      .contact-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .contact-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;
        opacity: 0.9;
      }

      .contact-icon {
        width: 16px;
        text-align: center;
        opacity: 0.7;
      }

      @media (max-width: 768px) {
        .business-card-header {
          flex-direction: column;
          text-align: center;
          padding: 24px;
        }

        .card-left, .card-right {
          align-items: center;
        }

        .contact-info {
          grid-template-columns: 1fr;
          gap: 8px;
        }
      }

      .profile-section {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: #111827;
        margin: 0 0 16px 0;
        display: flex;
        align-items: center;
        gap: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f3f4f6;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .profile-header {
          flex-direction: column;
          text-align: center;
        }
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-label {
        font-weight: 500;
        color: #374151;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }

      .form-input {
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        transition: all 0.2s ease;
        background: #fafafa;
        font-family: inherit;
      }

      .form-input:focus {
        outline: none;
        border-color: #6366f1;
        background: white;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .form-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: #f3f4f6;
        color: #6b7280;
      }

      .button-group {
        display: flex;
        gap: 12px;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #f3f4f6;
      }

      .btn {
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        font-family: inherit;
      }

      .btn-primary {
        background: #6366f1;
        color: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .btn-primary:hover {
        background: #5b21b6;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .btn-secondary {
        background: #f9fafb;
        color: #374151;
        border: 1px solid #d1d5db;
      }

      .btn-secondary:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
      }

      .success-message {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #166534;
        padding: 12px 16px;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 14px;
      }

      .error-message {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 12px 16px;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 14px;
      }

      .info-card {
        background: #f9fafb;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 12px;
        border: 1px solid #e5e7eb;
      }

      .info-card h3 {
        margin: 0 0 8px 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #111827;
      }

      .info-card p {
        margin: 0;
        color: #6b7280;
        line-height: 1.4;
        font-size: 0.875rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
      }

      .stat-card {
        background: #f9fafb;
        border-radius: 6px;
        padding: 16px 12px;
        text-align: center;
        border: 1px solid #e5e7eb;
      }

      .stat-value {
        font-size: 1.25rem;
        font-weight: 600;
        color: #6366f1;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 11px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        font-weight: 500;
      }

      .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #ffffff30;
        border-radius: 50%;
        border-top-color: #ffffff;
        animation: spin 1s ease-in-out infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* Custom Checkbox Styles */
      .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin-top: 8px;
      }

      .checkbox-item {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 6px;
        transition: background-color 0.2s ease;
      }

      .checkbox-item:hover {
        background: #f3f4f6;
      }

      .checkbox-item input[type="checkbox"] {
        display: none;
      }

      .checkmark {
        width: 16px;
        height: 16px;
        border: 2px solid #d1d5db;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .checkbox-item input[type="checkbox"]:checked + .checkmark {
        background: #6366f1;
        border-color: #6366f1;
      }

      .checkbox-item input[type="checkbox"]:checked + .checkmark::after {
        content: '✓';
        color: white;
        font-size: 11px;
        font-weight: 600;
      }

      .checkbox-label {
        font-size: 14px;
        color: #374151;
        font-weight: 400;
      }

      /* Layout improvements */
      .profile-section:last-child {
        margin-bottom: 24px;
      }

      @media (max-width: 768px) {
        .checkbox-grid {
          grid-template-columns: 1fr;
        }

        .profile-container {
          padding: 16px;
        }

        .profile-section {
          padding: 16px;
        }
      }
    </style>

    <div class="profile-container">
      <!-- Professional Business Card Style Header -->
      <div class="business-card-header">
        <div class="card-left">
          <div class="profile-avatar-large">${getInitials(person?.name || user.email)}</div>
          <div class="company-logo">
            <div class="logo-circle">🎯</div>
            <span class="company-name">Cue Insights</span>
          </div>
        </div>
        <div class="card-right">
          <div class="name-title">
            <h1 class="full-name">${person?.name || 'User Profile'}</h1>
            <div class="professional-title">${getProfessionalTitle(person)}</div>
            <div class="department">${getDepartment(person)}</div>
          </div>
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <span>${user.email}</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📞</span>
              <span>${getPhoneNumber(person)}</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📍</span>
              <span>${getOfficeLocation(person)}</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">🗓️</span>
              <span>${getTenure(person)} at Cue Insights</span>
            </div>
          </div>
        </div>
      </div>

      <div id="profile-message"></div>

      <!-- Personal Information -->
      <div class="profile-section">
        <h2 class="section-title">
          <span>👤</span>
          <span>Personal Information</span>
        </h2>

        <form id="profile-form">
          <div class="form-grid">
            <!-- Basic Information -->
            <div class="form-group">
              <label class="form-label" for="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                class="form-input"
                value="${person?.name || ''}"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-input"
                value="${user.email}"
                placeholder="Enter your email"
                required
              />
            </div>

            <!-- Role Selection -->
            <div class="form-group">
              <label class="form-label" for="role">Role</label>
              <select
                id="role"
                name="role"
                class="form-input"
              >
                <option value="Team Member" ${(person?.role || 'Team Member') === 'Team Member' ? 'selected' : ''}>Team Member</option>
                <option value="Project Manager" ${person?.role === 'Project Manager' ? 'selected' : ''}>Project Manager</option>
                <option value="Senior Analyst" ${person?.role === 'Senior Analyst' ? 'selected' : ''}>Senior Analyst</option>
                <option value="Data Analyst" ${person?.role === 'Data Analyst' ? 'selected' : ''}>Data Analyst</option>
                <option value="Research Director" ${person?.role === 'Research Director' ? 'selected' : ''}>Research Director</option>
                <option value="Client Manager" ${person?.role === 'Client Manager' ? 'selected' : ''}>Client Manager</option>
                <option value="Contractor" ${person?.role === 'Contractor' ? 'selected' : ''}>Contractor</option>
                <option value="Admin" ${person?.role === 'Admin' ? 'selected' : ''}>Admin</option>
              </select>
            </div>

            <!-- Organization (Read-only for now) -->
            <div class="form-group">
              <label class="form-label" for="organization">Organization</label>
              <input
                type="text"
                id="organization"
                name="organization"
                class="form-input"
                value="${organization?.name || 'Cue Insights'}"
                disabled
                placeholder="Your organization"
              />
            </div>

            <!-- User Settings/Preferences -->
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="timezone">Timezone</label>
              <select id="timezone" name="timezone" class="form-input">
                <option value="America/New_York" ${getTimezoneSelected('America/New_York', person)}>Eastern Time (ET)</option>
                <option value="America/Chicago" ${getTimezoneSelected('America/Chicago', person)}>Central Time (CT)</option>
                <option value="America/Denver" ${getTimezoneSelected('America/Denver', person)}>Mountain Time (MT)</option>
                <option value="America/Los_Angeles" ${getTimezoneSelected('America/Los_Angeles', person)}>Pacific Time (PT)</option>
                <option value="UTC" ${getTimezoneSelected('UTC', person)}>UTC</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <!-- Professional Details -->
      <div class="profile-section">
        <h2 class="section-title">
          <span>💼</span>
          <span>Professional Details</span>
        </h2>

        <form id="professional-form">
          <div class="form-grid">
            <!-- Start Date -->
            <div class="form-group">
              <label class="form-label" for="startDate">Start Date at Cue Insights</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                class="form-input"
                value="${getContactInfo('startDate', person)}"
                placeholder="When did you join?"
              />
            </div>

            <!-- Phone Number -->
            <div class="form-group">
              <label class="form-label" for="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                class="form-input"
                value="${getContactInfo('phone', person)}"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <!-- Office Location -->
            <div class="form-group">
              <label class="form-label" for="location">Office Location</label>
              <select id="location" name="location" class="form-input">
                <option value="Remote" ${getContactInfo('location', person) === 'Remote' ? 'selected' : ''}>Remote</option>
                <option value="New York, NY" ${getContactInfo('location', person) === 'New York, NY' ? 'selected' : ''}>New York, NY</option>
                <option value="Los Angeles, CA" ${getContactInfo('location', person) === 'Los Angeles, CA' ? 'selected' : ''}>Los Angeles, CA</option>
                <option value="Chicago, IL" ${getContactInfo('location', person) === 'Chicago, IL' ? 'selected' : ''}>Chicago, IL</option>
                <option value="Austin, TX" ${getContactInfo('location', person) === 'Austin, TX' ? 'selected' : ''}>Austin, TX</option>
                <option value="Atlanta, GA" ${getContactInfo('location', person) === 'Atlanta, GA' ? 'selected' : ''}>Atlanta, GA</option>
                <option value="Other" ${getContactInfo('location', person) === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>

            <!-- LinkedIn Profile -->
            <div class="form-group">
              <label class="form-label" for="linkedin">LinkedIn Profile</label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                class="form-input"
                value="${getContactInfo('linkedin', person)}"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <!-- Areas of Expertise -->
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="expertise">Areas of Expertise</label>
              <textarea
                id="expertise"
                name="expertise"
                class="form-input"
                rows="3"
                placeholder="Market research, data analysis, survey design, SPSS, statistical modeling..."
                style="resize: vertical; font-family: inherit;"
              >${getContactInfo('expertise', person)}</textarea>
            </div>

            <!-- Certifications -->
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="certifications">Certifications & Education</label>
              <textarea
                id="certifications"
                name="certifications"
                class="form-input"
                rows="2"
                placeholder="PMP, Google Analytics Certified, Master's in Marketing Research..."
                style="resize: vertical; font-family: inherit;"
              >${getContactInfo('certifications', person)}</textarea>
            </div>
          </div>

          <div class="button-group">
            <button type="submit" class="btn btn-primary" id="save-professional-btn">
              Save Professional Details
            </button>
          </div>
        </form>
      </div>

      <!-- Settings & Preferences -->
      <div class="profile-section">
        <h2 class="section-title">
          <span>⚙️</span>
          <span>Settings & Preferences</span>
        </h2>

        <form id="settings-form">
          <div class="form-grid">
            <!-- Notification Preferences -->
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Notifications</label>
              <div class="checkbox-grid">
                <label class="checkbox-item">
                  <input type="checkbox" id="emailNotifications" name="emailNotifications" ${getNotificationSetting('emailNotifications', true, person) ? 'checked' : ''}>
                  <span class="checkmark"></span>
                  <span class="checkbox-label">Project updates</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" id="projectAssignments" name="projectAssignments" ${getNotificationSetting('projectAssignments', true, person) ? 'checked' : ''}>
                  <span class="checkmark"></span>
                  <span class="checkbox-label">New assignments</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" id="weeklyReports" name="weeklyReports" ${getNotificationSetting('weeklyReports', false, person) ? 'checked' : ''}>
                  <span class="checkmark"></span>
                  <span class="checkbox-label">Weekly reports</span>
                </label>
              </div>
            </div>

            <!-- Dashboard Preferences -->
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Dashboard</label>
              <div class="checkbox-grid">
                <label class="checkbox-item">
                  <input type="checkbox" id="showActivityFeed" name="showActivityFeed" ${getDashboardSetting('showActivityFeed', true, person) ? 'checked' : ''}>
                  <span class="checkmark"></span>
                  <span class="checkbox-label">Activity feed</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" id="showProjectMetrics" name="showProjectMetrics" ${getDashboardSetting('showProjectMetrics', true, person) ? 'checked' : ''}>
                  <span class="checkmark"></span>
                  <span class="checkbox-label">Project metrics</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" id="compactView" name="compactView" ${getDashboardSetting('compactView', false, person) ? 'checked' : ''}>
                  <span class="checkmark"></span>
                  <span class="checkbox-label">Compact view</span>
                </label>
              </div>
            </div>
          </div>

          <div class="button-group">
            <button type="submit" class="btn btn-primary" id="save-settings-btn">
              Save Settings
            </button>
          </div>
        </form>
      </div>

      <!-- Account Information -->
      <div class="profile-section">
        <h2 class="section-title">
          <span>ℹ️</span>
          <span>Account Information</span>
        </h2>

        <div class="info-card">
          <h3>Account Created</h3>
          <p>${new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
        </div>

        <div class="info-card">
          <h3>Last Sign In</h3>
          <p>${user.last_sign_in_at ?
            new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'First time signing in'}</p>
        </div>
      </div>

      <!-- Activity Stats -->
      <div class="profile-section">
        <h2 class="section-title">
          <span>📊</span>
          <span>Activity Overview</span>
        </h2>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">--</div>
            <div class="stat-label">Projects Created</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">--</div>
            <div class="stat-label">Questions Added</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">--</div>
            <div class="stat-label">Reports Generated</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${calculateDaysActive(user.created_at)}</div>
            <div class="stat-label">Days Active</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Set up form handling
  setupProfileForm(el);
  setupProfessionalForm(el);
  setupSettingsForm(el);
}

function setupProfileForm(el) {
  const form = el.querySelector('#profile-form');
  const saveBtn = el.querySelector('#save-profile-btn');
  const messageDiv = el.querySelector('#profile-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // Collect all form data
    const profileData = {
      name: formData.get('fullName'),
      email: formData.get('email'),
      role: formData.get('role'),
      settings: {
        timezone: formData.get('timezone'),
        notifications: {
          emailNotifications: formData.get('emailNotifications') === 'on',
          projectAssignments: formData.get('projectAssignments') === 'on',
          weeklyReports: formData.get('weeklyReports') === 'on'
        },
        dashboard: {
          showActivityFeed: formData.get('showActivityFeed') === 'on',
          showProjectMetrics: formData.get('showProjectMetrics') === 'on',
          compactView: formData.get('compactView') === 'on'
        }
      }
    };

    console.log('Profile data to save:', profileData);

    // Show loading state
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';

    try {
      console.log('Starting profile update...', profileData);

      // Skip auth update for now and just update the database directly
      console.log('Updating person profile directly...');
      const personResult = await updatePersonProfile(profileData);

      console.log('Person update result:', personResult);

      if (personResult.success) {
        showSuccess(messageDiv, 'Profile updated successfully!');
        // Scroll to top to see message
        messageDiv.scrollIntoView({ behavior: 'smooth' });

        // Reload the page after a short delay to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showError(messageDiv, personResult.error || 'Failed to update profile settings');
      }

    } catch (error) {
      console.error('Profile update error:', error);
      showError(messageDiv, error.message || 'An unexpected error occurred');
    } finally {
      // Reset button
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Save Changes';
    }
  });

  // Clear messages on input
  form.addEventListener('input', () => {
    messageDiv.innerHTML = '';
  });
}

function setupProfessionalForm(el) {
  const form = el.querySelector('#professional-form');
  const saveBtn = el.querySelector('#save-professional-btn');
  const messageDiv = el.querySelector('#profile-message');

  if (!form || !saveBtn || !messageDiv) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // Collect professional contact info
    const contactInfo = {
      startDate: formData.get('startDate'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      linkedin: formData.get('linkedin'),
      expertise: formData.get('expertise'),
      certifications: formData.get('certifications')
    };

    console.log('Professional data to save:', contactInfo);

    // Show loading state
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';

    try {
      // Get current person data and update settings
      const currentProfile = await getCurrentUserProfile();
      if (!currentProfile.success) {
        throw new Error('Failed to get current profile');
      }

      const updatedSettings = {
        ...currentProfile.data.person.settings,
        contactInfo: {
          ...currentProfile.data.person.settings?.contactInfo,
          ...contactInfo
        }
      };

      const profileData = {
        name: currentProfile.data.person.name,
        role: currentProfile.data.person.role,
        settings: updatedSettings
      };

      console.log('Updating professional settings directly...', profileData);

      // Update the database directly (bypass auth update like in main form)
      const { error } = await supabase
        .from('people')
        .update({
          name: profileData.name,
          role: profileData.role,
          settings: profileData.settings
        })
        .eq('auth_user_id', currentProfile.data.user.id);

      if (error) {
        console.error('Database update error:', error);
        throw new Error(error.message);
      }

      const result = { success: true };

      if (result.success) {
        showSuccess(messageDiv, 'Professional details updated successfully!');
        messageDiv.scrollIntoView({ behavior: 'smooth' });

        // Reload the page after a short delay to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showError(messageDiv, result.error || 'Failed to update professional details');
      }

    } catch (error) {
      console.error('Professional update error:', error);
      showError(messageDiv, error.message || 'An unexpected error occurred');
    } finally {
      // Reset button
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Save Professional Details';
    }
  });

  // Clear messages on input
  form.addEventListener('input', () => {
    messageDiv.innerHTML = '';
  });
}

function setupSettingsForm(el) {
  const form = el.querySelector('#settings-form');
  const saveBtn = el.querySelector('#save-settings-btn');
  const messageDiv = el.querySelector('#profile-message');

  if (!form || !saveBtn || !messageDiv) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // Get current person data
    const currentProfile = await getCurrentUserProfile();
    if (!currentProfile.success) {
      showError(messageDiv, 'Failed to get current profile');
      return;
    }

    // Collect settings data
    const updatedSettings = {
      ...currentProfile.data.person.settings,
      notifications: {
        emailNotifications: formData.get('emailNotifications') === 'on',
        projectAssignments: formData.get('projectAssignments') === 'on',
        weeklyReports: formData.get('weeklyReports') === 'on'
      },
      dashboard: {
        showActivityFeed: formData.get('showActivityFeed') === 'on',
        showProjectMetrics: formData.get('showProjectMetrics') === 'on',
        compactView: formData.get('compactView') === 'on'
      }
    };

    const profileData = {
      name: currentProfile.data.person.name,
      role: currentProfile.data.person.role,
      settings: updatedSettings
    };

    console.log('Settings data to save:', profileData);

    // Show loading state
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';

    try {
      console.log('Updating settings directly...', profileData);

      // Update the database directly (bypass auth update)
      const { error } = await supabase
        .from('people')
        .update({
          name: profileData.name,
          role: profileData.role,
          settings: profileData.settings
        })
        .eq('auth_user_id', currentProfile.data.user.id);

      if (error) {
        console.error('Database update error:', error);
        throw new Error(error.message);
      }

      const result = { success: true };

      if (result.success) {
        showSuccess(messageDiv, 'Settings updated successfully!');
        messageDiv.scrollIntoView({ behavior: 'smooth' });

        // Reload the page after a short delay to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showError(messageDiv, result.error || 'Failed to update settings');
      }

    } catch (error) {
      console.error('Settings update error:', error);
      showError(messageDiv, error.message || 'An unexpected error occurred');
    } finally {
      // Reset button
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Save Settings';
    }
  });

  // Clear messages on input
  form.addEventListener('input', () => {
    messageDiv.innerHTML = '';
  });
}


function showSuccess(messageDiv, message) {
  messageDiv.innerHTML = `<div class="success-message">${message}</div>`;
}

function showError(messageDiv, message) {
  messageDiv.innerHTML = `<div class="error-message">${message}</div>`;
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

function calculateDaysActive(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getTimezoneSelected(timezone, person) {
  const userTimezone = person?.settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  return userTimezone === timezone ? 'selected' : '';
}

function getNotificationSetting(setting, defaultValue, person) {
  const notifications = person?.settings?.notifications || {};
  return notifications[setting] !== undefined ? notifications[setting] : defaultValue;
}

function getDashboardSetting(setting, defaultValue, person) {
  const dashboard = person?.settings?.dashboard || {};
  return dashboard[setting] !== undefined ? dashboard[setting] : defaultValue;
}

// Professional business card helper functions
function getProfessionalTitle(person) {
  if (!person) return 'Team Member';

  // Map roles to professional titles
  const titleMap = {
    'Research Director': 'Research Director',
    'Project Manager': 'Project Manager',
    'Senior Analyst': 'Senior Market Research Analyst',
    'Data Analyst': 'Data Research Analyst',
    'Client Manager': 'Client Success Manager',
    'Team Member': 'Market Research Analyst',
    'Contractor': 'Research Consultant',
    'Admin': 'Administrator'
  };

  return titleMap[person.role] || person.role || 'Team Member';
}

function getDepartment(person) {
  if (!person) return 'Research & Analytics';

  // Map roles to departments
  const deptMap = {
    'Research Director': 'Research & Analytics',
    'Project Manager': 'Project Management',
    'Senior Analyst': 'Research & Analytics',
    'Data Analyst': 'Data & Analytics',
    'Client Manager': 'Client Success',
    'Team Member': 'Research & Analytics',
    'Contractor': 'Consulting',
    'Admin': 'Operations'
  };

  return deptMap[person.role] || 'Research & Analytics';
}

function getPhoneNumber(person) {
  // For now, return a placeholder or extract from settings
  const phone = person?.settings?.contactInfo?.phone;
  return phone || '+1 (555) 123-4567';
}

function getOfficeLocation(person) {
  // Extract from settings or provide default
  const location = person?.settings?.contactInfo?.location;
  return location || 'Remote';
}

function getTenure(person) {
  if (!person?.settings?.contactInfo?.startDate) {
    return 'New Team Member';
  }

  const startDate = new Date(person.settings.contactInfo.startDate);
  const now = new Date();
  const diffTime = Math.abs(now - startDate);
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));

  if (diffYears > 0) {
    return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  } else {
    return 'New Team Member';
  }
}

function getContactInfo(field, person) {
  const contactInfo = person?.settings?.contactInfo || {};
  return contactInfo[field] || '';
}