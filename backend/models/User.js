const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    default: 'default-avatar.png',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isFrozen: {
    type: Boolean,
    default: false,
  },
  isBlacklisted: {
    type: Boolean,
    default: false,
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
  // ============ NEW FIELDS ============
  address: {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    zipCode: { type: String, trim: true, default: '' },
  },
  contact: {
    email: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
  },
  profilePicture: {
    type: String,
    default: '',
  },
  kyc: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'not_submitted'],
      default: 'not_submitted',
    },
    governmentId: { type: String, default: '' },
    idType: { type: String, enum: ['passport', 'drivers_license', 'national_id', 'other'], default: 'other' },
    idNumber: { type: String, trim: true, default: '' },
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
    adminNote: { type: String, trim: true, default: '' },
  },
  withdrawalPin: {
    type: String,
    default: '',
  },
  pinIssued: {
    type: Boolean,
    default: false,
  },
  pinIssuedAt: {
    type: Date,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  // ============ END NEW FIELDS ============
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);