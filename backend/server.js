const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');

// Models
const User = require('./models/User');
const Admin = require('./models/Admin');
const Transaction = require('./models/Transaction');
const Deposit = require('./models/Deposit');
const Withdraw = require('./models/Withdraw');
const SystemSetting = require('./models/SystemSetting');

// Middleware
const upload = require('./middleware/upload');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://bloom-haven-ten.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('🌿 MongoDB connected to Bloom Haven'))
  .catch((err) => console.log('❌ MongoDB error:', err));

io.on('connection', (socket) => {
  console.log('🌸 New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🌱 Client disconnected:', socket.id);
  });
});

app.set('io', io);

// Test route
app.get('/api', (req, res) => {
  res.json({ message: '🌸 Bloom Haven API is running!' });
});

// ============ AUTH ROUTES ============

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      fullName,
      email,
      password,
      phone,
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully! Waiting for admin approval.',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBlacklisted) {
      return res.status(403).json({ message: 'Account has been blacklisted. Contact support.' });
    }

    if (user.isFrozen) {
      return res.status(403).json({ message: 'Account is frozen. Contact support.' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Account pending admin approval' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: 'user',
        isApproved: user.isApproved,
        fiatBalance: user.fiatBalance,
        cryptoBalances: user.cryptoBalances,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin login successful!',
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        username: admin.username,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// ============ PROTECTED ROUTES ============

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, address, contact } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (address) user.address = address;
    if (contact) user.contact = contact;

    await user.save();
    res.json({
      message: 'Profile updated successfully!',
      user: {
        fullName: user.fullName,
        address: user.address,
        contact: user.contact,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Update profile picture
app.post('/api/profile/picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = req.file.path;
    await user.save();

    res.json({
      message: 'Profile picture updated!',
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});

// Change password
app.put('/api/profile/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Verify withdrawal PIN
app.post('/api/verify-pin', authenticateToken, async (req, res) => {
  try {
    const { pin } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.pinIssued) {
      return res.status(400).json({ message: 'No PIN set. Contact admin.' });
    }

    if (user.withdrawalPin !== pin) {
      return res.status(400).json({ message: 'Invalid PIN' });
    }

    res.json({ message: 'PIN verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying PIN' });
  }
});

// ============ ADMIN ROUTES ============

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Approve user
app.put('/api/admin/users/:userId/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isApproved = true;
    await user.save();
    
    res.json({ message: `User ${user.fullName} has been approved!` });
  } catch (error) {
    res.status(500).json({ message: 'Error approving user' });
  }
});

// Freeze user
app.put('/api/admin/users/:userId/freeze', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isFrozen = true;
    await user.save();
    
    res.json({ message: `User ${user.fullName} has been frozen!` });
  } catch (error) {
    res.status(500).json({ message: 'Error freezing user' });
  }
});

// Unfreeze user
app.put('/api/admin/users/:userId/unfreeze', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isFrozen = false;
    await user.save();
    
    res.json({ message: `User ${user.fullName} has been unfrozen!` });
  } catch (error) {
    res.status(500).json({ message: 'Error unfreezing user' });
  }
});

// Blacklist user
app.put('/api/admin/users/:userId/blacklist', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isBlacklisted = true;
    await user.save();
    
    res.json({ message: `User ${user.fullName} has been blacklisted!` });
  } catch (error) {
    res.status(500).json({ message: 'Error blacklisting user' });
  }
});

// Unblacklist user
app.put('/api/admin/users/:userId/unblacklist', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isBlacklisted = false;
    await user.save();
    
    res.json({ message: `User ${user.fullName} has been unblacklisted!` });
  } catch (error) {
    res.status(500).json({ message: 'Error unblacklisting user' });
  }
});

// Add balance to user
app.post('/api/admin/users/:userId/balance', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    user.fiatBalance += amount;
    await user.save();
    
    res.json({ 
      message: `Added $${amount} to ${user.fullName}'s account! New balance: $${user.fiatBalance}`,
      newBalance: user.fiatBalance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding balance' });
  }
});

