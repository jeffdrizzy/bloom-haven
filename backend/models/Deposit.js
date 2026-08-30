const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  depositType: {
    type: String,
    enum: ['crypto', 'giftcard'],
    required: true,
  },
  currency: {
  type: String,
  enum: ['BTC', 'ETH', 'USDT', 'BNB', 'USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD'],
  required: true,
},
giftcardType: {
  type: String,
  enum: ['Amazon', 'Apple', 'Google Play', 'Steam', 'Netflix'],
},
giftcardCountry: {
  type: String,
  enum: ['US', 'UK', 'CA', 'NG', 'AU', 'DE', 'FR'],
},
  amount: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: String,
    trim: true,
  },
  proofImage: {
    type: String, // URL or base64 of uploaded image
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  adminNote: {
    type: String,
    trim: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Deposit', DepositSchema);