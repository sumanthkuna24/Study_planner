import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="auth-branding-content">
            <div className="auth-badge">Plan smarter, finish faster</div>
            <div className="auth-logo">
              <span className="auth-logo-icon"></span>

              
              
              <h1 className="auth-brand-title">Study Planner</h1>
            </div>
            <h2 className="auth-brand-subtitle">Your Personal Study Assistant</h2>
            <p className="auth-brand-description">
              Organize your studies, manage tasks, and achieve your academic goals with our intelligent study planner.
            </p>
            <div className="auth-highlight-grid">
              <div className="auth-highlight-card">
                <div className="auth-highlight-icon">⏱️</div>
                <div>
                  <p className="auth-highlight-title">Auto-Schedule in Seconds</p>
                  <p className="auth-highlight-text">Let the planner arrange your week based on priority.</p>
                </div>
              </div>
              <div className="auth-highlight-card">
                <div className="auth-highlight-icon">✨</div>
                <div>
                  <p className="auth-highlight-title">Clean, calm dashboard</p>
                  <p className="auth-highlight-text">Modern UI that keeps focus on what matters.</p>
                </div>
              </div>
            </div>
            <div className="auth-features">
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Smart Task Management</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Auto-Generated Timetables</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Subject Notes & Organization</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Progress Tracking Dashboard</span>
              </div>
            </div>
          </div>
          <div className="auth-branding-decoration"></div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h1 className="auth-form-title">Welcome Back</h1>
              <p className="auth-form-subtitle">Sign in to continue to your account</p>
            </div>

            {error && (
              <div className="alert alert-error auth-alert">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <span className="form-label-icon">📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input auth-input"
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <span className="form-label-icon">🔒</span>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input auth-input"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-secondary-panel">
              <div className="auth-secondary-item">
                <span className="auth-secondary-icon">🔐</span>
                <div>
                  <p className="auth-secondary-title">Private by default</p>
                  <p className="auth-secondary-text">Your data is encrypted and never shared.</p>
                </div>
              </div>
              <div className="auth-secondary-item">
                <span className="auth-secondary-icon">⚡</span>
                <div>
                  <p className="auth-secondary-title">One-minute setup</p>
                  <p className="auth-secondary-text">Import tasks and start planning instantly.</p>
                </div>
              </div>
            </div>

            <p className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


