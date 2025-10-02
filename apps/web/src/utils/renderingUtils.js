// Future-Proof Rendering Utilities
// Use these utilities across all components to ensure consistent, lag-free interactions

let saveTimeouts = {};

/**
 * Queue a save operation with debouncing to prevent re-render lag
 * @param {string} key - Unique key for this save operation
 * @param {Function} saveFunction - Function to call after delay
 * @param {number} delay - Delay in milliseconds (default 2000)
 */
export function queueSave(key, saveFunction, delay = 2000) {
    // Clear existing timeout for this key
    if (saveTimeouts[key]) {
        clearTimeout(saveTimeouts[key]);
    }

    // Set new timeout
    saveTimeouts[key] = setTimeout(() => {
        saveFunction();
        delete saveTimeouts[key];
    }, delay);
}

/**
 * Update element visual state directly without re-render
 * @param {HTMLElement} element - Element to update
 * @param {boolean} isActive - Whether element should be active
 * @param {Object} options - Style options
 */
export function updateElementState(element, isActive, options = {}) {
    const defaults = {
        activeClass: 'active',
        activeColor: 'var(--accent)',
        inactiveColor: 'var(--surface-2)',
        transition: 'all 0.15s ease-in-out'
    };

    const opts = { ...defaults, ...options };

    // Add transition for smooth change
    element.style.transition = opts.transition;

    // Update class
    element.classList.toggle(opts.activeClass, isActive);

    // Update colors
    if (isActive) {
        element.style.backgroundColor = opts.activeColor;
        element.style.color = 'white';
    } else {
        element.style.backgroundColor = opts.inactiveColor;
        element.style.color = 'var(--text-1)';
    }
}

/**
 * Show/hide panel with smooth animation
 * @param {HTMLElement} panel - Panel to animate
 * @param {boolean} shouldShow - Whether to show or hide
 * @param {Object} options - Animation options
 */
export function animatePanel(panel, shouldShow, options = {}) {
    const defaults = {
        duration: 200,
        easing: 'ease-in-out',
        translateDistance: '10px'
    };

    const opts = { ...defaults, ...options };

    panel.style.transition = `opacity ${opts.duration}ms ${opts.easing}, transform ${opts.duration}ms ${opts.easing}`;

    if (shouldShow) {
        panel.style.display = 'block';
        panel.style.opacity = '0';
        panel.style.transform = `translateY(${opts.translateDistance})`;

        setTimeout(() => {
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        }, 50);
    } else {
        panel.style.opacity = '0';
        panel.style.transform = `translateY(-${opts.translateDistance})`;

        setTimeout(() => {
            panel.style.display = 'none';
        }, opts.duration);
    }
}

/**
 * Update dropdown and related UI without re-render
 * @param {HTMLSelectElement} dropdown - Dropdown element
 * @param {string} value - New value
 * @param {Function} onUpdate - Function to call with new value
 * @param {Function} updateRelatedUI - Optional function to update related UI
 */
export function handleDropdownChange(dropdown, value, onUpdate, updateRelatedUI = null) {
    // Update data immediately
    onUpdate(value);

    // Update related UI if provided
    if (updateRelatedUI) {
        updateRelatedUI(value);
    }

    // Queue save with unique key
    const saveKey = `dropdown-${dropdown.dataset.key || dropdown.id}-${Date.now()}`;
    queueSave(saveKey, () => {
        // Actual save happens here - implement based on your save pattern
        console.log('Saving dropdown value:', value);
    });
}

/**
 * Handle toggle button clicks with immediate visual feedback
 * @param {HTMLElement} button - Button element
 * @param {Function} onToggle - Function to call with new state
 * @param {Object} options - Button options
 */
export function handleToggleButton(button, onToggle, options = {}) {
    // Get current state
    const isCurrentlyActive = button.classList.contains(options.activeClass || 'active');
    const newState = !isCurrentlyActive;

    // Update visual state immediately
    updateElementState(button, newState, options);

    // Update data immediately
    onToggle(newState);

    // Queue save
    const saveKey = `toggle-${button.dataset.key || button.id}-${Date.now()}`;
    queueSave(saveKey, () => {
        console.log('Saving toggle state:', newState);
    });
}

/**
 * Handle text input with debouncing
 * @param {HTMLInputElement} input - Input element
 * @param {Function} onUpdate - Function to call with new value
 * @param {number} delay - Debounce delay (default 500ms for typing)
 */
export function handleTextInput(input, onUpdate, delay = 500) {
    const value = input.value;

    // Update data immediately (no visual change needed for text inputs)
    onUpdate(value);

    // Queue save with shorter delay for text inputs
    const saveKey = `text-${input.dataset.key || input.id}`;
    queueSave(saveKey, () => {
        console.log('Saving text value:', value);
    }, delay);
}

/**
 * Add smooth animation to newly created elements
 * @param {HTMLElement} element - Newly created element
 * @param {Object} options - Animation options
 */
export function animateNewElement(element, options = {}) {
    const defaults = {
        initialOpacity: '0',
        initialTransform: 'translateY(-10px)',
        duration: 300,
        delay: 50
    };

    const opts = { ...defaults, ...options };

    // Set initial state
    element.style.opacity = opts.initialOpacity;
    element.style.transform = opts.initialTransform;
    element.style.transition = `opacity ${opts.duration}ms ease-in-out, transform ${opts.duration}ms ease-in-out`;

    // Animate to final state
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, opts.delay);
}

/**
 * Create event delegation handler for a container
 * @param {HTMLElement} container - Container element
 * @param {Object} actionHandlers - Object mapping action names to handler functions
 */
export function setupEventDelegation(container, actionHandlers) {
    // Handle clicks
    container.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action && actionHandlers.click && actionHandlers.click[action]) {
            e.preventDefault();
            e.stopPropagation();
            actionHandlers.click[action](e);
        }
    });

    // Handle changes (dropdowns, checkboxes)
    container.addEventListener('change', (e) => {
        const action = e.target.dataset.action;
        if (action && actionHandlers.change && actionHandlers.change[action]) {
            actionHandlers.change[action](e);
        }
    });

    // Handle input (text fields)
    container.addEventListener('input', (e) => {
        const action = e.target.dataset.action;
        if (action && actionHandlers.input && actionHandlers.input[action]) {
            actionHandlers.input[action](e);
        }
    });
}

/**
 * Performance measurement utility
 * @param {string} label - Label for the measurement
 * @param {Function} fn - Function to measure
 */
export function measurePerformance(label, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
}

// Export all utilities as a default object for easy importing
export default {
    queueSave,
    updateElementState,
    animatePanel,
    handleDropdownChange,
    handleToggleButton,
    handleTextInput,
    animateNewElement,
    setupEventDelegation,
    measurePerformance
};