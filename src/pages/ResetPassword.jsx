import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import './Login.css';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { changePassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      addToast('Please fill out all fields.', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(password);
      addToast('Password updated successfully! Please sign in with your new credentials.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Password reset failed:', err);
      addToast(`Update Failed: ${err.message || 'Unable to update password.'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{ maxWidth: '460px' }}>
        <div className="login-header">
          <div className="login-brand" style={{ justifyContent: 'center' }}>
            <div className="logo-mark-lg"></div>
            <h1 className="font-serif glitch-text" data-text="Dayflow">Dayflow</h1>
          </div>
          <p className="login-subtitle font-mono uppercase text-xs text-muted mt-2" style={{ textAlign: 'center' }}>
            Terminal Security Override
          </p>
        </div>

        <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <KeyRound size={16} />
            <span className="font-mono uppercase text-xs font-bold">Set New Passcode</span>
          </div>
          <p className="text-muted text-xs font-sans">
            Please enter and confirm your new access passcode below.
          </p>
        </div>

        <form className="login-form" onSubmit={handleResetSubmit}>
          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">New Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ width: '100%', paddingRight: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Confirm New Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                style={{ width: '100%', paddingRight: '2.5rem' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '0.75rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary login-btn mt-6 w-full justify-center py-4 flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>UPDATING PASSCODE...</span>
              </>
            ) : (
              'UPDATE PASSWORD'
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Cancel & Return to <span style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Login</span>
            </button>
          </div>
        </form>

        <div className="login-footer">
          <span className="text-muted font-mono text-xs">v2.1.0-RC</span>
          <span className="text-muted font-mono text-xs">SECURE RECOVERY</span>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
