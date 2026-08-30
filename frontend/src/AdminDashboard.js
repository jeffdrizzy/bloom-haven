import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from './services/api';
import api from './services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    blacklisted: 0,
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    console.log('Current user:', currentUser); // Debug log
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Check if user is admin
    if (currentUser.role !== 'admin') {
      setError('Access denied. Admin only.');
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }
    
    setAdminUser(currentUser);
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const approved = response.data.filter(u => u.isApproved).length;
      const pending = response.data.filter(u => !u.isApproved).length;
      const blacklisted = response.data.filter(u => u.isBlacklisted).length;
      
      setStats({ total, approved, pending, blacklisted });
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/approve`);
      setSuccess(response.data.message);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to approve user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFreezeUser = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/freeze`);
      setSuccess(response.data.message);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to freeze user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUnfreezeUser = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/unfreeze`);
      setSuccess(response.data.message);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to unfreeze user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBlacklistUser = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/blacklist`);
      setSuccess(response.data.message);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to blacklist user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUnblacklistUser = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/unblacklist`);
      setSuccess(response.data.message);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to unblacklist user');
      setTimeout(() => setError(''), 3000);
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
      setSuccess(response.data.message);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add balance');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="text-center">
          <div className="text-4xl mb-4">👑</div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && error.includes('Access denied')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
  <div>
    <h1 className="text-3xl font-bold text-rose-600">👑 Bloom Haven Admin</h1>
    <p className="text-gray-600 mt-1">Manage users and accounts</p>
  </div>
  <div className="flex gap-4">
    <button
      onClick={() => navigate('/admin/deposits')}
      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
    >
      📊 Manage Deposits
    </button>
<button
  onClick={() => navigate('/admin/withdrawals')}
  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
>
  🏦 Withdrawals
</button>
<button
  onClick={() => navigate('/admin/pins')}
  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
>
  🔢 PIN Management
</button>

<button
  onClick={() => navigate('/admin/kyc')}
  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
>
  🛡️ KYC Verification
</button>
<button
  onClick={() => navigate('/admin/settings')}
  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
>
  ⚙️ Settings
</button>
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
    >
      Logout
    </button>
  </div>
</div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="text-gray-500 text-sm">Total Users</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="text-gray-500 text-sm">Approved</h3>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="text-gray-500 text-sm">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="text-gray-500 text-sm">Blacklisted</h3>
            <p className="text-2xl font-bold text-red-600">{stats.blacklisted}</p>
          </div>
        </div>

        {/* Messages */}
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

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center">
                          <span className="text-rose-600 font-bold">
                            {user.fullName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isApproved ? '✅ Approved' : '⏳ Pending'}
                        </span>
                        {user.isFrozen && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 ml-1">
                            ❄️ Frozen
                          </span>
                        )}
                        {user.isBlacklisted && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 ml-1">
                            🚫 Blacklisted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${user.fiatBalance || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {!user.isApproved && (
                          <button
                            onClick={() => handleApproveUser(user._id)}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                          >
                            Approve
                          </button>
                        )}
                        {user.isFrozen ? (
                          <button
                            onClick={() => handleUnfreezeUser(user._id)}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                          >
                            Unfreeze
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFreezeUser(user._id)}
                            className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition"
                          >
                            Freeze
                          </button>
                        )}
                        {user.isBlacklisted ? (
                          <button
                            onClick={() => handleUnblacklistUser(user._id)}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                          >
                            Unblacklist
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlacklistUser(user._id)}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                          >
                            Blacklist
                          </button>
                        )}
                        <button
                          onClick={() => handleAddBalance(user._id)}
                          className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition"
                        >
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
  );
};

export default AdminDashboard;