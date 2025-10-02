/**
 * Modern UI Enhancements for Q-Gen
 * Professional animations and micro-interactions
 */

export function initModernEnhancements() {
    initHamburgerAnimation();
    initSmoothScrolling();
    initCardHoverEffects();
    initLoadingStates();
    initToastNotifications();
    initKeyboardShortcuts();
}

/**
 * Modern Hamburger Menu Animation
 * Smooth morphing animation instead of basic toggle
 */
function initHamburgerAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        .hamburger-button {
            position: relative;
            width: 32px;
            height: 32px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hamburger-button:hover {
            opacity: 0.8;
            transform: scale(1.05);
        }

        .hamburger-icon {
            width: 24px;
            height: 18px;
            position: relative;
            transform: rotate(0deg);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hamburger-line {
            display: block;
            position: absolute;
            height: 2px;
            width: 100%;
            background: var(--fg);
            border-radius: 2px;
            opacity: 1;
            left: 0;
            transform: rotate(0deg);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hamburger-line:nth-child(1) {
            top: 0px;
        }

        .hamburger-line:nth-child(2) {
            top: 8px;
        }

        .hamburger-line:nth-child(3) {
            top: 16px;
        }

        /* Animated X state */
        .hamburger-button.active .hamburger-line:nth-child(1) {
            top: 8px;
            transform: rotate(45deg);
        }

        .hamburger-button.active .hamburger-line:nth-child(2) {
            opacity: 0;
            transform: translateX(-20px);
        }

        .hamburger-button.active .hamburger-line:nth-child(3) {
            top: 8px;
            transform: rotate(-45deg);
        }

        /* Backdrop animation */
        .sidebar-backdrop {
            backdrop-filter: blur(4px);
            transition: backdrop-filter 0.3s ease, opacity 0.3s ease;
        }

        body:not(.sidebar-open) .sidebar-backdrop {
            backdrop-filter: blur(0px);
        }
    `;
    document.head.appendChild(style);

    // Replace existing hamburger with modern version
    document.addEventListener('DOMContentLoaded', () => {
        const existingHamburger = document.querySelector('[data-action="toggle-sidebar"]');
        if (existingHamburger) {
            existingHamburger.innerHTML = `
                <div class="hamburger-icon">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </div>
            `;
            existingHamburger.classList.add('hamburger-button');

            // Toggle active state
            const toggleSidebar = () => {
                const isOpen = document.body.classList.contains('sidebar-open');
                existingHamburger.classList.toggle('active', isOpen);
            };

            // Listen for sidebar state changes
            const observer = new MutationObserver(toggleSidebar);
            observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        }
    });
}

/**
 * Smooth Scrolling with Momentum
 */
function initSmoothScrolling() {
    const style = document.createElement('style');
    style.textContent = `
        .smooth-scroll {
            scroll-behavior: smooth;
            scroll-padding-top: 20px;
        }

        /* Better scrollbar styling */
        .smooth-scroll::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        .smooth-scroll::-webkit-scrollbar-track {
            background: var(--surface-2);
            border-radius: 4px;
        }

        .smooth-scroll::-webkit-scrollbar-thumb {
            background: var(--line);
            border-radius: 4px;
            transition: background 0.2s ease;
        }

        .smooth-scroll::-webkit-scrollbar-thumb:hover {
            background: var(--muted);
        }
    `;
    document.head.appendChild(style);

    // Apply to main scrollable areas
    document.addEventListener('DOMContentLoaded', () => {
        const scrollAreas = document.querySelectorAll('.left-panel, .right-panel, main#view-root');
        scrollAreas.forEach(el => el.classList.add('smooth-scroll'));
    });
}

/**
 * Card Hover Effects with Subtle Lift
 */
function initCardHoverEffects() {
    const style = document.createElement('style');
    style.textContent = `
        .enhanced-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }

        .enhanced-card::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .enhanced-card:hover {
            transform: translateY(-4px);
        }

        .enhanced-card:hover::after {
            opacity: 1;
        }

        .enhanced-card:active {
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Loading States with Skeleton Screens
 */
function initLoadingStates() {
    const style = document.createElement('style');
    style.textContent = `
        .skeleton {
            background: linear-gradient(
                90deg,
                var(--surface-2) 0%,
                var(--surface-3) 50%,
                var(--surface-2) 100%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
            border-radius: 8px;
        }

        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        .skeleton-text {
            height: 16px;
            margin-bottom: 8px;
        }

        .skeleton-title {
            height: 24px;
            width: 60%;
            margin-bottom: 12px;
        }

        .skeleton-card {
            height: 120px;
            margin-bottom: 16px;
        }

        /* Loading spinner */
        .modern-spinner {
            width: 24px;
            height: 24px;
            border: 3px solid var(--surface-3);
            border-top-color: var(--accent);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Toast Notification System
 * Professional non-blocking notifications
 */
function initToastNotifications() {
    const style = document.createElement('style');
    style.textContent = `
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        }

        .toast {
            background: var(--surface-1);
            border: 1px solid var(--line);
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 400px;
            pointer-events: auto;
            animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transition: all 0.3s ease;
        }

        .toast.hiding {
            animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
            transform: translateX(400px);
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(400px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(400px);
            }
        }

        .toast-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            flex-shrink: 0;
        }

        .toast.success .toast-icon {
            background: #dcfce7;
            color: #166534;
        }

        .toast.error .toast-icon {
            background: #fee2e2;
            color: #dc2626;
        }

        .toast.info .toast-icon {
            background: #dbeafe;
            color: #1e40af;
        }

        .toast-content {
            flex: 1;
        }

        .toast-title {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 2px;
        }

        .toast-message {
            font-size: 13px;
            color: var(--muted);
        }

        .toast-close {
            background: none;
            border: none;
            color: var(--muted);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
        }

        .toast-close:hover {
            background: var(--surface-2);
            color: var(--fg);
        }
    `;
    document.head.appendChild(style);

    // Create toast container
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);

    // Global toast function
    window.showToast = function(options) {
        const { type = 'info', title, message, duration = 4000 } = options;

        const icons = {
            success: '✓',
            error: '✕',
            info: 'i'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close">×</button>
        `;

        container.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            removeToast(toast);
        });

        // Auto-remove after duration
        setTimeout(() => {
            removeToast(toast);
        }, duration);
    };

    function removeToast(toast) {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

/**
 * Keyboard Shortcuts
 * Professional keyboard navigation
 */
function initKeyboardShortcuts() {
    const shortcuts = {
        'ctrl+s': (e) => {
            e.preventDefault();
            const saveBtn = document.querySelector('[data-action="save"]');
            if (saveBtn) {
                saveBtn.click();
                window.showToast?.({
                    type: 'success',
                    title: 'Saved',
                    message: 'Project saved successfully',
                    duration: 2000
                });
            }
        },
        'ctrl+k': (e) => {
            e.preventDefault();
            // Could open command palette in future
            console.log('Command palette shortcut');
        },
        'esc': () => {
            // Close any open modals
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.click();

            // Close sidebar on mobile
            if (window.innerWidth < 768 && document.body.classList.contains('sidebar-open')) {
                document.body.classList.remove('sidebar-open');
            }
        }
    };

    document.addEventListener('keydown', (e) => {
        const key = [
            e.ctrlKey && 'ctrl',
            e.shiftKey && 'shift',
            e.altKey && 'alt',
            e.key?.toLowerCase()
        ].filter(Boolean).join('+');

        const handler = shortcuts[key];
        if (handler) {
            handler(e);
        }
    });
}

/**
 * Utility: Show loading state
 */
export function showLoading(container, text = 'Loading...') {
    const loader = document.createElement('div');
    loader.className = 'loading-state';
    loader.style.cssText = 'padding: 40px; text-align: center;';
    loader.innerHTML = `
        <div class="modern-spinner" style="margin: 0 auto 12px;"></div>
        <div style="color: var(--muted); font-size: 14px;">${text}</div>
    `;
    container.innerHTML = '';
    container.appendChild(loader);
}

/**
 * Utility: Show skeleton loading
 */
export function showSkeleton(container, count = 3) {
    const skeleton = document.createElement('div');
    skeleton.innerHTML = Array.from({ length: count }, () => `
        <div class="skeleton skeleton-card"></div>
    `).join('');
    container.innerHTML = '';
    container.appendChild(skeleton);
}