import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from './services/api';
import { brand } from './brand';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      }, 2000);
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
      <div className="max-w-md w-full rounded-2xl shadow-xl p-8" style={{ 
        background: brand.colors.surface,
        border: `1px solid ${brand.colors.primarySoft}`
      }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <span className="text-5xl">🌱</span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: brand.colors.primary }}>
            Bloom Haven
          </h1>
          <p className="text-lg" style={{ color: brand.colors.textLight }}>
            Create your account
          </p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-2" style={{ color: brand.colors.text }}>
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
            <label className="block font-medium mb-2" style={{ color: brand.colors.text }}>
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
            <label className="block font-medium mb-2" style={{ color: brand.colors.text }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
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
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="block font-medium mb-2" style={{ color: brand.colors.text }}>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold transition transform hover:scale-[1.02]"
            style={{
              background: brand.gradients.primary,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: `0 4px 14px ${brand.colors.primarySoft}`
            }}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: brand.colors.textLight }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold transition hover:opacity-80" style={{ color: brand.colors.primary }}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;