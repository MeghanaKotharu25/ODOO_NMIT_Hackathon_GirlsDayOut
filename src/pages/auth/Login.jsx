import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, Upload, Building2, User, Phone } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up State
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await signIn(loginEmail.trim(), loginPassword);

      if (!data?.user) {
        setErrorMessage('Authentication failed. Please check your credentials.');
        setIsSubmitting(false);
        return;
      }

      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error details:', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('failed to fetch') || err.name === 'TypeError') {
        setErrorMessage(`Network Error: Unable to reach Supabase server (${msg || 'Failed to fetch'}). Please check internet/DNS.`);
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        setErrorMessage('Invalid email or password. Please check your credentials.');
      } else {
        setErrorMessage(msg || 'An unexpected error occurred during login.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real production app, you would also save companyName, name, and phone 
      // into your profiles or companies table after successful auth signup.
      const data = await signUp(email.trim(), password);

      if (!data?.user) {
        setErrorMessage('Registration failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Save company context to local storage for the demo
      if (companyName) {
        localStorage.setItem('dayflow_company_name', companyName.trim());
      }

      // If email confirmation is required, notify user
      if (data.session === null) {
        setErrorMessage('Registration successful! Please check your email to confirm your account.');
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Signup error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[500px] border border-gray-700 bg-transparent rounded-sm p-8 pb-10">
        
        {/* App/Web Logo Placeholder */}
        <div className="w-full h-12 bg-[#222] rounded-md mb-8 flex items-center justify-center text-sm text-gray-400">
          App/Web Logo
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 rounded bg-red-900/30 border border-red-800 text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isLogin ? (
          /* ================= SIGN IN VIEW ================= */
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Login Id/Email :-</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-transparent border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Password :-</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-transparent border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-4 bg-[#B450C2] hover:bg-[#9c45a8] text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SIGN IN'}
            </button>

            <div className="text-center mt-6">
              <span className="text-sm text-gray-400">
                Don't have an Account?{' '}
                <button type="button" onClick={() => setIsLogin(false)} className="text-gray-200 hover:text-white transition-colors">
                  Sign Up
                </button>
              </span>
            </div>
          </form>
        ) : (
          /* ================= SIGN UP VIEW ================= */
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-300 w-32 shrink-0 text-right">Company Name :-</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 px-3 py-1.5 bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button type="button" className="shrink-0 w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-md flex items-center justify-center transition-colors">
                <Upload size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-300 w-32 shrink-0 text-right">Name :-</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 px-3 py-1.5 bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-300 w-32 shrink-0 text-right">Email :-</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 px-3 py-1.5 bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-300 w-32 shrink-0 text-right">Phone :-</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 px-3 py-1.5 bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-300 w-32 shrink-0 text-right">Password :-</label>
              <div className="flex-1 flex gap-2">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-1.5 bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button type="button" className="shrink-0 w-8 h-8 bg-white text-black hover:bg-gray-200 rounded-sm flex items-center justify-center text-xs font-bold font-mono">
                  &lt;/&gt;
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-300 w-32 shrink-0 text-right">Confirm Password :-</label>
              <div className="flex-1 flex gap-2">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-1.5 bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button type="button" className="shrink-0 w-8 h-8 bg-white text-black hover:bg-gray-200 rounded-sm flex items-center justify-center text-xs font-bold font-mono">
                  &lt;/&gt;
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-8 bg-[#B450C2] hover:bg-[#9c45a8] text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Up'}
            </button>
            
            <div className="text-center mt-4">
              <button type="button" onClick={() => setIsLogin(true)} className="text-xs text-gray-400 hover:text-white transition-colors">
                Cancel & Return to Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default Login;
