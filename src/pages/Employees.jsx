import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import { Magnetic } from '../components/layout/Magnetic';
import { employeeService } from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import { generateEmployeeId } from '../utils/idGenerator';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './Employees.css';

export function Employees() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const isAdmin = (user?.profile?.role || user?.role || '').toLowerCase() === 'admin';
  
  const [employeesList, setEmployeesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = () => {
    setLoading(true);
    employeeService.getEmployees()
      .then((data) => {
        setEmployeesList(data || []);
        setDbError(null);
      })
      .catch((err) => {
        console.warn('Employees database fetch error:', err.message);
        setDbError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Form state for new employee
  const [newEmployee, setNewEmployee] = useState({
    firstName: '', lastName: '', position: '', department: ''
  });

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'Present': return <span className="status-dot present" title="Present"></span>;
      case 'Absent': return <span className="status-dot absent" title="Absent"></span>;
      case 'On Leave': return <Plane size={16} className="status-icon leave" title="On Leave" />;
      default: return null;
    }
  };

  const filteredEmployees = employeesList.filter(emp => {
    const matchesSearch = 
      (emp.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (emp.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = filterDept === 'All' || emp.department === filterDept;
    
    return matchesSearch && matchesDept;
  });

  const departments = ['All', ...new Set(employeesList.map(emp => emp.department).filter(Boolean))];

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.position || !newEmployee.department) {
      addToast('Please fill all required fields.', 'error');
      return;
    }

    // Generate custom ID based on formula: [Company] + Initial + Initial + Year + Serial
    const companyName = localStorage.getItem('dayflow_company_name') || 'Odoo India';
    const year = new Date().getFullYear();
    const serial = employeesList.length + 1;
    const newId = generateEmployeeId(companyName, newEmployee.firstName, newEmployee.lastName, year, serial);

    // Auto-generate password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let autoPassword = '';
    for (let i = 0; i < 10; i++) {
      autoPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

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
    try {
      addToast('Creating record in database...', 'info');
      const { data, error } = await supabase.functions.invoke('create-employee', {
        body: {
          email: `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}@dayflow.demo`,
          password: autoPassword,
          firstName: newEmployee.firstName,
          lastName: newEmployee.lastName,
          position: newEmployee.position,
          department: newEmployee.department,
          companyName: companyName,
          serialNumber: serial
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Re-fetch to guarantee sync with DB
      fetchEmployees();
      setIsDrawerOpen(false);
      setNewEmployee({ firstName: '', lastName: '', position: '', department: '' });
      addToast(`Record Created! System Password: ${data?.generatedPassword || autoPassword}`, 'success');

    } catch (err) {
      console.error("Backend Edge Function failed:", err);
      addToast(`Failed to create employee: ${err.message}`, 'error');
    }
  };

  return (
    <div className="roster-page">
      <header className="roster-header">
        {isAdmin && (
          <button 
            type="button"
            className="btn-new-record" 
            onClick={() => setIsDrawerOpen(true)}
          >
            NEW
          </button>
        )}
        
        <div className="roster-search-bar">
          <input 
            type="text" 
            placeholder="Search" 
            className="roster-search-input font-sans"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {dbError && (
        <div className="mb-4 p-3 bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-mono rounded">
          Notice: Supabase live query notice ({dbError}). Displaying personnel roster.
        </div>
      )}

      {loading ? (
        <div className="roster-empty" style={{ gridColumn: '1 / -1', padding: '4rem' }}>
          <Loader2 size={24} className="text-muted" style={{ animation: 'spin 1s linear infinite' }} />
          <p className="font-mono text-muted">Loading personnel data...</p>
        </div>
      ) : (
        <div className="roster-grid">
          {filteredEmployees.map((emp, index) => (
            <motion.div 
              key={emp.id} 
              className="roster-card"
              onClick={() => navigate(`/employees/${emp.uuid || emp.id}`)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
            >
              <div className="roster-image-container">
                <img src={emp.avatarUrl} alt={emp.firstName} className="roster-avatar" />
              </div>
              <div className="roster-status-overlay">
                {getStatusDisplay(emp.status)}
              </div>
              
              <div className="roster-details">
                <h3 className="roster-name">[{emp.firstName} {emp.lastName}]</h3>
              </div>
            </motion.div>
          ))}
          {filteredEmployees.length === 0 && !loading && (
            <div className="roster-empty">
              <Search size={24} className="text-muted" />
              <p className="font-mono text-muted">No records match the query.</p>
            </div>
          )}
        </div>
      )}

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