// Set withdrawal PIN (admin only)
app.put('/api/admin/users/:userId/set-pin', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { pin } = req.body;
    
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.withdrawalPin = pin;
    user.pinIssued = true;
    user.pinIssuedAt = new Date();
    await user.save();

    res.json({
      message: `Withdrawal PIN set for ${user.fullName}`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        pinIssued: user.pinIssued,
      }
    });
  } catch (error) {
    console.error('Error setting PIN:', error);
    res.status(500).json({ message: 'Error setting PIN' });
  }
});

// ============ DEPOSIT ROUTES ============

// Generate unique reference
const generateReference = () => {
  return 'BLM-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Submit deposit (user)
app.post('/api/deposit/submit', authenticateToken, upload.single('proofImage'), async (req, res) => {
  try {
    const { depositType, currency, amount, transactionId, description, giftcardType, giftcardCountry } = req.body;
    const proofImage = req.file ? req.file.path : '';

    if (!depositType || !currency || !amount) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const user = await User.findById(req.user.userId);
    if (!user.isApproved) {
      return res.status(403).json({ message: 'Your account is not approved yet' });
    }

    const deposit = new Deposit({
      userId: req.user.userId,
      depositType,
      currency,
      amount,
      transactionId: transactionId || '',
      proofImage,
      description: description || '',
      giftcardType: giftcardType || '',
      giftcardCountry: giftcardCountry || '',
      status: 'pending',
    });

    await deposit.save();

    const io = req.app.get('io');
    io.emit('new-deposit', {
      depositId: deposit._id,
      user: {
        name: user.fullName,
        email: user.email,
      },
      amount: deposit.amount,
      currency: deposit.currency,
    });

    res.status(201).json({
      message: 'Deposit submitted successfully! Waiting for admin approval.',
      deposit: {
        id: deposit._id,
        amount: deposit.amount,
        currency: deposit.currency,
        status: deposit.status,
        createdAt: deposit.createdAt,
      },
    });
  } catch (error) {
    console.error('Submit deposit error:', error);
    res.status(500).json({ message: 'Error submitting deposit' });
  }
});

// Get user's deposits
app.get('/api/deposits', authenticateToken, async (req, res) => {
  try {
    const deposits = await Deposit.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deposits' });
  }
});

// Get deposit addresses (public)
app.get('/api/deposit/addresses', async (req, res) => {
  try {
    const settings = await SystemSetting.find();
    const addresses = {};
    settings.forEach(s => {
      if (s.key.startsWith('crypto_address_')) {
        const currency = s.key.replace('crypto_address_', '');
        addresses[currency] = s.value;
      }
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses' });
  }
});

// ============ WITHDRAW ROUTES ============

// Request withdrawal (user)
app.post('/api/withdraw', authenticateToken, async (req, res) => {
  try {
    const { withdrawType, currency, amount, walletAddress, bankName, accountName, accountNumber, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid amount' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has enough balance
    if (withdrawType === 'fiat') {
      if (user.fiatBalance < amount) {
        return res.status(400).json({ message: 'Insufficient fiat balance' });
      }
    } else if (withdrawType === 'crypto') {
      if (!user.cryptoBalances[currency] || user.cryptoBalances[currency] < amount) {
        return res.status(400).json({ message: `Insufficient ${currency} balance` });
      }
    }

    const withdraw = new Withdraw({
      userId: req.user.userId,
      withdrawType,
      currency,
      amount,
      walletAddress: walletAddress || '',
      bankName: bankName || '',
      accountName: accountName || '',
      accountNumber: accountNumber || '',
      description: description || '',
      status: 'pending',
    });

    await withdraw.save();

    const io = req.app.get('io');
    io.emit('new-withdraw', {
      withdrawId: withdraw._id,
      user: {
        name: user.fullName,
        email: user.email,
      },
      amount: withdraw.amount,
      currency: withdraw.currency,
    });

    res.status(201).json({
      message: 'Withdrawal request submitted successfully! Waiting for admin approval.',
      withdraw: {
        id: withdraw._id,
        amount: withdraw.amount,
        currency: withdraw.currency,
        status: withdraw.status,
        createdAt: withdraw.createdAt,
      },
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ message: 'Error processing withdrawal request' });
  }
});

// Get user's withdrawals
app.get('/api/withdrawals', authenticateToken, async (req, res) => {
  try {
    const withdrawals = await Withdraw.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching withdrawals' });
  }
});

// ============ ADMIN DEPOSIT ROUTES ============

// Get all deposits (admin only)
app.get('/api/admin/deposits', authenticateToken, isAdmin, async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 });
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deposits' });
  }
});

