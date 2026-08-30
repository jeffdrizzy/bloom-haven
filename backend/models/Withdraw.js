const mongoose = require('mongoose');

const WithdrawSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  withdrawType: {
    type: String,
    enum: ['fiat', 'crypto'],
    required: true,
  },
  currency: {
    type: String,
    enum: ['USD', 'BTC', 'ETH', 'USDT', 'BNB'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  walletAddress: {
    type: String,
    trim: true,
  },
  bankName: {
    type: String,
    trim: true,
  },
  accountName: {
    type: String,
    trim: true,
  },
  accountNumber: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  adminNote: {
    type: String,
    trim: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  processedAt: {
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

module.exports = mongoose.model('Withdraw', WithdrawSchema);