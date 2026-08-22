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
      setUser(fullUser);
    } catch {
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
      .catch(() => {
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

    // Subscribe to auth state changes
    const subscription = authService.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession) {
        await fetchUserWithProfile(newSession);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Clean up subscription on unmount
    return () => {
      mounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
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
    await authService.signOut();
    setSession(null);
    setUser(null);
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