// Get pending deposits (admin only)
app.get('/api/admin/deposits/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const deposits = await Deposit.find({ status: 'pending' })
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 });
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending deposits' });
  }
});

// Approve deposit (admin only)
app.put('/api/admin/deposits/:depositId/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const deposit = await Deposit.findById(req.params.depositId);
    
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }

    deposit.status = 'approved';
    deposit.adminNote = adminNote || 'Approved by admin';
    deposit.approvedBy = req.user.userId;
    deposit.approvedAt = new Date();
    await deposit.save();

    const user = await User.findById(deposit.userId);
    
    if (deposit.depositType === 'crypto') {
      if (user.cryptoBalances[deposit.currency] !== undefined) {
        user.cryptoBalances[deposit.currency] += deposit.amount;
      }
    } else if (deposit.depositType === 'giftcard') {
      user.fiatBalance += deposit.amount;
    }
    await user.save();

    const io = req.app.get('io');
    io.emit('deposit-approved', {
      depositId: deposit._id,
      userId: deposit.userId,
      amount: deposit.amount,
      currency: deposit.currency,
      newBalance: {
        fiat: user.fiatBalance,
        crypto: user.cryptoBalances,
      },
    });

    res.json({
      message: 'Deposit approved successfully!',
      deposit: deposit,
      newBalance: {
        fiatBalance: user.fiatBalance,
        cryptoBalances: user.cryptoBalances,
      },
    });
  } catch (error) {
    console.error('Approve deposit error:', error);
    res.status(500).json({ message: 'Error approving deposit' });
  }
});

// Reject deposit (admin only)
app.put('/api/admin/deposits/:depositId/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const deposit = await Deposit.findById(req.params.depositId);
    
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }

    deposit.status = 'rejected';
    deposit.adminNote = adminNote || 'Rejected by admin';
    deposit.approvedBy = req.user.userId;
    deposit.approvedAt = new Date();
    await deposit.save();

    const io = req.app.get('io');
    io.emit('deposit-rejected', {
      depositId: deposit._id,
      userId: deposit.userId,
      reason: deposit.adminNote,
    });

    res.json({
      message: 'Deposit rejected',
      deposit: deposit,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting deposit' });
  }
});

// ============ ADMIN WITHDRAW ROUTES ============

// Get all withdrawals (admin only)
app.get('/api/admin/withdrawals', authenticateToken, isAdmin, async (req, res) => {
  try {
    const withdrawals = await Withdraw.find()
      .populate('userId', 'fullName email phone fiatBalance cryptoBalances')
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching withdrawals' });
  }
});

// Get pending withdrawals (admin only)
app.get('/api/admin/withdrawals/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const withdrawals = await Withdraw.find({ status: 'pending' })
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending withdrawals' });
  }
});

