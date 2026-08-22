import { NavLink, useLocation } from 'react-router-dom';
import { Bell, Search, LayoutDashboard, Users, Clock, Calendar, HelpCircle, Settings, UserCircle } from 'lucide-react';
import { mockCurrentUser } from '../../data/mockData';
import './Layout.css';

export function TopBar() {
  const location = useLocation();
  
  const mainNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Time Off', path: '/time-off', icon: Calendar },
  ];

  const secondaryNav = [
    { name: 'Help', path: '/help', icon: HelpCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <header className="topbar-editorial">
      <div className="topbar-container">
        
        <div className="topbar-brand">
          <div className="logo-mark"></div>
          <span className="logo-text font-serif">Dayflow</span>
        </div>

        <nav className="topbar-nav main-nav">
          {mainNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `topnav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" size={16} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="topbar-right">
          <nav className="topbar-nav secondary-nav">
            {secondaryNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `topnav-item icon-only ${isActive ? 'active' : ''}`}
                title={item.name}
              >
                <item.icon className="nav-icon" size={18} />
              </NavLink>
            ))}
          </nav>

          <div className="vertical-divider"></div>

          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input type="text" placeholder="Query..." className="search-input font-mono" />
          </div>
          
          <button className="icon-btn action-btn">
            <Bell size={18} />
            <span className="notification-badge"></span>
          </button>
          
          <div className="user-profile-menu">
            <img 
              src={mockCurrentUser.avatarUrl} 
              alt={mockCurrentUser.firstName} 
              className="avatar-sm"
            />
          </div>
        </div>
        
      </div>
    </header>
  );
}
