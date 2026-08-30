import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from './services/api';
import WithdrawPinPopup from './WithdrawPinPopup';
import { brand } from './brand';

const Withdraw = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [withdrawType, setWithdrawType] = useState('crypto');
  const [balance, setBalance] = useState({ fiatBalance: 0, cryptoBalances: {} });
  const [formData, setFormData] = useState({
    currency: 'BTC',
    amount: '',
    walletAddress: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [pendingWithdrawData, setPendingWithdrawData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const cryptoIcons = {
    BTC: '₿',
    ETH: '⟠',
    USDT: '₮',
    BNB: '◆',
  };

  const cryptoColors = {
    BTC: 'border-orange-400 text-orange-700',
    ETH: 'border-purple-400 text-purple-700',
    USDT: 'border-green-400 text-green-700',
    BNB: 'border-yellow-400 text-yellow-700',
  };

  useEffect(() => {
    fetchBalance();
    fetchWithdrawals();
    fetchProfile();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await api.get('/balance');
      setBalance(response.data);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const response = await api.get('/withdrawals');
      setRecentWithdrawals(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getMaxAmount = () => {
    if (withdrawType === 'fiat') {
      return balance.fiatBalance || 0;
    } else {
      return balance.cryptoBalances[formData.currency] || 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const maxAmount = getMaxAmount();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(formData.amount) > maxAmount) {
      setError(`Insufficient balance. Max: ${maxAmount} ${withdrawType === 'fiat' ? 'USD' : formData.currency}`);
      return;
    }

    if (withdrawType === 'crypto' && !formData.walletAddress) {
      setError('Please enter a wallet address');
      return;
    }

    if (withdrawType === 'fiat') {
      if (!formData.bankName || !formData.accountName || !formData.accountNumber) {
        setError('Please fill in all bank details');
        return;
      }
    }

    const currency = withdrawType === 'fiat' ? 'USD' : formData.currency;

    setPendingWithdrawData({
      withdrawType,
      currency: currency,
      amount: parseFloat(formData.amount),
      walletAddress: formData.walletAddress || '',
      bankName: formData.bankName || '',
      accountName: formData.accountName || '',
      accountNumber: formData.accountNumber || '',
      description: formData.description || '',
    });
    
    setShowPinPopup(true);
  };

  const handlePinSuccess = async (message) => {
    setShowPinPopup(false);
    setSubmitting(true);
    
    try {
      const response = await api.post('/withdraw', pendingWithdrawData);
      setSuccess(response.data.message);
      setFormData({
        ...formData,
        amount: '',
        walletAddress: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        description: '',
      });
      fetchBalance();
      fetchWithdrawals();
      setPendingWithdrawData(null);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit withdrawal request');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinCancel = () => {
    setShowPinPopup(false);
    setPendingWithdrawData(null);
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

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: brand.colors.background }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: brand.colors.primary }}>🏦 Withdraw Funds</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg font-medium transition hover:opacity-80"
            style={{ 
              background: brand.colors.surfaceAlt,
              color: brand.colors.text
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl shadow-lg p-4" style={{ background: brand.colors.surface }}>
            <p className="text-sm" style={{ color: brand.colors.textMuted }}>💰 Fiat Balance</p>
            <p className="text-2xl font-bold" style={{ color: brand.colors.text }}>${balance.fiatBalance || 0}</p>
          </div>
          {Object.entries(balance.cryptoBalances || {}).map(([currency, amount]) => (
            <div key={currency} className="rounded-2xl shadow-lg p-4" style={{ background: brand.colors.surface }}>
              <p className="text-sm" style={{ color: brand.colors.textMuted }}>{cryptoIcons[currency]} {currency}</p>
              <p className="text-2xl font-bold" style={{ color: brand.colors.text }}>{amount || 0}</p>
            </div>
          ))}
        </div>

        {/* Withdraw Type Toggle */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setWithdrawType('crypto')}
            className={`p-6 rounded-2xl shadow-lg transition transform hover:scale-105 ${
              withdrawType === 'crypto' ? 'text-white' : ''
            }`}
            style={{
              background: withdrawType === 'crypto' ? brand.gradients.primary : brand.colors.surface,
              color: withdrawType === 'crypto' ? 'white' : brand.colors.text,
              boxShadow: withdrawType === 'crypto' ? `0 4px 20px ${brand.colors.primarySoft}` : '0 4px 6px rgba(0,0,0,0.05)'
            }}
          >
            <div className="text-4xl mb-2">₿</div>
            <div className="font-semibold text-lg">Cryptocurrency</div>
            <div className="text-sm opacity-75">Withdraw crypto</div>
          </button>
          <button
            onClick={() => setWithdrawType('fiat')}
            className={`p-6 rounded-2xl shadow-lg transition transform hover:scale-105 ${
              withdrawType === 'fiat' ? 'text-white' : ''
            }`}
            style={{
              background: withdrawType === 'fiat' ? brand.gradients.primary : brand.colors.surface,
              color: withdrawType === 'fiat' ? 'white' : brand.colors.text,
              boxShadow: withdrawType === 'fiat' ? `0 4px 20px ${brand.colors.primarySoft}` : '0 4px 6px rgba(0,0,0,0.05)'
            }}
          >
            <div className="text-4xl mb-2">💵</div>
            <div className="font-semibold text-lg">Fiat</div>
            <div className="text-sm opacity-75">Withdraw to bank</div>
          </button>
        </div>

        {/* Main Withdraw Card */}
        <div className="rounded-2xl shadow-xl p-8 mb-6" style={{ 
          background: brand.colors.surface,
          border: `1px solid ${brand.colors.primarySoft}`
        }}>
          {error && (
            <div className="border-l-4 px-4 py-3 rounded-lg mb-6 flex items-center gap-3" style={{
              backgroundColor: '#FDF2F2',
              borderColor: brand.colors.error,
              color: brand.colors.error
            }}>
              <span className="text-2xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="border-l-4 px-4 py-3 rounded-lg mb-6 flex items-center gap-3" style={{
              backgroundColor: '#F0FDF4',
              borderColor: brand.colors.success,
              color: brand.colors.success
            }}>
              <span className="text-2xl">✅</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Currency Selection */}
            {withdrawType === 'crypto' ? (
              <div>
                <label className="block font-semibold mb-3 text-lg" style={{ color: brand.colors.text }}>
                  Select Cryptocurrency
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(balance.cryptoBalances || {}).map((currency) => (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => setFormData({ ...formData, currency })}
                      className={`p-4 rounded-xl border-2 transition transform hover:scale-105 ${
                        formData.currency === currency
                          ? `${cryptoColors[currency]} border-4`
                          : 'border-gray-200'
                      }`}
                      style={{
                        background: formData.currency === currency ? brand.colors.creamSoft : brand.colors.surface,
                      }}
                    >
                      <div className="text-3xl">{cryptoIcons[currency]}</div>
                      <div className="font-bold text-lg">{currency}</div>
                      <div className="text-sm" style={{ color: brand.colors.textMuted }}>
                        Balance: {balance.cryptoBalances[currency] || 0}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-semibold mb-3 text-lg" style={{ color: brand.colors.text }}>
                  Currency: USD (Fixed)
                </label>
                <div className="p-4 rounded-xl" style={{ 
                  background: brand.colors.surfaceAlt,
                  border: `2px solid ${brand.colors.primarySoft}`
                }}>
                  <div className="text-3xl mb-2">💵</div>
                  <div className="font-bold text-lg">USD</div>
                  <div className="text-sm" style={{ color: brand.colors.textMuted }}>
                    Balance: ${balance.fiatBalance || 0}
                  </div>
                  <input type="hidden" name="currency" value="USD" />
                </div>
                <p className="text-xs mt-1" style={{ color: brand.colors.textMuted }}>
                  Fiat withdrawals are always in USD
                </p>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block font-semibold mb-2 text-lg" style={{ color: brand.colors.text }}>
                💰 Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-2xl">
                  {withdrawType === 'crypto' ? cryptoIcons[formData.currency] : '$'}
                </span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="1"
                  step="0.01"
                  className="w-full pl-14 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 transition text-lg"
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
                  placeholder="Enter amount"
                />
              </div>
              <div className="text-right mt-1">
                <span className="text-sm" style={{ color: brand.colors.textMuted }}>
                  Available: {getMaxAmount()} {withdrawType === 'crypto' ? formData.currency : 'USD'}
                </span>
              </div>
            </div>

            {/* Crypto Wallet Address */}
            {withdrawType === 'crypto' && (
              <div>
                <label className="block font-semibold mb-2 text-lg" style={{ color: brand.colors.text }}>
                  🔗 Wallet Address
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 rounded-xl focus:outline-none focus:ring-2 transition text-lg"
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
                  placeholder="Enter wallet address"
                />
              </div>
            )}

            {/* Bank Details */}
            {withdrawType === 'fiat' && (
              <div className="space-y-4 p-6 rounded-xl" style={{ 
                background: brand.colors.surfaceAlt,
                border: `2px solid ${brand.colors.primarySoft}`
              }}>
                <h3 className="font-semibold text-lg" style={{ color: brand.colors.text }}>🏦 Bank Details</h3>
                <div>
                  <label className="block font-medium mb-1" style={{ color: brand.colors.textLight }}>Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
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
                    placeholder="Enter bank name"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1" style={{ color: brand.colors.textLight }}>Account Name</label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
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
                    placeholder="Enter account name"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1" style={{ color: brand.colors.textLight }}>Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
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
                    placeholder="Enter account number"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block font-semibold mb-2 text-lg" style={{ color: brand.colors.text }}>
                📝 Description (optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl focus:outline-none focus:ring-2 transition text-lg"
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
                placeholder="Any additional information"
                rows="2"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl text-white font-bold text-lg transition transform hover:scale-[1.02]"
              style={{
                background: brand.gradients.primary,
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: `0 4px 20px ${brand.colors.primarySoft}`
              }}
            >
              {submitting ? '⏳ Submitting...' : '🚀 Request Withdrawal'}
            </button>
          </form>
        </div>

        {/* Recent Withdrawals */}
        {recentWithdrawals.length > 0 && (
          <div className="rounded-2xl shadow-xl p-6" style={{ 
            background: brand.colors.surface,
            border: `1px solid ${brand.colors.primarySoft}`
          }}>
            <h3 className="font-semibold text-lg mb-4" style={{ color: brand.colors.text }}>📊 Recent Withdrawals</h3>
            <div className="space-y-3">
              {recentWithdrawals.map((withdraw) => (
                <div key={withdraw._id} className="flex justify-between items-center p-4 rounded-xl transition" style={{ 
                  background: brand.colors.surfaceAlt,
                  border: `1px solid ${brand.colors.primarySoft}`
                }}>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {withdraw.withdrawType === 'crypto' ? cryptoIcons[withdraw.currency] || '₿' : '💵'}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: brand.colors.text }}>
                        {withdraw.amount} {withdraw.currency}
                      </p>
                      <p className="text-sm" style={{ color: brand.colors.textMuted }}>
                        {new Date(withdraw.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(withdraw.status)}`}>
                    {withdraw.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PIN Popup */}
      <WithdrawPinPopup
        isOpen={showPinPopup}
        onClose={handlePinCancel}
        onSuccess={handlePinSuccess}
        amount={pendingWithdrawData?.amount}
        currency={pendingWithdrawData?.currency}
        hasPin={userProfile?.pinIssued || false}
        userEmail={userProfile?.email || ''}
      />
    </div>
  );
};

export default Withdraw;