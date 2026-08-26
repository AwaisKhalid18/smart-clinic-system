import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import hospitalBg from '../assets/hospital-hallway.webp';
import logo from '../assets/logo.jpg';


export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'PATIENT',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      toast.success('Account created');
      redirectByRole(res.data.user.role, navigate);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
  <div className="auth-page register-page" style={{ backgroundImage: `url(${hospitalBg})` }}>
      <div className="auth-header">
      <div className="auth-icon">
  <img src={logo} alt="Smart Clinic logo" className="auth-icon-img" />
</div>
        <h1>Smart Clinic</h1>
        <p>Management System</p>
      </div>

      <div className="auth-card">
        <div className="auth-card-header">
          <h2>Create Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
              <input
                className="form-input"
                name="fullName"
                placeholder="Dr. Awais Khalid"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="clinician@smartclinic.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.4 5.5A9.9 9.9 0 0 1 12 5c5 0 9 4 10 7-.4 1.2-1.2 2.6-2.3 3.8M6.3 6.3C4.3 7.6 2.8 9.5 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.7" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              className="form-input"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="LAB">Lab Personnel</option>
            </select>
          </div>

          <button type="submit" className="signin-btn" disabled={submitting}>
            {submitting ? 'Creating account...' : (
              <>
                Create Account
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>

      <p className="auth-note">
        <Icon name="shield" size={14} />
        End-to-end encrypted clinical environment.
      </p>
    </div>
  );
}

export function redirectByRole(role, navigate) {
  switch (role) {
    case 'DOCTOR':
      navigate('/doctor/dashboard');
      break;
    case 'PATIENT':
      navigate('/patient/dashboard');
      break;
    case 'LAB':
      navigate('/lab/dashboard');
      break;
    case 'ADMIN':
      navigate('/admin/dashboard');
      break;
    default:
      navigate('/');
  }
}