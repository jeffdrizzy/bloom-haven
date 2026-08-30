import React, { useState } from 'react';
import api from './services/api';

const WithdrawPinPopup = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  amount, 
  currency, 
  hasPin = false,
  userEmail = ''
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSupport, setShowSupport] = useState(false);

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
    // Open email client with support email
    window.location.href = `mailto:support@bloomhaven.com?subject=Withdrawal PIN Request&body=Hello Support,%0D%0A%0D%0AI would like to request my withdrawal PIN.%0D%0A%0D%0AMy email: ${userEmail}%0D%0A%0D%0AThank you!`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-4">{hasPin ? '🔐' : '📌'}</div>
          <h2 className="text-2xl font-bold text-gray-800">
            {hasPin ? 'Withdrawal PIN Required' : 'No PIN Issued'}
          </h2>
          <p className="text-gray-600 mt-2">
            {hasPin 
              ? 'Enter your 4-digit PIN to confirm this withdrawal'
              : 'You need a withdrawal PIN to make your first withdrawal'
            }
          </p>
          {amount && currency && (
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Amount: {amount} {currency}
            </p>
          )}
        </div>

        {!hasPin ? (
          // No PIN - Show Contact Support
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-yellow-800">
                You don't have a withdrawal PIN yet.
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                Contact support to get your 4-digit PIN issued.
              </p>
            </div>
            
            <button
              onClick={handleContactSupport}
              className="w-full py-3 rounded-xl text-white font-semibold bg-blue-500 hover:bg-blue-600 transition"
            >
              📧 Contact Support
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-gray-600 font-semibold border-2 border-gray-200 hover:bg-gray-50 transition"
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
                  className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none transition"
                  autoFocus={index === 0}
                  inputMode="numeric"
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleVerifyPin}
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold transition ${
                loading
                  ? 'bg-rose-300 cursor-not-allowed'
                  : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              {loading ? 'Verifying...' : '✅ Verify PIN'}
            </button>

            <button
              onClick={onClose}
              className="w-full mt-2 py-3 rounded-xl text-gray-500 font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
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