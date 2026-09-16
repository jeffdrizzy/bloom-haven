import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';
import { brand } from './brand';
import {
  Crown,
  Mail,
  Lock,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from './icons';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/admin/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...response.data.admin,
          role: 'admin',
        })
      );
      navigate('/admin');
    } catch (error) {
      setError(error.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: brand.colors.background }}
    >
      <div
        className="max-w-md w-full rounded-2xl shadow-xl p-8"
        style={{
          background: brand.colors.surface,
          border: `1px solid ${brand.colors.primarySoft}`,
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: brand.colors.creamSoft }}
          >
            <Crown size={40} strokeWidth={2} style={{ color: brand.colors.primary }} />
          </div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: brand.colors.primary }}
          >
            Bloom Haven
          </h1>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-2"
            style={{ background: brand.colors.creamSoft, color: brand.colors.primary }}
          >
            <ShieldCheck size={14} strokeWidth={2} />
            <span className="text-sm font-semibold">Admin Panel</span>
          </div>
        </div>

        {error && (
          <div
            className="border-l-4 px-4 py-3 rounded-lg mb-4 flex items-center gap-3"
            style={{
              backgroundColor: '#FDF2F2',
              borderColor: brand.colors.error,
              color: brand.colors.error,
            }}
          >
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block font-medium mb-2 flex items-center gap-2"
              style={{ color: brand.colors.text }}
            >
              <Mail size={16} strokeWidth={2} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
              style={{
                border: `2px solid ${brand.colors.primarySoft}`,
                backgroundColor: brand.colors.background,
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
              placeholder="admin@bloomhaven.com"
            />
          </div>

          <div>
            <label
              className="block font-medium mb-2 flex items-center gap-2"
              style={{ color: brand.colors.text }}
            >
              <Lock size={16} strokeWidth={2} />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-2 transition"
                style={{
                  border: `2px solid ${brand.colors.primarySoft}`,
                  backgroundColor: brand.colors.background,
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
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition"
                style={{ color: brand.colors.textMuted }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
            style={{
              background: brand.gradients.primary,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: `0 4px 14px ${brand.colors.primarySoft}`,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <Crown size={18} />
                Admin Login
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: brand.colors.textLight }}>
            Not an admin?{' '}
            <a
              href="/login"
              className="font-semibold transition hover:opacity-80"
              style={{ color: brand.colors.primary }}
            >
              User Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;