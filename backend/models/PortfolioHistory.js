const mongoose = require('mongoose');

const PortfolioHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalBalance: {
    type: Number,
    required: true,
  },
  fiatBalance: {
    type: Number,
    default: 0,
  },
  cryptoBalances: {
    BTC: { type: Number, default: 0 },
    ETH: { type: Number, default: 0 },
    USDT: { type: Number, default: 0 },
    BNB: { type: Number, default: 0 },
  },
  snapshotDate: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
PortfolioHistorySchema.index({ userId: 1, snapshotDate: -1 });

module.exports = mongoose.model('PortfolioHistory', PortfolioHistorySchema);