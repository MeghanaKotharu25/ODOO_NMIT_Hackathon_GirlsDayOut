import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { EmployeeDetails } from './pages/EmployeeDetails';
import { Attendance } from './pages/Attendance';
import { TimeOff } from './pages/TimeOff';
import { Salary } from './pages/Salary';
import { Login } from './pages/Login';
import { LoadingScreen } from './pages/LoadingScreen';
import { MyProfile } from './pages/MyProfile';
import { Settings } from './pages/Settings';

const Help = () => <div className="p-8">Help Center (Placeholder)</div>;

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/loading" element={<LoadingScreen />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:id" element={<EmployeeDetails />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="time-off" element={<TimeOff />} />
            <Route path="salary" element={<Salary />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
