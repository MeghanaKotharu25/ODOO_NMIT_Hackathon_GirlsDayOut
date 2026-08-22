import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { useToast } from '../context/ToastContext';
import { Pencil, Key, Shield, Lock, Loader2, Save } from 'lucide-react';
import './MyProfile.css';

export function MyProfile() {
  const { user, changePassword } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('resume');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Security Form State
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // States for Private and Salary Info
  const [privateInfo, setPrivateInfo] = useState({
    date_of_birth: '', residing_address: '', nationality: '', personal_email: '', gender: '', marital_status: '',
    bank_name: '', account_number: '', ifsc_code: '', pan_no: '', uan_no: ''
  });

  const [salaryInfo, setSalaryInfo] = useState({
    monthly_wage: 50000, working_days_per_week: 5, break_time_hrs: 1,
    basic_percentage: 50, hra_percentage_of_basic: 50, standard_allowance_percentage: 16.67,
    performance_bonus_percentage: 8.33, lta_percentage: 8.33, pf_employee_percentage: 12,
    pf_employer_percentage: 12, professional_tax: 200
  });

  const isAdmin = (user?.profile?.role || user?.role || '').toLowerCase() === 'admin';

  useEffect(() => {
    if (!user?.id) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const [privData, salData] = await Promise.all([
          profileService.getPrivateInfo(user.id),
          isAdmin ? profileService.getSalaryInfo(user.id) : null
        ]);
        
        if (privData) setPrivateInfo(privData);
        if (salData) setSalaryInfo(salData);
      } catch (err) {
        console.warn('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user?.id, isAdmin]);

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

  const handleSavePrivateInfo = async () => {
    setSaving(true);
    try {
      await profileService.updatePrivateInfo(user.id, privateInfo);
      addToast('Private info updated successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSalaryInfo = async () => {
    setSaving(true);
    try {
      await profileService.updateSalaryInfo(user.id, salaryInfo);
      addToast('Salary config updated successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const calculateSalary = () => {
    const wage = Number(salaryInfo.monthly_wage) || 0;
    const basic = wage * ((Number(salaryInfo.basic_percentage) || 0) / 100);
    const hra = basic * ((Number(salaryInfo.hra_percentage_of_basic) || 0) / 100);
    const stdAllowance = wage * ((Number(salaryInfo.standard_allowance_percentage) || 0) / 100);
    const perfBonus = wage * ((Number(salaryInfo.performance_bonus_percentage) || 0) / 100);
    const lta = wage * ((Number(salaryInfo.lta_percentage) || 0) / 100);
    const fixedAllowance = Math.max(0, wage - (basic + hra + stdAllowance + perfBonus + lta));

    const pfEmployee = basic * ((Number(salaryInfo.pf_employee_percentage) || 0) / 100);
    const pfEmployer = basic * ((Number(salaryInfo.pf_employer_percentage) || 0) / 100);

    return { wage, basic, hra, stdAllowance, perfBonus, lta, fixedAllowance, pfEmployee, pfEmployer };
  };

  const salCalc = calculateSalary();

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
          {isAdmin && (
            <button 
              className={`tab-item ${activeTab === 'salary' ? 'active' : ''}`}
              onClick={() => setActiveTab('salary')}
            >
              Salary Info
            </button>
          )}
          <button
            className={`tab-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security & Passcode
          </button>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted" size={24} /></div>
        ) : (
          <>
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
                    <p className="text-secondary text-sm mt-4">
                      Collaborating across high-performance teams, building robust operational workflows, and streamlining enterprise systems.
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
              <div className="private-info-grid card-box p-6">
                <div className="flex justify-between items-center mb-6 border-b border-[var(--border-strong)] pb-4">
                  <h3 className="font-serif text-xl">Personal & Bank Details</h3>
                </div>
                <fieldset disabled className="grid-2-col gap-8 border-none m-0 p-0">
                  <div className="flex flex-col gap-4">
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">Date of Birth</label>
                      <input type="date" className="bg-transparent text-right font-mono outline-none" value={privateInfo.date_of_birth || ''} onChange={(e) => setPrivateInfo({...privateInfo, date_of_birth: e.target.value})} />
                    </div>
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">Residing Address</label>
                      <input type="text" className="bg-transparent text-right outline-none" value={privateInfo.residing_address || ''} onChange={(e) => setPrivateInfo({...privateInfo, residing_address: e.target.value})} placeholder="Full Address" />
                    </div>
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">Nationality</label>
                      <input type="text" className="bg-transparent text-right outline-none" value={privateInfo.nationality || ''} onChange={(e) => setPrivateInfo({...privateInfo, nationality: e.target.value})} placeholder="e.g. Indian" />
                    </div>
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">Personal Email</label>
                      <input type="email" className="bg-transparent text-right font-mono outline-none" value={privateInfo.personal_email || ''} onChange={(e) => setPrivateInfo({...privateInfo, personal_email: e.target.value})} placeholder="email@example.com" />
                    </div>
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">Gender</label>
                      <select className="bg-transparent text-right outline-none" value={privateInfo.gender || ''} onChange={(e) => setPrivateInfo({...privateInfo, gender: e.target.value})}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">Marital Status</label>
                      <select className="bg-transparent text-right outline-none" value={privateInfo.marital_status || ''} onChange={(e) => setPrivateInfo({...privateInfo, marital_status: e.target.value})}>
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                      </select>
                    </div>
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">Date of Joining</label>
                      <span className="font-mono text-muted">{user.joinDate || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="font-serif text-lg mb-2 text-[var(--text-secondary)]">Bank Details</h4>
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">Account Number</label>
                      <input type="text" className="bg-transparent text-right font-mono outline-none" value={privateInfo.account_number || ''} onChange={(e) => setPrivateInfo({...privateInfo, account_number: e.target.value})} placeholder="Account No" />
                    </div>
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">Bank Name</label>
                      <input type="text" className="bg-transparent text-right outline-none" value={privateInfo.bank_name || ''} onChange={(e) => setPrivateInfo({...privateInfo, bank_name: e.target.value})} placeholder="Bank Name" />
                    </div>
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">IFSC Code</label>
                      <input type="text" className="bg-transparent text-right font-mono outline-none" value={privateInfo.ifsc_code || ''} onChange={(e) => setPrivateInfo({...privateInfo, ifsc_code: e.target.value})} placeholder="IFSC Code" />
                    </div>
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">PAN No</label>
                      <input type="text" className="bg-transparent text-right font-mono outline-none uppercase" value={privateInfo.pan_no || ''} onChange={(e) => setPrivateInfo({...privateInfo, pan_no: e.target.value})} placeholder="PAN Number" />
                    </div>
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">UAN NO</label>
                      <input type="text" className="bg-transparent text-right font-mono outline-none" value={privateInfo.uan_no || ''} onChange={(e) => setPrivateInfo({...privateInfo, uan_no: e.target.value})} placeholder="UAN Number" />
                    </div>
                    <div className="form-group flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                      <label className="text-secondary text-sm">Emp Code</label>
                      <span className="font-mono text-muted">{user.profile?.employee_code || user.id || 'N/A'}</span>
                    </div>
                  </div>
                </fieldset>
              </div>
            )}

            {/* Tab Content - Salary Info */}
            {activeTab === 'salary' && isAdmin && (
              <div className="salary-info-grid card-box p-6 font-mono text-sm">
                <div className="flex justify-between items-center mb-6 border-b border-[var(--border-strong)] pb-4">
                  <h3 className="font-serif text-xl">Salary Config & Components</h3>
                </div>
                
                <fieldset disabled className="grid-2-col gap-12 border-none m-0 p-0">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-4">
                      <label className="font-sans">Month Wage</label>
                      <div className="flex items-center gap-2">
                        <span>₹</span>
                        <input type="number" className="bg-transparent border-b border-dashed border-[var(--border-strong)] text-right outline-none w-24" 
                          value={salaryInfo.monthly_wage} onChange={(e) => setSalaryInfo({...salaryInfo, monthly_wage: e.target.value})} />
                        <span className="text-xs text-muted">/ Month</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <label className="font-sans">Yearly Wage</label>
                      <div className="flex items-center gap-2">
                        <span className="text-muted">₹ {(salCalc.wage * 12).toFixed(2)}</span>
                        <span className="text-xs text-muted">/ Yearly</span>
                      </div>
                    </div>

                    <h4 className="font-sans font-semibold border-b border-[var(--border-strong)] pb-2 mb-2">Salary Components</h4>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col"><span className="font-sans text-xs">Basic Salary</span></div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted">₹ {salCalc.basic.toFixed(2)}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" className="bg-transparent border-b border-dashed border-[var(--border-strong)] text-right outline-none w-16 text-xs" 
                            value={salaryInfo.basic_percentage} onChange={(e) => setSalaryInfo({...salaryInfo, basic_percentage: e.target.value})} />
                          <span className="text-xs">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col"><span className="font-sans text-xs">House Rent Allowance (HRA)</span></div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted">₹ {salCalc.hra.toFixed(2)}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" className="bg-transparent border-b border-dashed border-[var(--border-strong)] text-right outline-none w-16 text-xs" 
                            value={salaryInfo.hra_percentage_of_basic} onChange={(e) => setSalaryInfo({...salaryInfo, hra_percentage_of_basic: e.target.value})} />
                          <span className="text-xs">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col"><span className="font-sans text-xs">Standard Allowance</span></div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted">₹ {salCalc.stdAllowance.toFixed(2)}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" className="bg-transparent border-b border-dashed border-[var(--border-strong)] text-right outline-none w-16 text-xs" 
                            value={salaryInfo.standard_allowance_percentage} onChange={(e) => setSalaryInfo({...salaryInfo, standard_allowance_percentage: e.target.value})} />
                          <span className="text-xs">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col"><span className="font-sans text-xs">Performance Bonus</span></div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted">₹ {salCalc.perfBonus.toFixed(2)}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" className="bg-transparent border-b border-dashed border-[var(--border-strong)] text-right outline-none w-16 text-xs" 
                            value={salaryInfo.performance_bonus_percentage} onChange={(e) => setSalaryInfo({...salaryInfo, performance_bonus_percentage: e.target.value})} />
                          <span className="text-xs">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col"><span className="font-sans text-xs">Leave Travel Allowance</span></div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted">₹ {salCalc.lta.toFixed(2)}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" className="bg-transparent border-b border-dashed border-[var(--border-strong)] text-right outline-none w-16 text-xs" 
                            value={salaryInfo.lta_percentage} onChange={(e) => setSalaryInfo({...salaryInfo, lta_percentage: e.target.value})} />
                          <span className="text-xs">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col"><span className="font-sans text-xs">Fixed Allowance (Balancer)</span></div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted">₹ {salCalc.fixedAllowance.toFixed(2)}</span>
                        <div className="flex items-center gap-1 opacity-50">
                          <span className="w-16 text-right text-xs">Auto</span>
                          <span className="text-xs"> </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <label className="font-sans text-xs">No of working days in a week:</label>
                      <input type="number" className="bg-transparent border-b border-dashed border-[var(--border-strong)] text-right outline-none w-16" 
                        value={salaryInfo.working_days_per_week} onChange={(e) => setSalaryInfo({...salaryInfo, working_days_per_week: e.target.value})} />
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <label className="font-sans text-xs">Break Time (hrs):</label>
                      <input type="number" className="bg-transparent border-b border-dashed border-[var(--border-strong)] text-right outline-none w-16" 
                        value={salaryInfo.break_time_hrs} onChange={(e) => setSalaryInfo({...salaryInfo, break_time_hrs: e.target.value})} />
                    </div>

                    <h4 className="font-sans font-semibold border-b border-[var(--border-strong)] pb-2 mb-2">Provident Fund (PF) Contribution</h4>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col"><span className="font-sans text-xs">Employee</span></div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted">₹ {salCalc.pfEmployee.toFixed(2)}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" className="bg-transparent border-b border-dashed border-[var(--border-strong)] text-right outline-none w-16 text-xs" 
                            value={salaryInfo.pf_employee_percentage} onChange={(e) => setSalaryInfo({...salaryInfo, pf_employee_percentage: e.target.value})} />
                          <span className="text-xs">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col"><span className="font-sans text-xs">Employer</span></div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted">₹ {salCalc.pfEmployer.toFixed(2)}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" className="bg-transparent border-b border-dashed border-[var(--border-strong)] text-right outline-none w-16 text-xs" 
                            value={salaryInfo.pf_employer_percentage} onChange={(e) => setSalaryInfo({...salaryInfo, pf_employer_percentage: e.target.value})} />
                          <span className="text-xs">%</span>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-sans font-semibold border-b border-[var(--border-strong)] pb-2 mb-2">Tax Deductions</h4>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col"><span className="font-sans text-xs">Professional Tax</span></div>
                      <div className="flex items-center gap-2">
                        <span>₹</span>
                        <input type="number" className="bg-transparent border-b border-dashed border-[var(--border-strong)] text-right outline-none w-20 text-xs" 
                          value={salaryInfo.professional_tax} onChange={(e) => setSalaryInfo({...salaryInfo, professional_tax: e.target.value})} />
                        <span className="text-xs text-muted">/ month</span>
                      </div>
                    </div>
                  </div>
                </fieldset>
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
          </>
        )}
      </div>
    </div>
  );
}

export default MyProfile;
