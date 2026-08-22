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

const Help = () => <div className="p-8 font-mono">Help Center (Placeholder)</div>;

function App() {
  return (
    <ToastProvider>
      <CustomCursor />
      <Routes>
        {/* Unprotected Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/loading" element={<LoadingScreen />} />

        {/* Admin-only Registration Route */}
        <Route
          path="/register"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute role="admin">
                <Register />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

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
          <Route path="admin/attendance" element={<RoleProtectedRoute><AdminAttendance /></RoleProtectedRoute>} />
          <Route path="time-off" element={<TimeOff />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
        </Route>

        {/* Fallback wildcard route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
