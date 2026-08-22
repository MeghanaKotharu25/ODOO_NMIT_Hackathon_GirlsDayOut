import { createContext, useContext, useState } from 'react';
import { mockCurrentUser } from '../data/mockData';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const { addToast } = useToast();

  const login = (email, password) => {
    // Simulated login logic
    if (email && password) {
      setIsAuthenticated(true);
      setUser(mockCurrentUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    addToast('Session terminated.', 'info');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Return mock data fallback if used outside provider during this development phase
    return { user: { id: 'EMP-001', role: 'ADMIN' }, isAuthenticated: true };
  }
  return context;
}
