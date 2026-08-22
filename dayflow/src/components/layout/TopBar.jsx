import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { mockCurrentUser } from '../../data/mockData';
import './Layout.css';

export function TopBar() {
  const location = useLocation();
  
  const getPageTitle = (path) => {
    switch(path) {
      case '/': return 'Dashboard';
      case '/employees': return 'Employees';
      case '/attendance': return 'Attendance';
      case '/time-off': return 'Time Off';
      case '/profile': return 'My Profile';
      case '/settings': return 'Settings';
      case '/help': return 'Help';
      default: 
        if (path.startsWith('/employees/')) return 'Employee Details';
        return 'Overview';
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="page-title">{getPageTitle(location.pathname)}</h2>
      </div>
      
      <div className="topbar-right">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        
        <button className="icon-btn">
          <Bell size={20} />
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
    </header>
  );
}
