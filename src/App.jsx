import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './pages/auth/Login';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { EmployeeDetails } from './pages/EmployeeDetails';
import { Attendance } from './pages/Attendance';
import { TimeOff } from './pages/TimeOff';
import { MyProfile } from './pages/MyProfile';
import { Salary } from './pages/Salary';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';

function App() {
  return (
    <Routes>
      {/* Unprotected Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes Wrapper */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/:id" element={<EmployeeDetails />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="time-off" element={<TimeOff />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="salary" element={<Salary />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
      </Route>

      {/* Fallback wildcard route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
