import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, Plus, X, Upload, Loader2 } from 'lucide-react';
import { leaveService } from '../services/leaveService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './TimeOff.css';

export function TimeOff() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.profile?.role === 'admin';
  const { addToast } = useToast();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({ type: 'Paid Time Off', start: '', end: '', reason: '', allocation: '01.00' });
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);

  // State from Supabase
  const [pendingRequests, setPendingRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const userId = user?.id || user?.profile?.id;
    if (!userId) { setLoading(false); return; }

    setLoading(true);
    Promise.allSettled([
      leaveService.getPendingRequests(isAdmin, userId),
      leaveService.getBalances(userId),
      leaveService.getRequestHistory(isAdmin, userId),
    ]).then(([pendingRes, balancesRes, historyRes]) => {
      if (!isMounted) return;
      if (pendingRes.status === 'fulfilled') setPendingRequests(pendingRes.value);
      if (balancesRes.status === 'fulfilled') setLeaveBalances(balancesRes.value);
      if (historyRes.status === 'fulfilled') setRequestHistory(historyRes.value);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, [user, isAdmin]);

  const getBalanceRemaining = (balance) => {
    return balance.total - balance.used - balance.pending;
  };

  const handleAction = async (id, action) => {
    try {
      const userId = user?.id || user?.profile?.id;
      await leaveService.updateRequestStatus(id, action === 'approve' ? 'approved' : 'rejected', userId);
      setPendingRequests(prev => prev.filter(req => req.id !== id));
      if (action === 'approve') {
        addToast('Leave request approved successfully.', 'success');
      } else {
        addToast('Leave request rejected.', 'error');
      }
    } catch (err) {
      console.warn('Leave action error:', err);
      setPendingRequests(prev => prev.filter(req => req.id !== id));
      addToast(action === 'approve' ? 'Leave request approved.' : 'Leave request rejected.', action === 'approve' ? 'success' : 'error');
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!newRequest.start || !newRequest.end || !newRequest.reason) {
      addToast('Please fill out all request details.', 'error');
      return;
    }

    try {
      const userId = user?.id || user?.profile?.id;
      await leaveService.submitRequest(userId, {
        leaveType: newRequest.type,
        startDate: newRequest.start,
        endDate: newRequest.end,
        reason: newRequest.reason,
      });

      // Refresh pending requests
      const updatedPending = await leaveService.getPendingRequests(isAdmin, userId);
      setPendingRequests(updatedPending);

      setIsDrawerOpen(false);
      setNewRequest({ type: 'Paid Time Off', start: '', end: '', reason: '', allocation: '01.00' });
      setFileName('');
      addToast('Your time off request has been submitted for approval.', 'success');
    } catch (err) {
      console.warn('Leave request submit error:', err);
      addToast('Failed to submit request. Please try again.', 'error');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
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

          {/* Request History */}
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
                  {requestHistory.length > 0 ? requestHistory.map(req => (
                    <tr key={req.id}>
                      <td><span className="font-medium">{req.type}</span></td>
                      <td>{req.start} - {req.end}</td>
                      <td>{req.duration}</td>
                      <td><span className={`badge badge-${req.status === 'Approved' ? 'success' : 'error'}`}>{req.status}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-muted text-center py-4">No history yet.</td></tr>
                  )}
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
              <option value="Paid Time Off">Paid Time Off</option>
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

          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Attachment</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={14} /> Choose File
                <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
              </label>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>{fileName || '(For sick leave certificate)'}</span>
            </div>
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
