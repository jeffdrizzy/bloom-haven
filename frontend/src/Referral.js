import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';
import { brand } from './brand';

const Referral = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referralCount: 0,
    referralEarnings: 0,
    referralLink: '',
    referredUsers: [],
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await api.get('/referrals');
      setReferralData(response.data);
    } catch (error) {
      setError('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.colors.background }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🎁</div>
          <p style={{ color: brand.colors.textLight }}>Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: brand.colors.background }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: brand.colors.primary }}>🎁 Refer & Earn</h1>
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

        {error && (
          <div className="border-l-4 px-4 py-3 rounded-lg mb-6" style={{
            backgroundColor: '#FDF2F2',
            borderColor: brand.colors.error,
            color: brand.colors.error
          }}>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl shadow-lg p-6" style={{ background: brand.colors.surface }}>
            <h3 className="text-sm mb-2" style={{ color: brand.colors.textMuted }}>👥 Total Referrals</h3>
            <p className="text-3xl font-bold" style={{ color: brand.colors.text }}>
              {referralData.referralCount}
            </p>
          </div>
          <div className="rounded-2xl shadow-lg p-6" style={{ background: brand.colors.surface }}>
            <h3 className="text-sm mb-2" style={{ color: brand.colors.textMuted }}>💰 Total Earned</h3>
            <p className="text-3xl font-bold" style={{ color: brand.colors.success }}>
              ${referralData.referralEarnings.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="rounded-2xl shadow-lg p-6 mb-6" style={{ 
          background: brand.colors.surface,
          border: `1px solid ${brand.colors.primarySoft}`
        }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: brand.colors.text }}>
            🔗 Your Referral Link
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: brand.colors.textLight }}>
              Referral Code
            </label>
            <div className="p-4 rounded-xl font-mono text-2xl text-center font-bold" style={{
              background: brand.colors.creamSoft,
              color: brand.colors.primary,
              letterSpacing: '4px'
            }}>
              {referralData.referralCode || 'Generating...'}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: brand.colors.textLight }}>
              Share this link
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={referralData.referralLink}
                readOnly
                className="flex-1 px-4 py-3 rounded-xl text-sm"
                style={{
                  border: `2px solid ${brand.colors.primarySoft}`,
                  background: brand.colors.background,
                  color: brand.colors.text,
                }}
              />
              <button
                onClick={copyToClipboard}
                className="px-6 py-3 rounded-xl text-white font-semibold transition hover:opacity-90"
                style={{ background: brand.gradients.primary }}
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{
            background: brand.colors.creamSoft,
            border: `1px solid ${brand.colors.primarySoft}`
          }}>
            <p className="text-sm" style={{ color: brand.colors.text }}>
              💡 <strong>How it works:</strong>
            </p>
            <ul className="text-sm mt-2 space-y-1" style={{ color: brand.colors.textLight }}>
              <li>• Share your link with friends</li>
              <li>• They sign up using your link</li>
              <li>• Both of you get <strong>$5 bonus</strong> instantly!</li>
              <li>• No limit on referrals</li>
            </ul>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="rounded-2xl shadow-lg p-6 mb-6" style={{ background: brand.colors.surface }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: brand.colors.text }}>
            📤 Share via
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/?text=Join Bloom Haven and get $5 bonus! ${encodeURIComponent(referralData.referralLink)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
              style={{ background: '#25D366' }}
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=Join Bloom Haven and get $5 bonus!&url=${encodeURIComponent(referralData.referralLink)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
              style={{ background: '#1DA1F2' }}
            >
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralData.referralLink)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
              style={{ background: '#1877F2' }}
            >
              Facebook
            </a>
            <a
              href={`mailto:?subject=Join Bloom Haven&body=Join Bloom Haven and get $5 bonus! ${encodeURIComponent(referralData.referralLink)}`}
              className="px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
              style={{ background: brand.colors.primary }}
            >
              Email
            </a>
          </div>
        </div>

        {/* Referred Users */}
        {referralData.referredUsers.length > 0 && (
          <div className="rounded-2xl shadow-lg p-6" style={{ background: brand.colors.surface }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: brand.colors.text }}>
              👥 People You've Referred ({referralData.referredUsers.length})
            </h2>
            <div className="space-y-3">
              {referralData.referredUsers.map((user, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-4 rounded-xl" style={{
                  background: brand.colors.surfaceAlt,
                  border: `1px solid ${brand.colors.primarySoft}`
                }}>
                  <div>
                    <p className="font-medium" style={{ color: brand.colors.text }}>{user.fullName}</p>
                    <p className="text-sm" style={{ color: brand.colors.textMuted }}>{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: brand.colors.textMuted }}>
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isApproved ? '✅ Active' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referral;