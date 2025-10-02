import { createClient } from '@supabase/supabase-js';

// These variables are placeholders that Vite will replace during the build process.
// Ensure you have a .env file in your project root with these keys.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Enable automatic token refresh (required for persistent sessions)
    autoRefreshToken: true,
    // Keep session persistent across page reloads
    persistSession: true,
    // Disable URL detection to avoid auth redirect issues
    detectSessionInUrl: false,
    // Store session in local storage for persistence
    storage: window.localStorage
  }
});

export default supabase;