// Approve withdrawal (admin only)
app.put('/api/admin/withdrawals/:withdrawId/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const withdraw = await Withdraw.findById(req.params.withdrawId);
    
    if (!withdraw) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdraw.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal already processed' });
    }

    const user = await User.findById(withdraw.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (withdraw.withdrawType === 'fiat') {
      if (user.fiatBalance < withdraw.amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      user.fiatBalance -= withdraw.amount;
    } else if (withdraw.withdrawType === 'crypto') {
      if (!user.cryptoBalances[withdraw.currency] || user.cryptoBalances[withdraw.currency] < withdraw.amount) {
        return res.status(400).json({ message: `Insufficient ${withdraw.currency} balance` });
      }
      user.cryptoBalances[withdraw.currency] -= withdraw.amount;
    }

    await user.save();

    withdraw.status = 'approved';
    withdraw.adminNote = adminNote || 'Approved by admin';
    withdraw.approvedBy = req.user.userId;
    withdraw.processedAt = new Date();
    await withdraw.save();

    const io = req.app.get('io');
    io.emit('withdraw-approved', {
      withdrawId: withdraw._id,
      userId: withdraw.userId,
      amount: withdraw.amount,
      currency: withdraw.currency,
      newBalance: {
        fiat: user.fiatBalance,
        crypto: user.cryptoBalances,
      },
    });

    res.json({
      message: 'Withdrawal approved successfully!',
      withdraw: withdraw,
      newBalance: {
        fiatBalance: user.fiatBalance,
        cryptoBalances: user.cryptoBalances,
      },
    });
  } catch (error) {
    console.error('Approve withdraw error:', error);
    res.status(500).json({ message: 'Error approving withdrawal' });
  }
});

// Reject withdrawal (admin only)
app.put('/api/admin/withdrawals/:withdrawId/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const withdraw = await Withdraw.findById(req.params.withdrawId);
    
    if (!withdraw) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdraw.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal already processed' });
    }

    withdraw.status = 'rejected';
    withdraw.adminNote = adminNote || 'Rejected by admin';
    withdraw.approvedBy = req.user.userId;
    withdraw.processedAt = new Date();
    await withdraw.save();

    const io = req.app.get('io');
    io.emit('withdraw-rejected', {
      withdrawId: withdraw._id,
      userId: withdraw.userId,
      reason: withdraw.adminNote,
    });

    res.json({
      message: 'Withdrawal rejected',
      withdraw: withdraw,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting withdrawal' });
  }
});

// ============ SYSTEM SETTINGS ROUTES ============

