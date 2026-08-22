import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Pencil, Key, Shield, Lock, Loader2 } from 'lucide-react';
import './MyProfile.css';

export function MyProfile() {
  const { user, changePassword } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('resume');

  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.new || !passwordForm.confirm) {
      addToast('Please fill out the new password fields.', 'error');
      return;
    }
    if (passwordForm.new.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      addToast('New passwords do not match.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordForm.new);
      addToast('Password successfully updated in Supabase Auth.', 'success');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      console.error('Password change error:', err);
      addToast(`Password Update Failed: ${err.message || 'Error updating password'}`, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <header className="profile-page-header">
        <h1 className="page-title font-serif">My Profile</h1>
      </header>

      <div className="profile-main-card">
        {/* Top Info Section */}
        <div className="profile-top-section">
          <div className="profile-identity">
            <div className="avatar-wrapper">
              <img
                src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.profile?.employee_code || user.id || 'EMP'}`}
                alt={user.firstName || 'Employee'}
                className="profile-avatar-large"
              />
              <button className="edit-avatar-btn" title="Edit Avatar">
                <Pencil size={14} />
              </button>
            </div>

            <div className="identity-details">
              <h2 className="font-serif text-3xl mb-4">
                {user.profile?.first_name || user.firstName} {user.profile?.last_name || user.lastName}
              </h2>

              <div className="info-grid">
                <span className="info-label text-muted">Login ID</span>
                <span className="info-value font-mono font-bold">{user.profile?.employee_code || user.email?.split('@')[0] || user.id}</span>

                <span className="info-label text-muted">Email</span>
                <span className="info-value">{user.email}</span>

                <span className="info-label text-muted">Mobile</span>
                <span className="info-value">{user.profile?.phone || user.phone || '+1 (555) 000-0000'}</span>
              </div>
            </div>
          </div>

          <div className="profile-work-info">
            <div className="info-grid work-grid">
              <span className="info-label text-muted">Company</span>
              <span className="info-value">{localStorage.getItem('dayflow_company_name') || 'Dayflow Inc.'}</span>

              <span className="info-label text-muted">Department</span>
              <span className="info-value">{user.profile?.department || user.department || 'Operations'}</span>

              <span className="info-label text-muted">Position</span>
              <span className="info-value">{user.profile?.position || user.position || 'Employee'}</span>

              <span className="info-label text-muted">Location</span>
              <span className="info-value">{user.location || 'HQ / Remote'}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-item ${activeTab === 'resume' ? 'active' : ''}`}
            onClick={() => setActiveTab('resume')}
          >
            Resume
          </button>
          <button
            className={`tab-item ${activeTab === 'private' ? 'active' : ''}`}
            onClick={() => setActiveTab('private')}
          >
            Private Info
          </button>
          <button
            className={`tab-item ${activeTab === 'salary' ? 'active' : ''}`}
            onClick={() => setActiveTab('salary')}
          >
            Salary Info
          </button>
          <button
            className={`tab-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security & Passcode
          </button>
        </div>

        {/* Tab Content - Resume */}
        {activeTab === 'resume' && (
          <div className="resume-content-grid">
            <div className="resume-left-col">
              <section className="resume-section card-box">
                <div className="section-header">
                  <h3 className="font-serif text-xl">About</h3>
                  <button className="icon-btn"><Pencil size={16} /></button>
                </div>
                <p className="text-secondary text-sm">
                  Personnel profile registered on the Dayflow Operating System. Active operator with full clearance for daily terminal logging, check-ins, and leave management.
                </p>
              </section>

              <section className="resume-section card-box">
                <div className="section-header">
                  <h3 className="font-serif text-xl">What I love about my job</h3>
                  <button className="icon-btn"><Pencil size={16} /></button>
                </div>
                <p className="text-secondary text-sm">
                  Collaborating across high-performance teams, building robust operational workflows, and streamlining enterprise systems.
                </p>
              </section>

              <section className="resume-section card-box">
                <div className="section-header">
                  <h3 className="font-serif text-xl">My interests and hobbies</h3>
                  <button className="icon-btn"><Pencil size={16} /></button>
                </div>
                <p className="text-secondary text-sm">
                  System architecture, open-source technology, continuous integration, and terminal user interfaces.
                </p>
              </section>
            </div>

            <div className="resume-right-col">
              <section className="resume-section card-box">
                <div className="section-header">
                  <h3 className="font-serif text-xl">Skills</h3>
                </div>
                <div className="skills-content">
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge badge-info">{user.profile?.department || 'Operations'}</span>
                    <span className="badge badge-info">{user.profile?.position || 'Personnel'}</span>
                    <span className="badge badge-info">Supabase Auth</span>
                  </div>
                </div>
                <button className="btn-add-text mt-4">+ Add Skills</button>
              </section>

              <section className="resume-section card-box">
                <div className="section-header">
                  <h3 className="font-serif text-xl">Certification</h3>
                </div>
                <div className="cert-content">
                  <p className="text-xs text-muted font-mono mt-1">Verified Corporate Security Clearance</p>
                </div>
                <button className="btn-add-text mt-4">+ Add Certification</button>
              </section>
            </div>
          </div>
        )}

        {/* Tab Content - Private Info */}
        {activeTab === 'private' && (
          <div className="resume-content-grid">
            <div className="card-box w-full p-8" style={{ gridColumn: '1 / -1' }}>
              <h3 className="font-serif text-xl mb-4">Private Information</h3>
              <div className="info-grid" style={{ maxWidth: '600px' }}>
                <span className="info-label text-muted">Personal Email</span>
                <span className="info-value">{user.email}</span>

                <span className="info-label text-muted">Nationality</span>
                <span className="info-value">Verified Citizen</span>

                <span className="info-label text-muted">Clearance Level</span>
                <span className="info-value font-mono">{(user.profile?.role || user.role || 'EMPLOYEE').toUpperCase()}</span>

                <span className="info-label text-muted">Join Date</span>
                <span className="info-value font-mono">{user.profile?.join_date || user.joinDate || new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content - Salary Info */}
        {activeTab === 'salary' && (
          <div className="resume-content-grid">
            <div className="card-box w-full p-8" style={{ gridColumn: '1 / -1' }}>
              <h3 className="font-serif text-xl mb-4">Salary Structure</h3>
              <p className="text-secondary text-sm mb-4">
                Compensation and payroll structures are managed by the Financial and HR Administration terminals.
              </p>
              <div className="info-grid" style={{ maxWidth: '600px' }}>
                <span className="info-label text-muted">Status</span>
                <span className="info-value font-mono text-green-400">ACTIVE ON PAYROLL</span>

                <span className="info-label text-muted">Payout Frequency</span>
                <span className="info-value font-mono">MONTHLY (END OF CYCLE)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content - Security Settings */}
        {activeTab === 'security' && (
          <div className="resume-content-grid">
            <div className="card-box w-full p-8" style={{ gridColumn: '1 / -1', maxWidth: '640px' }}>
              <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-light)] pb-3">
                <Shield size={20} />
                <h3 className="font-serif text-xl">Account Security & Passcode</h3>
              </div>

              <p className="text-secondary text-sm mb-6">
                Update your authentication password managed securely via Supabase Auth.
              </p>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="form-group mb-3">
                  <label className="form-label font-mono text-xs uppercase text-muted">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    placeholder="••••••••"
                    disabled={isChangingPassword}
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label font-mono text-xs uppercase text-muted">New Password</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    placeholder="••••••••"
                    disabled={isChangingPassword}
                  />
                </div>

                <div className="form-group mb-4">
                  <label className="form-label font-mono text-xs uppercase text-muted">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    placeholder="••••••••"
                    disabled={isChangingPassword}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full py-3 justify-center flex items-center gap-2"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>UPDATING PASSWORD...</span>
                    </>
                  ) : (
                    <>
                      <Key size={16} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyProfile;
