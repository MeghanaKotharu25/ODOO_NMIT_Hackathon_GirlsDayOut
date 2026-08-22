import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

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
      if (mounted) {
        setLoading(false);
      }
    }

    // Clean up subscription on unmount
    return () => {
      mounted = false;
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

  const signUp = async (email, password) => {
    return await authService.signUp(email, password);
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

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
