import { useState } from 'react';
import { Search, DollarSign, ArrowUpRight, ArrowDownRight, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Magnetic } from '../components/layout/Magnetic';
import { useToast } from '../context/ToastContext';
import { mockPayroll } from '../data/mockData';

export function Payroll() {
  const { addToast } = useToast();
  const [payrollList, setPayrollList] = useState(mockPayroll);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [editSalary, setEditSalary] = useState('');

  const filteredPayroll = payrollList.filter(record => 
    record.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    record.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (record) => {
    setSelectedEmployee(record);
    setEditSalary(record.baseSalary.toString());
    setIsDrawerOpen(true);
  };

  const handleSaveSalary = (e) => {
    e.preventDefault();
    const newBase = parseFloat(editSalary);
    if (isNaN(newBase) || newBase <= 0) {
      addToast('Please enter a valid salary amount.', 'error');
      return;
    }

    const updatedPayroll = payrollList.map(record => {
      if (record.employeeId === selectedEmployee.employeeId) {
        const deductions = newBase * 0.15;
        return {
          ...record,
          baseSalary: newBase,
          grossEarnings: newBase,
          totalDeductions: deductions,
          netPayable: newBase - deductions,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return record;
    });

    setPayrollList(updatedPayroll);
    setIsDrawerOpen(false);
    setSelectedEmployee(null);
    addToast('Compensation updated successfully (Simulated).', 'success');
  };

  return (
    <div className="roster-page">
      <header className="roster-header">
        <div className="roster-title-section">
          <h1 className="page-title">Compensation & Payroll</h1>
          <p className="roster-meta font-mono">
            {payrollList.length} Records &mdash; Financial Ledger
          </p>
        </div>
        
        <div className="roster-controls">
          <div className="search-bar">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Query name..." 
              className="search-input font-mono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Magnetic strength={0.15}>
            <button 
              type="button"
              className="btn-primary" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}
              onClick={() => addToast('Payroll cycle initiated.', 'success')}
            >
              Run Payroll Cycle
            </button>
          </Magnetic>
        </div>
      </header>

      <div className="roster-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {filteredPayroll.map((record, index) => (
          <motion.div 
            key={record.employeeId} 
            className="roster-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex justify-between w-full mb-4 pb-4 border-b border-[var(--border-strong)]">
              <div>
                <h3 className="text-lg font-serif">{record.firstName} {record.lastName}</h3>
                <p className="font-mono text-xs text-muted uppercase tracking-wider">{record.department} • {record.employeeId}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded font-mono ${record.status === 'Paid' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                  {record.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mb-4">
              <div>
                <p className="text-xs text-muted font-mono uppercase mb-1">Base Salary</p>
                <p className="text-lg font-mono">${record.baseSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
              <div>
                <p className="text-xs text-muted font-mono uppercase mb-1">Net Payable</p>
                <p className="text-lg font-mono text-purple-400">${record.netPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
              <div>
                <p className="text-xs text-muted font-mono uppercase mb-1 flex items-center gap-1"><ArrowUpRight size={12} className="text-green-500"/> Earnings</p>
                <p className="text-sm font-mono">${record.grossEarnings.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
              <div>
                <p className="text-xs text-muted font-mono uppercase mb-1 flex items-center gap-1"><ArrowDownRight size={12} className="text-red-500"/> Deductions</p>
                <p className="text-sm font-mono">${record.totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
            </div>

            <div className="flex justify-between items-center w-full mt-4 pt-4 border-t border-[var(--border-strong)]">
              <span className="text-xs text-muted font-mono">Updated: {record.lastUpdated}</span>
              <button 
                onClick={() => handleOpenEdit(record)}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <Edit3 size={14} /> Edit Salary
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Salary Drawer */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2 className="font-serif text-xl">Adjust Compensation</h2>
          <button className="icon-btn" onClick={() => setIsDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        {selectedEmployee && (
          <form className="drawer-body" onSubmit={handleSaveSalary}>
            <div className="mb-6 pb-6 border-b border-[var(--border-strong)]">
              <h3 className="text-lg font-serif mb-1">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
              <p className="text-sm text-muted font-mono">{selectedEmployee.employeeId} &mdash; {selectedEmployee.department}</p>
            </div>

            <div className="form-group">
              <label className="form-label font-mono uppercase text-xs">New Base Salary (USD)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input pl-9 font-mono" 
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-[var(--bg-subtle)] p-4 rounded-md border border-[var(--border-strong)] mt-4">
              <p className="text-xs text-muted font-mono uppercase mb-2">Projected Impact (15% Deduction)</p>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-mono">Gross Earnings:</span>
                <span className="text-sm font-mono">${(parseFloat(editSalary) || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-mono text-red-400">Total Deductions:</span>
                <span className="text-sm font-mono text-red-400">-${((parseFloat(editSalary) || 0) * 0.15).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between pt-2 mt-2 border-t border-[var(--border-strong)]">
                <span className="text-sm font-mono font-bold">Net Payable:</span>
                <span className="text-sm font-mono font-bold text-purple-400">${((parseFloat(editSalary) || 0) * 0.85).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
            
            <div className="drawer-footer mt-auto pt-6 border-t border-[var(--border-strong)]">
              <button type="submit" className="btn-primary w-full py-3 justify-center">
                Confirm Adjustment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
