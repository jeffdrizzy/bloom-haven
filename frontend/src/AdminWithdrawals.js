import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';

const AdminWithdrawals = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await api.get('/admin/withdrawals');
      setWithdrawals(response.data);
    } catch (error) {
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
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🏦</div>
          <p className="text-gray-600">Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-rose-600">🏦 Manage Withdrawals</h1>
            <p className="text-gray-600 mt-1">Approve or reject withdrawal requests</p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            ← Back to Admin
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No withdrawal requests found
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((withdraw) => (
                    <tr key={withdraw._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{withdraw.userId?.fullName || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{withdraw.userId?.email || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm capitalize">
                          {withdraw.withdrawType === 'crypto' ? '₿ Crypto' : '💵 Fiat'}
                        </span>
                        <br />
                        <span className="text-xs text-gray-500">{withdraw.currency}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {withdraw.amount} {withdraw.currency}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {withdraw.withdrawType === 'crypto' ? (
                          <span className="font-mono text-xs">{withdraw.walletAddress?.slice(0, 15)}...</span>
                        ) : (
                          <span>{withdraw.bankName}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(withdraw.status)}`}>
                          {withdraw.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(withdraw.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {withdraw.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(withdraw._id)}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(withdraw._id)}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Processed</span>
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

export default AdminWithdrawals;