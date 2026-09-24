import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaShieldAlt, FaCircle } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('user_avatar') || null);

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

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-breadcrumbs">
          <span className="network-pill"><FaCircle className="status-dot-green" /> LIVE NETWORK</span>
          <span className="network-title">Karachi Metropolitan Transit Command</span>
        </div>
      </div>

      <div className="header-right">
        <div className="mode-indicator">
          <span className="mode-tag">MODE: DEVELOPMENT</span>
        </div>

        <Link to="/profile" className="user-profile-badge" title="View Operator Profile & Security Ledger" style={{ textDecoration: 'none' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="user-avatar-custom" />
          ) : (
            <FaUserCircle className="user-avatar" />
          )}
          <div className="user-meta">
            <span className="user-name">{user?.full_name || user?.email?.split('@')[0] || 'Muhammad Affan'}</span>
            <span className="user-role"><FaShieldAlt className="role-icon" /> {user?.role?.toUpperCase() || 'ADMIN'}</span>
          </div>
        </Link>

        <button onClick={logout} className="btn-logout" title="Sign Out">
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
};

export default Header;