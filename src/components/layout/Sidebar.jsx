import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Clock, HelpCircle, Settings, UserCircle } from 'lucide-react';
import './Layout.css';

export function Sidebar() {
  const mainNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Time Off', path: '/time-off', icon: Calendar },
  ];

  const bottomNav = [
    { name: 'Help', path: '/help', icon: HelpCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'My Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-placeholder">
          <div className="logo-mark"></div>
          <span className="logo-text">Dayflow</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {mainNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="nav-section">
          {bottomNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}
