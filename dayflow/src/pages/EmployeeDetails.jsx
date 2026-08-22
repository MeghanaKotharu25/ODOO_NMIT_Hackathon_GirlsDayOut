import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, Building, Hash } from 'lucide-react';
import { mockEmployees } from '../data/mockData';
import './EmployeeDetails.css';

export function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const employee = mockEmployees.find(emp => emp.id === id);

  if (!employee) {
    return (
      <div className="empty-state">
        <h3>Employee not found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/employees')}>
          Return to Directory
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Present': return <span className="badge badge-success">Present</span>;
      case 'Absent': return <span className="badge badge-error">Absent</span>;
      case 'On Leave': return <span className="badge badge-info">On Leave</span>;
      default: return null;
    }
  };

  return (
    <div className="employee-details-page">
      <div className="back-nav">
        <button className="btn-text" onClick={() => navigate('/employees')}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>

      <div className="personnel-record">
        <header className="record-header">
          <div className="record-avatar-container">
            <img src={employee.avatarUrl} alt={employee.firstName} className="record-avatar" />
            <div className="record-status-overlay">
              {getStatusBadge(employee.status)}
            </div>
          </div>
          
          <div className="record-title">
            <h1 className="record-name">{employee.firstName} {employee.lastName}</h1>
            <p className="record-position">{employee.position}</p>
            
            <div className="record-meta-tags">
              <span className="meta-tag"><Building size={14} /> {employee.department}</span>
              <span className="meta-tag"><Hash size={14} /> {employee.id}</span>
            </div>
          </div>
        </header>

        <div className="record-body">
          <section className="record-section">
            <h2 className="section-title">Professional Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-value">{employee.department}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Position</span>
                <span className="info-value">{employee.position}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Joining Date</span>
                <span className="info-value">{new Date(employee.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Employment Type</span>
                <span className="info-value">Full-time</span>
              </div>
            </div>
          </section>

          <hr className="divider" />

          <section className="record-section">
            <h2 className="section-title">Contact Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value flex-align">
                  <Mail size={16} className="text-muted mr-2" /> 
                  <a href={`mailto:${employee.email}`}>{employee.email}</a>
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value flex-align">
                  <Phone size={16} className="text-muted mr-2" /> 
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value flex-align">
                  <MapPin size={16} className="text-muted mr-2" /> 
                  San Francisco, CA
                </span>
              </div>
            </div>
          </section>

          <hr className="divider" />

          <section className="record-section">
            <h2 className="section-title">Current Status</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Availability</span>
                <span className="info-value">{getStatusBadge(employee.status)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Recent Activity</span>
                <span className="info-value">Checked in at 9:00 AM</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
