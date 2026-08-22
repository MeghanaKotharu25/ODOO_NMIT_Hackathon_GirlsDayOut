import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleProtectedRoute } from './routes/RoleProtectedRoute';
import { CustomCursor } from './components/layout/CustomCursor';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { EmployeeDetails } from './pages/EmployeeDetails';
import Attendance from './pages/employees/Attendance';
import AdminAttendance from './pages/admin/attendance/Attendance';
import { TimeOff } from './pages/TimeOff';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ResetPassword } from './pages/ResetPassword';
import { LoadingScreen } from './pages/LoadingScreen';
import { MyProfile } from './pages/MyProfile';
import { Settings } from './pages/Settings';
import { Startup } from './pages/Startup';
import { Payroll } from './pages/Payroll';

const Help = () => <div className="p-8 font-mono">Help Center (Placeholder)</div>;

function App() {
  return (
    <ToastProvider>
      <CustomCursor />
      <Routes>
        {/* Unprotected Public Routes */}
        <Route path="/welcome" element={<Startup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/loading" element={<LoadingScreen />} />

        {/* Public HR / Admin Registration Route */}
        <Route path="/register" element={<Register />} />

        {/* Protected Routes Wrapper */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<RoleProtectedRoute><Employees /></RoleProtectedRoute>} />
          <Route path="employees/:id" element={<RoleProtectedRoute><EmployeeDetails /></RoleProtectedRoute>} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="admin/attendance" element={<RoleProtectedRoute><AdminAttendance /></RoleProtectedRoute>} />
          <Route path="time-off" element={<TimeOff />} />
          <Route path="payroll" element={<RoleProtectedRoute><Payroll /></RoleProtectedRoute>} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
        </Route>

        {/* Fallback wildcard route */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
