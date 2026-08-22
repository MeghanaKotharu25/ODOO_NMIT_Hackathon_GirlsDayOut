import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signIn } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Credentials required.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const authFn = signIn || login;
      await authFn(email, password);
      addToast('System authenticated. Welcome back.', 'success');
      navigate('/loading');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('failed to fetch') || err.name === 'TypeError') {
        addToast(`Network Error: Unable to connect to Supabase (${msg || 'Failed to fetch'}). Check DNS/Internet.`, 'error');
      } else {
        addToast(msg || 'Authentication failed.', 'error');
      }
      setIsSubmitting(false);
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
            <label className="form-label font-mono uppercase text-xs">Login Id/Email :-</label>
            <input 
              type="text" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@dayflow.io"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Password :-</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary login-btn mt-4 w-full justify-center py-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
          
          <div className="demo-logins" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Demo Access</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                onClick={() => { setEmail('elena.r@dayflow.io'); setPassword('Password123!'); }}
              >
                HR/Admin
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                onClick={() => { setEmail('sarah.chen@dayflow.io'); setPassword('Password123!'); }}
              >
                Employee
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }} style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Don't have an Account? <span style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Sign Up</span>
            </a>
          </div>
        </form>
        
        <div className="login-footer">
          <span className="text-muted font-mono text-xs">v2.1.0-RC</span>
          <span className="text-muted font-mono text-xs">SECURE CONNECTION</span>
        </div>
      </div>
    </div>
  );
}
