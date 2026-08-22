import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

// Mock user for demo mode (when Supabase is not configured)
const DEMO_USER = {
  id: 'demo-admin-001',
  email: 'admin@dayflow.demo',
  role: 'ADMIN',
  profile: {
    first_name: 'Elena',
    last_name: 'Vasquez',
    role: 'ADMIN',
    department: 'Human Resources',
    position: 'HR Director',
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile when session changes
  const fetchUserWithProfile = async (currentSession) => {
    if (!currentSession?.user) {
      setUser(null);
      return;
    }
    try {
      const fullUser = await authService.getCurrentUser();
      setUser(fullUser || currentSession.user);
    } catch (err) {
      console.warn('Profile fetch warning (fallback to session user):', err);
      setUser(currentSession.user);
    }
  };

  useEffect(() => {
    let mounted = true;
    let safetyTimeout = null;

    // DEMO MODE: If Supabase is not configured, skip auth entirely
    if (!isSupabaseConfigured) {
      console.info('[Dayflow] Demo mode active — Supabase not configured. Using mock user.');
      setUser(DEMO_USER);
      setSession({ user: DEMO_USER });
      setLoading(false);
      return;
    }

    // Safety timeout: forcefully clear loading state if Supabase hangs (e.g. storage lock issue)
    safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timed out after 5s. Forcefully clearing loading state.');
        setLoading(false);
      }
    }, 5000);

    // Get initial session on app mount
    authService.getCurrentSession()
      .then(async (initialSession) => {
        if (!mounted) return;
        setSession(initialSession);
        if (initialSession) {
          await fetchUserWithProfile(initialSession);
        }
      })
      .catch((err) => {
        console.warn('Session initialization warning:', err);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      });

    // Subscribe to auth state changes safely
    let subscription = null;
    try {
      subscription = authService.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        if (newSession) {
          await fetchUserWithProfile(newSession);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    } catch (err) {
      console.warn('Auth state subscription warning:', err);
      if (mounted) setLoading(false);
    }

    // Clean up subscription on unmount
    return () => {
      mounted = false;
      if (safetyTimeout) clearTimeout(safetyTimeout);
      if (subscription && typeof subscription.unsubscribe === 'function') {
        try {
          subscription.unsubscribe();
        } catch {
          // Ignore unsubscribe errors
        }
      }
    };
  }, []);

  const signIn = async (email, password) => {
    return await authService.signIn(email, password);
  };

  const signUp = async (email, password, metadata = {}) => {
    return await authService.signUp(email, password, metadata);
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setSession(null);
      setUser(null);
    }
  };

  const changePassword = async (newPassword) => {
    return await authService.changePassword(newPassword);
  };

  const resetPasswordForEmail = async (emailOrLoginId) => {
    return await authService.resetPasswordForEmail(emailOrLoginId);
  };

  // Compatibility aliases for frontend components
  const login = async (email, password) => {
    return await signIn(email, password);
  };

  const logout = async () => {
    await signOut();
  };

  const isAuthenticated = !!user || !!session;

  const value = {
    user,
    session,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    login,
    logout,
    changePassword,
    resetPasswordForEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return { isAuthenticated: false, loading: false, user: null, session: null };
  }
  return context;
}
