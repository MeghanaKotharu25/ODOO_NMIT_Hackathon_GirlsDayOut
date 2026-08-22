import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar as CalendarIcon, Shield, FileText, Loader2, Clock } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { profileService } from '../services/profileService';
import { useToast } from '../context/ToastContext';
import './EmployeeDetails.css';

export function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [employee, setEmployee] = useState(null);
  const [privateInfo, setPrivateInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      employeeService.getEmployeeById(id)
        .then(data => {
          if (isMounted && data) {
            setEmployee(data);
            if (data.uuid && profileService?.getPrivateInfo) {
              profileService.getPrivateInfo(data.uuid).then(info => {
                if (isMounted && info) setPrivateInfo(info);
              }).catch(() => {});
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

  if (loading) {
    return (
      <div className="dossier-page">
        <div className="dossier-empty" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading Record...
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
          <button 
            className={`dossier-tab ${activeTab === 'private' ? 'active' : ''}`}
            onClick={() => setActiveTab('private')}
          >
            Private Info
          </button>
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
        {activeTab === 'private' && (
          <div className="dossier-section">
            <h2 className="section-title">Personal Details</h2>
            <div className="data-grid">
              <div className="data-field">
                <span className="field-label">Date of Birth</span>
                <span className="field-value font-mono">{privateInfo?.date_of_birth || '—'}</span>
              </div>
              <div className="data-field">
                <span className="field-label">Nationality</span>
                <span className="field-value">{privateInfo?.nationality || '—'}</span>
              </div>
              <div className="data-field">
                <span className="field-label">Gender</span>
                <span className="field-value">{privateInfo?.gender || '—'}</span>
              </div>
              <div className="data-field">
                <span className="field-label">Personal Email</span>
                <span className="field-value font-mono">{privateInfo?.personal_email || `${employee.firstName?.toLowerCase()}@personal.com`}</span>
              </div>
              <div className="data-field">
                <span className="field-label">Emergency Contact</span>
                <span className="field-value">{privateInfo?.emergency_contact_name || '—'}</span>
              </div>
              <div className="data-field">
                <span className="field-label">Emergency Phone</span>
                <span className="field-value font-mono">{privateInfo?.emergency_contact_phone || '—'}</span>
              </div>
            </div>

            <h2 className="section-title" style={{ marginTop: 'var(--spacing-8)' }}>Banking & Compliance</h2>
            <div className="data-grid">
              <div className="data-field">
                <span className="field-label">Bank</span>
                <span className="field-value">{privateInfo?.bank_name || '—'}</span>
              </div>
              <div className="data-field">
                <span className="field-label">Account Number</span>
                <span className="field-value font-mono">{privateInfo?.account_number ? `XXXX-${privateInfo.account_number.slice(-4)}` : '—'}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
