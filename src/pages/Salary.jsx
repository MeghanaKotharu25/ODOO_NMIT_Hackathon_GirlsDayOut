import { useState, useEffect } from 'react';
import { Download, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import './Salary.css';

export function Salary() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    employeeService.getEmployees()
      .then(data => {
        if (isMounted && data && data.length > 0) {
          setEmployeesList(data);
          setSelectedEmployeeId(data[0].id);
        }
      })
      .catch(err => console.warn('Salary page employees fetch error:', err))
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const employee = (user?.role === 'EMPLOYEE'
    ? employeesList.find(emp => emp.id === user.id || emp.uuid === user.id)
    : employeesList.find(emp => emp.id === selectedEmployeeId)) || employeesList[0];

  const getSalaryStructure = (emp) => {
    const dept = emp?.department || 'Engineering';
    const base = dept === 'Engineering' ? 85000 : 65000;
    const hra = base * 0.4;
    const allowances = base * 0.2;
    const gross = base + hra + allowances;
    const tax = gross * 0.15;
    const pf = base * 0.12;
    const deductions = tax + pf;
    const net = gross - deductions;
    return { base, hra, allowances, gross, tax, pf, deductions, net };
  };

  if (loading || !employee) {
    return (
      <div className="salary-page">
        <header className="salary-header"><h1 className="page-title font-serif">Payroll & Compensation</h1></header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2rem', color: 'var(--text-muted)' }} className="font-mono text-sm">
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading compensation records...
        </div>
      </div>
    );
  }

  const salary = getSalaryStructure(employee);
  const formatCurrency = (amount) => `$${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const handleDownloadPayslip = () => {
    if (addToast) addToast('Downloading payslip PDF...', 'success');
  };

  return (
    <div className="salary-page">
      <header className="salary-header">
        <div>
          <h1 className="page-title">Payroll & Compensation</h1>
          <p className="font-mono text-muted">Monthly Salary Breakdown & Payslips</p>
        </div>

        {user?.role !== 'EMPLOYEE' && employeesList.length > 0 && (
          <div className="employee-selector font-mono">
            <label>Select Employee:</label>
            <div className="select-wrapper">
              <select 
                value={selectedEmployeeId} 
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                {employeesList.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.id})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
          </div>
        )}
      </header>

      <div className="salary-grid">
        <div className="card salary-summary">
          <div className="card-header">
            <h2 className="font-serif text-lg">Net Payable Salary</h2>
            <button className="btn-secondary text-xs" onClick={handleDownloadPayslip}>
              <Download size={14} /> Download Payslip
            </button>
          </div>
          <div className="net-salary-amount font-mono">
            {formatCurrency(salary.net)}
          </div>
          <p className="text-muted text-xs font-mono mt-1">For period: October 2025</p>

          <div className="salary-meta mt-6 pt-6 border-t border-[var(--border-subtle)]">
            <div className="meta-item">
              <span className="text-muted text-xs font-mono">Employee</span>
              <strong className="text-sm font-sans">{employee?.firstName} {employee?.lastName}</strong>
            </div>
            <div className="meta-item">
              <span className="text-muted text-xs font-mono">Role / Dept</span>
              <strong className="text-sm font-sans">{employee?.position} ({employee?.department})</strong>
            </div>
            <div className="meta-item">
              <span className="text-muted text-xs font-mono">Payment Status</span>
              <span className="status-badge present">Paid</span>
            </div>
          </div>
        </div>

        <div className="card breakdown-card">
          <h2 className="font-serif text-lg mb-4">Earnings Breakdown</h2>
          <div className="breakdown-list">
            <div className="breakdown-item">
              <span>Basic Salary</span>
              <span className="font-mono">{formatCurrency(salary.base)}</span>
            </div>
            <div className="breakdown-item">
              <span>House Rent Allowance (HRA)</span>
              <span className="font-mono">{formatCurrency(salary.hra)}</span>
            </div>
            <div className="breakdown-item">
              <span>Special & Other Allowances</span>
              <span className="font-mono">{formatCurrency(salary.allowances)}</span>
            </div>
            <div className="breakdown-item total font-bold">
              <span>Gross Earnings</span>
              <span className="font-mono">{formatCurrency(salary.gross)}</span>
            </div>
          </div>
        </div>

        <div className="card breakdown-card">
          <h2 className="font-serif text-lg mb-4">Deductions Breakdown</h2>
          <div className="breakdown-list">
            <div className="breakdown-item">
              <span>Income Tax (TDS)</span>
              <span className="font-mono text-red-400">-{formatCurrency(salary.tax)}</span>
            </div>
            <div className="breakdown-item">
              <span>Provident Fund (PF)</span>
              <span className="font-mono text-red-400">-{formatCurrency(salary.pf)}</span>
            </div>
            <div className="breakdown-item total font-bold">
              <span>Total Deductions</span>
              <span className="font-mono text-red-400">-{formatCurrency(salary.deductions)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
