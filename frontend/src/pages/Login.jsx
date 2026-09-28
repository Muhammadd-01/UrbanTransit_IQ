import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaShieldAlt, 
  FaUser, 
  FaLock, 
  FaEnvelope, 
  FaArrowRight, 
  FaCheckCircle,
  FaExclamationCircle,
  FaBolt,
  FaCity,
  FaSun,
  FaMoon,
  FaBriefcase,
  FaChartLine,
  FaBus
} from 'react-icons/fa';
import Logo from '../components/common/Logo';
import BackgroundParticles from '../components/common/BackgroundParticles';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useContext(AuthContext);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('analyst');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync theme
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          email,
          password,
          full_name: fullName,
          role
        });
        setSuccessMsg('Account registered successfully! Signing you in...');
        setTimeout(async () => {
          await login(email, password);
          navigate('/dashboard');
        }, 1200);
      } else {
        await login(email, password);
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Authentication failed. Please verify credentials or try Quick Evaluator Access.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setError('');
    try {
      await login(demoEmail, demoPassword);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', demoEmail);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Quick login failed. Ensure backend server is active on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transit-auth-wrapper">
      {/* 3D Interactive Three.js Particle Wave Mesh (Responds to Cursor Hover & Clicks) */}
      <BackgroundParticles />

      {/* Floating Theme Switcher */}
      <button 
        type="button"
        className={`theme-toggle-ios auth-theme-toggle ${theme === 'dark' ? 'is-dark' : 'is-light'}`}
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Slide to Switch to iOS Light Mode' : 'Slide to Switch to iOS 27 Night Mode'}
        aria-label="Toggle Night Mode"
      >
        <div className="theme-toggle-track">
          <span className="track-icon-sun" title="Day"><FaSun /></span>
          <span className="track-icon-moon" title="Night"><FaMoon /></span>
          <div className="theme-toggle-thumb">
            {theme === 'dark' ? (
              <FaMoon className="thumb-icon moon" />
            ) : (
              <FaSun className="thumb-icon sun" />
            )}
          </div>
        </div>
      </button>

      {/* Main Authentication Liquid Glass Panel */}
      <div className="auth-card-container">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="brand-badge">
            <span className="pulse-dot"></span>
            <FaCity className="badge-icon" /> TRANSITVERSE INTELLIGENCE • KARACHI
          </div>

          <div className="brand-logo-title">
            <Logo size={46} className="auth-brand-logo-svg" />
            <h1 className="brand-title">UrbanTransit<span className="brand-accent">IQ</span></h1>
          </div>
          <p className="brand-subtitle">
            Big Data Transportation Intelligence & Operational Command Platform
          </p>
        </div>

        {/* Liquid Glass Box */}
        <div className="auth-glass-box hud-panel">
          {/* iOS Segmented Tabs */}
          <div className="auth-tabs">
            <button 
              type="button"
              className={`tab-btn ${!isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(false); setError(''); setSuccessMsg(''); }}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`tab-btn ${isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(true); setError(''); setSuccessMsg(''); }}
            >
              Create Account
            </button>
            <div className={`tab-indicator ${isRegister ? 'right' : 'left'}`}></div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="auth-alert error-alert">
              <FaExclamationCircle className="alert-icon" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="auth-alert success-alert">
              <FaCheckCircle className="alert-icon" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {isRegister && (
              <div className="form-group fade-in-up">
                <label>FULL OPERATOR NAME</label>
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Affan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>OFFICIAL TELEMETRY EMAIL</label>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  required
                  placeholder="name@urbantransit.iq"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>SECURITY PASSCODE</label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {!isRegister && (
              <div className="form-group remember-me-group" style={{ flexDirection: 'row', alignItems: 'center', marginTop: '10px', gap: '8px', cursor: 'pointer', display: 'flex' }}>
                <input 
                  type="checkbox" 
                  id="rememberMeCheckbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary-glow)' }}
                />
                <label htmlFor="rememberMeCheckbox" style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 0, textTransform: 'none', letterSpacing: 'normal' }}>
                  Remember my email
                </label>
              </div>
            )}

            {isRegister && (
              <div className="form-group fade-in-up">
                <label>SECURITY ROLE ENTITLEMENT</label>
                <div className="input-group">
                  <FaShieldAlt className="input-icon" />
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="analyst">Analyst (Operations & Intelligence)</option>
                    <option value="executer">Executer (Executive Director / Observer)</option>
                    <option value="operator">Operator (Transit & Fleet Controller)</option>
                  </select>
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <div className="spinner-orbit">
                  <div className="orbit-dot"></div>
                </div>
              ) : (
                <>
                  <span>{isRegister ? 'Register Credentials' : 'Access Command Center'}</span>
                  <FaArrowRight className="btn-arrow" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Sign-Ins for SRS Roles (Only shown on Sign In tab) */}
          {!isRegister && (
            <div className="quick-demo-section">
              <div className="divider">
                <span>ONE-CLICK ROLE ACCESS</span>
              </div>
              <p className="admin-direct-hint">
                <strong>Admin:</strong> Log in directly using your email and password above.
              </p>
              <div className="demo-buttons-grid roles-three-grid">
                <button
                  type="button"
                  className="demo-btn exec-demo"
                  onClick={() => handleQuickDemo('executer@urbantransit.iq', 'UrbanTransit2026!')}
                  title="Login as Executer (Executive Director)"
                >
                  <FaBriefcase className="demo-icon executer" />
                  <div className="demo-meta">
                    <strong>Executer</strong>
                    <small>Executive Director</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-btn eval-demo"
                  onClick={() => handleQuickDemo('analyst@urbantransit.iq', 'UrbanTransit2026!')}
                  title="Login as Analyst (Transit Operations Analyst)"
                >
                  <FaChartLine className="demo-icon analyst" />
                  <div className="demo-meta">
                    <strong>Analyst</strong>
                    <small>Operations Analyst</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-btn operator-demo"
                  onClick={() => handleQuickDemo('operator@urbantransit.iq', 'UrbanTransit2026!')}
                  title="Login as Operator (Transit Operations Controller)"
                >
                  <FaBus className="demo-icon operator" />
                  <div className="demo-meta">
                    <strong>Operator</strong>
                    <small>Fleet Controller</small>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Footprint Ticker */}
        <div className="auth-footer-stats">
          <div className="stat-item">
            <span className="stat-num">2.05M+</span>
            <span className="stat-label">Movement Records</span>
          </div>
          <div className="stat-separator">•</div>
          <div className="stat-item">
            <span className="stat-num">110</span>
            <span className="stat-label">Corridors</span>
          </div>
          <div className="stat-separator">•</div>
          <div className="stat-item">
            <span className="stat-num">Spark 3.5</span>
            <span className="stat-label">MLlib Engine</span>
          </div>
          <div className="stat-separator">•</div>
          <div className="stat-item">
            <span className="stat-num">MongoDB</span>
            <span className="stat-label">Live Database</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
