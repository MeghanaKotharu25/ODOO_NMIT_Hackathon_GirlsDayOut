import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  // Sign up a new user with email & password and optional user metadata
  signUp: async (email, password, metadata = {}) => {
    if (!isSupabaseConfigured) throw new Error('Demo mode: Supabase not configured');
    const cleanEmail = (email || '').trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;

    // Ensure profile row exists in public.profiles for this new user
    if (data?.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: cleanEmail,
            first_name: metadata.first_name || 'Admin',
            last_name: metadata.last_name || '',
            role: metadata.role || 'admin',
            phone: metadata.phone || null,
            status: 'active',
          }, { onConflict: 'id' });
        if (profileError) console.warn('Profile upsert warning:', profileError);
      } catch (pErr) {
        console.warn('Profile sync exception:', pErr);
      }
    }

    return data;
  },

  // Sign in an existing user with email or employee Login ID & password
  signIn: async (identifier, password) => {
    if (!isSupabaseConfigured) throw new Error('Demo mode: Supabase not configured');

    const cleanInput = (identifier || '').trim();
    if (!cleanInput) throw new Error('Email or Login ID is required.');

    let targetEmail = cleanInput;

    // If identifier is not an email (e.g. employee code like OIJODO20260001 or EMP-001), resolve email from profiles
    if (!cleanInput.includes('@')) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .ilike('employee_code', cleanInput)
          .maybeSingle();

        if (profile?.email) {
          targetEmail = profile.email.trim().toLowerCase();
        }
      } catch (lookupErr) {
        console.warn('Employee code lookup warning:', lookupErr);
      }
    } else {
      targetEmail = cleanInput.toLowerCase();
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Update password for currently authenticated user
  changePassword: async (newPassword) => {
    if (!isSupabaseConfigured) throw new Error('Demo mode: Supabase not configured');
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },

  // Send password reset email
  resetPasswordForEmail: async (emailOrLoginId) => {
    if (!isSupabaseConfigured) throw new Error('Demo mode: Supabase not configured');
    let email = emailOrLoginId?.trim() || '';

    if (!email.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .ilike('employee_code', email)
        .maybeSingle();

      if (profile?.email) {
        email = profile.email;
      }
    }

    const redirectUrl = `${window.location.origin}/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
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
