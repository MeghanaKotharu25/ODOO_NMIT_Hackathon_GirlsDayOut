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
  
  const { signUp } = useAuth();
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
        company_name: trimmedCompany || 'Dayflow'
      };

      const result = await signUp(trimmedEmail, formData.password, metadata);
      
      if (trimmedCompany) {
        localStorage.setItem('dayflow_company_name', trimmedCompany);
      }

      if (result?.session) {
        addToast('Registration successful! Welcome to Dayflow.', 'success');
        navigate('/loading');
      } else {
        addToast('Registration successful! Please check your email to verify or sign in.', 'success');
        navigate('/login');
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
            System Registration Terminal
          </p>
        </div>
        
        <form className="login-form mt-8" onSubmit={handleRegister}>
          
          <div className="form-group flex-row-group">
            <label className="form-label font-mono text-xs">Company Name :-</label>
            <div className="input-with-button">
              <input 
                type="text" 
                name="companyName"
                className="form-input flex-1" 
                value={formData.companyName}
                onChange={handleChange}
              />
              <button type="button" className="icon-btn-primary ml-2" title="Upload Logo">
                <UploadCloud size={18} />
              </button>
            </div>
          </div>
          
          <div className="form-group flex-row-group">
            <label className="form-label font-mono text-xs">Name :-</label>
            <input 
              type="text" 
              name="name"
              className="form-input flex-1" 
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group flex-row-group">
            <label className="form-label font-mono text-xs">Email :-</label>
            <input 
              type="email" 
              name="email"
              className="form-input flex-1" 
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group flex-row-group">
            <label className="form-label font-mono text-xs">Phone :-</label>
            <input 
              type="text" 
              name="phone"
              className="form-input flex-1" 
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group flex-row-group">
            <label className="form-label font-mono text-xs">Password :-</label>
            <div className="password-wrapper flex-1">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                className="form-input w-full" 
                value={formData.password}
                onChange={handleChange}
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
          
          <div className="form-group flex-row-group">
            <label className="form-label font-mono text-xs">Confirm Password :-</label>
            <div className="password-wrapper flex-1">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                name="confirmPassword"
                className="form-input w-full" 
                value={formData.confirmPassword}
                onChange={handleChange}
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
            className="btn-primary login-btn mt-6 w-full justify-center py-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Sign Up'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Already have an account ? <span style={{ color: 'var(--text-primary)' }}>Sign In</span>
            </a>
          </div>
        </form>
        
      </div>
    </div>
  );
}
