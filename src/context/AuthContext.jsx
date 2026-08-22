import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Mock logged in user for the HRMS (Admin role)
  const [user, setUser] = useState({
    id: 'EMP-001',
    name: 'Elena R.',
    role: 'ADMIN'
  });

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Return mock data fallback if used outside provider during this development phase
    return { user: { id: 'EMP-001', role: 'ADMIN' } };
  }
  return context;
}
