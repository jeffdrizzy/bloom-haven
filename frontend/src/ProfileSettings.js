import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from './services/api';
import { brand } from './brand';
import {
  User,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Camera,
  Save,
  KeyRound,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Info,
  Calendar,
  FileText,
} from './icons';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', country: '', zipCode: '' },
    contact: { email: '', phone: '' },
    profilePicture: '',
    kyc: { status: 'not_submitted', governmentId: '', idType: '', idNumber: '', adminNote: '' },
    withdrawalPin: '',
    pinIssued: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [kycData, setKycData] = useState({
    idType: 'passport',
    idNumber: '',
    governmentId: null,
  });

  const [imagePreview, setImagePreview] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
      if (response.data.profilePicture) {
        setImagePreview(response.data.profilePicture);
      }
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/profile', {
        fullName: profile.fullName,
        address: profile.address,
        contact: profile.contact,
      });
      setSuccess(response.data.message);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, GIF, or WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      await api.post('/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Profile picture updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload picture');
    }
  };

  const handleKYCSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    if (!kycData.governmentId) {
      setError('Please upload your government ID');
      setUpdating(false);
      return;
    }

    const formData = new FormData();
    formData.append('idType', kycData.idType);
    formData.append('idNumber', kycData.idNumber);
    formData.append('governmentId', kycData.governmentId);

    try {
      const response = await api.post('/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(response.data.message);
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setUpdating(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setUpdating(false);
      return;
    }

    try {
      const response = await api.put('/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess(response.data.message);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  const getKYCStatusBadge = () => {
    const status = profile.kyc?.status || 'not_submitted';
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  const getKYCStatusText = () => {
    const status = profile.kyc?.status || 'not_submitted';
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Submitted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.colors.background }}>
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: brand.colors.primary }} />
          <p style={{ color: brand.colors.textLight }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: brand.colors.background }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2" style={{ color: brand.colors.primary }}>
            <User size={28} strokeWidth={2} />
            Profile Settings
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

        {error && (
          <div className="border-l-4 px-4 py-3 rounded-lg mb-4 flex items-center gap-3" style={{ backgroundColor: '#FDF2F2', borderColor: brand.colors.error, color: brand.colors.error }}>
            <AlertTriangle size={20} />
            {error}
          </div>
        )}
        {success && (
          <div className="border-l-4 px-4 py-3 rounded-lg mb-4 flex items-center gap-3" style={{ backgroundColor: '#F0FDF4', borderColor: brand.colors.success, color: brand.colors.success }}>
            <CheckCircle2 size={20} />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl shadow-lg p-4 sticky top-4" style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}>
              <div className="flex flex-col gap-2">
                {[
                  { key: 'profile', Icon: User, label: 'Profile' },
                  { key: 'kyc', Icon: ShieldCheck, label: 'KYC Verification' },
                  { key: 'security', Icon: Lock, label: 'Security' },
                ].map((tab) => {
                  const IconComponent = tab.Icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-3 rounded-xl text-left font-medium transition flex items-center gap-3 ${
                        isActive ? 'text-white' : ''
                      }`}
                      style={{
                        background: isActive ? brand.gradients.primary : 'transparent',
                        color: isActive ? 'white' : brand.colors.text,
                      }}
                    >
                      <IconComponent size={20} strokeWidth={2} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="rounded-2xl shadow-xl p-6" style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: brand.colors.text }}>
                  <User size={22} strokeWidth={2} />
                  Profile Information
                </h2>

                {/* Profile Picture */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <img
                      src={imagePreview || 'https://ui-avatars.com/api/?name=' + profile.fullName + '&background=8A9A7F&color=fff&size=100'}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4"
                      style={{ borderColor: brand.colors.primary }}
                    />
                    <label
                      htmlFor="profilePictureInput"
                      className="absolute bottom-0 right-0 p-1.5 rounded-full cursor-pointer transition hover:opacity-80"
                      style={{ background: brand.gradients.primary }}
                    >
                      <Camera size={16} style={{ color: 'white' }} />
                    </label>
                    <input
                      id="profilePictureInput"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p style={{ color: brand.colors.textLight }}>Click the camera icon to upload a profile picture</p>
                    <p className="text-sm" style={{ color: brand.colors.textMuted }}>JPEG, PNG, GIF, WEBP (Max 5MB)</p>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>Full Name</label>
                    <input
                      type="text"
                      value={profile.fullName || ''}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                      style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                      onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                      onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>Email</label>
                      <input
                        type="email"
                        value={profile.contact?.email || profile.email || ''}
                        onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, email: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                        style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                        onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                        onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>Phone</label>
                      <input
                        type="tel"
                        value={profile.contact?.phone || profile.phone || ''}
                        onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, phone: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                        style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                        onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                        onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>Street Address</label>
                    <input
                      type="text"
                      value={profile.address?.street || ''}
                      onChange={(e) => setProfile({ ...profile, address: { ...profile.address, street: e.target.value } })}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                      style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                      onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                      onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>City</label>
                      <input
                        type="text"
                        value={profile.address?.city || ''}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                        style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                        onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                        onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>State/Province</label>
                      <input
                        type="text"
                        value={profile.address?.state || ''}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, state: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                        style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                        onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                        onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>Country</label>
                      <input
                        type="text"
                        value={profile.address?.country || ''}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, country: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                        style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                        onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                        onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>Zip Code</label>
                      <input
                        type="text"
                        value={profile.address?.zipCode || ''}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, zipCode: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                        style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                        onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                        onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full py-3 rounded-xl text-white font-semibold transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    style={{
                      background: brand.gradients.primary,
                      opacity: updating ? 0.6 : 1,
                      cursor: updating ? 'not-allowed' : 'pointer',
                      boxShadow: `0 4px 14px ${brand.colors.primarySoft}`,
                    }}
                  >
                    {updating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Update Profile
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* KYC Tab */}
            {activeTab === 'kyc' && (
              <div className="rounded-2xl shadow-xl p-6" style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: brand.colors.text }}>
                  <ShieldCheck size={22} strokeWidth={2} />
                  KYC Verification
                </h2>

                <div className={`p-4 rounded-xl border-2 mb-6 ${getKYCStatusBadge()}`}>
                  <p className="font-semibold">Status: {getKYCStatusText()}</p>
                  {profile.kyc?.adminNote && <p className="text-sm mt-1">Admin Note: {profile.kyc.adminNote}</p>}
                  {profile.kyc?.verifiedAt && (
                    <p className="text-sm mt-1">Verified on: {new Date(profile.kyc.verifiedAt).toLocaleDateString()}</p>
                  )}
                </div>

                {profile.kyc?.status === 'verified' ? (
                  <div className="text-center py-8">
                    <CheckCircle2 size={64} strokeWidth={1.2} style={{ color: brand.colors.success, margin: '0 auto 16px' }} />
                    <h3 className="text-xl font-semibold" style={{ color: brand.colors.success }}>KYC Verified</h3>
                    <p style={{ color: brand.colors.textLight }}>Your identity has been verified</p>
                  </div>
                ) : (
                  <form onSubmit={handleKYCSubmit} className="space-y-4">
                    <div>
                      <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>ID Type</label>
                      <select
                        value={kycData.idType}
                        onChange={(e) => setKycData({ ...kycData, idType: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                        style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                        onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                        onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                      >
                        <option value="passport">Passport</option>
                        <option value="drivers_license">Driver's License</option>
                        <option value="national_id">National ID</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium mb-1" style={{ color: brand.colors.text }}>ID Number</label>
                      <input
                        type="text"
                        value={kycData.idNumber}
                        onChange={(e) => setKycData({ ...kycData, idNumber: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                        style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                        onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                        onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                        placeholder="Enter your ID number"
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1 flex items-center gap-2" style={{ color: brand.colors.text }}>
                        <Upload size={16} />
                        Upload Government ID
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setKycData({ ...kycData, governmentId: e.target.files[0] })}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                        style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                        onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                        onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                        required
                      />
                      <p className="text-sm mt-1" style={{ color: brand.colors.textMuted }}>JPEG, PNG, PDF (Max 10MB)</p>
                    </div>

                    {profile.kyc?.status === 'rejected' && (
                      <div className="p-4 rounded-lg" style={{ background: '#FDF2F2' }}>
                        <p className="text-sm" style={{ color: brand.colors.error }}>Your KYC was rejected. Please submit new documents.</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={updating || profile.kyc?.status === 'pending'}
                      className="w-full py-3 rounded-xl text-white font-semibold transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
                      style={{
                        background: brand.gradients.primary,
                        opacity: updating || profile.kyc?.status === 'pending' ? 0.6 : 1,
                        cursor: updating || profile.kyc?.status === 'pending' ? 'not-allowed' : 'pointer',
                        boxShadow: `0 4px 14px ${brand.colors.primarySoft}`,
                      }}
                    >
                      {updating ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Submit KYC
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="rounded-2xl shadow-xl p-6" style={{ background: brand.colors.surface, border: `1px solid ${brand.colors.primarySoft}` }}>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: brand.colors.text }}>
                  <Lock size={22} strokeWidth={2} />
                  Change Password
                </h2>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1 flex items-center gap-2" style={{ color: brand.colors.text }}>
                      <Lock size={16} />
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                      style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                      onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                      onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1 flex items-center gap-2" style={{ color: brand.colors.text }}>
                      <KeyRound size={16} />
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                      style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                      onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                      onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                      required
                      minLength="6"
                    />
                    <p className="text-sm mt-1" style={{ color: brand.colors.textMuted }}>Must be at least 6 characters</p>
                  </div>

                  <div>
                    <label className="block font-medium mb-1 flex items-center gap-2" style={{ color: brand.colors.text }}>
                      <KeyRound size={16} />
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                      style={{ border: `2px solid ${brand.colors.primarySoft}`, background: brand.colors.background, color: brand.colors.text }}
                      onFocus={(e) => { e.target.style.borderColor = brand.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${brand.colors.primarySoft}`; }}
                      onBlur={(e) => { e.target.style.borderColor = brand.colors.primarySoft; e.target.style.boxShadow = 'none'; }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full py-3 rounded-xl text-white font-semibold transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    style={{
                      background: brand.gradients.primary,
                      opacity: updating ? 0.6 : 1,
                      cursor: updating ? 'not-allowed' : 'pointer',
                      boxShadow: `0 4px 14px ${brand.colors.primarySoft}`,
                    }}
                  >
                    {updating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Change Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;