import React, { useState } from 'react';
import api from './services/api';
import { brand } from './brand';
import {
  KeyRound,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
} from './icons';

const WithdrawPinPopup = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  currency,
  hasPin = false,
  userEmail = '',
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePinChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      document.getElementById(`pin-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-input-${index - 1}`)?.focus();
    }
    if (e.key === 'Enter') {
      handleVerifyPin();
    }
  };

  const handleVerifyPin = async () => {
    const pinCode = pin.join('');
    if (pinCode.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/verify-pin', { pin: pinCode });
      setLoading(false);
      onSuccess(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid PIN. Please try again.');
      setLoading(false);
      setPin(['', '', '', '']);
      document.getElementById('pin-input-0')?.focus();
    }
  };

  const handleContactSupport = () => {
    window.location.href = `mailto:support@bloomhaven.com?subject=Withdrawal PIN Request&body=Hello Support,%0D%0A%0D%0AI would like to request my withdrawal PIN.%0D%0A%0D%0AMy email: ${userEmail}%0D%0A%0D%0AThank you!`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
        style={{ background: brand.colors.surface }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg transition hover:bg-opacity-10"
          style={{ color: brand.colors.textLight }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: brand.colors.creamSoft }}
          >
            {hasPin ? (
              <KeyRound size={40} strokeWidth={2} style={{ color: brand.colors.primary }} />
            ) : (
              <ShieldCheck size={40} strokeWidth={2} style={{ color: brand.colors.primary }} />
            )}
          </div>
          <h2
            className="text-2xl font-bold"
            style={{ color: brand.colors.text }}
          >
            {hasPin ? 'Withdrawal PIN Required' : 'No PIN Issued'}
          </h2>
          <p className="mt-2" style={{ color: brand.colors.textLight }}>
            {hasPin
              ? 'Enter your 4-digit PIN to confirm this withdrawal'
              : 'You need a withdrawal PIN to make your first withdrawal'}
          </p>
          {amount && currency && (
            <p
              className="text-sm mt-2 font-semibold px-3 py-1 rounded-full inline-block"
              style={{
                background: brand.colors.creamSoft,
                color: brand.colors.primary,
              }}
            >
              Amount: {amount} {currency}
            </p>
          )}
        </div>

        {!hasPin ? (
          // No PIN - Show Contact Support
          <div className="space-y-4">
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
              }}
            >
              <AlertTriangle
                size={24}
                strokeWidth={2}
                style={{ color: brand.colors.warning, margin: '0 auto 8px' }}
              />
              <p className="font-medium" style={{ color: '#92400E' }}>
                You don't have a withdrawal PIN yet.
              </p>
              <p className="text-sm mt-1" style={{ color: '#B45309' }}>
                Contact support to get your 4-digit PIN issued.
              </p>
            </div>

            <button
              onClick={handleContactSupport}
              className="w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: '#3b82f6' }}
            >
              <Mail size={18} />
              Contact Support
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold transition hover:bg-opacity-10 flex items-center justify-center gap-2"
              style={{
                color: brand.colors.text,
                border: `2px solid ${brand.colors.primarySoft}`,
              }}
            >
              Cancel Withdrawal
            </button>
          </div>
        ) : (
          // Has PIN - Show PIN Input
          <>
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  id={`pin-input-${index}`}
                  type="password"
                  maxLength="1"
                  value={pin[index]}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-16 h-16 text-center text-2xl font-bold rounded-xl focus:outline-none transition"
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
                  autoFocus={index === 0}
                  inputMode="numeric"
                />
              ))}
            </div>

            {error && (
              <div
                className="border-l-4 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 text-sm"
                style={{
                  backgroundColor: '#FDF2F2',
                  borderColor: brand.colors.error,
                  color: brand.colors.error,
                }}
              >
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            <button
              onClick={handleVerifyPin}
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-90 flex items-center justify-center gap-2"
              style={{
                background: brand.gradients.primary,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Verify PIN
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full mt-2 py-3 rounded-xl font-semibold transition hover:bg-opacity-10"
              style={{ color: brand.colors.textLight }}
            >
              Cancel
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs flex items-center justify-center gap-1" style={{ color: brand.colors.textMuted }}>
                <Lock size={12} />
                Forgot PIN? Contact support to reset it.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WithdrawPinPopup;