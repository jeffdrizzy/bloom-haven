import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from './services/api';
import { brand } from './brand';
import {
  User,
  Mail,
  Lock,
  Phone,
  Gift,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
} from './icons';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Auto-fill referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode.toUpperCase() }));
    }
  }, []);

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
    setSuccess('');

    try {
      const response = await authService.register(formData);
      setSuccess(response.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: brand.colors.background }}
    >
      <div
        className="max-w-md w-full rounded-2xl shadow-xl p-8"
        style={{
          background: brand.colors.surface,
          border: `1px solid ${brand.colors.primarySoft}`,
        }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <span className="text-5xl">🌸</span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: brand.colors.primary }}>
            Bloom Haven
          </h1>
          <p className="text-lg" style={{ color: brand.colors.textLight }}>
            Create your account
          </p>
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

        {success && (
          <div
            className="border-l-4 px-4 py-3 rounded-lg mb-4 flex items-center gap-3"
            style={{
              backgroundColor: '#F0FDF4',
              borderColor: brand.colors.success,
              color: brand.colors.success,
            }}
          >
            <CheckCircle2 size={20} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block font-medium mb-2 flex items-center gap-2"
              style={{ color: brand.colors.text }}
            >
              <User size={16} strokeWidth={2} />
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
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
              placeholder="John Doe"
            />
          </div>

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
              placeholder="your@email.com"
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
                placeholder="Min 6 characters"
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

          <div>
            <label
              className="block font-medium mb-2 flex items-center gap-2"
              style={{ color: brand.colors.text }}
            >
              <Phone size={16} strokeWidth={2} />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
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
              placeholder="1234567890"
            />
          </div>

          <div>
            <label
              className="block font-medium mb-2 flex items-center gap-2"
              style={{ color: brand.colors.text }}
            >
              <Gift size={16} strokeWidth={2} />
              Referral Code (Optional)
            </label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition uppercase"
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
              placeholder="e.g., BHABC123"
            />
            <p className="text-xs mt-1" style={{ color: brand.colors.textMuted }}>
              Got a referral code? Enter it to get $5 bonus!
            </p>
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
                Registering...
              </>
            ) : (
              <>
                Register
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: brand.colors.textLight }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold transition hover:opacity-80"
              style={{ color: brand.colors.primary }}
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;