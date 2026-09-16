import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';
import { brand } from './brand';
import AdminLayout from './AdminLayout';
import {
  Users,
  CheckCircle2,
  Clock,
  Ban,
  Snowflake,
  Plus,
  Loader2,
  AlertTriangle,
  Crown,
} from './icons';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    blacklisted: 0,
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin-login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);

      const total = response.data.length;
      const approved = response.data.filter((u) => u.isApproved).length;
      const pending = response.data.filter((u) => !u.isApproved).length;
      const blacklisted = response.data.filter((u) => u.isBlacklisted).length;

      setStats({ total, approved, pending, blacklisted });
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/approve`);
      showMessage(response.data.message);
      fetchUsers();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to approve user', 'error');
    }
  };

  const handleFreezeUser = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/freeze`);
      showMessage(response.data.message);
      fetchUsers();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to freeze user', 'error');
    }
  };

  const handleUnfreezeUser = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/unfreeze`);
      showMessage(response.data.message);
      fetchUsers();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to unfreeze user', 'error');
    }
  };

  const handleBlacklistUser = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/blacklist`);
      showMessage(response.data.message);
      fetchUsers();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to blacklist user', 'error');
    }
  };

  const handleUnblacklistUser = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/unblacklist`);
      showMessage(response.data.message);
      fetchUsers();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to unblacklist user', 'error');
    }
  };

  const handleAddBalance = async (userId) => {
    const amount = prompt('Enter amount to add (in USD):');
    if (!amount) return;
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const response = await api.post(`/admin/users/${userId}/balance`, {
        amount: parseFloat(amount),
      });
      showMessage(response.data.message);
      fetchUsers();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to add balance', 'error');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ background: brand.colors.background }}>
          <div className="text-center">
            <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: brand.colors.primary }} />
            <p style={{ color: brand.colors.textLight }}>Loading admin dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen py-8 px-4" style={{ background: brand.colors.background }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold flex items-center gap-2"
              style={{ color: brand.colors.primary }}
            >
              <Crown size={32} strokeWidth={2} />
              Admin Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: brand.colors.textLight }}>
              Manage users and accounts
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div
              className="rounded-2xl shadow-lg p-4"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <h3 className="text-sm flex items-center gap-1.5 mb-2" style={{ color: brand.colors.textMuted }}>
                <Users size={16} strokeWidth={1.8} />
                Total Users
              </h3>
              <p className="text-2xl font-bold" style={{ color: brand.colors.text }}>{stats.total}</p>
            </div>

            <div
              className="rounded-2xl shadow-lg p-4"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <h3 className="text-sm flex items-center gap-1.5 mb-2" style={{ color: brand.colors.textMuted }}>
                <CheckCircle2 size={16} strokeWidth={1.8} />
                Approved
              </h3>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>

            <div
              className="rounded-2xl shadow-lg p-4"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <h3 className="text-sm flex items-center gap-1.5 mb-2" style={{ color: brand.colors.textMuted }}>
                <Clock size={16} strokeWidth={1.8} />
                Pending
              </h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>

            <div
              className="rounded-2xl shadow-lg p-4"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <h3 className="text-sm flex items-center gap-1.5 mb-2" style={{ color: brand.colors.textMuted }}>
                <Ban size={16} strokeWidth={1.8} />
                Blacklisted
              </h3>
              <p className="text-2xl font-bold text-red-600">{stats.blacklisted}</p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div
              className="border-l-4 px-4 py-3 rounded-lg mb-4 flex items-center gap-3"
              style={{ backgroundColor: '#FDF2F2', borderColor: brand.colors.error, color: brand.colors.error }}
            >
              <AlertTriangle size={20} />
              {error}
            </div>
          )}
          {success && (
            <div
              className="border-l-4 px-4 py-3 rounded-lg mb-4 flex items-center gap-3"
              style={{ backgroundColor: '#F0FDF4', borderColor: brand.colors.success, color: brand.colors.success }}
            >
              <CheckCircle2 size={20} />
              {success}
            </div>
          )}

          {/* Users Table */}
          <div
            className="rounded-2xl shadow-lg overflow-hidden"
            style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: brand.colors.surfaceAlt }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="transition hover:bg-opacity-50"
                      style={{ borderTop: `1px solid ${brand.colors.primarySoft}` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                            style={{ background: brand.colors.creamSoft, color: brand.colors.primary }}
                          >
                            {user.fullName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: brand.colors.text }}>
                              {user.fullName}
                            </p>
                            <p className="text-sm" style={{ color: brand.colors.textMuted }}>
                              {user.role}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: brand.colors.textLight }}>
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.isApproved ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                              <CheckCircle2 size={10} /> Approved
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                              <Clock size={10} /> Pending
                            </span>
                          )}
                          {user.isFrozen && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                              <Snowflake size={10} /> Frozen
                            </span>
                          )}
                          {user.isBlacklisted && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                              <Ban size={10} /> Blacklisted
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: brand.colors.text }}>
                        ${user.fiatBalance || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {!user.isApproved && (
                            <button
                              onClick={() => handleApproveUser(user._id)}
                              className="px-3 py-1 rounded text-white text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                              style={{ background: brand.colors.success }}
                            >
                              <CheckCircle2 size={12} />
                              Approve
                            </button>
                          )}

                          {user.isFrozen ? (
                            <button
                              onClick={() => handleUnfreezeUser(user._id)}
                              className="px-3 py-1 rounded text-white text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                              style={{ background: brand.colors.primary }}
                            >
                              <Snowflake size={12} />
                              Unfreeze
                            </button>
                          ) : (
                            <button
                              onClick={() => handleFreezeUser(user._id)}
                              className="px-3 py-1 rounded text-white text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                              style={{ background: brand.colors.warning }}
                            >
                              <Snowflake size={12} />
                              Freeze
                            </button>
                          )}

                          {user.isBlacklisted ? (
                            <button
                              onClick={() => handleUnblacklistUser(user._id)}
                              className="px-3 py-1 rounded text-white text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                              style={{ background: brand.colors.success }}
                            >
                              <CheckCircle2 size={12} />
                              Unblacklist
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlacklistUser(user._id)}
                              className="px-3 py-1 rounded text-white text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                              style={{ background: brand.colors.error }}
                            >
                              <Ban size={12} />
                              Blacklist
                            </button>
                          )}

                          <button
                            onClick={() => handleAddBalance(user._id)}
                            className="px-3 py-1 rounded text-white text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                            style={{ background: '#8b5cf6' }}
                          >
                            <Plus size={12} />
                            Add Funds
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;