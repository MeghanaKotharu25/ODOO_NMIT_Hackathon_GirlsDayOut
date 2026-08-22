import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  // Sign up a new user with email & password and optional user metadata
  signUp: async (email, password, metadata = {}) => {
    if (!isSupabaseConfigured) throw new Error('Demo mode: Supabase not configured');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
  },

  // Sign in an existing user with email & password
  signIn: async (email, password) => {
    if (!isSupabaseConfigured) throw new Error('Demo mode: Supabase not configured');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign out current authenticated session
  signOut: async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get active session
  getCurrentSession: async () => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (err) {
      console.warn('getCurrentSession warning:', err);
      return null;
    }
  },

  // Get current authenticated user details along with profile role
  getCurrentUser: async () => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      // Retrieve user profile from public.profiles
      let query = supabase
        .from('profiles')
        .select('id, employee_code, first_name, last_name, email, role, department, position, status, default_in_time, default_out_time')
        .eq('id', user.id)
        .maybeSingle();

      let { data: profile, error: profileError } = await query;
      
      if (profileError && profileError.message && profileError.message.includes('default_in_time')) {
        const fallback = await supabase
          .from('profiles')
          .select('id, employee_code, first_name, last_name, email, role, department, position, status')
          .eq('id', user.id)
          .maybeSingle();
        profile = fallback.data;
      }

      return {
        ...user,
        profile: profile || null,
        role: profile?.role || 'employee',
      };
    } catch (err) {
      console.warn('getCurrentUser warning:', err);
      return null;
    }
  },

  // Subscribe to auth state changes
  onAuthStateChange: (callback) => {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );
    return subscription;
  },
};
