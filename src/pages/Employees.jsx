import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { mockEmployees } from '../data/mockData';
import './Employees.css';

export function Employees() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const getStatusDisplay = (status) => {
    switch(status) {
      case 'Present': return <span className="status-dot present"></span>;
      case 'Absent': return <span className="status-dot absent"></span>;
      case 'On Leave': return <span className="status-dot leave"></span>;
      default: return null;
    }
  };

  const filteredEmployees = mockEmployees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="roster-page">
      <header className="roster-header">
        <div className="roster-title-section">
          <h1 className="page-title">Personnel Roster</h1>
          <p className="roster-meta font-mono">
            {mockEmployees.length} Records &mdash; Sorted by Department
          </p>
        </div>
        
        <div className="roster-controls">
          <div className="search-bar">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Query name or department..." 
              className="search-input font-mono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            + Add Record
          </button>
        </div>
      </header>

      <div className="roster-grid">
        {filteredEmployees.map(emp => (
          <div 
            key={emp.id} 
            className="roster-card"
            onClick={() => navigate(`/employees/${emp.id}`)}
          >
            <div className="roster-image-container">
              <img src={emp.avatarUrl} alt={emp.firstName} className="roster-avatar" />
              <div className="roster-status-overlay">
                {getStatusDisplay(emp.status)}
              </div>
            </div>
            
            <div className="roster-details">
              <div className="roster-identity">
                <span className="roster-id font-mono">{emp.id}</span>
                <h3 className="roster-name">{emp.firstName} {emp.lastName}</h3>
              </div>
              
              <div className="roster-role">
                <p className="role-title">{emp.position}</p>
                <p className="role-dept font-mono">{emp.department}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredEmployees.length === 0 && (
          <div className="roster-empty">
            <Search size={24} className="text-muted" />
            <p className="font-mono text-muted">No records match the query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
