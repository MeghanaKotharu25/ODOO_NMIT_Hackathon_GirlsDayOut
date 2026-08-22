import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UploadCloud, Eye, EyeOff } from 'lucide-react';
import './Register.css';

export function Register() {
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedCompany = formData.companyName.trim();
    const trimmedPhone = formData.phone.trim();

    if (!trimmedName || !trimmedEmail || !formData.password || !formData.confirmPassword) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = trimmedName.split(/\s+/);
      const firstName = nameParts[0] || 'Employee';
      const lastName = nameParts.slice(1).join(' ') || '';

      const metadata = {
        first_name: firstName,
        last_name: lastName,
        full_name: trimmedName,
        phone: trimmedPhone,
        company_name: trimmedCompany || 'Dayflow',
        role: 'admin'
      };

      const result = await signUp(trimmedEmail, formData.password, metadata);

      if (trimmedCompany) {
        localStorage.setItem('dayflow_company_name', trimmedCompany);
      }

      if (result?.session) {
        addToast('Registration successful! Welcome to Dayflow.', 'success');
        navigate('/loading');
      } else {
        // Try automatic sign in (works if email confirmations are disabled but auto-sign-in isn't returned)
        try {
          await login(trimmedEmail, formData.password);
          addToast('Registration successful! Automatically logged in.', 'success');
          navigate('/loading');
        } catch (loginErr) {
          addToast('Registration successful! Please check your email to verify.', 'success');
          navigate('/login');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('unique constraint') || msg.toLowerCase().includes('user already exists')) {
        addToast('An account with this email address already exists. Please sign in.', 'error');
      } else if (msg.toLowerCase().includes('failed to fetch') || err.name === 'TypeError') {
        addToast('Network Error: Unable to connect to Supabase. Check your connection.', 'error');
      } else {
        addToast(msg || 'Registration failed.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{ maxWidth: '500px' }}>
        <div className="login-header">
          <div className="login-brand" style={{ justifyContent: 'center' }}>
            <div className="logo-mark-lg"></div>
            <h1 className="font-serif glitch-text" data-text="Dayflow">Dayflow</h1>
          </div>
          <p className="login-subtitle font-mono uppercase text-xs text-muted mt-2" style={{ textAlign: 'center' }}>
            HR & Admin Registration Terminal
          </p>
        </div>

        <form className="login-form" onSubmit={handleRegister}>

          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Company Name</label>
            <div className="input-with-button">
              <input
                type="text"
                name="companyName"
                className="form-input"
                style={{ flex: 1 }}
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Dayflow Inc."
              />
              <button type="button" className="btn btn-secondary" style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Upload Logo">
                <UploadCloud size={18} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Doe"
            />
          </div>

          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@company.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Phone Number</label>
            <input
              type="text"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                style={{ width: '100%', paddingRight: '2.5rem' }}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-mono uppercase text-xs">Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input"
                style={{ width: '100%', paddingRight: '2.5rem' }}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn mt-4 w-full justify-center py-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'REGISTERING...' : 'REGISTER'}
          </button>

        </form>

        <div className="login-footer">
          <span className="text-muted font-mono text-xs">v2.1.0-RC</span>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', textDecoration: 'none' }}>
            Sign In Instead →
          </a>
        </div>
      </div>
    </div>
  );
}
