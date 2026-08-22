import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, UserCircle } from 'lucide-react';
import { Magnetic } from './Magnetic';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

export function TopBar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const mainNav = [
    { name: 'Employees', path: '/employees' },
    { name: 'Attendance', path: '/attendance' },
    { name: 'Time Off', path: '/time-off' }
  ];

  return (
    <header className="topbar-editorial" style={{ borderBottom: '1px solid var(--border-light)' }}>
      <div className="topbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="topbar-brand" style={{ paddingRight: 'var(--spacing-6)', borderRight: '1px solid var(--border-strong)' }}>
            <span className="logo-text font-serif" style={{ fontSize: '1.2rem', color: '#FFF' }}>Company Logo</span>
          </div>

          <nav className="topbar-nav main-nav" style={{ marginLeft: 'var(--spacing-6)' }}>
            {mainNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `topnav-item ${isActive ? 'active' : ''}`}
                style={{ padding: '0.5rem 1rem' }}
              >
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="topbar-right">
          <div className="relative-container" ref={profileRef}>
            <Magnetic strength={0.2}>
              <div 
                className="user-profile-menu cursor-pointer"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ff8a8a', // Pink circle as per wireframe
                  border: '2px solid transparent',
                  transition: 'border-color 0.2s'
                }}
              />
            </Magnetic>

            {showProfileMenu && (
              <div className="popover-menu profile-menu" style={{ top: '120%' }}>
                <div className="popover-header profile-header">
                  <span className="font-mono">{user?.firstName || user?.profile?.first_name || 'Admin'} {user?.lastName || user?.profile?.last_name || ''}</span>
                  <span className="text-muted text-xs uppercase">{user?.role || user?.profile?.role || 'EMPLOYEE'}</span>
                </div>
                <button 
                  className="popover-action"
                  onClick={() => { setShowProfileMenu(false); navigate(`/employees/${user?.id || ''}`); }}
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
