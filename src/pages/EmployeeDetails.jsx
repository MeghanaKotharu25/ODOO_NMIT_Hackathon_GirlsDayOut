import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar as CalendarIcon, Shield, FileText } from 'lucide-react';
import { mockEmployees } from '../data/mockData';
import { employeeService } from '../services/employeeService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './EmployeeDetails.css';

export function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [employee, setEmployee] = useState(() => mockEmployees.find(emp => emp.id === id) || null);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      employeeService.getEmployeeById(id).then(data => {
        if (isMounted && data) {
          setEmployee(data);
        }
      });
    }
    return () => { isMounted = false; };
  }, [id]);

  if (!employee) {
    return (
      <div className="dossier-page">
        <div className="dossier-empty">Record Not Found</div>
      </div>
    );
  }

  const isAuthorizedForPrivate = user?.role === 'ADMIN' || user?.role === 'HR' || user?.id === employee.id;

  return (
    <div className="dossier-page">
      <button className="btn-back" onClick={() => navigate('/employees')}>
        <ArrowLeft size={16} /> Return to Roster
      </button>

      <div className="dossier-header-block">
        <div className="dossier-identity">
          <div className="dossier-image-wrapper">
            <img src={employee.avatarUrl} alt={employee.firstName} className="dossier-avatar" />
            <div className={`dossier-status-badge ${employee.status.toLowerCase().replace(' ', '-')}`}>
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
            General Information
          </button>
          
          {isAuthorizedForPrivate && (
            <>
              <button 
                className={`dossier-tab ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                Security & Access
              </button>
              <button 
                className={`dossier-tab ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                Confidential Documents
              </button>
            </>
          )}
          <div className="dossier-tab-line" data-active={activeTab}></div>
        </div>
      </div>

      <div className="dossier-content">
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
                <span className="field-value font-mono">{employee.phone}</span>
              </div>
              <div className="data-field">
                <span className="field-label"><MapPin size={14} /> Location</span>
                <span className="field-value">{employee.location}</span>
              </div>
              <div className="data-field">
                <span className="field-label"><CalendarIcon size={14} /> Date of Joining</span>
                <span className="field-value font-mono">{employee.joinDate}</span>
              </div>
              <div className="data-field">
                <span className="field-label"><Briefcase size={14} /> Manager</span>
                <span className="field-value">{employee.manager}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && isAuthorizedForPrivate && (
          <div className="dossier-section">
            <h2 className="section-title">Security Settings</h2>
            <div className="data-grid">
              <div className="data-field">
                <span className="field-label"><Shield size={14} /> System Role</span>
                <span className="field-value font-mono uppercase">{employee.role}</span>
              </div>
              <div className="data-field">
                <span className="field-label">Last Login</span>
                <span className="field-value font-mono">2024-10-24 08:42:15</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && isAuthorizedForPrivate && (
          <div className="dossier-section">
            <h2 className="section-title">Stored Documents</h2>
            <div className="document-list">
              <div className="document-item">
                <div className="doc-icon"><FileText size={20} /></div>
                <div className="doc-info">
                  <span className="doc-name font-mono">Resume_Updated_2023.pdf</span>
                  <span className="doc-meta">Added 2023-01-15 • 2.4 MB</span>
                </div>
                <button 
                  className="btn-link"
                  onClick={() => addToast('Downloading Resume_Updated_2023.pdf...', 'success')}
                >Download</button>
              </div>
              <div className="document-item">
                <div className="doc-icon"><FileText size={20} /></div>
                <div className="doc-info">
                  <span className="doc-name font-mono">Contract_Signed.pdf</span>
                  <span className="doc-meta">Added {employee.joinDate} • 1.1 MB</span>
                </div>
                <button 
                  className="btn-link"
                  onClick={() => addToast('Downloading Contract_Signed.pdf...', 'success')}
                >Download</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
