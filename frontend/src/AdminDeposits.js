import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';

const AdminDeposits = () => {
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addresses, setAddresses] = useState({});
  const [newAddresses, setNewAddresses] = useState({});

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
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">Loading deposits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-rose-600">📊 Manage Deposits</h1>
            <p className="text-gray-600 mt-1">Approve or reject user deposits</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              ← Back to Admin
            </button>
          </div>
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

        {/* Update Addresses */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">🔑 Update Crypto Deposit Addresses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['BTC', 'ETH', 'USDT', 'BNB'].map((currency) => (
              <div key={currency}>
                <label className="block text-gray-700 font-medium mb-1">{currency}</label>
                <input
                  type="text"
                  value={newAddresses[currency] || ''}
                  onChange={(e) => setNewAddresses({
                    ...newAddresses,
                    [currency]: e.target.value,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder={`${currency} address`}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleUpdateAddresses}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Update Addresses
          </button>
        </div>

        {/* Deposits Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No deposits found
                    </td>
                  </tr>
                ) : (
                  deposits.map((deposit) => (
                    <tr key={deposit._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{deposit.userId?.fullName || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{deposit.userId?.email || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm capitalize">
                          {deposit.depositType === 'crypto' ? '₿ Crypto' : '🎁 Gift Card'}
                        </span>
                        <br />
                        <span className="text-xs text-gray-500">{deposit.currency}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {deposit.amount} {deposit.currency}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(deposit.status)}`}>
                          {deposit.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(deposit.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {deposit.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(deposit._id)}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(deposit._id)}
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

export default AdminDeposits;