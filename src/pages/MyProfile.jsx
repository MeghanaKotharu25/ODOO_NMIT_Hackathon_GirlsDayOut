import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Pencil } from 'lucide-react';
import './MyProfile.css';

export function MyProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resume');
  
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
              <img src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id || 'EMP'}`} alt={user.firstName} className="profile-avatar-large" />
              <button className="edit-avatar-btn"><Pencil size={14} /></button>
            </div>
            
            <div className="identity-details">
              <h2 className="font-serif text-3xl mb-4">{user.firstName} {user.lastName}</h2>
              
              <div className="info-grid">
                <span className="info-label text-muted">Login ID</span>
                <span className="info-value">{user.email?.split('@')[0] || user.id}</span>
                
                <span className="info-label text-muted">Email</span>
                <span className="info-value">{user.email}</span>
                
                <span className="info-label text-muted">Mobile</span>
                <span className="info-value">{user.phone || '+1 (555) 000-0000'}</span>
              </div>
            </div>
          </div>
          
          <div className="profile-work-info">
            <div className="info-grid work-grid">
              <span className="info-label text-muted">Company</span>
              <span className="info-value">Dayflow Inc.</span>
              
              <span className="info-label text-muted">Department</span>
              <span className="info-value">{user.department || 'Operations'}</span>
              
              <span className="info-label text-muted">Manager</span>
              <span className="info-value">Sarah Jenkins</span>
              
              <span className="info-label text-muted">Location</span>
              <span className="info-value">{user.location || 'New York, HQ'}</span>
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
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                </p>
              </section>

              <section className="resume-section card-box">
                <div className="section-header">
                  <h3 className="font-serif text-xl">What I love about my job</h3>
                  <button className="icon-btn"><Pencil size={16} /></button>
                </div>
                <p className="text-secondary text-sm">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                </p>
              </section>

              <section className="resume-section card-box">
                <div className="section-header">
                  <h3 className="font-serif text-xl">My interests and hobbies</h3>
                  <button className="icon-btn"><Pencil size={16} /></button>
                </div>
                <p className="text-secondary text-sm">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                </p>
              </section>
            </div>

            <div className="resume-right-col">
              <section className="resume-section card-box">
                <div className="section-header">
                  <h3 className="font-serif text-xl">Skills</h3>
                </div>
                <div className="skills-content">
                  {/* Placeholder for skills if any exist, otherwise just the add button */}
                </div>
                <button className="btn-add-text mt-4">+ Add Skills</button>
              </section>

              <section className="resume-section card-box">
                <div className="section-header">
                  <h3 className="font-serif text-xl">Certification</h3>
                </div>
                <div className="cert-content">
                  {/* Placeholder for certs if any exist */}
                </div>
                <button className="btn-add-text mt-4">+ Add Certification</button>
              </section>
            </div>
          </div>
        )}
        
        {/* Placeholder for other tabs */}
        {activeTab === 'private' && (
          <div className="resume-content-grid">
            <div className="card-box w-full p-8 text-center text-muted font-mono" style={{ gridColumn: '1 / -1' }}>Private Info Content Not Available</div>
          </div>
        )}
        {activeTab === 'salary' && (
          <div className="resume-content-grid">
            <div className="card-box w-full p-8 text-center text-muted font-mono" style={{ gridColumn: '1 / -1' }}>Salary Info Content Not Available</div>
          </div>
        )}
      </div>
    </div>
  );
}
