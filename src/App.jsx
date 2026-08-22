import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { EmployeeDetails } from './pages/EmployeeDetails';
import { Attendance } from './pages/Attendance';
import { TimeOff } from './pages/TimeOff';
import { Salary } from './pages/Salary';

// Dummy components for missing routes
const MyProfile = () => <div className="p-8">My Profile (Placeholder)</div>;
const Settings = () => <div className="p-8">Settings (Placeholder)</div>;
const Help = () => <div className="p-8">Help Center (Placeholder)</div>;

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<AppShell />}>
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
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
