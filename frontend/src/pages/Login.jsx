import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaBus, 
  FaSubway, 
  FaShieldAlt, 
  FaUser, 
  FaLock, 
  FaEnvelope, 
  FaArrowRight, 
  FaCheckCircle,
  FaExclamationCircle,
  FaBolt,
  FaCity
} from 'react-icons/fa';
import logoImg from '../assets/logo.png';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useContext(AuthContext);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('analyst');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
          navigate('/');
        }, 1200);
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Authentication failed. Please verify credentials or use One-Click Demo Login.'
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
      navigate('/');
    } catch (err) {
      setError('Quick login failed. Ensure backend server is active on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transit-auth-wrapper">
      {/* Dynamic Animated Background Mesh */}
      <div className="cyber-transit-bg">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="transit-lines-canvas">
          <div className="transit-stream line-green"></div>
          <div className="transit-stream line-orange"></div>
          <div className="transit-stream line-red"></div>
        </div>
      </div>

      <div className="auth-card-container">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="brand-badge">
            <span className="pulse-dot"></span>
            <FaCity className="badge-icon" /> TRANSITVERSE INTELLIGENCE • KARACHI
          </div>
          <div className="brand-logo-title">
            <img src={logoImg} alt="UrbanTransit IQ Logo" className="auth-brand-logo-img" />
            <h1 className="brand-title">UrbanTransit<span className="brand-accent">IQ</span></h1>
          </div>
          <p className="brand-subtitle">
            Big Data Transportation Intelligence & Operational Command Platform
          </p>
        </div>

        {/* Glassmorphic Auth Box */}
        <div className="auth-glass-box">
          {/* Tabs */}
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

          {/* Alerts */}
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
                <label>Full Name</label>
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
              <label>Official Email</label>
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
              <label>Password</label>
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

            {isRegister && (
              <div className="form-group fade-in-up">
                <label>Role Assignment</label>
                <div className="input-group">
                  <FaShieldAlt className="input-icon" />
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="analyst">Transit Operations Analyst</option>
                    <option value="admin">System Administrator</option>
                    <option value="viewer">Executive Observer / Viewer</option>
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
                  <span>{isRegister ? 'Register Account' : 'Access Command Center'}</span>
                  <FaArrowRight className="btn-arrow" />
                </>
              )}
            </button>
          </form>

          {/* One-Click Quick Demo Sign-Ins */}
          <div className="quick-demo-section">
            <div className="divider">
              <span>ONE-CLICK EVALUATOR ACCESS</span>
            </div>
            <div className="demo-buttons-grid">
              <button
                type="button"
                className="demo-btn admin-demo"
                onClick={() => handleQuickDemo('affan@urbantransit.iq', 'UrbanTransit2026!')}
                title="Login as Lead Architect & Administrator"
              >
                <FaBolt className="demo-icon bolt" />
                <div>
                  <strong>Muhammad Affan</strong>
                  <small>Lead Architect (Admin)</small>
                </div>
              </button>

              <button
                type="button"
                className="demo-btn eval-demo"
                onClick={() => handleQuickDemo('evaluator@urbantransit.iq', 'UrbanTransit2026!')}
                title="Login as Competition Evaluator"
              >
                <FaShieldAlt className="demo-icon shield" />
                <div>
                  <strong>Evaluator Panel</strong>
                  <small>Competition Juror (Analyst)</small>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Live Footprint Ticker */}
        <div className="auth-footer-stats">
          <div className="stat-item">
            <span className="stat-num">2.0M+</span>
            <span className="stat-label">Movement Records</span>
          </div>
          <div className="stat-separator">•</div>
          <div className="stat-item">
            <span className="stat-num">110</span>
            <span className="stat-label">Karachi Routes</span>
          </div>
          <div className="stat-separator">•</div>
          <div className="stat-item">
            <span className="stat-num">Spark 3.5</span>
            <span className="stat-label">Distributed Engine</span>
          </div>
          <div className="stat-separator">•</div>
          <div className="stat-item">
            <span className="stat-num">Supabase</span>
            <span className="stat-label">Security Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;