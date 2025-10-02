import supabase from './supa.js';

// Auth state management
let authState = {
  user: null,
  person: null,
  organization: null,
  loading: true,
  initialized: false
};

const authCallbacks = new Set();

// Subscribe to auth state changes
export function onAuthStateChange(callback) {
  authCallbacks.add(callback);

  // If already initialized, call immediately
  if (authState.initialized) {
    callback(authState);
  }

  // Return unsubscribe function
  return () => authCallbacks.delete(callback);
}

// Notify all subscribers of auth state changes
function notifyAuthChange() {
  authCallbacks.forEach(callback => callback(authState));
}

// Initialize auth system
export async function initAuth() {
  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (session?.user) {
      await setAuthUser(session.user);
    } else {
      authState = { ...authState, loading: false, initialized: true };
    }

    // Listen for auth changes - but filter out frequent refresh events
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      // Ignore benign events that don't require re-authentication
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        console.log(`🔄 ${event} event ignored - session already established`);
        return;
      }

      if (session?.user) {
        await setAuthUser(session.user);
      } else {
        authState = {
          user: null,
          person: null,
          organization: null,
          loading: false,
          initialized: true
        };
      }

      notifyAuthChange();
    });

    notifyAuthChange();
  } catch (error) {
    console.error('Auth initialization error:', error);
    authState = { ...authState, loading: false, initialized: true };
    notifyAuthChange();
  }
}

// Set authenticated user and fetch related data
async function setAuthUser(user) {
  try {
    authState.user = user;
    authState.loading = true;

    // Fetch person record and organization
    const { data: person, error: personError } = await supabase
      .rpc('get_current_user_person');

    if (personError) throw personError;

    if (person && person.length > 0) {
      authState.person = person[0];

      // Fetch organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', person[0].organization_id)
        .single();

      if (!orgError && org) {
        authState.organization = org;
      }
    }

    authState.loading = false;
    authState.initialized = true;

  } catch (error) {
    console.error('Error setting auth user:', error);
    authState = {
      user,
      person: null,
      organization: null,
      loading: false,
      initialized: true
    };
  }
}

// Get current auth state
export function getAuthState() {
  return { ...authState };
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!authState.user;
}

// Sign up new user
export async function signUp({ email, password, fullName, organizationName }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization_name: organizationName
        }
      }
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in user
export async function signIn({ email, password }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out user
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Reset password
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: error.message };
  }
}

// Update user profile
export async function updateProfile({ name, email }) {
  try {
    console.log('updateProfile called with:', { name, email });

    // Get current auth state
    const currentAuthState = getAuthState();
    if (!currentAuthState.user) {
      throw new Error('User not authenticated');
    }

    console.log('Current user ID:', currentAuthState.user.id);

    // Update auth user
    console.log('Updating Supabase auth user...');
    const { error: authError } = await supabase.auth.updateUser({
      email,
      data: { full_name: name }
    });

    if (authError) {
      console.error('Auth update error:', authError);
      throw authError;
    }

    console.log('Auth user updated successfully');

    // Update person record
    console.log('Updating person record...');
    const { error: personError } = await supabase
      .from('people')
      .update({ name, email })
      .eq('auth_user_id', currentAuthState.user.id);

    if (personError) {
      console.error('Person update error:', personError);
      throw personError;
    }

    console.log('Person record updated successfully');

    // Refresh auth state
    await setAuthUser(currentAuthState.user);
    notifyAuthChange();

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in with OAuth provider (Google, GitHub, etc.)
export async function signInWithOAuth(provider) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/#/dashboard`
      }
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('OAuth sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Get current user's full profile data
export async function getCurrentUserProfile() {
  try {
    const authState = getAuthState();
    if (!authState.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get person data directly from database (bypassing RLS since we disabled it)
    let { data: person, error: personError } = await supabase
      .from('people')
      .select('*')
      .eq('auth_user_id', authState.user.id)
      .single();

    // If person doesn't exist, create one
    if (personError && personError.code === 'PGRST116') {
      console.log('Person record not found, creating one...');

      // Get or create Cue Insights organization
      let { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('name', 'Cue Insights')
        .single();

      if (orgError && orgError.code === 'PGRST116') {
        // Create Cue Insights organization
        const { data: newOrg, error: createOrgError } = await supabase
          .from('organizations')
          .insert([{
            name: 'Cue Insights',
            domain: 'cueinsights.com'
          }])
          .select()
          .single();

        if (createOrgError) {
          console.error('Error creating organization:', createOrgError);
          return { success: false, error: createOrgError.message };
        }
        org = newOrg;
      }

      // Create person record
      const { data: newPerson, error: createPersonError } = await supabase
        .from('people')
        .insert([{
          auth_user_id: authState.user.id,
          organization_id: org.id,
          name: authState.user.user_metadata?.full_name ||
                authState.user.user_metadata?.fullName ||
                authState.user.email.split('@')[0],
          email: authState.user.email,
          role: authState.user.email.includes('@cueinsights.com') ? 'Team Member' : 'Contractor',
          settings: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            notifications: {
              emailNotifications: true,
              projectAssignments: true,
              weeklyReports: false
            },
            dashboard: {
              showActivityFeed: true,
              showProjectMetrics: true,
              compactView: false
            }
          }
        }])
        .select()
        .single();

      if (createPersonError) {
        console.error('Error creating person:', createPersonError);
        return { success: false, error: createPersonError.message };
      }

      person = newPerson;
    } else if (personError) {
      console.error('Error fetching person data:', personError);
      return { success: false, error: personError.message };
    }

    // Get organization data
    let organization = null;
    if (person?.organization_id) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', person.organization_id)
        .single();

      if (!orgError && org) {
        organization = org;
      }
    }

    return {
      success: true,
      data: {
        user: authState.user,
        person,
        organization
      }
    };

  } catch (error) {
    console.error('Get user profile error:', error);
    return { success: false, error: error.message };
  }
}

// Update person profile in database
export async function updatePersonProfile(profileData) {
  try {
    const authState = getAuthState();
    if (!authState.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update the person record
    const { data, error } = await supabase
      .from('people')
      .update({
        name: profileData.name,
        role: profileData.role,
        settings: profileData.settings
      })
      .eq('auth_user_id', authState.user.id);

    if (error) {
      console.error('Database update error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (error) {
    console.error('Update person profile error:', error);
    return { success: false, error: error.message };
  }
}