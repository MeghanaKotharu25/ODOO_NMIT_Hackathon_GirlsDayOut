import { useState, useEffect } from 'react';
import { Download, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import './Salary.css';

export function Salary() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    employeeService.getEmployees()
      .then(data => {
        if (isMounted && data && data.length > 0) {
          setEmployees(data);
          setSelectedEmployeeId(data[0].id);
        }
      })
      .catch(err => console.warn('Salary employees fetch error:', err))
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  // In a real app, this would be fetched based on the selected employee or current user
  const employee = user?.role === 'EMPLOYEE' 
    ? employees.find(emp => emp.id === user.id) || employees[0]
    : employees.find(emp => emp.id === selectedEmployeeId) || employees[0];

  // Mock salary structure based on the employee's role/department
  const getSalaryStructure = (emp) => {
    const base = emp.department === 'Engineering' ? 85000 : 65000;
    const hra = base * 0.4; // 40% of base
    const allowances = base * 0.2; // 20% of base
    
    const gross = base + hra + allowances;
    
    const tax = gross * 0.15; // 15% estimated tax
    const pf = base * 0.12; // 12% of base
    
    const deductions = tax + pf;
    const net = gross - deductions;
    
    return {
      base, hra, allowances, gross, tax, pf, deductions, net
    };
  };
  if (loading || !employee) {
    return (
      <div className="financial-page">
        <header className="financial-header"><h1 className="page-title">Financial Ledger</h1></header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2rem', color: 'var(--text-muted)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading salary data...
        </div>
      </div>
    );
  }

  const salary = getSalaryStructure(employee);
  const formatCurrency = (amount) => `$${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  return (
    <div className="financial-page">
      <header className="financial-header">
        <h1 className="page-title">Financial Ledger</h1>
        
        {user?.role !== 'EMPLOYEE' && (
          <div className="employee-selector">
            <span className="selector-label">Viewing Record For:</span>
            <div className="selector-dropdown">
              <select 
                value={selectedEmployeeId} 
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="font-mono"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.id})</option>
                ))}
              </select>
              <ChevronDown size={14} className="selector-icon" />
            </div>
          </div>
        )}
      </header>

      {/* Main Calculation Grid */}
      <div className="calculation-ledger">
        
        {/* Earnings Column */}
        <div className="ledger-column">
          <div className="column-header">
            <h3>Gross Earnings</h3>
          </div>
          <div className="ledger-entries">
            <div className="ledger-entry">
              <span className="entry-label">Base Compensation</span>
              <span className="entry-value font-mono">{formatCurrency(salary.base)}</span>
            </div>
            <div className="ledger-entry">
              <span className="entry-label">Housing Allowance (HRA)</span>
              <span className="entry-value font-mono">{formatCurrency(salary.hra)}</span>
            </div>
            <div className="ledger-entry">
              <span className="entry-label">Special Allowances</span>
              <span className="entry-value font-mono">{formatCurrency(salary.allowances)}</span>
            </div>
          </div>
          <div className="ledger-subtotal">
            <span className="subtotal-label">Total Earnings</span>
            <span className="subtotal-value font-mono">{formatCurrency(salary.gross)}</span>
          </div>
        </div>

        {/* Deductions Column */}
        <div className="ledger-column">
          <div className="column-header">
            <h3>Deductions</h3>
          </div>
          <div className="ledger-entries">
            <div className="ledger-entry">
              <span className="entry-label">Income Tax (Est.)</span>
              <span className="entry-value font-mono text-error">-{formatCurrency(salary.tax)}</span>
            </div>
            <div className="ledger-entry">
              <span className="entry-label">Provident Fund (PF)</span>
              <span className="entry-value font-mono text-error">-{formatCurrency(salary.pf)}</span>
            </div>
          </div>
          <div className="ledger-subtotal">
            <span className="subtotal-label">Total Deductions</span>
            <span className="subtotal-value font-mono text-error">-{formatCurrency(salary.deductions)}</span>
          </div>
        </div>

      </div>

      {/* Net Salary Result */}
      <div className="net-salary-block">
        <div className="net-details">
          <span className="net-label">Net Payable Amount</span>
          <span className="net-value font-mono">{formatCurrency(salary.net)}</span>
        </div>
        <div className="net-structure-bar">
          <div className="bar-segment earnings" style={{ width: `${(salary.net / salary.gross) * 100}%` }}></div>
          <div className="bar-segment deductions" style={{ width: `${(salary.deductions / salary.gross) * 100}%` }}></div>
        </div>
        <div className="net-legend font-mono">
          <span><span className="legend-dot earnings"></span> Net Pay</span>
          <span><span className="legend-dot deductions"></span> Deductions</span>
        </div>
      </div>

      {/* Payslips */}
      <div className="payslip-archive">
        <div className="archive-header">
          <h3>Payslip Archive</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Period</th>
              <th className="text-right">Net Pay</th>
              <th>Status</th>
              <th className="text-right">Document</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-mono">September 2024</td>
              <td className="font-mono text-right">{formatCurrency(salary.net)}</td>
              <td><span className="badge badge-success">Processed</span></td>
              <td className="text-right">
                <button 
                  className="btn-link"
                  onClick={() => addToast('Generating Payslip PDF for September 2024...', 'success')}
                ><Download size={14} className="inline-icon" /> PDF</button>
              </td>
            </tr>
            <tr>
              <td className="font-mono">August 2024</td>
              <td className="font-mono text-right">{formatCurrency(salary.net)}</td>
              <td><span className="badge badge-success">Processed</span></td>
              <td className="text-right">
                <button 
                  className="btn-link"
                  onClick={() => addToast('Generating Payslip PDF for August 2024...', 'success')}
                ><Download size={14} className="inline-icon" /> PDF</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
