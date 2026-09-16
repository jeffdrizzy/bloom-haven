import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from './services/api';
import { brand } from './brand';
import {
  Receipt,
  ArrowLeft,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Filter,
} from './icons';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const [depositsRes, withdrawalsRes, swapsRes] = await Promise.all([
        api.get('/deposits').catch(() => ({ data: [] })),
        api.get('/withdrawals').catch(() => ({ data: [] })),
        api.get('/transactions').catch(() => ({ data: [] })),
      ]);

      const deposits = (depositsRes.data || []).map((d) => ({
        ...d,
        type: 'deposit',
        displayType: 'Deposit',
        date: new Date(d.createdAt),
      }));

      const withdrawals = (withdrawalsRes.data || []).map((w) => ({
        ...w,
        type: 'withdraw',
        displayType: 'Withdrawal',
        date: new Date(w.createdAt),
      }));

      const swaps = (swapsRes.data || [])
        .filter((tx) => tx.type === 'swap')
        .map((s) => ({
          ...s,
          type: 'swap',
          displayType: 'Swap',
          date: new Date(s.createdAt),
        }));

      const all = [...deposits, ...withdrawals, ...swaps].sort(
        (a, b) => b.date - a.date
      );
      setTransactions(all);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'approved':
        return CheckCircle2;
      case 'rejected':
        return XCircle;
      case 'completed':
        return CheckCircle2;
      default:
        return Clock;
    }
  };

  const getTxIcon = (type) => {
    if (type === 'deposit') return ArrowDownToLine;
    if (type === 'withdraw') return ArrowUpFromLine;
    if (type === 'swap') return ArrowLeftRight;
    return Receipt;
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: brand.colors.background }}
      >
        <div className="text-center">
          <Loader2
            size={40}
            className="animate-spin mx-auto mb-4"
            style={{ color: brand.colors.primary }}
          />
          <p style={{ color: brand.colors.textLight }}>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: brand.colors.background }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1
            className="text-2xl sm:text-3xl font-bold flex items-center gap-2"
            style={{ color: brand.colors.primary }}
          >
            <Receipt size={28} strokeWidth={2} />
            Transaction History
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg font-medium transition hover:opacity-80 flex items-center gap-2 w-full sm:w-auto justify-center"
            style={{ background: brand.colors.surfaceAlt, color: brand.colors.text }}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div
          className="rounded-2xl shadow-xl p-6 mb-6"
          style={{
            background: brand.colors.surface,
            border: `1px solid ${brand.colors.primarySoft}`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter size={18} strokeWidth={2} style={{ color: brand.colors.textMuted }} />
            <span className="text-sm font-medium" style={{ color: brand.colors.textMuted }}>
              Filter by
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', label: 'All', Icon: Receipt },
              { key: 'deposit', label: 'Deposits', Icon: ArrowDownToLine },
              { key: 'withdraw', label: 'Withdrawals', Icon: ArrowUpFromLine },
              { key: 'swap', label: 'Swaps', Icon: ArrowLeftRight },
            ].map((item) => {
              const IconComponent = item.Icon;
              const isActive = filter === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className="px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                  style={{
                    background: isActive ? brand.gradients.primary : brand.colors.surfaceAlt,
                    color: isActive ? 'white' : brand.colors.text,
                  }}
                >
                  <IconComponent size={16} strokeWidth={2} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <p className="text-sm mt-3" style={{ color: brand.colors.textMuted }}>
            Showing {filteredTransactions.length} transaction(s)
          </p>
        </div>

        {error && (
          <div
            className="border-l-4 px-4 py-3 rounded-lg mb-6 flex items-center gap-3"
            style={{
              backgroundColor: '#FDF2F2',
              borderColor: brand.colors.error,
              color: brand.colors.error,
            }}
          >
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div
            className="rounded-2xl shadow-xl p-12 text-center"
            style={{
              background: brand.colors.surface,
              border: `1px solid ${brand.colors.primarySoft}`,
            }}
          >
            <Receipt
              size={56}
              strokeWidth={1.2}
              style={{ color: brand.colors.textMuted, margin: '0 auto 16px' }}
            />
            <h3 className="text-xl font-semibold" style={{ color: brand.colors.text }}>
              No Transactions Found
            </h3>
            <p style={{ color: brand.colors.textLight }}>
              Start depositing or withdrawing to see your history here.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('/deposit')}
                className="px-6 py-2 rounded-lg text-white font-semibold transition hover:scale-[1.02] flex items-center gap-2"
                style={{ background: brand.gradients.primary }}
              >
                <ArrowDownToLine size={18} />
                Make a Deposit
              </button>
              <button
                onClick={() => navigate('/withdraw')}
                className="px-6 py-2 rounded-lg font-semibold transition hover:opacity-80 flex items-center gap-2"
                style={{
                  background: brand.colors.surfaceAlt,
                  color: brand.colors.primary,
                  border: `2px solid ${brand.colors.primary}`,
                }}
              >
                <ArrowUpFromLine size={18} />
                Withdraw
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const TxIcon = getTxIcon(transaction.type);
              const StatusIcon = getStatusIcon(transaction.status);

              const isDeposit = transaction.type === 'deposit';
              const isWithdraw = transaction.type === 'withdraw';
              const isSwap = transaction.type === 'swap';

              const iconColor = isDeposit
                ? brand.colors.success
                : isWithdraw
                ? brand.colors.error
                : isSwap
                ? brand.colors.primary
                : brand.colors.textLight;

              return (
                <div
                  key={transaction._id}
                  className="rounded-2xl shadow-lg p-6 transition hover:shadow-xl"
                  style={{
                    background: brand.colors.surface,
                    border: `1px solid ${brand.colors.primarySoft}`,
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${iconColor}15`, color: iconColor }}
                      >
                        <TxIcon size={22} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: brand.colors.text }}>
                          {transaction.displayType}
                        </p>
                        <p className="text-sm" style={{ color: brand.colors.textMuted }}>
                          {transaction.date.toLocaleDateString()} at{' '}
                          {transaction.date.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${
                          isDeposit
                            ? 'text-green-600'
                            : isWithdraw
                            ? 'text-red-600'
                            : isSwap
                            ? 'text-blue-600'
                            : ''
                        }`}
                      >
                        {isDeposit ? '+' : isWithdraw ? '-' : isSwap ? '⇄ ' : ''}
                        {transaction.amount} {transaction.currency}
                      </p>
                      <p className="text-sm" style={{ color: brand.colors.textMuted }}>
                        {transaction.depositType ||
                          transaction.withdrawType ||
                          transaction.type}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        <StatusIcon size={12} strokeWidth={2.5} />
                        {transaction.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {(transaction.walletAddress ||
                    transaction.bankName ||
                    transaction.adminNote) && (
                    <div
                      className="mt-3 pt-3 border-t text-sm space-y-1"
                      style={{
                        borderColor: brand.colors.primarySoft,
                        color: brand.colors.textMuted,
                      }}
                    >
                      {transaction.walletAddress && (
                        <p>
                          <span className="font-medium">Wallet:</span>{' '}
                          {transaction.walletAddress}
                        </p>
                      )}
                      {transaction.bankName && (
                        <p>
                          <span className="font-medium">Bank:</span> {transaction.bankName}
                        </p>
                      )}
                      {transaction.adminNote && (
                        <p>
                          <span className="font-medium">Note:</span>{' '}
                          {transaction.adminNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;