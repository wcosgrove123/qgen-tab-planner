import { signIn, signUp, resetPassword, signInWithOAuth } from '../lib/auth.js';
import { goto } from '../router.js';

export function renderAuth(el, mode = 'signin') {
  el.innerHTML = `
    <style>
      .auth-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .auth-card {
        background: white;
        border-radius: 24px;
        padding: 48px;
        width: 100%;
        max-width: 440px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        position: relative;
        overflow: hidden;
      }

      .auth-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2);
      }

      .auth-header {
        text-align: center;
        margin-bottom: 32px;
      }

      .auth-logo {
        font-size: 3rem;
        margin-bottom: 16px;
      }

      .auth-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1a202c;
        margin-bottom: 8px;
      }

      .auth-subtitle {
        color: #718096;
        font-size: 1rem;
      }

      .auth-form {
        margin-bottom: 24px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-label {
        display: block;
        font-weight: 600;
        color: #374151;
        margin-bottom: 6px;
        font-size: 14px;
      }

      .form-input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        font-size: 16px;
        transition: all 0.2s ease;
        background: #fafafa;
      }

      .form-input:focus {
        outline: none;
        border-color: #667eea;
        background: white;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .form-input.error {
        border-color: #ef4444;
        background: #fef2f2;
      }

      .auth-button {
        width: 100%;
        padding: 14px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-bottom: 16px;
      }

      .auth-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      .auth-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .oauth-button {
        width: 100%;
        padding: 12px 24px;
        border: 2px solid #e5e7eb;
        background: white;
        color: #374151;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .oauth-button:hover {
        border-color: #d1d5db;
        background: #f9fafb;
      }

      .divider {
        display: flex;
        align-items: center;
        margin: 24px 0;
        font-size: 14px;
        color: #9ca3af;
      }

      .divider::before,
      .divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #e5e7eb;
      }

      .divider span {
        margin: 0 16px;
      }

      .auth-links {
        text-align: center;
        font-size: 14px;
      }

      .auth-link {
        color: #667eea;
        text-decoration: none;
        font-weight: 500;
        cursor: pointer;
      }

      .auth-link:hover {
        text-decoration: underline;
      }

      .error-message {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 14px;
      }

      .success-message {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #166534;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 14px;
      }

      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid #ffffff30;
        border-radius: 50%;
        border-top-color: #ffffff;
        animation: spin 1s ease-in-out infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .signup-only {
        display: ${mode === 'signup' ? 'block' : 'none'};
      }

      .signin-only {
        display: ${mode === 'signin' ? 'block' : 'none'};
      }

      .forgot-password-only {
        display: ${mode === 'forgot' ? 'block' : 'none'};
      }

      .signin-signup-only {
        display: ${mode === 'signin' || mode === 'signup' ? 'block' : 'none'};
      }
    </style>

    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">🎯</div>
          <h1 class="auth-title">
            <span class="signin-only">Welcome Back</span>
            <span class="signup-only">Create Account</span>
            <span class="forgot-password-only">Reset Password</span>
          </h1>
          <p class="auth-subtitle">
            <span class="signin-only">Sign in to your Q-Gen account</span>
            <span class="signup-only">Join your team on Q-Gen</span>
            <span class="forgot-password-only">Enter your email to reset your password</span>
          </p>
        </div>

        <div id="auth-message"></div>

        <form class="auth-form" id="auth-form">
          <div class="form-group signup-only">
            <label class="form-label" for="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              class="form-input"
              placeholder="Enter your full name"
              ${mode === 'signup' ? 'required' : ''}
            />
          </div>

          <div class="form-group signup-only">
            <label class="form-label" for="organizationName">Organization Name</label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              class="form-input"
              placeholder="Your company or organization"
              ${mode === 'signup' ? 'required' : ''}
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              class="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group signin-signup-only">
            <label class="form-label" for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              class="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" class="auth-button" id="auth-submit">
            <span class="signin-only">Sign In</span>
            <span class="signup-only">Create Account</span>
            <span class="forgot-password-only">Send Reset Link</span>
          </button>
        </form>

        <div class="signin-signup-only">
          <div class="divider">
            <span>or continue with</span>
          </div>

          <button class="oauth-button" data-provider="google">
            <span>🔍</span>
            <span>Continue with Google</span>
          </button>

          <button class="oauth-button" data-provider="github">
            <span>⚡</span>
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div class="auth-links">
          <span class="signin-only">
            Don't have an account?
            <a class="auth-link" data-mode="signup">Sign up</a>
          </span>
          <span class="signup-only">
            Already have an account?
            <a class="auth-link" data-mode="signin">Sign in</a>
          </span>
          <span class="signin-only">
            <br><br>
            <a class="auth-link" data-mode="forgot">Forgot your password?</a>
          </span>
          <span class="forgot-password-only">
            Remember your password?
            <a class="auth-link" data-mode="signin">Sign in</a>
          </span>
        </div>
      </div>
    </div>
  `;

  // Set up event handlers
  setupAuthHandlers(el, mode);
}

