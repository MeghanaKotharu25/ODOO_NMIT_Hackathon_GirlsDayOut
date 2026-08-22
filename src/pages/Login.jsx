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
            <label className="form-label font-mono uppercase text-xs">Operator ID / Email</label>
            <input 
              type="text" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@dayflow.io"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Passcode</label>
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
            className="btn-primary login-btn mt-4 w-full justify-center py-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Initialize Session'}
          </button>
        </form>
        
        <div className="login-footer">
          <span className="text-muted font-mono text-xs">v2.1.0-RC</span>
          <span className="text-muted font-mono text-xs">SECURE CONNECTION</span>
        </div>
      </div>
    </div>
  );
}
