import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from './services/api';
import { brand } from './brand';

const Swap = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [swapLoading, setSwapLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [balance, setBalance] = useState({ fiatBalance: 0, cryptoBalances: {} });
  const [rates, setRates] = useState({});
  const [formData, setFormData] = useState({
    fromCurrency: 'USD',
    toCurrency: 'BTC',
    amount: '',
  });
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [conversionRate, setConversionRate] = useState(null);

  const currencies = ['USD', 'BTC', 'ETH', 'USDT', 'BNB'];
  
  const currencyIcons = {
    USD: '💵',
    BTC: '₿',
    ETH: '⟠',
    USDT: '₮',
    BNB: '◆',
  };

  const currencyColors = {
    USD: 'text-green-600',
    BTC: 'text-orange-500',
    ETH: 'text-purple-500',
    USDT: 'text-green-500',
    BNB: 'text-yellow-500',
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateConversion();
  }, [formData.fromCurrency, formData.toCurrency, formData.amount, rates]);

  const fetchData = async () => {
    try {
      const [balanceRes, ratesRes] = await Promise.all([
        api.get('/balance'),
        api.get('/swap/rates'),
      ]);
      
      setBalance(balanceRes.data);
      setRates(ratesRes.data);
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateConversion = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0 || !rates[formData.fromCurrency] || !rates[formData.toCurrency]) {
      setConvertedAmount(null);
      setConversionRate(null);
      return;
    }

    const fromRate = rates[formData.fromCurrency];
    const toRate = rates[formData.toCurrency];
    
    if (!fromRate || !toRate) return;
    
    const usdValue = parseFloat(formData.amount) * fromRate;
    const toAmount = usdValue / toRate;
    
    setConvertedAmount(toAmount);
    setConversionRate(toRate / fromRate);
  };

  const getMaxAmount = () => {
    if (formData.fromCurrency === 'USD') {
      return balance.fiatBalance || 0;
    } else {
      return balance.cryptoBalances[formData.fromCurrency] || 0;
    }
  };

  const handleSwapDirection = () => {
    setFormData({
      ...formData,
      fromCurrency: formData.toCurrency,
      toCurrency: formData.fromCurrency,
      amount: '',
    });
    setConvertedAmount(null);
    setConversionRate(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSwapLoading(true);
    setError('');
    setSuccess('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      setSwapLoading(false);
      return;
    }

    if (parseFloat(formData.amount) > getMaxAmount()) {
      setError(`Insufficient ${formData.fromCurrency} balance`);
      setSwapLoading(false);
      return;
    }

    if (formData.fromCurrency === formData.toCurrency) {
      setError('Cannot swap same currency');
      setSwapLoading(false);
      return;
    }

    try {
      const response = await api.post('/swap', {
        fromCurrency: formData.fromCurrency,
        toCurrency: formData.toCurrency,
        amount: parseFloat(formData.amount),
      });

      setSuccess(response.data.message);
      setFormData({ ...formData, amount: '' });
      setConvertedAmount(null);
      setConversionRate(null);
      fetchData();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Swap failed');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSwapLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.colors.background }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p style={{ color: brand.colors.textLight }}>Loading swap rates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: brand.colors.background }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: brand.colors.primary }}>🔄 Swap</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg font-medium transition hover:opacity-80"
            style={{ 
              background: brand.colors.surfaceAlt,
              color: brand.colors.text
            }}
          >
            ← Back
          </button>
        </div>

        {/* Swap Card */}
        <div className="rounded-2xl shadow-xl p-6 sm:p-8" style={{ 
          background: brand.colors.surface,
          border: `1px solid ${brand.colors.primarySoft}`
        }}>
          {error && (
            <div className="border-l-4 px-4 py-3 rounded-lg mb-6" style={{
              backgroundColor: '#FDF2F2',
              borderColor: brand.colors.error,
              color: brand.colors.error
            }}>
              {error}
            </div>
          )}

          {success && (
            <div className="border-l-4 px-4 py-3 rounded-lg mb-6" style={{
              backgroundColor: '#F0FDF4',
              borderColor: brand.colors.success,
              color: brand.colors.success
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* From Section */}
            <div>
              <label className="block font-medium mb-2" style={{ color: brand.colors.text }}>
                From
              </label>
              <div className="flex gap-3">
                <select
                  value={formData.fromCurrency}
                  onChange={(e) => setFormData({ ...formData, fromCurrency: e.target.value, amount: '' })}
                  className="flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                  style={{
                    border: `2px solid ${brand.colors.primarySoft}`,
                    background: brand.colors.background,
                    color: brand.colors.text,
                  }}
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>
                      {currencyIcons[curr]} {curr}
                    </option>
                  ))}
                </select>
                <div className="relative flex-2">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                    style={{
                      border: `2px solid ${brand.colors.primarySoft}`,
                      background: brand.colors.background,
                      color: brand.colors.text,
                    }}
                    placeholder="0.00"
                    min="0"
                    step="any"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: getMaxAmount().toString() })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded"
                    style={{ 
                      background: brand.colors.primarySoft,
                      color: brand.colors.primary
                    }}
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="mt-1 text-right">
                <span className="text-xs" style={{ color: brand.colors.textMuted }}>
                  Balance: {getMaxAmount()} {formData.fromCurrency}
                </span>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapDirection}
                className="p-3 rounded-full transition hover:scale-110"
                style={{
                  background: brand.colors.creamSoft,
                  color: brand.colors.primary,
                }}
              >
                <span className="text-2xl">⇅</span>
              </button>
            </div>

            {/* To Section */}
            <div>
              <label className="block font-medium mb-2" style={{ color: brand.colors.text }}>
                To
              </label>
              <div className="flex gap-3">
                <select
                  value={formData.toCurrency}
                  onChange={(e) => setFormData({ ...formData, toCurrency: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                  style={{
                    border: `2px solid ${brand.colors.primarySoft}`,
                    background: brand.colors.background,
                    color: brand.colors.text,
                  }}
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>
                      {currencyIcons[curr]} {curr}
                    </option>
                  ))}
                </select>
                <div className="flex-2 px-4 py-3 rounded-xl" style={{
                  border: `2px solid ${brand.colors.primarySoft}`,
                  background: brand.colors.surfaceAlt,
                  color: brand.colors.text,
                }}>
                  {convertedAmount !== null ? (
                    <span className="font-semibold">
                      {convertedAmount.toFixed(6)} {formData.toCurrency}
                    </span>
                  ) : (
                    <span style={{ color: brand.colors.textMuted }}>0.00</span>
                  )}
                </div>
              </div>
              {conversionRate !== null && (
                <div className="mt-1 text-center">
                  <span className="text-xs" style={{ color: brand.colors.textMuted }}>
                    1 {formData.fromCurrency} = {conversionRate.toFixed(6)} {formData.toCurrency}
                  </span>
                </div>
              )}
            </div>

            {/* Live Rate Info */}
            <div className="p-4 rounded-xl" style={{ 
              background: brand.colors.surfaceAlt,
              border: `1px solid ${brand.colors.primarySoft}`
            }}>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: brand.colors.textMuted }}>Live Exchange Rate</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span style={{ color: brand.colors.textMuted }}>Live</span>
                </span>
              </div>
              <p className="text-lg font-semibold mt-1" style={{ color: brand.colors.text }}>
                1 {formData.fromCurrency} = {rates[formData.toCurrency] ? (rates[formData.toCurrency] / rates[formData.fromCurrency]).toFixed(6) : '...'} {formData.toCurrency}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={swapLoading || !formData.amount || parseFloat(formData.amount) <= 0}
              className="w-full py-4 rounded-xl text-white font-bold text-lg transition transform hover:scale-[1.02]"
              style={{
                background: brand.gradients.primary,
                opacity: swapLoading || !formData.amount || parseFloat(formData.amount) <= 0 ? 0.6 : 1,
                cursor: swapLoading || !formData.amount || parseFloat(formData.amount) <= 0 ? 'not-allowed' : 'pointer',
                boxShadow: `0 4px 20px ${brand.colors.primarySoft}`
              }}
            >
              {swapLoading ? 'Processing Swap...' : '🔄 Swap Now'}
            </button>
          </form>
        </div>

        {/* Supported Currencies */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: brand.colors.textMuted }}>
            Supported: 💵 USD • ₿ BTC • ⟠ ETH • ₮ USDT • ◆ BNB
          </p>
          <p className="text-xs mt-1" style={{ color: brand.colors.textMuted }}>
            Real-time prices from CoinGecko • No hidden fees
          </p>
        </div>
      </div>
    </div>
  );
};

export default Swap;