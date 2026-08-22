import { useState } from 'react';
import { mockCurrentUser } from '../data/mockData';
import { Building, Hash, Download } from 'lucide-react';
import './MyProfile.css';

export function MyProfile() {
  const [activeTab, setActiveTab] = useState('resume');
  const isAdmin = true; // Hardcoded for mockup based on role
  
  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'private', label: 'Private Info' },
    { id: 'security', label: 'Security' }
  ];
  
  if (isAdmin) {
    tabs.push({ id: 'salary', label: 'Salary Info' });
  }

  return (
    <div className="profile-page">
      <div className="profile-header card">
        <div className="profile-cover"></div>
        <div className="profile-info-container">
          <div className="profile-avatar-wrapper">
            <img src={mockCurrentUser.avatarUrl} alt="Avatar" className="profile-avatar" />
          </div>
          
          <div className="profile-info">
            <h1 className="profile-name">{mockCurrentUser.firstName} {mockCurrentUser.lastName}</h1>
            <p className="profile-position">{mockCurrentUser.position}</p>
            
            <div className="profile-meta">
              <span className="meta-tag"><Building size={14} /> Dayflow Inc.</span>
              <span className="meta-tag"><Hash size={14} /> {mockCurrentUser.id}</span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button className="btn btn-secondary">Edit Profile</button>
          </div>
        </div>
        
        <div className="profile-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'resume' && (
          <div className="tab-pane">
            <section className="profile-section card">
              <h2 className="section-title">About</h2>
              <p className="profile-text">
                I'm a passionate HR professional with over 8 years of experience building scalable teams and fostering inclusive cultures. At Dayflow, I focus on talent acquisition and employee experience.
              </p>
            </section>
            
            <div className="grid-cols-2 mt-6">
              <section className="profile-section card">
                <h2 className="section-title">What I love about my job</h2>
                <ul className="profile-list">
                  <li>Connecting with people across different departments</li>
                  <li>Building systems that make work life easier</li>
                  <li>Mentoring junior team members</li>
                </ul>
              </section>
              
              <section className="profile-section card">
                <h2 className="section-title">Interests</h2>
                <div className="tag-cloud">
                  <span className="tag">Organizational Psychology</span>
                  <span className="tag">Remote Culture</span>
                  <span className="tag">Data-driven HR</span>
                  <span className="tag">Hiking</span>
                </div>
              </section>
            </div>
            
            <section className="profile-section card mt-6">
              <div className="section-header-flex">
                <h2 className="section-title">Certifications</h2>
                <button className="btn btn-secondary btn-sm"><Download size={14} /> Download Resume</button>
              </div>
              <div className="cert-list">
                <div className="cert-item">
                  <div className="cert-icon">SHRM</div>
                  <div className="cert-info">
                    <h4>SHRM Senior Certified Professional (SHRM-SCP)</h4>
                    <p>Issued Jun 2022</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
        
        {activeTab === 'private' && (
          <div className="tab-pane">
             <section className="profile-section card">
              <h2 className="section-title">Personal Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">Elena Rodriguez</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date of Birth</span>
                  <span className="info-value">August 12, 1990</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Gender</span>
                  <span className="info-value">Female</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nationality</span>
                  <span className="info-value">United States</span>
                </div>
              </div>
            </section>

            <section className="profile-section card mt-6">
              <h2 className="section-title">Contact Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Personal Email</span>
                  <span className="info-value">elena.rodriguez.private@example.com</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">+1 (555) 987-6543</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Emergency Contact</span>
                  <span className="info-value">Michael Rodriguez (Spouse) - +1 (555) 111-2222</span>
                </div>
              </div>
            </section>

            <section className="profile-section card mt-6">
              <h2 className="section-title">Bank Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Bank Name</span>
                  <span className="info-value">Chase Bank</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Number</span>
                  <span className="info-value">•••• •••• •••• 4092</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="tab-pane">
            <section className="profile-section card">
              <h2 className="section-title">Security Settings</h2>
              <p className="text-muted mt-2">Manage your password and 2FA settings.</p>
              
              <div className="mt-6">
                <button className="btn btn-secondary">Change Password</button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'salary' && isAdmin && (
          <div className="tab-pane">
            <section className="profile-section card">
              <h2 className="section-title">Salary Information</h2>
              <p className="text-muted mt-2">This tab is only visible to Admins. View detailed salary breakdown in the Salary module.</p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
