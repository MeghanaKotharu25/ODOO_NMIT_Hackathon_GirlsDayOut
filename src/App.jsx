import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { CustomCursor } from './components/layout/CustomCursor';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { EmployeeDetails } from './pages/EmployeeDetails';
import Attendance from './pages/employees/Attendance';
import { TimeOff } from './pages/TimeOff';
import { Payroll } from './pages/Payroll';
import { Login } from './pages/Login';
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
        <Route path="/loading" element={<LoadingScreen />} />

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
          <Route path="salary" element={<Payroll />} />
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
