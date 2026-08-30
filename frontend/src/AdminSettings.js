import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';
import { brand } from './brand';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    siteName: 'Bloom Haven',
    siteTagline: 'Where Your Wealth Blossoms',
    cryptoAddresses: {
      BTC: '',
      ETH: '',
      USDT: '',
      BNB: '',
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      const data = response.data;
      
      // Extract crypto addresses
      const cryptoAddresses = {};
      const cryptos = ['BTC', 'ETH', 'USDT', 'BNB'];
      cryptos.forEach(crypto => {
        cryptoAddresses[crypto] = data[`crypto_address_${crypto}`] || '';
      });

      setSettings({
        maintenanceMode: data.maintenanceMode || false,
        siteName: data.siteName || 'Bloom Haven',
        siteTagline: data.siteTagline || 'Where Your Wealth Blossoms',
        cryptoAddresses: cryptoAddresses,
      });
    } catch (error) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/admin/settings', {
        maintenanceMode: settings.maintenanceMode,
        siteName: settings.siteName,
        siteTagline: settings.siteTagline,
        cryptoAddresses: settings.cryptoAddresses,
      });
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update settings');
    } finally {
      setUpdating(false);
    }
  };

  const handleCryptoChange = (currency, value) => {
    setSettings({
      ...settings,
      cryptoAddresses: {
        ...settings.cryptoAddresses,
        [currency]: value,
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.colors.background }}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <p style={{ color: brand.colors.textLight }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: brand.colors.background }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: brand.colors.primary }}>⚙️ Admin Settings</h1>
            <p className="text-sm" style={{ color: brand.colors.textLight }}>Manage system settings</p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-lg font-medium transition hover:opacity-80"
            style={{ 
              background: brand.colors.surfaceAlt,
              color: brand.colors.text
            }}
          >
            ← Back to Admin
          </button>
        </div>

        {error && (
          <div className="border-l-4 px-4 py-3 rounded-lg mb-4" style={{
            backgroundColor: '#FDF2F2',
            borderColor: brand.colors.error,
            color: brand.colors.error
          }}>
            {error}
          </div>
        )}
        {success && (
          <div className="border-l-4 px-4 py-3 rounded-lg mb-4" style={{
            backgroundColor: '#F0FDF4',
            borderColor: brand.colors.success,
            color: brand.colors.success
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Site Settings */}
          <div className="rounded-2xl shadow-lg p-6" style={{ 
            background: brand.colors.surface,
            border: `1px solid ${brand.colors.primarySoft}`
          }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: brand.colors.text }}>🌐 Site Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
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
                />
              </div>

              <div>
                <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>
                  Site Tagline
                </label>
                <input
                  type="text"
                  value={settings.siteTagline}
                  onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
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
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="w-5 h-5 rounded focus:ring-2"
                    style={{ accentColor: brand.colors.primary }}
                  />
                  <span style={{ color: brand.colors.text }}>Enable Maintenance Mode</span>
                </label>
                <span className="text-sm" style={{ color: brand.colors.textMuted }}>
                  (Users will see a maintenance page)
                </span>
              </div>
            </div>
          </div>

          {/* Crypto Addresses */}
          <div className="rounded-2xl shadow-lg p-6" style={{ 
            background: brand.colors.surface,
            border: `1px solid ${brand.colors.primarySoft}`
          }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: brand.colors.text }}>₿ Crypto Deposit Addresses</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['BTC', 'ETH', 'USDT', 'BNB'].map((currency) => (
                <div key={currency}>
                  <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>
                    {currency} Address
                  </label>
                  <input
                    type="text"
                    value={settings.cryptoAddresses[currency] || ''}
                    onChange={(e) => handleCryptoChange(currency, e.target.value)}
                    placeholder={`Enter ${currency} wallet address`}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
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
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={updating}
            className="w-full py-3 rounded-xl text-white font-semibold transition transform hover:scale-[1.02]"
            style={{
              background: brand.gradients.primary,
              opacity: updating ? 0.6 : 1,
              cursor: updating ? 'not-allowed' : 'pointer',
              boxShadow: `0 4px 14px ${brand.colors.primarySoft}`
            }}
          >
            {updating ? 'Saving...' : '💾 Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;