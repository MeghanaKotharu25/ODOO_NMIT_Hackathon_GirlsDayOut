import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus } from 'lucide-react';
import { mockEmployees } from '../data/mockData';
import './Employees.css';

export function Employees() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const getStatusDisplay = (status) => {
    switch(status) {
      case 'Present': return <span className="status-indicator present"><span className="dot"></span> Present</span>;
      case 'Absent': return <span className="status-indicator absent"><span className="dot"></span> Absent</span>;
      case 'On Leave': return <span className="status-indicator leave">✈ On Leave</span>;
      default: return null;
    }
  };

  const filteredEmployees = mockEmployees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employees-page">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Employees</h1>
            <p className="text-muted">{mockEmployees.length} active team members</p>
          </div>
          <button className="btn btn-primary">
            <Plus size={16} /> New Employee
          </button>
        </div>
        
        <div className="filters-bar">
          <div className="search-container expanded">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or department..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary filter-btn">
            <Filter size={16} /> Department
          </button>
          <button className="btn btn-secondary filter-btn">
            <Filter size={16} /> Status
          </button>
        </div>
      </header>

      <div className="employee-grid">
        {filteredEmployees.map(emp => (
          <div 
            key={emp.id} 
            className="card employee-card"
            onClick={() => navigate(`/employees/${emp.id}`)}
          >
            <div className="card-header">
              {getStatusDisplay(emp.status)}
            </div>
            
            <div className="card-body">
              <img src={emp.avatarUrl} alt={emp.firstName} className="employee-avatar" />
              <h3 className="employee-name">{emp.firstName} {emp.lastName}</h3>
              <p className="employee-position">{emp.position}</p>
              
              <div className="employee-meta">
                <span className="badge">{emp.department}</span>
                <span className="employee-id">{emp.id}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredEmployees.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon-placeholder"><Search size={32} className="text-muted" /></div>
            <h3>No employees found</h3>
            <p className="text-muted">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
