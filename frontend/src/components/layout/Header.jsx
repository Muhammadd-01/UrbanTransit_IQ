import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  FaUserCircle, FaSignOutAlt, FaShieldAlt, FaSearch, 
  FaDatabase, FaBus, FaRoute, FaBars, FaSun, FaMoon,
  FaExclamationTriangle, FaTimes, FaLock
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import SystemStatusModal from '../common/SystemStatusModal';
import CommandPalette from '../common/CommandPalette';
import './Header.css';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    });
  };

  return (
    <div className="live-clock">
      <span className="clock-date">{formatDate(time)}</span>
      <span className="clock-time">{formatTime(time)} PKT</span>
    </div>
  );
};

// iOS 27 Liquid Glass Logout Confirmation Alert Modal
const LogoutConfirmModal = ({ isOpen, onClose, onConfirm, user }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-backdrop" onClick={onClose}>
      <div className="logout-confirm-card hud-panel" onClick={(e) => e.stopPropagation()}>
        <button className="logout-close-corner" onClick={onClose} title="Cancel">
          <FaTimes />
        </button>

        <div className="logout-card-content">
          <div className="logout-icon-glow">
            <FaLock className="logout-lock-svg" />
          </div>

          <h3 className="logout-title">Sign Out of Command Session?</h3>
          <p className="logout-desc">
            You are about to terminate active operator credentials for <strong>{user?.full_name || 'Operator'}</strong>. Live telemetry polling will be gracefully suspended.
          </p>

          <div className="logout-user-preview">
            <span className="logout-preview-role">
              <FaShieldAlt /> {user?.role?.toUpperCase() || 'DATA ARCHITECT'}
            </span>
            <span className="logout-preview-email">{user?.email || 'affan@urbantransit.iq'}</span>
          </div>

          <div className="logout-actions-grid">
            <button className="btn-logout-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-logout-confirm" onClick={onConfirm}>
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = ({ toggleSidebar, isSidebarCollapsed }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('user_avatar') || null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // iOS 27 Theme Management (Light Liquid vs Dark Midnight Obsidian)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setAvatarUrl(localStorage.getItem('user_avatar') || null);
    };
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    window.addEventListener('storage', handleAvatarUpdate);
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
      window.removeEventListener('storage', handleAvatarUpdate);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    toast.info("Securely logging out of Command Session...", {
      icon: "🔒",
      autoClose: 1800
    });
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 450);
  };

  return (
    <>
      <header className="header hud-panel">
        <div className="header-left">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} title="Toggle Sidebar">
            <FaBars />
          </button>
          
          <LiveClock />
          <div className="header-divider"></div>

          <button 
            className="system-status-trigger"
            onClick={() => setIsStatusOpen(true)}
            title="Click to view full platform health & cluster diagnostic telemetry"
          >
            <span className="pulse-beacon-cyan"></span>
            <span className="status-title">SYSTEM ONLINE</span>
          </button>
        </div>

        <div className="header-right">
          {/* iOS 27 Authentic Sliding Theme Toggle Switch */}
          <button 
            type="button"
            className={`theme-toggle-ios ${theme === 'dark' ? 'is-dark' : 'is-light'}`}
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

          <button 
            className="cmd-palette-trigger"
            onClick={() => setIsPaletteOpen(true)}
            title="Search commands, routes, models (Ctrl+K / ⌘K)"
          >
            <FaSearch className="cmd-search-icon" />
            <span className="cmd-text">Quick Command</span>
            <kbd className="cmd-kbd">⌘K</kbd>
          </button>

          <div className="header-divider"></div>

          <Link to="/profile" className="user-profile-badge" title="View Operator Profile & Security Credentials">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="user-avatar-custom" />
            ) : (
              <FaUserCircle className="user-avatar" />
            )}
            <div className="user-meta">
              <span className="user-name">{user?.full_name || user?.email?.split('@')[0] || 'Muhammad Affan'}</span>
              <span className="user-role"><FaShieldAlt className="role-icon" /> {user?.role?.toUpperCase() || 'DATA ARCHITECT'}</span>
            </div>
          </Link>

          <button 
            onClick={() => setIsLogoutModalOpen(true)} 
            className="btn-logout" 
            title="Sign Out of Command Session"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        user={user}
      />

      <SystemStatusModal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} />
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </>
  );
};

export default Header;
