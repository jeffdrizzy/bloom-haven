import React, { useState, useEffect } from 'react';
import api from './services/api';
import { brand } from './brand';
import AdminLayout from './AdminLayout';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  User,
  FileText,
  ExternalLink,
  Receipt,
} from './icons';

const AdminKYC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchKYCSubmissions();
  }, []);

  const fetchKYCSubmissions = async () => {
    try {
      const response = await api.get('/admin/kyc');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching KYC:', error);
      setError('Failed to fetch KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    const note = prompt('Enter admin note (optional):');
    try {
      const response = await api.put(`/admin/kyc/${userId}/verify`, {
        adminNote: note || 'KYC verified',
      });
      setSuccess(response.data.message);
      fetchKYCSubmissions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify KYC');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await api.put(`/admin/kyc/${userId}/reject`, {
        adminNote: reason,
      });
      setSuccess(response.data.message);
      fetchKYCSubmissions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reject KYC');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1 w-fit">
            <CheckCircle2 size={10} /> Verified
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
            <Clock size={10} /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit">
            <XCircle size={10} /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 flex items-center gap-1 w-fit">
            Not Submitted
          </span>
        );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return CheckCircle2;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    return user.kyc?.status === filter;
  });

  const stats = {
    total: users.length,
    pending: users.filter((u) => u.kyc?.status === 'pending').length,
    verified: users.filter((u) => u.kyc?.status === 'verified').length,
    rejected: users.filter((u) => u.kyc?.status === 'rejected').length,
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
              <ShieldCheck size={32} strokeWidth={2} />
              KYC Management
            </h1>
            <p className="text-sm mt-1" style={{ color: brand.colors.textLight }}>
              Verify user identities
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div
              className="rounded-2xl shadow-lg p-4"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <h3 className="text-sm mb-2" style={{ color: brand.colors.textMuted }}>Total Submissions</h3>
              <p className="text-2xl font-bold" style={{ color: brand.colors.text }}>{stats.total}</p>
            </div>
            <div
              className="rounded-2xl shadow-lg p-4"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <h3 className="text-sm mb-2 flex items-center gap-1.5" style={{ color: brand.colors.textMuted }}>
                <Clock size={14} /> Pending
              </h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div
              className="rounded-2xl shadow-lg p-4"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <h3 className="text-sm mb-2 flex items-center gap-1.5" style={{ color: brand.colors.textMuted }}>
                <CheckCircle2 size={14} /> Verified
              </h3>
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            </div>
            <div
              className="rounded-2xl shadow-lg p-4"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <h3 className="text-sm mb-2 flex items-center gap-1.5" style={{ color: brand.colors.textMuted }}>
                <XCircle size={14} /> Rejected
              </h3>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
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

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { key: 'all', label: 'All', Icon: ShieldCheck },
              { key: 'pending', label: 'Pending', Icon: Clock },
              { key: 'verified', label: 'Verified', Icon: CheckCircle2 },
              { key: 'rejected', label: 'Rejected', Icon: XCircle },
            ].map((item) => {
              const IconComponent = item.Icon;
              const isActive = filter === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className="px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                  style={{
                    background: isActive ? brand.gradients.primary : brand.colors.surfaceAlt,
                    color: isActive ? 'white' : brand.colors.text,
                  }}
                >
                  <IconComponent size={16} strokeWidth={2} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Users Table */}
          {loading ? (
            <div
              className="rounded-2xl shadow-lg p-12 text-center"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: brand.colors.primary }} />
              <p style={{ color: brand.colors.textLight }}>Loading KYC submissions...</p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>ID Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>ID Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Document</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center" style={{ color: brand.colors.textMuted }}>
                          No KYC submissions found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
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
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm capitalize" style={{ color: brand.colors.text }}>
                            {user.kyc?.idType || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono" style={{ color: brand.colors.text }}>
                            {user.kyc?.idNumber || '-'}
                          </td>
                          <td className="px-6 py-4">
                            {user.kyc?.governmentId ? (
                              <a
                                href={`https://bloom-haven-backend.onrender.com/${user.kyc.governmentId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm font-medium transition hover:opacity-80"
                                style={{ color: brand.colors.primary }}
                              >
                                <ExternalLink size={14} />
                                View Document
                              </a>
                            ) : (
                              <span className="text-xs" style={{ color: brand.colors.textMuted }}>No file</span>
                            )}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(user.kyc?.status)}</td>
                          <td className="px-6 py-4 text-xs" style={{ color: brand.colors.textMuted }}>
                            {user.kyc?.submittedAt ? new Date(user.kyc.submittedAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4">
                            {user.kyc?.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleVerify(user._id)}
                                  className="px-3 py-1 rounded text-white text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                                  style={{ background: brand.colors.success }}
                                >
                                  <CheckCircle2 size={12} />
                                  Verify
                                </button>
                                <button
                                  onClick={() => handleReject(user._id)}
                                  className="px-3 py-1 rounded text-white text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                                  style={{ background: brand.colors.error }}
                                >
                                  <XCircle size={12} />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs" style={{ color: brand.colors.textMuted }}>Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminKYC;