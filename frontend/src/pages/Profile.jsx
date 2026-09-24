import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaUserCircle, FaShieldAlt, FaKey, FaUsers, FaClock, 
  FaCity, FaCheckCircle, FaSave, FaTerminal, FaHdd, FaMicrochip,
  FaCamera, FaTrashAlt, FaCloudUploadAlt
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);

  const [fullName, setFullName] = useState(user?.full_name || 'Muhammad Affan');
  const [email] = useState(user?.email || 'affan@urbantransit.iq');
  const [phone, setPhone] = useState('+92 300 1234567');
  const [department, setDepartment] = useState('Big Data & Intelligence Architecture');
  const [savedAlert, setSavedAlert] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('user_avatar') || null);
  const [uploadToast, setUploadToast] = useState('');
  
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit. Please select a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result;
        if (result) {
          setAvatarUrl(result);
          localStorage.setItem('user_avatar', result);
          window.dispatchEvent(new Event('avatarUpdated'));
          setUploadToast('Profile photo updated successfully!');
          setTimeout(() => setUploadToast(''), 3500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    localStorage.removeItem('user_avatar');
    window.dispatchEvent(new Event('avatarUpdated'));
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadToast('Profile photo removed.');
    setTimeout(() => setUploadToast(''), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  const teamMembers = [
    { name: 'Muhammad Affan', role: 'Lead Architect & Full-Stack Engineer', focus: 'FastAPI Backend, Supabase Ledger, React UI' },
    { name: 'Muhammad Hammad', role: 'Big Data & Spark Engineer', focus: 'Apache Hadoop, HDFS Setup, PySpark Ingestion' },
    { name: 'Shahmir Qadri', role: 'Machine Learning & Forecasting Engineer', focus: 'Spark MLlib, Python XGBoost, SARIMA' },
    { name: 'Waqas Rehman', role: 'Data Quality & Analytics Engineer', focus: '4-Tier Audit Engine, Karachi Spatial Geometry' },
  ];

  return (
    <div className="page-container profile-page">
      {/* Background Ambient Glows */}
      <div className="profile-mesh-glow orb-aurora"></div>
      <div className="profile-mesh-glow orb-gold"></div>

      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">Operator Profile & Security Ledger</h1>
          <p className="page-desc">
            System credentials, role-based access entitlements, and platform configuration matrix.
          </p>
        </div>
      </div>

      {savedAlert && (
        <div className="liquid-alert-success fade-in-up">
          <FaCheckCircle /> Operator profile parameters updated successfully.
        </div>
      )}

      {uploadToast && (
        <div className="liquid-alert-success fade-in-up">
          <FaCheckCircle /> {uploadToast}
        </div>
      )}

      {/* Hero Card with Liquid Glass Effect */}
      <div className="liquid-glass-card profile-hero-card">
        <div className="profile-avatar-container">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <div 
            className="avatar-liquid-ring" 
            onClick={() => fileInputRef.current?.click()}
            title="Click to upload profile photo"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="profile-avatar-custom" />
            ) : (
              <FaUserCircle className="profile-avatar-icon" />
            )}
            <div className="avatar-camera-overlay">
              <FaCamera />
            </div>
          </div>
          <span className="live-pulse-badge">
            <span className="pulse-dot"></span> ACTIVE
          </span>
          <div className="avatar-btn-row">
            <button 
              type="button" 
              className="btn-avatar-action upload" 
              onClick={() => fileInputRef.current?.click()}
              title="Select image from device"
            >
              <FaCloudUploadAlt /> {avatarUrl ? 'Change' : 'Upload'}
            </button>
            {avatarUrl && (
              <button 
                type="button" 
                className="btn-avatar-action remove" 
                onClick={handleRemoveAvatar}
                title="Remove photo"
              >
                <FaTrashAlt />
              </button>
            )}
          </div>
        </div>

        <div className="profile-hero-info">
          <div className="profile-name-row">
            <h2>{fullName}</h2>
            <span className="role-pill-liquid">
              <FaShieldAlt /> {user?.role ? user.role.toUpperCase() : 'ADMINISTRATOR'}
            </span>
          </div>
          <p className="profile-tagline">
            Lead Transportation Architect • UrbanTransit IQ Karachi Command Center
          </p>
          <div className="profile-meta-badges">
            <span className="meta-item"><FaCity /> Metropolis: Karachi, Pakistan</span>
            <span className="meta-item"><FaKey /> Access Level: Level-3 System Root</span>
            <span className="meta-item"><FaClock /> Session: Authenticated via JWT</span>
          </div>
        </div>
      </div>

      {/* Grid: Profile Form & System Entitlements */}
      <div className="profile-grid">
        {/* Left Column: Editable Settings */}
        <div className="liquid-glass-card">
          <div className="card-header-liquid">
            <h3>Operator Details & Preferences</h3>
            <span className="badge-pill">EDITABLE</span>
          </div>

          <form onSubmit={handleSave} className="profile-form">
            <div className="form-field-liquid">
              <label>FULL OPERATOR NAME</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-field-liquid">
              <label>OFFICIAL NETWORK EMAIL</label>
              <input 
                type="email" 
                value={email} 
                disabled 
                title="Email is locked to primary authentication identity"
              />
              <small className="field-hint">Primary cryptographic identity (read-only)</small>
            </div>

            <div className="form-field-liquid">
              <label>CONTACT PHONE / DISPATCH RADIO</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>

            <div className="form-field-liquid">
              <label>ASSIGNED DIVISION</label>
              <input 
                type="text" 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)} 
              />
            </div>

            <button type="submit" className="liquid-action-btn">
              <FaSave /> Save Profile Changes
            </button>
          </form>
        </div>

        {/* Right Column: Entitlements & Hardware Topology */}
        <div className="liquid-glass-card">
          <div className="card-header-liquid">
            <h3>Platform Security & Execution Entitlements</h3>
            <span className="badge-pill">HARDWARE BUFFER</span>
          </div>

          <div className="entitlements-list">
            <div className="entitlement-item">
              <div className="entitlement-icon-box">
                <FaMicrochip className="ent-icon" />
              </div>
              <div className="entitlement-text">
                <strong>Apache Spark Cluster Engine</strong>
                <p>2GB Driver / 2GB Executor allocation • 8 Shuffle Partitions</p>
                <span className="status-granted">✓ RUNTIME GRANTED</span>
              </div>
            </div>

            <div className="entitlement-item">
              <div className="entitlement-icon-box">
                <FaHdd className="ent-icon" />
              </div>
              <div className="entitlement-text">
                <strong>Hadoop HDFS Storage Ledger</strong>
                <p>Path: <code>/urbantransit/raw/</code> • Replication: 1 (Pseudo-Distributed)</p>
                <span className="status-granted">✓ WRITE & READ ACCESS</span>
              </div>
            </div>

            <div className="entitlement-item">
              <div className="entitlement-icon-box">
                <FaTerminal className="ent-icon" />
              </div>
              <div className="entitlement-text">
                <strong>Supabase Security & RLS Layer</strong>
                <p>14 Relational Tables • Automated Audit Trail & Job Monitoring</p>
                <span className="status-granted">✓ SCHEMA SYNCHRONIZED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Matrix Section */}
      <div className="liquid-glass-card" style={{ marginTop: '24px' }}>
        <div className="card-header-liquid">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaUsers style={{ color: 'var(--accent-aurora)', fontSize: '1.2rem' }} />
            <h3>UrbanTransit IQ Engineering Roster</h3>
          </div>
          <span className="badge-pill">4 CORE ARCHITECTS</span>
        </div>

        <div className="team-roster-grid">
          {teamMembers.map((m, idx) => (
            <div key={idx} className="team-member-card">
              <div className="member-avatar">
                {m.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="member-details">
                <h4>{m.name}</h4>
                <span className="member-role">{m.role}</span>
                <p className="member-focus">{m.focus}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
