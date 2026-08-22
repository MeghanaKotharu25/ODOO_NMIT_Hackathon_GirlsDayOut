import { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react';
import { mockEmployees } from '../data/mockData';
import './TimeOff.css';

export function TimeOff() {
  const isAdmin = true; // Hardcoded based on mock user

  // Mock pending requests (Admin view)
  const pendingRequests = [
    { id: 1, employee: mockEmployees[1], type: 'Paid Leave', start: 'Oct 28, 2024', end: 'Oct 31, 2024', duration: '4 days', reason: 'Family vacation' },
    { id: 2, employee: mockEmployees[6], type: 'Sick Leave', start: 'Oct 24, 2024', end: 'Oct 25, 2024', duration: '2 days', reason: 'Flu symptoms' },
  ];

  // Mock leave balances (Employee view)
  const leaveBalances = [
    { type: 'Paid Leave', total: 20, used: 12, pending: 4 },
    { type: 'Sick Leave', total: 10, used: 2, pending: 0 },
    { type: 'Unpaid Leave', total: 0, used: 0, pending: 0 }
  ];

  const getBalanceRemaining = (balance) => {
    return balance.total - balance.used - balance.pending;
  };

  return (
    <div className="timeoff-page">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Time Off</h1>
            <p className="text-muted">Manage leave balances and requests</p>
          </div>
          <button className="btn btn-primary">
            <Plus size={16} /> Request Time Off
          </button>
        </div>
      </header>

      <div className="timeoff-grid">
        <div className="timeoff-main">
          {/* Admin Review Interface */}
          {isAdmin && (
            <div className="card admin-review-card">
              <h2 className="section-title">Pending Approvals</h2>
              
              {pendingRequests.length > 0 ? (
                <div className="pending-list">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="pending-request-item">
                      <div className="req-header">
                        <div className="req-emp-info">
                          <img src={req.employee.avatarUrl} alt={req.employee.firstName} className="emp-avatar-sm" />
                          <div>
                            <span className="req-emp-name">{req.employee.firstName} {req.employee.lastName}</span>
                            <span className="req-type badge badge-info ml-2">{req.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="req-details">
                        <div className="req-detail-col">
                          <span className="detail-label">When</span>
                          <span className="detail-value flex-align">
                            <CalendarIcon size={14} className="text-muted mr-1" />
                            {req.start} to {req.end}
                          </span>
                        </div>
                        <div className="req-detail-col">
                          <span className="detail-label">Duration</span>
                          <span className="detail-value">{req.duration}</span>
                        </div>
                        <div className="req-detail-col flex-2">
                          <span className="detail-label">Reason</span>
                          <span className="detail-value text-muted">"{req.reason}"</span>
                        </div>
                      </div>
                      
                      <div className="req-actions">
                        <button className="btn btn-secondary approve-btn">
                          <CheckCircle2 size={16} /> Approve
                        </button>
                        <button className="btn btn-secondary reject-btn">
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-6">No pending requests.</p>
              )}
            </div>
          )}

          {/* Employee Request History (Both Views) */}
          <div className="card mt-6">
            <h2 className="section-title">{isAdmin ? 'Recent Approvals' : 'Request History'}</h2>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="font-medium">Paid Leave</span></td>
                    <td>Aug 15 - Aug 18, 2024</td>
                    <td>4 days</td>
                    <td><span className="badge badge-success">Approved</span></td>
                  </tr>
                  <tr>
                    <td><span className="font-medium">Sick Leave</span></td>
                    <td>Jul 10, 2024</td>
                    <td>1 day</td>
                    <td><span className="badge badge-success">Approved</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="timeoff-sidebar">
          <div className="card balances-card">
            <h2 className="section-title">Your Balances</h2>
            <div className="balances-list">
              {leaveBalances.map((balance, index) => {
                const remaining = getBalanceRemaining(balance);
                const percentRemaining = balance.total > 0 ? (remaining / balance.total) * 100 : 0;
                
                return (
                  <div key={index} className="balance-item">
                    <div className="balance-header">
                      <span className="balance-type">{balance.type}</span>
                      <span className="balance-remaining"><strong>{remaining}</strong> {balance.type === 'Unpaid Leave' ? 'used' : 'left'}</span>
                    </div>
                    
                    {balance.total > 0 && (
                      <>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${percentRemaining}%`, backgroundColor: balance.type === 'Sick Leave' ? '#f59e0b' : 'var(--accent)' }}></div>
                        </div>
                        <div className="balance-footer">
                          <span className="text-xs text-muted">Total: {balance.total} days</span>
                          {balance.pending > 0 && <span className="text-xs text-muted flex-align"><Clock size={12} className="mr-1" /> {balance.pending} pending</span>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