function setupAuthHandlers(el, initialMode) {
  let currentMode = initialMode;
  const form = el.querySelector('#auth-form');
  const submitBtn = el.querySelector('#auth-submit');
  const messageDiv = el.querySelector('#auth-message');

  // Mode switching
  el.addEventListener('click', (e) => {
    const modeLink = e.target.closest('[data-mode]');
    if (modeLink) {
      e.preventDefault();
      const newMode = modeLink.dataset.mode;
      goto(`#/auth/${newMode}`);
    }

    // OAuth buttons
    const oauthBtn = e.target.closest('[data-provider]');
    if (oauthBtn) {
      handleOAuth(oauthBtn.dataset.provider, messageDiv, oauthBtn);
    }
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(form, currentMode, messageDiv, submitBtn);
  });

  // Clear errors on input
  form.addEventListener('input', () => {
    clearMessage(messageDiv);
    form.querySelectorAll('.form-input').forEach(input => {
      input.classList.remove('error');
    });
  });
}

async function handleFormSubmit(form, mode, messageDiv, submitBtn) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Clear previous errors
  clearMessage(messageDiv);
  form.querySelectorAll('.form-input').forEach(input => {
    input.classList.remove('error');
  });

  // Validation
  if (!data.email || data.email.trim() === '') {
    showError(messageDiv, 'Email is required');
    const emailField = form.querySelector('#email');
    if (emailField) {
      emailField.classList.add('error');
      emailField.focus();
    }
    return;
  }

  if ((mode === 'signin' || mode === 'signup') && (!data.password || data.password.trim() === '')) {
    showError(messageDiv, 'Password is required');
    const passwordField = form.querySelector('#password');
    if (passwordField) {
      passwordField.classList.add('error');
      passwordField.focus();
    }
    return;
  }

  if (mode === 'signup') {
    if (!data.fullName || data.fullName.trim() === '') {
      showError(messageDiv, 'Full name is required');
      const fullNameField = form.querySelector('#fullName');
      if (fullNameField) {
        fullNameField.classList.add('error');
        fullNameField.focus();
      }
      return;
    }
    if (!data.organizationName || data.organizationName.trim() === '') {
      showError(messageDiv, 'Organization name is required');
      const orgField = form.querySelector('#organizationName');
      if (orgField) {
        orgField.classList.add('error');
        orgField.focus();
      }
      return;
    }
  }

  // Show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner"></span>';

  try {
    let result;

    switch (mode) {
      case 'signin':
        result = await signIn({
          email: data.email,
          password: data.password
        });
        break;

      case 'signup':
        result = await signUp({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          organizationName: data.organizationName
        });
        break;

      case 'forgot':
        result = await resetPassword(data.email);
        break;
    }

    if (result.success) {
      if (mode === 'signup') {
        showSuccess(messageDiv, 'Account created successfully! Redirecting to dashboard...');
        // Auto-redirect to dashboard after successful signup
        setTimeout(() => {
          goto('#/dashboard');
        }, 1500);
      } else if (mode === 'forgot') {
        showSuccess(messageDiv, 'Password reset link sent to your email.');
      } else {
        // Sign in successful - redirect to dashboard
        goto('#/dashboard');
        return;
      }
    } else {
      showError(messageDiv, result.error);
    }

  } catch (error) {
    console.error('Auth error:', error);
    showError(messageDiv, 'An unexpected error occurred');
  } finally {
    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = mode === 'signin' ? 'Sign In' :
                         mode === 'signup' ? 'Create Account' :
                         'Send Reset Link';
  }
}

async function handleOAuth(provider, messageDiv, button) {
  const originalText = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<span class="loading-spinner"></span>';

  try {
    const result = await signInWithOAuth(provider);

    if (!result.success) {
      showError(messageDiv, result.error);
    }
    // On success, the OAuth flow will redirect, so no need for additional handling

  } catch (error) {
    console.error('OAuth error:', error);
    showError(messageDiv, 'OAuth sign in failed');
  } finally {
    button.disabled = false;
    button.innerHTML = originalText;
  }
}

function showError(messageDiv, message) {
  messageDiv.innerHTML = `<div class="error-message">${message}</div>`;
}

function showSuccess(messageDiv, message) {
  messageDiv.innerHTML = `<div class="success-message">${message}</div>`;
}

function clearMessage(messageDiv) {
  messageDiv.innerHTML = '';
}