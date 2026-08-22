import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Bell, Shield, Monitor } from 'lucide-react';
import './Settings.css';

export function Settings() {
  const { addToast } = useToast();
  const { user, resetPasswordForEmail } = useAuth();

  const [prefs, setPrefs] = useState({
    emailNotifs: true,
    pushNotifs: false,
    darkMode: false,
    twoFactor: true
  });

  const togglePref = (key) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
    addToast('Preferences updated.', 'success');
  };

  const handleInitiatePasswordReset = async () => {
    if (!user?.email) {
      addToast('No user email associated with current session.', 'error');
      return;
    }
    try {
      await resetPasswordForEmail(user.email);
      addToast(`Password recovery link dispatched to ${user.email}.`, 'success');
    } catch (err) {
      console.error('Settings password reset error:', err);
      addToast(`Reset Error: ${err.message || 'Failed to dispatch reset link.'}`, 'error');
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1 className="page-title font-serif">System Preferences</h1>
        <p className="text-muted font-mono uppercase text-xs">Configure local environment</p>
      </header>

      <div className="settings-grid">
        <div className="settings-panel">
          <div className="panel-header">
            <Bell size={18} />
            <h2 className="font-serif text-xl">Notifications</h2>
          </div>
          <div className="panel-body">
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Email Digests</span>
                <span className="setting-desc text-muted">Receive daily summary of terminal activity.</span>
              </div>
              <button
                className={`toggle-btn ${prefs.emailNotifs ? 'on' : 'off'}`}
                onClick={() => togglePref('emailNotifs')}
              >
                {prefs.emailNotifs ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Push Alerts</span>
                <span className="setting-desc text-muted">Critical operational alerts pushed to browser.</span>
              </div>
              <button
                className={`toggle-btn ${prefs.pushNotifs ? 'on' : 'off'}`}
                onClick={() => togglePref('pushNotifs')}
              >
                {prefs.pushNotifs ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        <div className="settings-panel">
          <div className="panel-header">
            <Monitor size={18} />
            <h2 className="font-serif text-xl">Interface</h2>
          </div>
          <div className="panel-body">
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">High Contrast Mode</span>
                <span className="setting-desc text-muted">Enforce dark mode aesthetic globally.</span>
              </div>
              <button
                className={`toggle-btn ${prefs.darkMode ? 'on' : 'off'}`}
                onClick={() => togglePref('darkMode')}
              >
                {prefs.darkMode ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        <div className="settings-panel">
          <div className="panel-header">
            <Shield size={18} />
            <h2 className="font-serif text-xl">Security</h2>
          </div>
          <div className="panel-body">
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Two-Factor Authentication</span>
                <span className="setting-desc text-muted">Require hardware token for system access.</span>
              </div>
              <button
                className={`toggle-btn ${prefs.twoFactor ? 'on' : 'off'}`}
                onClick={() => togglePref('twoFactor')}
              >
                {prefs.twoFactor ? 'ENFORCED' : 'DISABLED'}
              </button>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Passcode Reset</span>
                <span className="setting-desc text-muted">Rotate your operational terminal passcode.</span>
              </div>
              <button className="btn-secondary" onClick={handleInitiatePasswordReset}>
                Initiate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
