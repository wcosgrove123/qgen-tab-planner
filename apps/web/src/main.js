import { initRouter, renderRoute } from './router.js';
import { loadLegacyCode } from './legacy_code.js';
import { initAuth, onAuthStateChange } from './lib/auth.js';
import { initModernEnhancements } from './components/modernEnhancements.js';

/**
 * The main bootstrap function for the application.
 */
async function bootstrap() {
  // 1. Load all the legacy code from the old index.html.
  // This makes functions like `renderEditor` available on the `window` object
  // for the new modular views to use.
  loadLegacyCode();

  // 2. Initialize modern UI enhancements
  initModernEnhancements();

  // 3. Initialize authentication system
  await initAuth();

  // 4. Listen for auth state changes and re-render routes accordingly
  let hasInitiallyRendered = false;
  onAuthStateChange((authState) => {
    console.log('Auth state changed:', authState.user?.email || 'signed out');

    // Only re-render on initial load or if user actually signed out
    if (!hasInitiallyRendered || !authState.user) {
      renderRoute();
      hasInitiallyRendered = true;
    } else {
      console.log('🚫 Skipping re-render - user still authenticated');
    }
  });

  // 5. Initialize the new router. This will handle all navigation.
  initRouter();

  // 6. Perform the first render based on the current URL hash.
  await renderRoute();
}

// Start the application once the DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
