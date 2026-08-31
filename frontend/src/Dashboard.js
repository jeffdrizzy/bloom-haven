import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from './services/api';
import api from './services/api';
import { brand } from './brand';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState({ fiatBalance: 0, cryptoBalances: {} });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      const [profileRes, balanceRes, transactionsRes, marketRes] = await Promise.all([
        api.get('/profile'),
        api.get('/balance'),
        api.get('/transactions').catch(() => ({ data: [] })),
        fetchMarketData(),
      ]);

      const profileData = profileRes.data;
      const balanceData = balanceRes.data;

      setUser(prev => ({
        ...prev,
        ...profileData,
        fullName: profileData.fullName || prev?.fullName || 'User',
        email: profileData.email || prev?.email || '',
        isApproved: profileData.isApproved !== undefined ? profileData.isApproved : prev?.isApproved,
      }));

      setBalance({
        fiatBalance: balanceData?.fiatBalance || 0,
        cryptoBalances: balanceData?.cryptoBalances || {},
      });

      setRecentTransactions(transactionsRes.data?.slice(0, 5) || []);
      setMarketData(marketRes || []);
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load some data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,bnb,solana,cardano&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await response.json();
      
      return [
        { name: 'Bitcoin', symbol: 'BTC', price: data.bitcoin?.usd || 0, change: data.bitcoin?.usd_24h_change || 0 },
        { name: 'Ethereum', symbol: 'ETH', price: data.ethereum?.usd || 0, change: data.ethereum?.usd_24h_change || 0 },
        { name: 'Tether', symbol: 'USDT', price: data.tether?.usd || 1, change: data.tether?.usd_24h_change || 0 },
        { name: 'BNB', symbol: 'BNB', price: data.bnb?.usd || 0, change: data.bnb?.usd_24h_change || 0 },
        { name: 'Solana', symbol: 'SOL', price: data.solana?.usd || 0, change: data.solana?.usd_24h_change || 0 },
        { name: 'Cardano', symbol: 'ADA', price: data.cardano?.usd || 0, change: data.cardano?.usd_24h_change || 0 },
      ];
    } catch (error) {
      console.error('Market data error:', error);
      return [
        { name: 'Bitcoin', symbol: 'BTC', price: 65432, change: 2.5 },
        { name: 'Ethereum', symbol: 'ETH', price: 3456, change: -1.2 },
        { name: 'Tether', symbol: 'USDT', price: 1, change: 0.01 },
        { name: 'BNB', symbol: 'BNB', price: 587, change: 3.1 },
        { name: 'Solana', symbol: 'SOL', price: 172, change: 5.6 },
        { name: 'Cardano', symbol: 'ADA', price: 0.45, change: -0.8 },
      ];
    }
  };

  const toggleBalance = () => {
    setShowBalance(!showBalance);
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

  const totalBalance = (balance?.fiatBalance || 0) + Object.values(balance?.cryptoBalances || {}).reduce((sum, val) => sum + val, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.colors.background }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🌸</div>
          <p style={{ color: brand.colors.textLight }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const userName = user?.fullName || 'User';
  const userEmail = user?.email || '';
  const isApproved = user?.isApproved || false;
  const fiatBalance = balance?.fiatBalance || 0;
  const cryptoBalances = balance?.cryptoBalances || {};

  return (
    <div className="min-h-screen" style={{ background: brand.colors.background }}>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mt-4">
          {error && (
            <div className="border-l-4 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base" style={{
              backgroundColor: '#FDF2F2',
              borderColor: brand.colors.error,
              color: brand.colors.error
            }}>
              {error}
            </div>
          )}

          {/* Welcome Section */}
          <div className="rounded-2xl shadow-lg p-6 sm:p-8 mb-6 text-white" style={{ background: brand.gradients.primary }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  Welcome back, {userName}! 🌸
                </h2>
                <p className="text-sm sm:text-base mt-1 opacity-90">
                  {userEmail} • Status: {isApproved ? '✅ Approved' : '⏳ Pending Approval'}
                </p>
                
                <div className="mt-4 flex items-center gap-3">
                  <div>
                    <p className="text-xs sm:text-sm opacity-80">Total Balance</p>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {showBalance ? `$${totalBalance.toFixed(2)}` : '••••••••'}
                    </p>
                  </div>
                  <button
                    onClick={toggleBalance}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-lg sm:text-xl"
                    title={showBalance ? 'Hide Balance' : 'Show Balance'}
                  >
                    {showBalance ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
  {[
    { path: '/deposit', icon: '💳', label: 'Deposit', sub: 'Add funds' },
    { path: '/withdraw', icon: '🏦', label: 'Withdraw', sub: 'Withdraw funds' },
    { path: '/transactions', icon: '📊', label: 'History', sub: 'View transactions' },
    { path: '/profile', icon: '⚙️', label: 'Profile', sub: 'Manage account' },
  ].map((item) => (
    <button
      key={item.path}
      onClick={() => navigate(item.path)}
      className="rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-xl transition text-center cursor-pointer"
      style={{ background: brand.colors.surface }}
    >
      <div className="text-2xl sm:text-3xl mb-1">{item.icon}</div>
      <h3 className="font-semibold text-sm sm:text-base" style={{ color: brand.colors.text }}>{item.label}</h3>
      <p className="text-xs sm:text-sm" style={{ color: brand.colors.textMuted }}>{item.sub}</p>
    </button>
  ))}
</div>

          {/* Asset Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="rounded-2xl shadow-lg p-4 sm:p-6" style={{ background: brand.colors.surface }}>
              <h3 className="text-xs sm:text-sm mb-2" style={{ color: brand.colors.textMuted }}>💰 Fiat Balance</h3>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: brand.colors.text }}>
                {showBalance ? `$${fiatBalance.toFixed(2)}` : '••••••••'}
              </p>
            </div>

            {Object.entries(cryptoBalances).length > 0 ? (
              Object.entries(cryptoBalances).map(([currency, amount]) => {
                const icon = currency === 'BTC' ? '₿' : currency === 'ETH' ? '⟠' : currency === 'USDT' ? '₮' : '◆';
                return (
                  <div key={currency} className="rounded-2xl shadow-lg p-4 sm:p-6" style={{ background: brand.colors.surface }}>
                    <h3 className="text-xs sm:text-sm mb-2" style={{ color: brand.colors.primary }}>{icon} {currency}</h3>
                    <p className="text-xl sm:text-2xl font-bold" style={{ color: brand.colors.text }}>
                      {showBalance ? (amount || 0) : '••••••••'}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl shadow-lg p-4 sm:p-6 col-span-2" style={{ background: brand.colors.surface }}>
                <h3 className="text-xs sm:text-sm mb-2" style={{ color: brand.colors.textMuted }}>₿ Crypto Balances</h3>
                <p style={{ color: brand.colors.textMuted }}>No crypto balances yet</p>
              </div>
            )}
          </div>

          {/* Live Market Data */}
          <div className="rounded-2xl shadow-lg p-4 sm:p-6 mb-6" style={{ background: brand.colors.surface }}>
            <h3 className="font-semibold text-base sm:text-lg mb-4" style={{ color: brand.colors.text }}>📈 Live Market Prices</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
              {marketData.map((item) => (
                <div key={item.symbol} className="rounded-xl p-2 sm:p-4 text-center transition hover:shadow-md" style={{ background: brand.colors.surfaceAlt }}>
                  <p className="font-bold text-sm sm:text-base" style={{ color: brand.colors.text }}>{item.symbol}</p>
                  <p className="text-xs sm:text-sm" style={{ color: brand.colors.textLight }}>${item.price.toFixed(2)}</p>
                  <p className={`text-xs sm:text-sm font-semibold ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[10px] sm:text-xs text-center mt-4" style={{ color: brand.colors.textMuted }}>Live prices from CoinGecko • Updated in real-time</p>
          </div>

          {/* Recent Transactions */}
          {recentTransactions.length > 0 && (
            <div className="rounded-2xl shadow-lg p-4 sm:p-6" style={{ background: brand.colors.surface }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-base sm:text-lg" style={{ color: brand.colors.text }}>📊 Recent Transactions</h3>
                <button
                  onClick={() => navigate('/transactions')}
                  className="text-xs sm:text-sm font-medium transition hover:opacity-80"
                  style={{ color: brand.colors.primary }}
                >
                  View All →
                </button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {recentTransactions.map((tx) => {
                  const isDeposit = tx.type === 'deposit' || tx.depositType;
                  const isWithdraw = tx.type === 'withdraw' || tx.withdrawType;
                  const icon = isDeposit ? '💰' : isWithdraw ? '🏦' : '🔄';
                  const amount = tx.amount || 0;
                  const currency = tx.currency || 'USD';
                  const status = tx.status || 'pending';
                  const date = new Date(tx.createdAt || tx.date);
                  
                  return (
                    <div key={tx._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 sm:p-4 rounded-xl transition" style={{ background: brand.colors.surfaceAlt }}>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-xl sm:text-2xl">{icon}</div>
                        <div>
                          <p className="font-medium text-sm sm:text-base" style={{ color: brand.colors.text }}>
                            {isDeposit ? 'Deposit' : isWithdraw ? 'Withdrawal' : 'Transaction'}
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: brand.colors.textMuted }}>
                            {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <p className={`font-semibold text-sm sm:text-base ${isDeposit ? 'text-green-600' : isWithdraw ? 'text-red-600' : ''}`}>
                          {isDeposit ? '+' : isWithdraw ? '-' : ''}{showBalance ? amount : '••••'} {currency}
                        </p>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusColor(status)}`}>
                          {status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;