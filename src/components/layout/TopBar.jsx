import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LayoutDashboard, Users, Clock, Calendar, HelpCircle, Settings, UserCircle, LogOut } from 'lucide-react';
import { Magnetic } from './Magnetic';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isAdmin = (user?.profile?.role || user?.role || '').toLowerCase() === 'admin';
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const mainNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Attendance', path: isAdmin ? '/admin/attendance' : '/attendance', icon: Clock },
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
          
          <div className="relative-container" ref={notifRef}>
            <Magnetic strength={0.2}>
              <button 
                className="icon-btn action-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={18} />
                <span className="notification-badge"></span>
              </button>
            </Magnetic>
            
            {showNotifications && (
              <div className="popover-menu notif-menu">
                <div className="popover-header">Recent Alerts</div>
                <div className="popover-item">
                  <span className="popover-title">Leave Request</span>
                  <span className="popover-desc text-muted">2 pending requests need approval.</span>
                </div>
                <div className="popover-item">
                  <span className="popover-title text-error">Absence Alert</span>
                  <span className="popover-desc text-muted">David Kim is absent unexcused.</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative-container" ref={profileRef}>
            <Magnetic strength={0.2}>
              <div 
                className="user-profile-menu cursor-pointer"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <img 
                  src={user?.avatarUrl || user?.avatar_url || user?.profile?.avatar_url || `https://i.pravatar.cc/150?u=${user?.id || 'EMP'}`} 
                  alt={user?.firstName || user?.first_name || user?.profile?.first_name || 'User'} 
                  className="avatar-sm"
                />
              </div>
            </Magnetic>

            {showProfileMenu && (
              <div className="popover-menu profile-menu">
                <div className="popover-header profile-header">
                  <span className="font-mono">{user?.firstName || user?.first_name || user?.profile?.first_name || 'User'} {user?.lastName || user?.last_name || user?.profile?.last_name || ''}</span>
                  <span className="text-muted text-xs uppercase">{user?.role || user?.profile?.role || 'EMPLOYEE'}</span>
                </div>
                <button 
                  className="popover-action"
                  onClick={() => { setShowProfileMenu(false); navigate(`/employees/${user?.id || user?.uuid || ''}`); }}
                >
                  <UserCircle size={14} /> My Dossier
                </button>
                <button 
                  className="popover-action text-error"
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </header>
  );
}
