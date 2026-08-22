import { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import './Salary.css';

export function Salary() {
  const [selectedEmployee, setSelectedEmployee] = useState('Elena Rodriguez');

  const salaryData = {
    monthly: 8500,
    annual: 102000,
    structure: [
      { name: 'Basic', percentage: 50, amount: 4250, color: 'var(--accent)' },
      { name: 'HRA', percentage: 20, amount: 1700, color: '#38bdf8' },
      { name: 'Special Allowance', percentage: 15, amount: 1275, color: '#a78bfa' },
      { name: 'LTA', percentage: 10, amount: 850, color: '#fbbf24' },
      { name: 'Other', percentage: 5, amount: 425, color: '#94a3b8' }
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: 510 },
      { name: 'Professional Tax', amount: 200 }
    ]
  };

  const totalDeductions = salaryData.deductions.reduce((acc, curr) => acc + curr.amount, 0);
  const netSalary = salaryData.monthly - totalDeductions;

  return (
    <div className="salary-page">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Salary Management</h1>
            <p className="text-muted">Admin access only</p>
          </div>
          
          <div className="employee-selector">
            <span className="text-muted mr-2">Viewing:</span>
            <button className="btn btn-secondary">
              {selectedEmployee} <ChevronDown size={14} className="ml-2" />
            </button>
          </div>
        </div>
      </header>

      <div className="salary-content">
        <div className="salary-main">
          {/* Primary Wage Display */}
          <div className="card wage-card">
            <div className="wage-header">
              <h2>Current Compensation</h2>
              <button className="btn btn-secondary btn-sm"><Download size={14} /> Payslip</button>
            </div>
            
            <div className="wage-numbers">
              <div className="primary-wage">
                <span className="wage-label">Monthly Gross</span>
                <span className="wage-amount">${salaryData.monthly.toLocaleString()}</span>
              </div>
              <div className="wage-divider"></div>
              <div className="secondary-wage">
                <span className="wage-label">Annual CTC</span>
                <span className="wage-amount">${salaryData.annual.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Salary Structure Visual Breakdown */}
          <div className="card structure-card">
            <h3 className="section-title">Salary Structure</h3>
            
            <div className="visual-bar-container">
              {salaryData.structure.map((item, index) => (
                <div 
                  key={index} 
                  className="visual-bar-segment" 
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  title={`${item.name} (${item.percentage}%)`}
                ></div>
              ))}
            </div>

            <div className="structure-list">
              {salaryData.structure.map((item, index) => (
                <div key={index} className="structure-item">
                  <div className="structure-item-left">
                    <span className="color-dot" style={{ backgroundColor: item.color }}></span>
                    <span className="structure-name">{item.name}</span>
                    <span className="structure-percent">{item.percentage}%</span>
                  </div>
                  <div className="structure-amount">${item.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="salary-sidebar">
          {/* Deductions & Net */}
          <div className="card deductions-card">
            <h3 className="section-title">Deductions</h3>
            
            <div className="deductions-list">
              {salaryData.deductions.map((item, index) => (
                <div key={index} className="deduction-item">
                  <span className="deduction-name">{item.name}</span>
                  <span className="deduction-amount">-${item.amount}</span>
                </div>
              ))}
            </div>
            
            <div className="deductions-total">
              <span>Total Deductions</span>
              <span>-${totalDeductions}</span>
            </div>

            <div className="net-salary-box">
              <span className="net-label">Net Monthly Salary</span>
              <span className="net-amount">${netSalary.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="card info-card mt-6">
            <h3 className="section-title">Recent Revisions</h3>
            <div className="revision-item">
              <div className="revision-date">Jan 1, 2024</div>
              <div className="revision-change">+$10,000 Annual (10.8% increase)</div>
              <div className="revision-reason text-muted">Annual Performance Review</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
