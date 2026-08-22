import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Phone, MapPin, Briefcase, Calendar as CalendarIcon, Shield, Key } from 'lucide-react';
import './MyProfile.css';

export function MyProfile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwordForm.new || !passwordForm.confirm) {
      addToast('Please fill out the new password fields.', 'error');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    
    setIsChangingPassword(true);
    // Simulate API call for password change
    setTimeout(() => {
      addToast('Password successfully updated.', 'success');
      setPasswordForm({ current: '', new: '', confirm: '' });
      setIsChangingPassword(false);
    }, 1000);
  };
  
  if (!user) return null;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1 className="page-title font-serif">Operator Profile</h1>
        <p className="text-muted font-mono uppercase text-xs">Self-Service Access</p>
      </header>
      
      <div className="profile-grid">
        <div className="profile-card identity-card">
          <div className="identity-header">
            <img src={user.avatarUrl} alt={user.firstName} className="profile-avatar" />
            <div className="identity-title">
              <h2 className="font-serif text-2xl">{user.firstName} {user.lastName}</h2>
              <span className="badge badge-info mt-2">{user.position}</span>
            </div>
          </div>
          
          <div className="identity-details mt-8">
            <div className="detail-row">
              <span className="detail-label font-mono text-xs uppercase text-muted"><Mail size={14} className="inline-icon"/> Comm</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label font-mono text-xs uppercase text-muted"><Phone size={14} className="inline-icon"/> Contact</span>
              <span className="detail-value">{user.phone || '+1 (555) 000-0000'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label font-mono text-xs uppercase text-muted"><MapPin size={14} className="inline-icon"/> Location</span>
              <span className="detail-value">{user.location || 'Remote'}</span>
            </div>
          </div>
        </div>

        <div className="profile-card ops-card">
          <h3 className="section-title font-mono uppercase text-sm border-b pb-4 mb-4">Operational Status</h3>
          
          <div className="ops-grid">
            <div className="ops-stat">
              <span className="ops-label text-muted"><Briefcase size={16} className="mb-2"/> Department</span>
              <span className="ops-value font-serif text-xl">{user.department}</span>
            </div>
            <div className="ops-stat">
              <span className="ops-label text-muted"><CalendarIcon size={16} className="mb-2"/> Activated</span>
              <span className="ops-value font-mono">{user.joinDate || '2023-01-15'}</span>
            </div>
            <div className="ops-stat">
              <span className="ops-label text-muted"><Shield size={16} className="mb-2"/> Clearance</span>
              <span className="ops-value font-mono">{user.role}</span>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-6" style={{ borderColor: 'var(--border-strong)'}}>
            <h4 className="font-mono uppercase text-xs text-muted mb-4">Security Settings</h4>
            
            <form onSubmit={handlePasswordChange} className="password-change-form">
              <div className="form-group mb-3">
                <label className="form-label font-mono text-[10px] uppercase text-muted">Current Password</label>
                <input 
                  type="password" 
                  className="form-input text-sm p-2" 
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label font-mono text-[10px] uppercase text-muted">New Password</label>
                <input 
                  type="password" 
                  className="form-input text-sm p-2" 
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label font-mono text-[10px] uppercase text-muted">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-input text-sm p-2" 
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit" 
                className="btn-secondary w-full py-2 text-xs"
                disabled={isChangingPassword}
              >
                <Key size={14} className="mr-2" />
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="mt-8 border-t pt-6" style={{ borderColor: 'var(--border-strong)'}}>
            <h4 className="font-mono uppercase text-xs text-muted mb-4">Recent Access Logs</h4>
            <ul className="access-logs">
              <li className="log-item">
                <span className="log-time font-mono text-xs">Today, 09:01 AM</span>
                <span className="log-action font-sans text-sm">System Authentication</span>
                <span className="log-status font-mono text-xs" style={{color: 'var(--status-success)'}}>SUCCESS</span>
              </li>
              <li className="log-item">
                <span className="log-time font-mono text-xs">Yesterday, 17:35 PM</span>
                <span className="log-action font-sans text-sm">Session Terminated</span>
                <span className="log-status font-mono text-xs text-muted">CLOSED</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
