import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar as CalendarIcon, Shield, FileText, Loader2, Clock, Save } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { profileService } from '../services/profileService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './EmployeeDetails.css';

export function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isAdmin = (user?.profile?.role || user?.role || '').toLowerCase() === 'admin';

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

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      employeeService.getEmployeeById(id)
        .then(async data => {
          if (isMounted && data) {
            setEmployee(data);
            if (data.uuid) {
              const [privData, salData] = await Promise.all([
                profileService.getPrivateInfo(data.uuid),
                profileService.getSalaryInfo(data.uuid)
              ]);
              if (isMounted) {
                if (privData) setPrivateInfo(privData);
                if (salData) setSalaryInfo(salData);
              }
            }
          }
        })
        .catch((err) => {
          console.warn('Employee fetch error:', err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [id]);

  const handleSavePrivateInfo = async () => {
    setSaving(true);
    try {
      await profileService.updatePrivateInfo(employee.uuid, privateInfo);
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
      await profileService.updateSalaryInfo(employee.uuid, salaryInfo);
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

  if (loading) {
    return (
      <div className="dossier-page">
        <div className="dossier-empty" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Loader2 size={20} className="animate-spin" /> Loading Record...
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="dossier-page">
        <div className="dossier-empty">Record Not Found</div>
      </div>
    );
  }

  return (
    <div className="dossier-page">
      <button className="btn-back" onClick={() => navigate('/employees')}>
        <ArrowLeft size={16} /> Return to Roster
      </button>

      <div className="dossier-header-block">
        <div className="dossier-identity">
          <div className="dossier-image-wrapper">
            <img src={employee.avatarUrl} alt={employee.firstName} className="dossier-avatar" />
            <div className={`dossier-status-badge ${(employee.status || '').toLowerCase().replace(' ', '-')}`}>
              {employee.status}
            </div>
          </div>
          <div className="dossier-titles">
            <h1 className="dossier-name">{employee.firstName} {employee.lastName}</h1>
            <p className="dossier-role">{employee.position}</p>
            <div className="dossier-meta">
              <span className="font-mono text-muted">{employee.id}</span>
              <span className="dossier-divider">/</span>
              <span className="font-mono">{employee.department}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dossier-navigation">
        <div className="dossier-tabs">
          <button 
            className={`dossier-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            Resume
          </button>
          {isAdmin && (
            <>
              <button 
                className={`dossier-tab ${activeTab === 'private' ? 'active' : ''}`}
                onClick={() => setActiveTab('private')}
              >
                Private Info
              </button>
              <button 
                className={`dossier-tab ${activeTab === 'salary' ? 'active' : ''}`}
                onClick={() => setActiveTab('salary')}
              >
                Salary Info
              </button>
            </>
          )}
        </div>
      </div>

      <div className="dossier-content">
        {/* RESUME TAB */}
        {activeTab === 'general' && (
          <div className="dossier-section">
            <h2 className="section-title">Contact & Organization</h2>
            <div className="data-grid">
              <div className="data-field">
                <span className="field-label"><Mail size={14} /> Email Address</span>
                <span className="field-value font-mono">{employee.email}</span>
              </div>
              <div className="data-field">
                <span className="field-label"><Phone size={14} /> Mobile Phone</span>
                <span className="field-value font-mono">{employee.phone || privateInfo?.phone_number || '+1 (555) 000-0000'}</span>
              </div>
              <div className="data-field">
                <span className="field-label"><MapPin size={14} /> Location</span>
                <span className="field-value">{employee.location || 'Remote'}</span>
              </div>
              <div className="data-field">
                <span className="field-label"><CalendarIcon size={14} /> Date of Joining</span>
                <span className="field-value font-mono">{employee.joinDate}</span>
              </div>
              <div className="data-field">
                <span className="field-label"><Clock size={14} /> Shift Start</span>
                <span className="field-value font-mono">{employee.defaultInTime ? employee.defaultInTime.substring(0, 5) : '09:00'}</span>
              </div>
              <div className="data-field">
                <span className="field-label"><Clock size={14} /> Shift End</span>
                <span className="field-value font-mono">{employee.defaultOutTime ? employee.defaultOutTime.substring(0, 5) : '17:30'}</span>
              </div>
              <div className="data-field">
                <span className="field-label"><Briefcase size={14} /> Manager</span>
                <span className="field-value">{employee.manager || 'Not Assigned'}</span>
              </div>
            </div>

            <h2 className="section-title" style={{ marginTop: 'var(--spacing-8)' }}>Documents</h2>
            <div className="document-list">
              <div className="document-item">
                <div className="doc-icon"><FileText size={20} /></div>
                <div className="doc-info">
                  <span className="doc-name font-mono">Resume_Updated_2023.pdf</span>
                  <span className="doc-meta">Added 2023-01-15 • 2.4 MB</span>
                </div>
                <button className="btn-link" onClick={() => addToast('Downloading Resume_Updated_2023.pdf...', 'success')}>Download</button>
              </div>
              <div className="document-item">
                <div className="doc-icon"><FileText size={20} /></div>
                <div className="doc-info">
                  <span className="doc-name font-mono">Contract_Signed.pdf</span>
                  <span className="doc-meta">Added {employee.joinDate} • 1.1 MB</span>
                </div>
                <button className="btn-link" onClick={() => addToast('Downloading Contract_Signed.pdf...', 'success')}>Download</button>
              </div>
            </div>
          </div>
        )}

        {/* PRIVATE INFO TAB */}
        {activeTab === 'private' && isAdmin && (
          <div className="private-info-grid card-box p-6 mt-4">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-strong)] pb-4">
              <h3 className="font-serif text-xl">Personal & Bank Details</h3>
              <button className="btn-primary" onClick={handleSavePrivateInfo} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
              </button>
            </div>
            <div className="grid-2-col gap-8">
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
                  <span className="font-mono text-muted">{employee.joinDate || 'N/A'}</span>
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
                  <span className="font-mono text-muted">{employee.id || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SALARY INFO TAB */}
        {activeTab === 'salary' && isAdmin && (
          <div className="salary-info-grid card-box p-6 mt-4 font-mono text-sm">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-strong)] pb-4">
              <h3 className="font-serif text-xl">Salary Config & Components</h3>
              <button className="btn-primary" onClick={handleSaveSalaryInfo} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Config
              </button>
            </div>
            
            <div className="grid-2-col gap-12">
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
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
