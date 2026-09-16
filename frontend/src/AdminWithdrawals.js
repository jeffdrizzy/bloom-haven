import React, { useState, useEffect } from 'react';
import api from './services/api';
import { brand } from './brand';
import AdminLayout from './AdminLayout';
import {
  Banknote,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  User,
  Wallet,
  Bitcoin,
  Banknote as BankIcon,
  Link as LinkIcon,
  ExternalLink,
  Receipt,
  getCryptoIcon,
} from './icons';

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await api.get('/admin/withdrawals');
      setWithdrawals(response.data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      setError('Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawId) => {
    const note = prompt('Enter admin note (optional):');
    try {
      const response = await api.put(`/admin/withdrawals/${withdrawId}/approve`, {
        adminNote: note || 'Approved by admin',
      });
      setSuccess(response.data.message);
      fetchWithdrawals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to approve withdrawal');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (withdrawId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await api.put(`/admin/withdrawals/${withdrawId}/reject`, {
        adminNote: reason,
      });
      setSuccess(response.data.message);
      fetchWithdrawals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reject withdrawal');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return CheckCircle2;
      case 'rejected': return XCircle;
      case 'completed': return CheckCircle2;
      default: return Clock;
    }
  };

  const getTypeIcon = (withdrawType, currency) => {
    if (withdrawType === 'crypto') return getCryptoIcon(currency);
    if (withdrawType === 'fiat') return BankIcon;
    return Banknote;
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter((w) => w.status === 'pending').length,
    approved: withdrawals.filter((w) => w.status === 'approved').length,
    rejected: withdrawals.filter((w) => w.status === 'rejected').length,
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
              <Banknote size={32} strokeWidth={2} />
              Manage Withdrawals
            </h1>
            <p className="text-sm mt-1" style={{ color: brand.colors.textLight }}>
              Approve or reject user withdrawal requests
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div
              className="rounded-2xl shadow-lg p-4"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <h3 className="text-sm mb-2" style={{ color: brand.colors.textMuted }}>Total</h3>
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
                <CheckCircle2 size={14} /> Approved
              </h3>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
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
              { key: 'all', label: 'All', Icon: Banknote },
              { key: 'pending', label: 'Pending', Icon: Clock },
              { key: 'approved', label: 'Approved', Icon: CheckCircle2 },
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

          {/* Withdrawals Table */}
          {loading ? (
            <div
              className="rounded-2xl shadow-lg p-12 text-center"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: brand.colors.primary }} />
              <p style={{ color: brand.colors.textLight }}>Loading withdrawals...</p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center" style={{ color: brand.colors.textMuted }}>
                          No withdrawals found
                        </td>
                      </tr>
                    ) : (
                      filteredWithdrawals.map((withdraw) => {
                        const TypeIcon = getTypeIcon(withdraw.withdrawType, withdraw.currency);
                        const StatusIcon = getStatusIcon(withdraw.status);
                        return (
                          <tr
                            key={withdraw._id}
                            className="transition hover:bg-opacity-50"
                            style={{ borderTop: `1px solid ${brand.colors.primarySoft}` }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ background: brand.colors.creamSoft, color: brand.colors.primary }}
                                >
                                  <User size={18} strokeWidth={1.8} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium" style={{ color: brand.colors.text }}>
                                    {withdraw.userId?.fullName || 'Unknown'}
                                  </p>
                                  <p className="text-xs" style={{ color: brand.colors.textMuted }}>
                                    {withdraw.userId?.email || ''}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <TypeIcon size={18} strokeWidth={1.8} style={{ color: brand.colors.primary }} />
                                <div>
                                  <p className="text-sm capitalize" style={{ color: brand.colors.text }}>
                                    {withdraw.withdrawType}
                                  </p>
                                  <p className="text-xs" style={{ color: brand.colors.textMuted }}>
                                    {withdraw.currency}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold" style={{ color: brand.colors.text }}>
                              {withdraw.amount} {withdraw.currency}
                              {withdraw.metadata?.fee && (
                                <p className="text-xs font-normal" style={{ color: brand.colors.textMuted }}>
                                  Fee: ${withdraw.metadata.fee.toFixed(2)}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {withdraw.withdrawType === 'crypto' ? (
                                <div className="flex items-center gap-1" style={{ color: brand.colors.textMuted }}>
                                  <LinkIcon size={12} />
                                  <span className="font-mono">
                                    {withdraw.walletAddress?.slice(0, 15)}...
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1" style={{ color: brand.colors.textMuted }}>
                                  <BankIcon size={12} />
                                  <span>{withdraw.bankName}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full font-semibold flex items-center gap-1 w-fit ${getStatusColor(withdraw.status)}`}>
                                <StatusIcon size={12} />
                                {withdraw.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs" style={{ color: brand.colors.textMuted }}>
                              {new Date(withdraw.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {withdraw.status === 'pending' ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApprove(withdraw._id)}
                                    className="px-3 py-1 rounded text-white text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                                    style={{ background: brand.colors.success }}
                                  >
                                    <CheckCircle2 size={12} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(withdraw._id)}
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
                        );
                      })
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

export default AdminWithdrawals;