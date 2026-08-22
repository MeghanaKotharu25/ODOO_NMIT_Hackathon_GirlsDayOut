import { supabase } from '../lib/supabase';

export const authService = {
  // Sign up a new user with email & password
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign in an existing user with email & password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign out current authenticated session
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get active session
  getCurrentSession: async () => {
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
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      // Retrieve user profile from public.profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, employee_code, first_name, last_name, email, role, department, position, status')
        .eq('id', user.id)
        .maybeSingle();

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );
    return subscription;
  },
};
