import { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, Plus, X } from 'lucide-react';
import { mockEmployees } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import './TimeOff.css';

export function TimeOff() {
  const isAdmin = true; // Hardcoded based on mock user
  const { addToast } = useToast();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({ type: 'Paid Leave', start: '', end: '', reason: '' });

  // Mock pending requests (Admin view) made stateful
  const [pendingRequests, setPendingRequests] = useState([
    { id: 1, employee: mockEmployees[1], type: 'Paid Leave', start: 'Oct 28, 2024', end: 'Oct 31, 2024', duration: '4 days', reason: 'Family vacation' },
    { id: 2, employee: mockEmployees[6], type: 'Sick Leave', start: 'Oct 24, 2024', end: 'Oct 25, 2024', duration: '2 days', reason: 'Flu symptoms' },
  ]);

  // Mock leave balances (Employee view)
  const leaveBalances = [
    { type: 'Paid Leave', total: 20, used: 12, pending: 4 },
    { type: 'Sick Leave', total: 10, used: 2, pending: 0 },
    { type: 'Unpaid Leave', total: 0, used: 0, pending: 0 }
  ];

  const getBalanceRemaining = (balance) => {
    return balance.total - balance.used - balance.pending;
  };

  const handleAction = (id, action) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
    if (action === 'approve') {
      addToast('Leave request approved successfully.', 'success');
    } else {
      addToast('Leave request rejected.', 'error');
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!newRequest.start || !newRequest.end || !newRequest.reason) {
      addToast('Please fill out all request details.', 'error');
      return;
    }
    
    // Calculate rough duration in days for mock display
    const startD = new Date(newRequest.start);
    const endD = new Date(newRequest.end);
    const diffTime = Math.abs(endD - startD);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const mockNewRequest = {
      id: Date.now(),
      employee: mockEmployees[2], // Assuming the current user (Elena) is requesting
      type: newRequest.type,
      start: startD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      end: endD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: `${diffDays} days`,
      reason: newRequest.reason
    };

    setPendingRequests([mockNewRequest, ...pendingRequests]);

    setIsDrawerOpen(false);
    setNewRequest({ type: 'Paid Leave', start: '', end: '', reason: '' });
    addToast('Your time off request has been submitted for approval.', 'success');
  };

  return (
    <div className="timeoff-page">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Time Off</h1>
            <p className="text-muted">Manage leave balances and requests</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsDrawerOpen(true)}>
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
                        <button 
                          className="btn btn-secondary approve-btn"
                          onClick={() => handleAction(req.id, 'approve')}
                        >
                          <CheckCircle2 size={16} /> Approve
                        </button>
                        <button 
                          className="btn btn-secondary reject-btn"
                          onClick={() => handleAction(req.id, 'reject')}
                        >
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

      {/* Request Leave Drawer */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2 className="font-serif text-xl">Request Time Off</h2>
          <button className="icon-btn" onClick={() => setIsDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <form className="drawer-body" onSubmit={handleRequestSubmit}>
          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Leave Type</label>
            <select 
              className="form-input"
              value={newRequest.type}
              onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
            >
              <option value="Paid Leave">Paid Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Start Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={newRequest.start}
              onChange={(e) => setNewRequest({...newRequest, start: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">End Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={newRequest.end}
              onChange={(e) => setNewRequest({...newRequest, end: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Reason</label>
            <textarea 
              className="form-input" 
              rows="3"
              value={newRequest.reason}
              onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
            ></textarea>
          </div>
          
          <div className="drawer-footer mt-auto pt-6 border-t border-[var(--border-strong)]">
            <button type="submit" className="btn-primary w-full py-3 justify-center">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
