import React, { useState, useEffect } from 'react';
import api from './services/api';
import { brand } from './brand';
import AdminLayout from './AdminLayout';
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  User,
  Users,
  ShieldCheck,
  RefreshCw,
} from './icons';

const AdminPinManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [pinInput, setPinInput] = useState(['', '', '', '']);
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pinInput];
    newPin[index] = value;
    setPinInput(newPin);

    if (value && index < 3) {
      document.getElementById(`pin-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinInput[index] && index > 0) {
      document.getElementById(`pin-input-${index - 1}`)?.focus();
    }
    if (e.key === 'Enter') {
      handleIssuePin();
    }
  };

  const handleIssuePin = async () => {
    const pin = pinInput.join('');
    if (pin.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    try {
      const response = await api.put(`/admin/users/${selectedUser._id}/set-pin`, { pin });
      setSuccess(response.data.message);
      setShowPinModal(false);
      setPinInput(['', '', '', '']);
      setSelectedUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to set PIN');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openPinModal = (user) => {
    setSelectedUser(user);
    setPinInput(['', '', '', '']);
    setShowPinModal(true);
    setError('');
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setSelectedUser(null);
    setPinInput(['', '', '', '']);
    setError('');
  };

  const getStatusBadge = (user) => {
    if (!user.isApproved) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
          <Clock size={10} /> Pending
        </span>
      );
    }
    if (user.isBlacklisted) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit">
          <XCircle size={10} /> Blacklisted
        </span>
      );
    }
    if (user.isFrozen) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
          <Clock size={10} /> Frozen
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1 w-fit">
        <CheckCircle2 size={10} /> Active
      </span>
    );
  };

  const stats = {
    total: users.length,
    hasPin: users.filter((u) => u.pinIssued).length,
    needsPin: users.filter((u) => u.isApproved && !u.pinIssued && !u.isBlacklisted && !u.isFrozen).length,
  };

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
              <KeyRound size={32} strokeWidth={2} />
              PIN Management
            </h1>
            <p className="text-sm mt-1" style={{ color: brand.colors.textLight }}>
              Issue and manage withdrawal PINs for users
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                Has PIN
              </h3>
              <p className="text-2xl font-bold text-green-600">{stats.hasPin}</p>
            </div>
            <div
              className="rounded-2xl shadow-lg p-4"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <h3 className="text-sm flex items-center gap-1.5 mb-2" style={{ color: brand.colors.textMuted }}>
                <Clock size={16} strokeWidth={1.8} />
                Needs PIN
              </h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.needsPin}</p>
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
          {loading ? (
            <div
              className="rounded-2xl shadow-lg p-12 text-center"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: brand.colors.primary }} />
              <p style={{ color: brand.colors.textLight }}>Loading users...</p>
            </div>
          ) : (
            <div
              className="rounded-2xl shadow-lg overflow-hidden"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: brand.colors.surfaceAlt }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>PIN Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Action</th>
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
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                              style={{ background: brand.colors.creamSoft, color: brand.colors.primary }}
                            >
                              {user.fullName?.charAt(0) || <User size={18} />}
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: brand.colors.text }}>
                                {user.fullName}
                              </p>
                              <p className="text-xs" style={{ color: brand.colors.textMuted }}>
                                {user.role}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: brand.colors.textLight }}>
                          {user.email}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(user)}</td>
                        <td className="px-6 py-4">
                          {user.pinIssued ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                              <CheckCircle2 size={10} /> Issued
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
                              <Clock size={10} /> Not Issued
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.isApproved && !user.isBlacklisted && !user.isFrozen ? (
                            user.pinIssued ? (
                              <button
                                onClick={() => openPinModal(user)}
                                className="px-3 py-1 rounded text-white text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                                style={{ background: '#3b82f6' }}
                              >
                                <RefreshCw size={12} />
                                Reset PIN
                              </button>
                            ) : (
                              <button
                                onClick={() => openPinModal(user)}
                                className="px-3 py-1 rounded text-white text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                                style={{ background: brand.colors.primary }}
                              >
                                <KeyRound size={12} />
                                Issue PIN
                              </button>
                            )
                          ) : (
                            <span className="text-xs" style={{ color: brand.colors.textMuted }}>Not Available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
            <button
              onClick={closePinModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <XCircle size={20} />
            </button>

            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: brand.colors.creamSoft }}
              >
                <KeyRound size={32} strokeWidth={2} style={{ color: brand.colors.primary }} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: brand.colors.text }}>
                {selectedUser.pinIssued ? 'Reset PIN' : 'Issue PIN'}
              </h2>
              <p className="mt-2" style={{ color: brand.colors.textLight }}>
                {selectedUser.pinIssued
                  ? `Reset PIN for ${selectedUser.fullName}`
                  : `Issue new 4-digit PIN for ${selectedUser.fullName}`}
              </p>
              <p className="text-sm mt-1" style={{ color: brand.colors.textMuted }}>
                {selectedUser.email}
              </p>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  id={`pin-input-${index}`}
                  type="password"
                  maxLength="1"
                  value={pinInput[index]}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-16 h-16 text-center text-2xl font-bold rounded-xl focus:outline-none transition"
                  style={{
                    border: `2px solid ${brand.colors.primarySoft}`,
                    background: brand.colors.background,
                    color: brand.colors.text,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = brand.colors.primary;
                    e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = brand.colors.primarySoft;
                    e.target.style.boxShadow = 'none';
                  }}
                  autoFocus={index === 0}
                  inputMode="numeric"
                />
              ))}
            </div>

            <button
              onClick={handleIssuePin}
              className="w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: brand.gradients.primary }}
            >
              {selectedUser.pinIssued ? (
                <>
                  <RefreshCw size={18} />
                  Reset PIN
                </>
              ) : (
                <>
                  <KeyRound size={18} />
                  Issue PIN
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm" style={{ color: brand.colors.textMuted }}>
                PIN will be sent to the user
              </p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPinManagement;