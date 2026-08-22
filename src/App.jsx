import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

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
      <Route path="/" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/:id" element={<EmployeeDetails />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="time-off" element={<TimeOff />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="salary" element={<Salary />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
      </Route>
    </Routes>
  );
}

export default App;
