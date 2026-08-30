import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';

const AdminPinManagement = () => {
  const navigate = useNavigate();
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

    // Auto-focus next input
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
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">⏳ Pending</span>;
    }
    if (user.isBlacklisted) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">🚫 Blacklisted</span>;
    }
    if (user.isFrozen) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">❄️ Frozen</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">✅ Active</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🔢</div>
          <p className="text-gray-600">Loading users...</p>
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
            <h1 className="text-3xl font-bold text-rose-600">🔢 PIN Management</h1>
            <p className="text-gray-600 mt-1">Issue and manage withdrawal PINs for users</p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            ← Back to Admin
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="text-gray-500 text-sm">Total Users</h3>
            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="text-gray-500 text-sm">Has PIN</h3>
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.pinIssued).length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="text-gray-500 text-sm">Needs PIN</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.isApproved && !u.pinIssued && !u.isBlacklisted && !u.isFrozen).length}
            </p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PIN Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
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
                    <td className="px-6 py-4">{getStatusBadge(user)}</td>
                    <td className="px-6 py-4">
                      {user.pinIssued ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          ✅ Issued
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          ⏳ Not Issued
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isApproved && !user.isBlacklisted && !user.isFrozen ? (
                        user.pinIssued ? (
                          <button
                            onClick={() => openPinModal(user)}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                          >
                            Reset PIN
                          </button>
                        ) : (
                          <button
                            onClick={() => openPinModal(user)}
                            className="px-3 py-1 bg-rose-500 text-white text-xs rounded hover:bg-rose-600 transition"
                          >
                            Issue PIN
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">Not Available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔑</div>
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedUser.pinIssued ? 'Reset PIN' : 'Issue PIN'}
              </h2>
              <p className="text-gray-600 mt-2">
                {selectedUser.pinIssued
                  ? `Reset PIN for ${selectedUser.fullName}`
                  : `Issue new 4-digit PIN for ${selectedUser.fullName}`}
              </p>
              <p className="text-sm text-gray-500 mt-1">{selectedUser.email}</p>
            </div>

            {/* PIN Input */}
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
                  className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none transition"
                  autoFocus={index === 0}
                  inputMode="numeric"
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleIssuePin}
              className="w-full py-3 rounded-xl text-white font-semibold bg-rose-500 hover:bg-rose-600 transition"
            >
              {selectedUser.pinIssued ? '🔄 Reset PIN' : '📌 Issue PIN'}
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                PIN will be sent to the user
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPinManagement;