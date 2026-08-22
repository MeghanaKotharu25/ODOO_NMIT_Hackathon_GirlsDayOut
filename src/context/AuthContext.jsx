import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

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
        if (mounted) setLoading(false);
      });

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

    return () => {
      mounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { error } = await authService.signIn(email, password);
      if (error) {
        addToast(`Login failed: ${error.message}`, 'error');
        return false;
      }
      addToast('System authenticated. Welcome back.', 'success');
      return true;
    } catch (err) {
      addToast('System error during authentication.', 'error');
      return false;
    }
  };

  const logout = async () => {
    await authService.signOut();
    setSession(null);
    setUser(null);
    addToast('Session terminated.', 'info');
  };

  const isAuthenticated = !!session;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback for isolated components without provider wrap
    return { isAuthenticated: false, loading: false };
  }
  return context;
}
