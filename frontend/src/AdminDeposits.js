import React, { useState, useEffect } from 'react';
import api from './services/api';
import { brand } from './brand';
import AdminLayout from './AdminLayout';
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  Bitcoin,
  CircleDollarSign,
  Diamond,
  Hexagon,
  Gift,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Download,
  ExternalLink,
  User,
  Calendar,
  FileText,
  getCryptoIcon,
} from './icons';

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addresses, setAddresses] = useState({});
  const [newAddresses, setNewAddresses] = useState({});
  const [filter, setFilter] = useState('all');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeposits();
    fetchAddresses();
  }, []);

  const fetchDeposits = async () => {
    try {
      const response = await api.get('/admin/deposits');
      setDeposits(response.data);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      setError('Failed to fetch deposits');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/deposit/addresses');
      setAddresses(response.data);
      setNewAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleApprove = async (depositId) => {
    const note = prompt('Enter admin note (optional):');
    try {
      const response = await api.put(`/admin/deposits/${depositId}/approve`, {
        adminNote: note || 'Approved by admin',
      });
      setSuccess(response.data.message);
      fetchDeposits();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to approve deposit');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (depositId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await api.put(`/admin/deposits/${depositId}/reject`, {
        adminNote: reason,
      });
      setSuccess(response.data.message);
      fetchDeposits();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reject deposit');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateAddresses = async () => {
    setSaving(true);
    try {
      const response = await api.put('/admin/settings', {
        cryptoAddresses: newAddresses,
      });
      setSuccess(response.data.message);
      fetchAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update addresses');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return CheckCircle2;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const getTypeIcon = (depositType, currency) => {
    if (depositType === 'crypto') return getCryptoIcon(currency);
    if (depositType === 'giftcard') return Gift;
    return Receipt;
  };

  const filteredDeposits = deposits.filter((d) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  const stats = {
    total: deposits.length,
    pending: deposits.filter((d) => d.status === 'pending').length,
    approved: deposits.filter((d) => d.status === 'approved').length,
    rejected: deposits.filter((d) => d.status === 'rejected').length,
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
              <Receipt size={32} strokeWidth={2} />
              Manage Deposits
            </h1>
            <p className="text-sm mt-1" style={{ color: brand.colors.textLight }}>
              Approve or reject user deposit requests
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

          {/* Update Crypto Addresses */}
          <div
            className="rounded-2xl shadow-lg p-6 mb-6"
            style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
          >
            <h3
              className="font-semibold text-lg mb-4 flex items-center gap-2"
              style={{ color: brand.colors.text }}
            >
              <Wallet size={20} strokeWidth={2} />
              Crypto Deposit Addresses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['BTC', 'ETH', 'USDT', 'BNB'].map((currency) => {
                const CryptoIcon = getCryptoIcon(currency);
                return (
                  <div key={currency}>
                    <label
                      className="block font-medium mb-1 flex items-center gap-2"
                      style={{ color: brand.colors.text }}
                    >
                      <CryptoIcon size={16} strokeWidth={1.8} />
                      {currency} Address
                    </label>
                    <input
                      type="text"
                      value={newAddresses[currency] || ''}
                      onChange={(e) =>
                        setNewAddresses({ ...newAddresses, [currency]: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
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
                      placeholder={`${currency} address`}
                    />
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleUpdateAddresses}
              disabled={saving}
              className="mt-4 px-6 py-2 rounded-lg text-white font-semibold transition hover:opacity-90 flex items-center gap-2"
              style={{
                background: brand.gradients.primary,
                opacity: saving ? 0.6 : 1,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Update Addresses
                </>
              )}
            </button>
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
              { key: 'all', label: 'All', Icon: Receipt },
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

          {/* Deposits Table */}
          {loading ? (
            <div
              className="rounded-2xl shadow-lg p-12 text-center"
              style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}
            >
              <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: brand.colors.primary }} />
              <p style={{ color: brand.colors.textLight }}>Loading deposits...</p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Proof</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: brand.colors.textMuted }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeposits.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center" style={{ color: brand.colors.textMuted }}>
                          No deposits found
                        </td>
                      </tr>
                    ) : (
                      filteredDeposits.map((deposit) => {
                        const TypeIcon = getTypeIcon(deposit.depositType, deposit.currency);
                        const StatusIcon = getStatusIcon(deposit.status);
                        return (
                          <tr
                            key={deposit._id}
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
                                    {deposit.userId?.fullName || 'Unknown'}
                                  </p>
                                  <p className="text-xs" style={{ color: brand.colors.textMuted }}>
                                    {deposit.userId?.email || ''}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <TypeIcon size={18} strokeWidth={1.8} style={{ color: brand.colors.primary }} />
                                <div>
                                  <p className="text-sm capitalize" style={{ color: brand.colors.text }}>
                                    {deposit.depositType}
                                  </p>
                                  <p className="text-xs" style={{ color: brand.colors.textMuted }}>
                                    {deposit.currency}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold" style={{ color: brand.colors.text }}>
                              {deposit.amount} {deposit.currency}
                            </td>
                            <td className="px-6 py-4">
                              {deposit.proofImage ? (
                                <a
                                  href={`https://bloom-haven-backend.onrender.com/${deposit.proofImage}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm font-medium transition hover:opacity-80"
                                  style={{ color: brand.colors.primary }}
                                >
                                  <ExternalLink size={14} />
                                  View
                                </a>
                              ) : (
                                <span className="text-xs" style={{ color: brand.colors.textMuted }}>No file</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full font-semibold flex items-center gap-1 w-fit ${getStatusColor(deposit.status)}`}>
                                <StatusIcon size={12} />
                                {deposit.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs" style={{ color: brand.colors.textMuted }}>
                              {new Date(deposit.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {deposit.status === 'pending' ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApprove(deposit._id)}
                                    className="px-3 py-1 rounded text-white text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                                    style={{ background: brand.colors.success }}
                                  >
                                    <CheckCircle2 size={12} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(deposit._id)}
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

export default AdminDeposits;