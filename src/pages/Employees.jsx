import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { mockEmployees } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import './Employees.css';

export function Employees() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [employeesList, setEmployeesList] = useState(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form state for new employee
  const [newEmployee, setNewEmployee] = useState({
    firstName: '', lastName: '', position: '', department: ''
  });
  
  const getStatusDisplay = (status) => {
    switch(status) {
      case 'Present': return <span className="status-dot present"></span>;
      case 'Absent': return <span className="status-dot absent"></span>;
      case 'On Leave': return <span className="status-dot leave"></span>;
      default: return null;
    }
  };

  const filteredEmployees = employeesList.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.position || !newEmployee.department) {
      addToast('Please fill all required fields.', 'error');
      return;
    }
    const newId = `EMP-0${employeesList.length + 1}`;
    const empData = {
      id: newId,
      ...newEmployee,
      status: 'Present',
      avatarUrl: `https://i.pravatar.cc/150?u=${newId}`,
      email: `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}@dayflow.demo`,
      phone: '+1 (555) 000-0000',
      location: 'Remote',
      joinDate: new Date().toISOString().split('T')[0],
      manager: 'Not Assigned',
      role: 'EMPLOYEE'
    };
    
    setEmployeesList([empData, ...employeesList]);
    setIsDrawerOpen(false);
    setNewEmployee({ firstName: '', lastName: '', position: '', department: '' });
    addToast(`${empData.firstName} ${empData.lastName} added to the roster.`, 'success');
  };

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
          <button 
            className="btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            onClick={() => setIsDrawerOpen(true)}
          >
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

      {/* Add Employee Drawer */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2 className="font-serif text-xl">New Personnel Record</h2>
          <button className="icon-btn" onClick={() => setIsDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <form className="drawer-body" onSubmit={handleAddEmployee}>
          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">First Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={newEmployee.firstName}
              onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Last Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={newEmployee.lastName}
              onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Position</label>
            <input 
              type="text" 
              className="form-input" 
              value={newEmployee.position}
              onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Department</label>
            <select 
              className="form-input"
              value={newEmployee.department}
              onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
            >
              <option value="">Select Department...</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
            </select>
          </div>
          
          <div className="drawer-footer mt-auto pt-6 border-t border-[var(--border-strong)]">
            <button type="submit" className="btn-primary w-full py-3 justify-center">
              Submit Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
