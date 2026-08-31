import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';
import { brand } from './brand';

const AdminKYC = () => {
  const navigate = useNavigate();
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
    switch(status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'verified': return '✅ Verified';
      case 'pending': return '⏳ Pending';
      case 'rejected': return '❌ Rejected';
      default: return '📋 Not Submitted';
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.kyc?.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.colors.background }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <p style={{ color: brand.colors.textLight }}>Loading KYC submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: brand.colors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: brand.colors.primary }}>🛡️ KYC Management</h1>
            <p className="text-sm" style={{ color: brand.colors.textLight }}>Verify user identities</p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-lg font-medium transition hover:opacity-80"
            style={{ 
              background: brand.colors.surfaceAlt,
              color: brand.colors.text
            }}
          >
            ← Back to Admin
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl shadow-lg p-4" style={{ 
            background: brand.colors.surface,
            border: `1px solid ${brand.colors.primarySoft}`
          }}>
            <h3 className="text-sm" style={{ color: brand.colors.textMuted }}>Total Submissions</h3>
            <p className="text-2xl font-bold" style={{ color: brand.colors.text }}>{users.length}</p>
          </div>
          <div className="rounded-2xl shadow-lg p-4" style={{ 
            background: brand.colors.surface,
            border: `1px solid ${brand.colors.primarySoft}`
          }}>
            <h3 className="text-sm" style={{ color: brand.colors.textMuted }}>Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.kyc?.status === 'pending').length}
            </p>
          </div>
          <div className="rounded-2xl shadow-lg p-4" style={{ 
            background: brand.colors.surface,
            border: `1px solid ${brand.colors.primarySoft}`
          }}>
            <h3 className="text-sm" style={{ color: brand.colors.textMuted }}>Verified</h3>
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.kyc?.status === 'verified').length}
            </p>
          </div>
        </div>

        {/* Error/Success */}
        {error && (
          <div className="border-l-4 px-4 py-3 rounded-lg mb-4" style={{
            backgroundColor: '#FDF2F2',
            borderColor: brand.colors.error,
            color: brand.colors.error
          }}>
            {error}
          </div>
        )}
        {success && (
          <div className="border-l-4 px-4 py-3 rounded-lg mb-4" style={{
            backgroundColor: '#F0FDF4',
            borderColor: brand.colors.success,
            color: brand.colors.success
          }}>
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { key: 'all', label: '📋 All' },
            { key: 'pending', label: '⏳ Pending' },
            { key: 'verified', label: '✅ Verified' },
            { key: 'rejected', label: '❌ Rejected' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === item.key ? 'text-white' : ''
              }`}
              style={{
                background: filter === item.key ? brand.gradients.primary : brand.colors.surfaceAlt,
                color: filter === item.key ? 'white' : brand.colors.text,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="rounded-2xl shadow-lg overflow-hidden" style={{ 
          background: brand.colors.surface,
          border: `1px solid ${brand.colors.primarySoft}`
        }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" style={{ borderColor: brand.colors.primarySoft }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: brand.colors.textMuted }}>User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: brand.colors.textMuted }}>ID Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: brand.colors.textMuted }}>ID Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: brand.colors.textMuted }}>Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: brand.colors.textMuted }}>Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: brand.colors.textMuted }}>Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: brand.colors.textMuted }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: brand.colors.primarySoft }}>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center" style={{ color: brand.colors.textMuted }}>
                      No KYC submissions found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-opacity-50" style={{ hover: { background: brand.colors.surfaceAlt } }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ 
                            background: brand.colors.creamSoft,
                            color: brand.colors.primary
                          }}>
                            {user.fullName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: brand.colors.text }}>{user.fullName}</p>
                            <p className="text-sm" style={{ color: brand.colors.textMuted }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: brand.colors.text }}>
                        {user.kyc?.idType || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: brand.colors.text }}>
                        {user.kyc?.idNumber || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.kyc?.governmentId ? (
                          <a 
                           href={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${user.kyc.governmentId}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline flex items-center gap-1"
                          >
                            📄 View Document
                          </a>
                        ) : (
                          <span style={{ color: brand.colors.textMuted }}>No file</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(user.kyc?.status)}`}>
                          {getStatusText(user.kyc?.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: brand.colors.textMuted }}>
                        {user.kyc?.submittedAt ? new Date(user.kyc.submittedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {user.kyc?.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerify(user._id)}
                              className="px-3 py-1 rounded text-white text-xs transition hover:opacity-80"
                              style={{ background: brand.colors.success }}
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleReject(user._id)}
                              className="px-3 py-1 rounded text-white text-xs transition hover:opacity-80"
                              style={{ background: brand.colors.error }}
                            >
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
      </div>
    </div>
  );
};

export default AdminKYC;