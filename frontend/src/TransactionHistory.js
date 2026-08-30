import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from './services/api';
import { brand } from './brand';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const cryptoIcons = {
    BTC: '₿',
    ETH: '⟠',
    USDT: '₮',
    BNB: '◆',
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const [depositsRes, withdrawalsRes] = await Promise.all([
        api.get('/deposits'),
        api.get('/withdrawals'),
      ]);

      const deposits = depositsRes.data.map(d => ({
        ...d,
        type: 'deposit',
        displayType: 'Deposit',
        icon: d.depositType === 'crypto' ? '₿' : '🎁',
        date: new Date(d.createdAt),
      }));

      const withdrawals = withdrawalsRes.data.map(w => ({
        ...w,
        type: 'withdraw',
        displayType: 'Withdrawal',
        icon: w.withdrawType === 'crypto' ? '₿' : '💵',
        date: new Date(w.createdAt),
      }));

      const all = [...deposits, ...withdrawals].sort((a, b) => b.date - a.date);
      setTransactions(all);
    } catch (error) {
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'completed': return '✔️';
      default: return '❓';
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.colors.background }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p style={{ color: brand.colors.textLight }}>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: brand.colors.background }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: brand.colors.primary }}>📊 Transaction History</h1>
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

        {/* Filters */}
        <div className="rounded-2xl shadow-xl p-6 mb-6" style={{ 
          background: brand.colors.surface,
          border: `1px solid ${brand.colors.primarySoft}`
        }}>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', label: 'All' },
              { key: 'deposit', label: '💰 Deposits' },
              { key: 'withdraw', label: '🏦 Withdrawals' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  filter === item.key
                    ? 'text-white'
                    : 'hover:opacity-80'
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
          <p className="text-sm mt-3" style={{ color: brand.colors.textMuted }}>
            Showing {filteredTransactions.length} transaction(s)
          </p>
        </div>

        {error && (
          <div className="border-l-4 px-4 py-3 rounded-lg mb-6" style={{
            backgroundColor: '#FDF2F2',
            borderColor: brand.colors.error,
            color: brand.colors.error
          }}>
            {error}
          </div>
        )}

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="rounded-2xl shadow-xl p-12 text-center" style={{ 
            background: brand.colors.surface,
            border: `1px solid ${brand.colors.primarySoft}`
          }}>
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold" style={{ color: brand.colors.text }}>No Transactions Found</h3>
            <p style={{ color: brand.colors.textLight }}>Start depositing or withdrawing to see your history here.</p>
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('/deposit')}
                className="px-6 py-2 rounded-lg text-white font-semibold transition hover:scale-[1.02]"
                style={{ background: brand.gradients.primary }}
              >
                💰 Make a Deposit
              </button>
              <button
                onClick={() => navigate('/withdraw')}
                className="px-6 py-2 rounded-lg font-semibold transition hover:opacity-80"
                style={{
                  background: brand.colors.surfaceAlt,
                  color: brand.colors.primary,
                  border: `2px solid ${brand.colors.primary}`
                }}
              >
                🏦 Withdraw
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="rounded-2xl shadow-lg p-6 transition hover:shadow-xl"
                style={{ 
                  background: brand.colors.surface,
                  border: `1px solid ${brand.colors.primarySoft}`
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{
                      background: transaction.type === 'deposit' ? '#F0FDF4' : '#EFF6FF',
                    }}>
                      {transaction.icon}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: brand.colors.text }}>
                        {transaction.displayType}
                      </p>
                      <p className="text-sm" style={{ color: brand.colors.textMuted }}>
                        {new Date(transaction.date).toLocaleDateString()} at{' '}
                        {new Date(transaction.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      transaction.type === 'deposit'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount} {transaction.currency}
                    </p>
                    <p className="text-sm" style={{ color: brand.colors.textMuted }}>
                      {transaction.depositType || transaction.withdrawType}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)} {transaction.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {(transaction.walletAddress || transaction.bankName) && (
                  <div className="mt-3 pt-3 border-t text-sm" style={{ 
                    borderColor: brand.colors.primarySoft,
                    color: brand.colors.textMuted
                  }}>
                    {transaction.walletAddress && (
                      <p><span className="font-medium">Wallet:</span> {transaction.walletAddress}</p>
                    )}
                    {transaction.bankName && (
                      <p><span className="font-medium">Bank:</span> {transaction.bankName}</p>
                    )}
                    {transaction.adminNote && (
                      <p><span className="font-medium">Note:</span> {transaction.adminNote}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;