import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from './services/api';
import { brand } from './brand';
import {
  ArrowLeftRight,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
  CircleDollarSign,
  TrendingUp,
  getCryptoIcon,
} from './icons';

const Swap = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [swapLoading, setSwapLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [balance, setBalance] = useState({ fiatBalance: 0, cryptoBalances: {} });
  const [rates, setRates] = useState({});
  const [swapFee, setSwapFee] = useState(0.5);
  const [formData, setFormData] = useState({
    fromCurrency: 'USD',
    toCurrency: 'BTC',
    amount: '',
  });
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [conversionRate, setConversionRate] = useState(null);

  const currencies = ['USD', 'BTC', 'ETH', 'USDT', 'BNB'];

  const currencyColors = {
    USD: '#16a34a',
    BTC: '#f97316',
    ETH: '#a855f7',
    USDT: '#22c55e',
    BNB: '#eab308',
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateConversion();
  }, [formData.fromCurrency, formData.toCurrency, formData.amount, rates]);

  const fetchData = async () => {
    try {
      const [balanceRes, ratesRes, settingsRes] = await Promise.all([
        api.get('/balance'),
        api.get('/swap/rates'),
        api.get('/settings').catch(() => ({ data: {} })),
      ]);

      setBalance(balanceRes.data);
      setRates(ratesRes.data);
      if (settingsRes.data.swapFee !== undefined) {
        setSwapFee(settingsRes.data.swapFee);
      }
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateConversion = () => {
    if (
      !formData.amount ||
      parseFloat(formData.amount) <= 0 ||
      !rates[formData.fromCurrency] ||
      !rates[formData.toCurrency]
    ) {
      setConvertedAmount(null);
      setConversionRate(null);
      return;
    }

    const fromRate = rates[formData.fromCurrency];
    const toRate = rates[formData.toCurrency];

    if (!fromRate || !toRate) return;

    const usdValue = parseFloat(formData.amount) * fromRate;
    const feeAmount = (usdValue * swapFee) / 100;
    const netUsdValue = usdValue - feeAmount;
    const toAmount = netUsdValue / toRate;

    setConvertedAmount(toAmount);
    setConversionRate(toRate / fromRate);
  };

  const getMaxAmount = () => {
    if (formData.fromCurrency === 'USD') return balance.fiatBalance || 0;
    return balance.cryptoBalances[formData.fromCurrency] || 0;
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

  const getCurrencyIcon = (currency) => {
    if (currency === 'USD') return CircleDollarSign;
    return getCryptoIcon(currency);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.colors.background }}>
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: brand.colors.primary }} />
          <p style={{ color: brand.colors.textLight }}>Loading swap rates...</p>
        </div>
      </div>
    );
  }

  const FromIcon = getCurrencyIcon(formData.fromCurrency);
  const ToIcon = getCurrencyIcon(formData.toCurrency);

  const feeAmount = formData.amount
    ? (parseFloat(formData.amount) * rates[formData.fromCurrency] * swapFee) / 100
    : 0;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: brand.colors.background }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2" style={{ color: brand.colors.primary }}>
            <ArrowLeftRight size={28} strokeWidth={2} />
            Swap
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg font-medium transition hover:opacity-80 flex items-center gap-2 w-full sm:w-auto justify-center"
            style={{ background: brand.colors.surfaceAlt, color: brand.colors.text }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* Swap Card */}
        <div className="rounded-2xl shadow-xl p-6 sm:p-8" style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}>
          {error && (
            <div className="border-l-4 px-4 py-3 rounded-lg mb-6 flex items-center gap-3" style={{ backgroundColor: '#FDF2F2', borderColor: brand.colors.error, color: brand.colors.error }}>
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="border-l-4 px-4 py-3 rounded-lg mb-6 flex items-center gap-3" style={{ backgroundColor: '#F0FDF4', borderColor: brand.colors.success, color: brand.colors.success }}>
              <CheckCircle2 size={20} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* From Section */}
            <div>
              <label className="block font-medium mb-2" style={{ color: brand.colors.text }}>
                From
              </label>
              <div className="flex gap-3 flex-col sm:flex-row">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <FromIcon size={20} strokeWidth={1.8} style={{ color: currencyColors[formData.fromCurrency] }} />
                  </div>
                  <select
                    value={formData.fromCurrency}
                    onChange={(e) => setFormData({ ...formData, fromCurrency: e.target.value, amount: '' })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition appearance-none cursor-pointer"
                    style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                    onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                    onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                  >
                    {currencies.map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 pr-16 rounded-xl focus:outline-none focus:ring-2 transition"
                    style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                    onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                    onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                    placeholder="0.00"
                    min="0"
                    step="any"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: getMaxAmount().toString() })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 rounded"
                    style={{ background: brand.colors.primarySoft, color: brand.colors.primary }}
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
                style={{ background: brand.colors.creamSoft, color: brand.colors.primary }}
                aria-label="Swap direction"
              >
                <RefreshCw size={22} strokeWidth={2.2} />
              </button>
            </div>

            {/* To Section */}
            <div>
              <label className="block font-medium mb-2" style={{ color: brand.colors.text }}>
                To
              </label>
              <div className="flex gap-3 flex-col sm:flex-row">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <ToIcon size={20} strokeWidth={1.8} style={{ color: currencyColors[formData.toCurrency] }} />
                  </div>
                  <select
                    value={formData.toCurrency}
                    onChange={(e) => setFormData({ ...formData, toCurrency: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition appearance-none cursor-pointer"
                    style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                    onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                    onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                  >
                    {currencies.map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 px-4 py-3 rounded-xl flex items-center" style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.surfaceAlt, color: brand.colors.text }}>
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

            {/* Fee Breakdown */}
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <div className="p-4 rounded-xl space-y-1" style={{ background: brand.colors.creamSoft, border: `1px solid ${brand.colors.primarySoft}` }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: brand.colors.textLight }}>Amount</span>
                  <span style={{ color: brand.colors.text }}>{formData.amount} {formData.fromCurrency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: brand.colors.textLight }}>Swap Fee ({swapFee}%)</span>
                  <span style={{ color: brand.colors.text }}>${feeAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1 border-t" style={{ borderColor: brand.colors.primarySoft }}>
                  <span style={{ color: brand.colors.text }}>You'll receive</span>
                  <span style={{ color: brand.colors.primary }}>
                    {convertedAmount !== null ? `${convertedAmount.toFixed(6)} ${formData.toCurrency}` : '...'}
                  </span>
                </div>
              </div>
            )}

            {/* Live Rate Info */}
            <div className="p-4 rounded-xl" style={{ background: brand.colors.surfaceAlt, border: `1px solid ${brand.colors.primarySoft}` }}>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-1.5" style={{ color: brand.colors.textMuted }}>
                  <TrendingUp size={14} strokeWidth={1.8} />
                  Live Exchange Rate
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span style={{ color: brand.colors.textMuted }}>Live</span>
                </span>
              </div>
              <p className="text-lg font-semibold mt-1" style={{ color: brand.colors.text }}>
                1 {formData.fromCurrency} ={' '}
                {rates[formData.toCurrency]
                  ? (rates[formData.toCurrency] / rates[formData.fromCurrency]).toFixed(6)
                  : '...'}{' '}
                {formData.toCurrency}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={swapLoading || !formData.amount || parseFloat(formData.amount) <= 0}
              className="w-full py-4 rounded-xl text-white font-bold text-lg transition transform hover:scale-[1.02]"
              style={{
                background: brand.gradients.primary,
                opacity: swapLoading || !formData.amount || parseFloat(formData.amount) <= 0 ? 0.6 : 1,
                cursor: swapLoading || !formData.amount || parseFloat(formData.amount) <= 0 ? 'not-allowed' : 'pointer',
                boxShadow: `0 4px 20px ${brand.colors.primarySoft}`,
              }}
            >
              {swapLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  Processing Swap...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeftRight size={20} />
                  Swap Now
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Supported Info */}
        <div className="mt-6 text-center">
          <p className="text-sm flex items-center justify-center gap-1.5" style={{ color: brand.colors.textMuted }}>
            <Info size={14} strokeWidth={1.8} />
            Real-time prices from CoinGecko • No hidden fees
          </p>
        </div>
      </div>
    </div>
  );
};

export default Swap;