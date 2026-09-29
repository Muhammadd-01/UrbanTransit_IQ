import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api/client';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaShieldAlt } from 'react-icons/fa';
import './Settings.css';
import { toast } from 'react-toastify';
import ScrollAnimate from '../hooks/useScrollAnimate';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.list();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUserId(user.id);
      setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setEditingUserId(null);
      setFormData({ name: '', email: '', password: '', role: 'viewer' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        await usersAPI.update(editingUserId, { name: formData.name, role: formData.role });
        toast.success("User updated successfully");
      } else {
        await usersAPI.create(formData);
        toast.success("User created successfully");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await usersAPI.delete(id);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'badge-pill badge-gold';
      case 'operator': return 'badge-pill badge-sky';
      case 'analyst': return 'badge-pill badge-aurora';
      default: return 'badge-pill badge-dim';
    }
  };

  return (
    <div className="page-container settings-page">
      <ScrollAnimate type="down">
        <div className="dashboard-hero hud-panel hud-corners">
          <div className="hero-text-block">
            <div className="hero-super-tag">
              <span className="pulse-beacon-cyan"></span>
              <span>PLATFORM CONFIGURATION // ACCESS CONTROL</span>
            </div>
            <h1 className="hero-main-title">User Management</h1>
            <p className="hero-desc">
              Manage system operators, analysts, and administrators. Assign role-based access for UrbanTransit IQ modules.
            </p>
          </div>
          <div className="hero-right-actions">
            <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaPlus /> Add User
            </button>
          </div>
        </div>
      </ScrollAnimate>

      <ScrollAnimate type="up">
        <div className="chart-card hud-panel hud-corners" style={{ marginTop: '20px' }}>
        <div className="chart-header">
          <div>
            <h3>System Roster</h3>
          </div>
          <span className="badge-pill badge-gold"><FaShieldAlt /> RBAC ACTIVE</span>
        </div>

        <div className="table-responsive" style={{ overflowX: 'auto', marginTop: '15px' }}>
          <table className='table-animate' style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Created Date</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}><strong className="text-white">{user.name}</strong></td>
                  <td style={{ padding: '12px' }} className="mono-val text-dim">{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={getRoleBadgeClass(user.role)}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }} className="mono-val text-dim">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn-icon" style={{ marginRight: '10px', background: 'transparent', border: 'none', color: 'var(--text-cyan)', cursor: 'pointer' }} onClick={() => handleOpenModal(user)} title="Edit Role/Name">
                      <FaEdit size={16} />
                    </button>
                    <button className="btn-icon" style={{ background: 'transparent', border: 'none', color: 'var(--text-coral)', cursor: 'pointer' }} onClick={() => handleDelete(user.id)} title="Delete User">
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }} className="text-dim">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </ScrollAnimate>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="hud-panel hud-corners" style={{ width: '400px', padding: '20px', background: 'var(--color-card-bg)' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingUserId ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Email</label>
                <input required={!editingUserId} disabled={!!editingUserId} type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: editingUserId ? 'gray' : 'white', borderRadius: '4px' }} />
              </div>
              {!editingUserId && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Password</label>
                  <input required type="password" name="password" value={formData.password} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px' }} />
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Role</label>
                <select name="role" value={formData.role} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px' }}>
                  <option value="admin">Admin</option>
                  <option value="operator">Operator</option>
                  <option value="analyst">Analyst</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-cyan)', border: 'none', color: 'black', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>{editingUserId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
