import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from './services/api';
import { brand } from './brand';

const Deposit = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [depositType, setDepositType] = useState('crypto');
  const [addresses, setAddresses] = useState({});
  const [formData, setFormData] = useState({
    currency: 'BTC',
    amount: '',
    transactionId: '',
    description: '',
    giftcardType: 'Amazon',
    giftcardCountry: 'US',
    proofImage: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const giftcardTypes = ['Amazon', 'Apple', 'Google Play', 'Steam', 'Netflix'];
  
  const countries = [
    { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
    { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
  ];

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

  const giftcardIcons = {
    Amazon: '📦',
    Apple: '🍎',
    'Google Play': '▶️',
    Steam: '🎮',
    Netflix: '🎬',
  };

  useEffect(() => {
    fetchAddresses();
    fetchDeposits();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/deposit/addresses');
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchDeposits = async () => {
    try {
      const response = await api.get('/deposits');
      setRecentDeposits(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG, GIF, or WEBP)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setFormData({
        ...formData,
        proofImage: file,
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleAddressSelect = (currency, address) => {
    setFormData({ ...formData, currency });
    setSelectedAddress(address);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      setSubmitting(false);
      return;
    }

    if (!formData.proofImage) {
      setError('Please upload a proof image');
      setSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('depositType', depositType);
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('transactionId', formData.transactionId || '');
      formDataToSend.append('description', formData.description || '');
      
      if (depositType === 'giftcard') {
        formDataToSend.append('giftcardType', formData.giftcardType);
        formDataToSend.append('giftcardCountry', formData.giftcardCountry);
      }
      
      if (formData.proofImage) {
        formDataToSend.append('proofImage', formData.proofImage);
      }

      const response = await api.post('/deposit/submit', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(response.data.message);
      setFormData({
        ...formData,
        amount: '',
        transactionId: '',
        description: '',
        proofImage: null,
      });
      setImagePreview(null);
      document.getElementById('fileInput').value = '';
      fetchDeposits();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit deposit');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmitting(false);
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

  const getAvailableCurrencies = () => {
    return Object.keys(addresses);
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4" style={{ background: brand.colors.background }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: brand.colors.primary }}>💳 {t('deposit')}</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg font-medium transition hover:opacity-80 text-sm sm:text-base w-full sm:w-auto"
            style={{ 
              background: brand.colors.surfaceAlt,
              color: brand.colors.text
            }}
          >
            ← {t('back_to_dashboard')}
          </button>
        </div>

        {/* Deposit Type Toggle */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          <button
            onClick={() => setDepositType('crypto')}
            className={`p-4 sm:p-6 rounded-2xl shadow-lg transition transform hover:scale-105 ${
              depositType === 'crypto' ? 'text-white' : ''
            }`}
            style={{
              background: depositType === 'crypto' ? brand.gradients.primary : brand.colors.surface,
              color: depositType === 'crypto' ? 'white' : brand.colors.text,
              boxShadow: depositType === 'crypto' ? `0 4px 20px ${brand.colors.primarySoft}` : '0 4px 6px rgba(0,0,0,0.05)'
            }}
          >
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">₿</div>
            <div className="font-semibold text-base sm:text-lg">{t('crypto')}</div>
            <div className="text-xs sm:text-sm opacity-75">Deposit with cryptocurrency</div>
          </button>
          <button
            onClick={() => setDepositType('giftcard')}
            className={`p-4 sm:p-6 rounded-2xl shadow-lg transition transform hover:scale-105 ${
              depositType === 'giftcard' ? 'text-white' : ''
            }`}
            style={{
              background: depositType === 'giftcard' ? brand.gradients.primary : brand.colors.surface,
              color: depositType === 'giftcard' ? 'white' : brand.colors.text,
              boxShadow: depositType === 'giftcard' ? `0 4px 20px ${brand.colors.primarySoft}` : '0 4px 6px rgba(0,0,0,0.05)'
            }}
          >
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🎁</div>
            <div className="font-semibold text-base sm:text-lg">{t('giftcard')}</div>
            <div className="text-xs sm:text-sm opacity-75">Deposit with gift cards</div>
          </button>
        </div>

        {/* Main Deposit Card */}
        <div className="rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6" style={{ 
          background: brand.colors.surface,
          border: `1px solid ${brand.colors.primarySoft}`
        }}>
          {error && (
            <div className="border-l-4 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 text-sm sm:text-base" style={{
              backgroundColor: '#FDF2F2',
              borderColor: brand.colors.error,
              color: brand.colors.error
            }}>
              <span className="text-xl sm:text-2xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="border-l-4 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 text-sm sm:text-base" style={{
              backgroundColor: '#F0FDF4',
              borderColor: brand.colors.success,
              color: brand.colors.success
            }}>
              <span className="text-xl sm:text-2xl">✅</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Crypto Wallet Selection */}
            {depositType === 'crypto' && (
              <div>
                <label className="block font-semibold mb-3 text-base sm:text-lg" style={{ color: brand.colors.text }}>
                  Select Cryptocurrency Wallet
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {getAvailableCurrencies().map((currency) => (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => handleAddressSelect(currency, addresses[currency])}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition transform hover:scale-105 ${
                        formData.currency === currency
                          ? `${cryptoColors[currency]} border-4`
                          : 'border-gray-200'
                      }`}
                      style={{
                        background: formData.currency === currency ? brand.colors.creamSoft : brand.colors.surface,
                      }}
                    >
                      <div className="text-2xl sm:text-3xl">{cryptoIcons[currency]}</div>
                      <div className="font-bold text-base sm:text-lg">{currency}</div>
                      <div className="text-xs mt-1 truncate" style={{ color: brand.colors.textMuted }}>
                        {addresses[currency]?.slice(0, 10)}...
                      </div>
                    </button>
                  ))}
                </div>
                {selectedAddress && (
                  <div className="mt-3 p-3 rounded-lg" style={{ 
                    background: brand.colors.surfaceAlt,
                    border: `1px solid ${brand.colors.primarySoft}`
                  }}>
                    <p className="text-sm" style={{ color: brand.colors.textLight }}>Wallet Address:</p>
                    <p className="text-xs sm:text-sm font-mono break-all" style={{ color: brand.colors.text }}>{selectedAddress}</p>
                  </div>
                )}
              </div>
            )}

            {/* Gift Card Selection */}
            {depositType === 'giftcard' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-3 text-base sm:text-lg" style={{ color: brand.colors.text }}>
                    Select Gift Card Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {giftcardTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, giftcardType: type })}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition transform hover:scale-105 ${
                          formData.giftcardType === type
                            ? 'border-4'
                            : 'border-gray-200'
                        }`}
                        style={{
                          background: formData.giftcardType === type ? brand.colors.creamSoft : brand.colors.surface,
                          borderColor: formData.giftcardType === type ? brand.colors.primary : '#e5e7eb',
                        }}
                      >
                        <div className="text-2xl sm:text-3xl">{giftcardIcons[type]}</div>
                        <div className="font-semibold text-xs sm:text-sm" style={{ color: brand.colors.text }}>{type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-3 text-base sm:text-lg" style={{ color: brand.colors.text }}>
                    Select Country
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => setFormData({ ...formData, giftcardCountry: country.code })}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition transform hover:scale-105 ${
                          formData.giftcardCountry === country.code
                            ? 'border-4'
                            : 'border-gray-200'
                        }`}
                        style={{
                          background: formData.giftcardCountry === country.code ? brand.colors.creamSoft : brand.colors.surface,
                          borderColor: formData.giftcardCountry === country.code ? brand.colors.primary : '#e5e7eb',
                        }}
                      >
                        <div className="text-2xl sm:text-3xl">{country.flag}</div>
                        <div className="font-semibold text-xs sm:text-sm" style={{ color: brand.colors.text }}>{country.name}</div>
                        <div className="text-xs" style={{ color: brand.colors.textMuted }}>{country.currency}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block font-semibold mb-2 text-base sm:text-lg" style={{ color: brand.colors.text }}>
                💰 {t('amount')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-xl sm:text-2xl">
                  {depositType === 'crypto' ? cryptoIcons[formData.currency] : '$'}
                </span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="1"
                  step="0.01"
                  className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 rounded-xl focus:outline-none focus:ring-2 transition text-base sm:text-lg"
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
            </div>

            {/* Transaction ID / Gift Card Code */}
            <div>
              <label className="block font-semibold mb-2 text-base sm:text-lg" style={{ color: brand.colors.text }}>
                {depositType === 'crypto' ? '🔗 Transaction ID' : '🎫 Gift Card Code'}
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 sm:py-4 rounded-xl focus:outline-none focus:ring-2 transition text-base sm:text-lg"
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
                placeholder={depositType === 'crypto' ? 'Enter transaction ID' : 'Enter gift card code'}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block font-semibold mb-2 text-base sm:text-lg" style={{ color: brand.colors.text }}>
                📸 {t('upload_proof')}
              </label>
              <div 
                className="border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition cursor-pointer"
                style={{
                  borderColor: brand.colors.primarySoft,
                  background: brand.colors.surfaceAlt,
                }}
              >
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                />
                <label htmlFor="fileInput" className="cursor-pointer block">
                  <div className="text-3xl sm:text-4xl mb-2">📤</div>
                  <p className="text-sm sm:text-base" style={{ color: brand.colors.textLight }}>Click to upload proof image</p>
                  <p className="text-xs sm:text-sm" style={{ color: brand.colors.textMuted }}>JPEG, PNG, GIF, WEBP (Max 5MB)</p>
                </label>
              </div>
              {imagePreview && (
                <div className="mt-3">
                  <img src={imagePreview} alt="Preview" className="max-w-full h-auto max-h-48 rounded-lg mx-auto" />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold mb-2 text-base sm:text-lg" style={{ color: brand.colors.text }}>
                📝 {t('description')} (optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 sm:py-4 rounded-xl focus:outline-none focus:ring-2 transition text-base sm:text-lg"
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
              className="w-full py-3 sm:py-4 rounded-xl text-white font-bold text-base sm:text-lg transition transform hover:scale-[1.02]"
              style={{
                background: brand.gradients.primary,
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: `0 4px 20px ${brand.colors.primarySoft}`
              }}
            >
              {submitting ? '⏳ Submitting...' : '🚀 ' + t('submit') + ' ' + t('deposit')}
            </button>
          </form>
        </div>

        {/* Recent Deposits */}
        {recentDeposits.length > 0 && (
          <div className="rounded-2xl shadow-xl p-4 sm:p-6" style={{ 
            background: brand.colors.surface,
            border: `1px solid ${brand.colors.primarySoft}`
          }}>
            <h3 className="font-semibold text-base sm:text-lg mb-4" style={{ color: brand.colors.text }}>📊 {t('deposit_history')}</h3>
            <div className="space-y-2 sm:space-y-3">
              {recentDeposits.map((deposit) => (
                <div key={deposit._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 sm:p-4 rounded-xl transition" style={{ 
                  background: brand.colors.surfaceAlt,
                  border: `1px solid ${brand.colors.primarySoft}`
                }}>
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="text-xl sm:text-2xl">
                      {deposit.depositType === 'crypto' ? cryptoIcons[deposit.currency] || '₿' : '🎁'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-base" style={{ color: brand.colors.text }}>
                        {deposit.amount} {deposit.currency}
                      </p>
                      <p className="text-xs sm:text-sm" style={{ color: brand.colors.textMuted }}>
                        {new Date(deposit.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(deposit.status)}`}>
                    {deposit.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deposit;