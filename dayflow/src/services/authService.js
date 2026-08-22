import { mockCurrentUser } from '../data/mockData';

// Simulated roles: ADMIN, HR_OFFICER, EMPLOYEE
const MOCK_ROLE = 'ADMIN';

export const authService = {
  getCurrentUser: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...mockCurrentUser,
          role: MOCK_ROLE
        });
      }, 300);
    });
  },
  
  hasRole: (userRole, requiredRole) => {
    const roleHierarchy = {
      'EMPLOYEE': 1,
      'HR_OFFICER': 2,
      'ADMIN': 3
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
};
