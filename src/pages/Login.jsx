import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, KeyRound, Loader2 } from 'lucide-react';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const { login, signIn, resetPasswordForEmail } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      addToast('Credentials required.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const authFn = signIn || login;
      await authFn(email.trim(), password);
      addToast('System authenticated. Welcome back.', 'success');
      navigate('/loading');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('failed to fetch') || err.name === 'TypeError') {
        addToast(`Network Error: Unable to connect to Supabase (${msg || 'Failed to fetch'}). Check DNS/Internet.`, 'error');
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        addToast('Invalid Login ID/Email or password. Please verify.', 'error');
      } else {
        addToast(msg || 'Authentication failed.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!recoveryInput.trim()) {
      addToast('Please enter your email or Login ID.', 'error');
      return;
    }

    setIsSendingReset(true);
    try {
      await resetPasswordForEmail(recoveryInput.trim());
      addToast('Password recovery link dispatched. Please check your inbox.', 'success');
      setIsForgotModalOpen(false);
      setRecoveryInput('');
    } catch (err) {
      console.error('Password reset error:', err);
      addToast(`Reset Error: ${err.message || 'Failed to dispatch reset link.'}`, 'error');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-brand">
            <div className="logo-mark-lg"></div>
            <h1 className="font-serif glitch-text" data-text="Dayflow">Dayflow</h1>
          </div>
          <p className="login-subtitle font-mono uppercase text-xs text-muted mt-2">
            System Access Terminal
          </p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Login Id / Email :-</label>
            <input
              type="text"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. OIJODO20260001 or name@dayflow.io"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label font-mono uppercase text-xs">Password :-</label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', cursor: 'pointer', padding: 0 }}
                className="hover:text-white"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn-primary login-btn mt-4 w-full justify-center py-4 flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>SIGNING IN...</span>
              </>
            ) : (
              'SIGN IN'
            )}
          </button>

          <div className="demo-logins" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Demo Access</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                onClick={() => { setEmail('elena.r@dayflow.io'); setPassword('Password123!'); }}
              >
                HR/Admin
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                onClick={() => { setEmail('sarah.chen@dayflow.io'); setPassword('Password123!'); }}
              >
                Employee
              </button>
            </div>
          </div>
        </form>

        <div className="login-footer">
          <span className="text-muted font-mono text-xs">v2.1.0-RC</span>
          <span className="text-muted font-mono text-xs">SECURE CONNECTION</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="login-box" style={{ maxWidth: '420px', width: '100%', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-strong)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={18} />
                <h3 className="font-serif text-lg">Password Recovery</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Enter your registered Email address or Employee Login ID. We will dispatch a secure reset link to your primary communication channel.
            </p>

            <form onSubmit={handleForgotPassword}>
              <div className="form-group mb-4">
                <label className="form-label font-mono uppercase text-xs">Login ID / Email</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={recoveryInput}
                  onChange={(e) => setRecoveryInput(e.target.value)}
                  placeholder="e.g. OIJODO20260001 or user@dayflow.io"
                  disabled={isSendingReset}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                  onClick={() => setIsForgotModalOpen(false)}
                  disabled={isSendingReset}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.75rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  disabled={isSendingReset}
                >
                  {isSendingReset ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    'Send Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
