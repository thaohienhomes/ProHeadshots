import { createClient } from '@/utils/supabase/client';

/**
 * Client-side authentication utilities
 */

/**
 * Check if user is authenticated and return user data
 */
export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: any | null;
  error: string | null;
}> {
  try {
    const supabase = createClient();
    
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return {
        isAuthenticated: false,
        user: null,
        error: sessionError.message
      };
    }

    if (!session) {
      return {
        isAuthenticated: false,
        user: null,
        error: null
      };
    }

    // If we have a session, get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User error:', userError);
      return {
        isAuthenticated: false,
        user: null,
        error: userError.message
      };
    }

    return {
      isAuthenticated: !!user,
      user,
      error: null
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      isAuthenticated: false,
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh error:', error);
      return false;
    }

    return !!data.session;
  } catch (error) {
    console.error('Session refresh error:', error);
    return false;
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