// Get system settings (public)
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await SystemSetting.find();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    // Set defaults if not found
    if (!settingsObj.maintenanceMode) settingsObj.maintenanceMode = false;
    if (!settingsObj.siteName) settingsObj.siteName = 'Bloom Haven';
    if (!settingsObj.siteTagline) settingsObj.siteTagline = 'Where Your Wealth Blossoms';
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// Update system settings (admin only)
app.put('/api/admin/settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { maintenanceMode, siteName, siteTagline, cryptoAddresses } = req.body;
    
    console.log('Updating settings:', { maintenanceMode, siteName, siteTagline, cryptoAddresses });
    
    // Update site settings
    if (maintenanceMode !== undefined) {
      await SystemSetting.findOneAndUpdate(
        { key: 'maintenanceMode' },
        { key: 'maintenanceMode', value: maintenanceMode, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }
    
    if (siteName) {
      await SystemSetting.findOneAndUpdate(
        { key: 'siteName' },
        { key: 'siteName', value: siteName, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }
    
    if (siteTagline) {
      await SystemSetting.findOneAndUpdate(
        { key: 'siteTagline' },
        { key: 'siteTagline', value: siteTagline, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }
    
    // Update crypto addresses
    if (cryptoAddresses) {
      for (const [currency, address] of Object.entries(cryptoAddresses)) {
        await SystemSetting.findOneAndUpdate(
          { key: `crypto_address_${currency}` },
          { 
            key: `crypto_address_${currency}`,
            value: address || '',
            description: `${currency} deposit address`,
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      }
    }
    
    res.json({ message: 'Settings updated successfully!' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings: ' + error.message });
  }
});

// ============ TEMPORARY ADMIN SETUP ============
// Remove this route after first use
app.post('/api/setup-first-admin', async (req, res) => {
  try {
    const adminExists = await Admin.findOne();
    if (adminExists) {
      return res.json({ message: 'Admin already exists!' });
    }

    const admin = new Admin({
      username: 'admin',
      email: 'admin@bloomhaven.com',
      password: 'admin123',
      fullName: 'Super Admin',
    });

    await admin.save();
    res.json({ 
      message: 'First admin created!',
      credentials: {
        email: 'admin@bloomhaven.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Error creating admin' });
  }
});

// ============ TEMPORARY MIGRATION ============
// Add missing fields to existing users (run once)
app.post('/api/migrate-users', async (req, res) => {
  try {
    const users = await User.find({});
    let updated = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      
      // Add address if missing
      if (!user.address) {
        user.address = { street: '', city: '', state: '', country: '', zipCode: '' };
        needsUpdate = true;
      }
      
      // Add contact if missing
      if (!user.contact) {
        user.contact = { email: user.email || '', phone: user.phone || '' };
        needsUpdate = true;
      }
      
      // Add profilePicture if missing
      if (user.profilePicture === undefined) {
        user.profilePicture = '';
        needsUpdate = true;
      }
      
      // Add kyc if missing
      if (!user.kyc) {
        user.kyc = {
          status: 'not_submitted',
          governmentId: '',
          idType: 'other',
          idNumber: '',
          submittedAt: null,
          verifiedAt: null,
          adminNote: '',
        };
        needsUpdate = true;
      }
      
      // Add withdrawalPin if missing
      if (user.withdrawalPin === undefined) {
        user.withdrawalPin = '';
        needsUpdate = true;
      }
      
      // Add pinIssued if missing
      if (user.pinIssued === undefined) {
        user.pinIssued = false;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
        updated++;
      }
    }
    
    res.json({
      message: `Migration complete! Updated ${updated} users.`,
      total: users.length,
      updated: updated
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      message: 'Error migrating users',
      error: error.message 
    });
  }
});

// ============ BALANCE ROUTE ============

// Get user's balance
app.get('/api/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('fiatBalance cryptoBalances');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      fiatBalance: user.fiatBalance,
      cryptoBalances: user.cryptoBalances,
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ message: 'Error fetching balance' });
  }
});

// ============ KYC ROUTES ============

// Get all KYC submissions (admin only)
app.get('/api/admin/kyc', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({
      'kyc.status': { $in: ['pending', 'verified', 'rejected'] }
    }).select('fullName email kyc profilePicture');
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching KYC:', error);
    res.status(500).json({ message: 'Error fetching KYC submissions' });
  }
});

// Verify KYC (admin only)
app.put('/api/admin/kyc/:userId/verify', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kyc.status = 'verified';
    user.kyc.verifiedAt = new Date();
    user.kyc.adminNote = adminNote || 'KYC verified';
    await user.save();

    // Notify user via socket
    const io = req.app.get('io');
    io.emit('kyc-verified', {
      userId: user._id,
      fullName: user.fullName,
    });

    res.json({
      message: `KYC verified for ${user.fullName}`,
      kyc: user.kyc,
    });
  } catch (error) {
    console.error('Error verifying KYC:', error);
    res.status(500).json({ message: 'Error verifying KYC' });
  }
});

// Reject KYC (admin only)
app.put('/api/admin/kyc/:userId/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kyc.status = 'rejected';
    user.kyc.adminNote = adminNote || 'KYC rejected';
    await user.save();

    res.json({
      message: `KYC rejected for ${user.fullName}`,
      kyc: user.kyc,
    });
  } catch (error) {
    console.error('Error rejecting KYC:', error);
    res.status(500).json({ message: 'Error rejecting KYC' });
  }
});

// ============ KYC SUBMIT ROUTE ============

// Submit KYC (user)
app.post('/api/kyc/submit', authenticateToken, upload.single('governmentId'), async (req, res) => {
  try {
    const { idType, idNumber } = req.body;
    
    console.log('KYC Submission - User:', req.user.userId);
    console.log('ID Type:', idType);
    console.log('ID Number:', idNumber);
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload your government ID' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kyc = {
      status: 'pending',
      governmentId: req.file.path,
      idType: idType || 'other',
      idNumber: idNumber || '',
      submittedAt: new Date(),
    };

    await user.save();

    // Notify admin via socket
    const io = req.app.get('io');
    io.emit('new-kyc', {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
    });

    res.json({
      message: 'KYC submitted successfully! Waiting for admin verification.',
      kyc: user.kyc,
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ message: 'Error submitting KYC' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌸 Bloom Haven server running on port ${PORT}`);
  console.log(`🌿 http://localhost:${PORT}`);
});