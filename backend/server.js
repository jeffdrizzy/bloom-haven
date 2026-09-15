const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Models
const User = require('./models/User');
const Admin = require('./models/Admin');
const Transaction = require('./models/Transaction');
const Deposit = require('./models/Deposit');
const Withdraw = require('./models/Withdraw');
const SystemSetting = require('./models/SystemSetting');
const Notification = require('./models/Notification');
const PortfolioHistory = require('./models/PortfolioHistory');

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

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads folder');
}

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

// ============ PORTFOLIO SNAPSHOT HELPER ============
const createPortfolioSnapshot = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let rates = { BTC: 65432, ETH: 3456, USDT: 1, BNB: 587 };
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,bnb&vs_currencies=usd'
      );
      const data = await response.json();
      rates = {
        BTC: data.bitcoin?.usd || 65432,
        ETH: data.ethereum?.usd || 3456,
        USDT: data.tether?.usd || 1,
        BNB: data.bnb?.usd || 587,
      };
    } catch (err) {
      console.log('Using fallback rates for snapshot');
    }

    const cryptoTotal = 
      (user.cryptoBalances.BTC || 0) * rates.BTC +
      (user.cryptoBalances.ETH || 0) * rates.ETH +
      (user.cryptoBalances.USDT || 0) * rates.USDT +
      (user.cryptoBalances.BNB || 0) * rates.BNB;

    const totalBalance = (user.fiatBalance || 0) + cryptoTotal;

    await PortfolioHistory.create({
      userId: user._id,
      totalBalance,
      fiatBalance: user.fiatBalance,
      cryptoBalances: user.cryptoBalances,
      snapshotDate: new Date(),
    });

    console.log(`📸 Snapshot created for ${user.email}: $${totalBalance.toFixed(2)}`);
  } catch (error) {
    console.error('Snapshot helper error:', error);
  }
};

// Test route
app.get('/api', (req, res) => {
  res.json({ message: '🌸 Bloom Haven API is running!' });
});

// ============ AUTH ROUTES ============

// Register (with referral support)
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password, phone, referralCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const generateReferralCode = () => {
      return 'BH' + Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    let newReferralCode = generateReferralCode();
    let codeExists = await User.findOne({ referralCode: newReferralCode });
    while (codeExists) {
      newReferralCode = generateReferralCode();
      codeExists = await User.findOne({ referralCode: newReferralCode });
    }

    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    }

    const user = new User({
      fullName,
      email,
      password,
      phone,
      referralCode: newReferralCode,
      referredBy: referrer ? referrer._id : null,
    });

    await user.save();

    if (referrer) {
      referrer.referralCount += 1;
      referrer.referralEarnings += 5;
      referrer.fiatBalance += 5;
      await referrer.save();

      user.fiatBalance += 5;
      user.referralBonusApplied = true;
      await user.save();

      await Notification.create({
        userId: referrer._id,
        title: '🎁 Referral Bonus Earned!',
        message: `${fullName} signed up using your referral link. You earned $5!`,
        type: 'referral',
        link: '/referral',
      });

      await Notification.create({
        userId: user._id,
        title: '🎁 Welcome Bonus!',
        message: 'You received $5 bonus for signing up with a referral code!',
        type: 'referral',
        link: '/dashboard',
      });

      await createPortfolioSnapshot(referrer._id);
    }

    await createPortfolioSnapshot(user._id);

    res.status(201).json({
      message: referrer 
        ? 'User registered successfully! $5 referral bonus applied to both accounts. Waiting for admin approval.'
        : 'User registered successfully! Waiting for admin approval.',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        referralCode: user.referralCode,
        referralBonus: referrer ? 5 : 0,
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
        referralCode: user.referralCode,
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

// ============ REFERRAL ROUTES ============

app.get('/api/referrals', authenticateToken, async (req, res) => {
  try {
    let user = await User.findById(req.user.userId).select(
      'referralCode referralCount referralEarnings fiatBalance'
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.referralCode) {
      const generateReferralCode = () => {
        return 'BH' + Math.random().toString(36).substring(2, 8).toUpperCase();
      };
      
      let newCode = generateReferralCode();
      let codeExists = await User.findOne({ referralCode: newCode });
      while (codeExists) {
        newCode = generateReferralCode();
        codeExists = await User.findOne({ referralCode: newCode });
      }
      
      user.referralCode = newCode;
      await user.save();
    }

    const referredUsers = await User.find({ referredBy: req.user.userId })
      .select('fullName email createdAt isApproved')
      .sort({ createdAt: -1 });

    res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      referralEarnings: user.referralEarnings || 0,
      referralLink: `${process.env.CLIENT_URL || 'https://bloom-haven-ten.vercel.app'}/register?ref=${user.referralCode}`,
      referredUsers: referredUsers.map(u => ({
        fullName: u.fullName,
        email: u.email,
        joinedAt: u.createdAt,
        isApproved: u.isApproved,
      })),
    });
  } catch (error) {
    console.error('Referral error:', error);
    res.status(500).json({ message: 'Error fetching referral info' });
  }
});

app.post('/api/referrals/apply', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.referredBy) {
      return res.status(400).json({ message: 'No referrer found' });
    }

    const referrer = await User.findById(user.referredBy);
    if (!referrer) {
      return res.status(404).json({ message: 'Referrer not found' });
    }

    if (user.referralBonusApplied) {
      return res.status(400).json({ message: 'Referral bonus already applied' });
    }

    referrer.referralEarnings += 5;
    referrer.fiatBalance += 5;
    referrer.referralCount += 1;
    await referrer.save();

    user.fiatBalance += 5;
    user.referralBonusApplied = true;
    await user.save();

    await createPortfolioSnapshot(referrer._id);
    await createPortfolioSnapshot(user._id);

    res.json({
      message: 'Referral bonus applied! $5 credited to both accounts.',
      referrer: {
        name: referrer.fullName,
        earnings: referrer.referralEarnings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error applying referral bonus' });
  }
});

// ============ ADMIN ROUTES ============

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.put('/api/admin/users/:userId/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isApproved = true;
    await user.save();

    await Notification.create({
      userId: user._id,
      title: '✅ Account Approved',
      message: 'Your account has been approved! You can now start using all features.',
      type: 'system',
      link: '/dashboard',
    });
    
    res.json({ message: `User ${user.fullName} has been approved!` });
  } catch (error) {
    res.status(500).json({ message: 'Error approving user' });
  }
});

app.put('/api/admin/users/:userId/freeze', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isFrozen = true;
    await user.save();

    await Notification.create({
      userId: user._id,
      title: '❄️ Account Frozen',
      message: 'Your account has been frozen. Please contact support for more information.',
      type: 'system',
      link: '/dashboard',
    });
    
    res.json({ message: `User ${user.fullName} has been frozen!` });
  } catch (error) {
    res.status(500).json({ message: 'Error freezing user' });
  }
});

app.put('/api/admin/users/:userId/unfreeze', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isFrozen = false;
    await user.save();

    await Notification.create({
      userId: user._id,
      title: '✅ Account Unfrozen',
      message: 'Your account has been unfrozen. You can now use all features again.',
      type: 'system',
      link: '/dashboard',
    });
    
    res.json({ message: `User ${user.fullName} has been unfrozen!` });
  } catch (error) {
    res.status(500).json({ message: 'Error unfreezing user' });
  }
});

app.put('/api/admin/users/:userId/blacklist', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isBlacklisted = true;
    await user.save();

    await Notification.create({
      userId: user._id,
      title: '🚫 Account Blacklisted',
      message: 'Your account has been blacklisted. Please contact support for more information.',
      type: 'system',
      link: '/dashboard',
    });
    
    res.json({ message: `User ${user.fullName} has been blacklisted!` });
  } catch (error) {
    res.status(500).json({ message: 'Error blacklisting user' });
  }
});

app.put('/api/admin/users/:userId/unblacklist', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isBlacklisted = false;
    await user.save();

    await Notification.create({
      userId: user._id,
      title: '✅ Account Restored',
      message: 'Your account has been restored. You can now use all features again.',
      type: 'system',
      link: '/dashboard',
    });
    
    res.json({ message: `User ${user.fullName} has been unblacklisted!` });
  } catch (error) {
    res.status(500).json({ message: 'Error unblacklisting user' });
  }
});

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

    await Notification.create({
      userId: user._id,
      title: '💰 Balance Added',
      message: `$${amount} has been added to your account by admin. New balance: $${user.fiatBalance.toFixed(2)}`,
      type: 'system',
      link: '/dashboard',
    });

    await createPortfolioSnapshot(user._id);
    
    res.json({ 
      message: `Added $${amount} to ${user.fullName}'s account! New balance: $${user.fiatBalance}`,
      newBalance: user.fiatBalance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding balance' });
  }
});

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

    await Notification.create({
      userId: user._id,
      title: '🔑 Withdrawal PIN Issued',
      message: 'Your withdrawal PIN has been issued by admin. You can now make withdrawals.',
      type: 'pin',
      link: '/withdraw',
    });

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

const generateReference = () => {
  return 'BLM-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

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

    let withdrawFeePercent = 1;
    const feeSetting = await SystemSetting.findOne({ key: 'withdrawFee' });
    if (feeSetting) withdrawFeePercent = feeSetting.value;

    const feeAmount = (amount * withdrawFeePercent) / 100;
    const netAmount = amount - feeAmount;

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
      metadata: {
        fee: feeAmount,
        feePercent: withdrawFeePercent,
        netAmount: netAmount,
      },
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
      message: `Withdrawal request submitted! You will receive ${netAmount.toFixed(6)} ${currency} after a $${feeAmount.toFixed(2)} fee.`,
      withdraw: {
        id: withdraw._id,
        amount: withdraw.amount,
        currency: withdraw.currency,
        status: withdraw.status,
        fee: feeAmount.toFixed(2),
        feePercent: withdrawFeePercent,
        netAmount: netAmount.toFixed(6),
        createdAt: withdraw.createdAt,
      },
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ message: 'Error processing withdrawal request' });
  }
});

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

    await Notification.create({
      userId: deposit.userId,
      title: '💰 Deposit Approved',
      message: `Your deposit of ${deposit.amount} ${deposit.currency} has been approved and credited to your account.`,
      type: 'deposit',
      link: '/dashboard',
    });

    await createPortfolioSnapshot(deposit.userId);

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

    await Notification.create({
      userId: deposit.userId,
      title: '❌ Deposit Rejected',
      message: `Your deposit of ${deposit.amount} ${deposit.currency} was rejected. Reason: ${deposit.adminNote}`,
      type: 'deposit',
      link: '/dashboard',
    });

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

    await Notification.create({
      userId: withdraw.userId,
      title: '🏦 Withdrawal Approved',
      message: `Your withdrawal of ${withdraw.amount} ${withdraw.currency} has been approved and is being processed.`,
      type: 'withdrawal',
      link: '/dashboard',
    });

    await createPortfolioSnapshot(withdraw.userId);

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

    await Notification.create({
      userId: withdraw.userId,
      title: '❌ Withdrawal Rejected',
      message: `Your withdrawal of ${withdraw.amount} ${withdraw.currency} was rejected. Reason: ${withdraw.adminNote}`,
      type: 'withdrawal',
      link: '/dashboard',
    });

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

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await SystemSetting.find();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    if (!settingsObj.maintenanceMode) settingsObj.maintenanceMode = false;
    if (!settingsObj.siteName) settingsObj.siteName = 'Bloom Haven';
    if (!settingsObj.siteTagline) settingsObj.siteTagline = 'Where Your Wealth Blossoms';
    if (settingsObj.swapFee === undefined) settingsObj.swapFee = 0.5;
    if (settingsObj.withdrawFee === undefined) settingsObj.withdrawFee = 1;
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

app.put('/api/admin/settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { maintenanceMode, siteName, siteTagline, cryptoAddresses, swapFee, withdrawFee } = req.body;
    
    if (maintenanceMode !== undefined) {
      await SystemSetting.findOneAndUpdate(
        { key: 'maintenanceMode' },
        { key: 'maintenanceMode', value: maintenanceMode, updatedAt: new Date() },
        { upsert: true, returnDocument: 'after' }
      );
    }
    
    if (siteName) {
      await SystemSetting.findOneAndUpdate(
        { key: 'siteName' },
        { key: 'siteName', value: siteName, updatedAt: new Date() },
        { upsert: true, returnDocument: 'after' }
      );
    }
    
    if (siteTagline) {
      await SystemSetting.findOneAndUpdate(
        { key: 'siteTagline' },
        { key: 'siteTagline', value: siteTagline, updatedAt: new Date() },
        { upsert: true, returnDocument: 'after' }
      );
    }

    if (swapFee !== undefined) {
      await SystemSetting.findOneAndUpdate(
        { key: 'swapFee' },
        { key: 'swapFee', value: swapFee, updatedAt: new Date() },
        { upsert: true, returnDocument: 'after' }
      );
    }

    if (withdrawFee !== undefined) {
      await SystemSetting.findOneAndUpdate(
        { key: 'withdrawFee' },
        { key: 'withdrawFee', value: withdrawFee, updatedAt: new Date() },
        { upsert: true, returnDocument: 'after' }
      );
    }
    
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
          { upsert: true, returnDocument: 'after' }
        );
      }
    }
    
    res.json({ message: 'Settings updated successfully!' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings: ' + error.message });
  }
});

// ============ TRANSACTIONS ROUTE ============

app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const deposits = await Deposit.find({ userId: req.user.userId });
    const withdrawals = await Withdraw.find({ userId: req.user.userId });
    const swaps = await Transaction.find({ userId: req.user.userId, type: 'swap' });

    const transactions = [];

    deposits.forEach(d => {
      transactions.push({
        _id: d._id,
        type: 'deposit',
        amount: d.amount,
        currency: d.currency,
        status: d.status,
        createdAt: d.createdAt,
        depositType: d.depositType,
      });
    });

    withdrawals.forEach(w => {
      transactions.push({
        _id: w._id,
        type: 'withdraw',
        amount: w.amount,
        currency: w.currency,
        status: w.status,
        createdAt: w.createdAt,
        withdrawType: w.withdrawType,
        metadata: w.metadata,
      });
    });

    swaps.forEach(s => {
      transactions.push({
        _id: s._id,
        type: 'swap',
        amount: s.amount,
        currency: s.currency,
        status: s.status,
        createdAt: s.createdAt,
        metadata: s.metadata,
      });
    });

    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// ============ BALANCE ROUTE ============

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

    await Notification.create({
      userId: user._id,
      title: '✅ KYC Verified',
      message: 'Your identity has been verified. You now have full access to all features.',
      type: 'kyc',
      link: '/profile',
    });

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

    await Notification.create({
      userId: user._id,
      title: '❌ KYC Rejected',
      message: `Your KYC submission was rejected. Reason: ${user.kyc.adminNote}`,
      type: 'kyc',
      link: '/profile',
    });

    res.json({
      message: `KYC rejected for ${user.fullName}`,
      kyc: user.kyc,
    });
  } catch (error) {
    console.error('Error rejecting KYC:', error);
    res.status(500).json({ message: 'Error rejecting KYC' });
  }
});

app.post('/api/kyc/submit', authenticateToken, upload.single('governmentId'), async (req, res) => {
  try {
    const { idType, idNumber } = req.body;
    
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

// ============ SWAP ROUTE ============

app.get('/api/swap/rates', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,bnb&vs_currencies=usd'
    );
    const data = await response.json();
    
    const rates = {
      USD: 1,
      BTC: data.bitcoin?.usd || 0,
      ETH: data.ethereum?.usd || 0,
      USDT: data.tether?.usd || 1,
      BNB: data.bnb?.usd || 0,
    };
    
    res.json(rates);
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.json({
      USD: 1,
      BTC: 65432,
      ETH: 3456,
      USDT: 1,
      BNB: 587
    });
  }
});

app.post('/api/swap', authenticateToken, async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;
    
    if (!fromCurrency || !toCurrency || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Please provide valid swap details' });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let swapFeePercent = 0.5;
    const feeSetting = await SystemSetting.findOne({ key: 'swapFee' });
    if (feeSetting) swapFeePercent = feeSetting.value;
    
    const ratesResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,bnb&vs_currencies=usd'
    );
    const ratesData = await ratesResponse.json();
    
    const rates = {
      USD: 1,
      BTC: ratesData.bitcoin?.usd || 65432,
      ETH: ratesData.ethereum?.usd || 3456,
      USDT: ratesData.tether?.usd || 1,
      BNB: ratesData.bnb?.usd || 587,
    };
    
    let fromBalance = 0;
    if (fromCurrency === 'USD') {
      fromBalance = user.fiatBalance;
    } else {
      fromBalance = user.cryptoBalances[fromCurrency] || 0;
    }
    
    if (fromBalance < amount) {
      return res.status(400).json({ message: `Insufficient ${fromCurrency} balance` });
    }
    
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    
    if (!fromRate || !toRate || fromRate === 0) {
      return res.status(400).json({ message: 'Invalid currency selected' });
    }
    
    const usdValue = amount * fromRate;
    const feeAmount = (usdValue * swapFeePercent) / 100;
    const netUsdValue = usdValue - feeAmount;
    const toAmount = netUsdValue / toRate;
    
    if (fromCurrency === 'USD') {
      user.fiatBalance -= amount;
    } else {
      user.cryptoBalances[fromCurrency] -= amount;
    }
    
    if (toCurrency === 'USD') {
      user.fiatBalance += toAmount;
    } else {
      user.cryptoBalances[toCurrency] = (user.cryptoBalances[toCurrency] || 0) + toAmount;
    }
    
    await user.save();
    
    const transaction = new Transaction({
      userId: req.user.userId,
      type: 'swap',
      currencyType: 'crypto',
      currency: toCurrency,
      amount: toAmount,
      status: 'completed',
      description: `Swapped ${amount} ${fromCurrency} to ${toAmount.toFixed(6)} ${toCurrency} (Fee: $${feeAmount.toFixed(2)})`,
      metadata: {
        fromCurrency,
        toCurrency,
        fromAmount: amount,
        toAmount: toAmount,
        rate: toRate / fromRate,
        fee: feeAmount,
        feePercent: swapFeePercent,
      },
    });
    await transaction.save();

    await createPortfolioSnapshot(req.user.userId);
    
    const io = req.app.get('io');
    io.emit('balance-update', {
      userId: req.user.userId,
      newBalance: {
        fiat: user.fiatBalance,
        crypto: user.cryptoBalances,
      },
    });
    
    res.json({
      message: `Successfully swapped ${amount} ${fromCurrency} to ${toAmount.toFixed(6)} ${toCurrency}`,
      swap: {
        fromCurrency,
        toCurrency,
        fromAmount: amount,
        toAmount: toAmount.toFixed(6),
        rate: (toRate / fromRate).toFixed(6),
        fee: feeAmount.toFixed(2),
        feePercent: swapFeePercent,
      },
      newBalance: {
        fiatBalance: user.fiatBalance,
        cryptoBalances: user.cryptoBalances,
      },
    });
    
  } catch (error) {
    console.error('Swap error:', error);
    res.status(500).json({ message: 'Error processing swap' });
  }
});

// ============ NOTIFICATION ROUTES ============

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user.userId,
      isRead: false,
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

app.put('/api/notifications/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

app.delete('/api/notifications/:notificationId', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Notification.findByIdAndDelete(req.params.notificationId);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

// ============ PORTFOLIO HISTORY ROUTES ============

app.get('/api/portfolio/history', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const history = await PortfolioHistory.find({
      userId: req.user.userId,
      snapshotDate: { $gte: startDate },
    })
      .sort({ snapshotDate: 1 })
      .select('totalBalance snapshotDate');

    if (history.length === 0) {
      const user = await User.findById(req.user.userId);
      
      let rates = { BTC: 65432, ETH: 3456, USDT: 1, BNB: 587 };
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,bnb&vs_currencies=usd'
        );
        const data = await response.json();
        rates = {
          BTC: data.bitcoin?.usd || 65432,
          ETH: data.ethereum?.usd || 3456,
          USDT: data.tether?.usd || 1,
          BNB: data.bnb?.usd || 587,
        };
      } catch (err) {
        console.log('Using fallback rates for portfolio');
      }

      const cryptoTotal = 
        (user.cryptoBalances.BTC || 0) * rates.BTC +
        (user.cryptoBalances.ETH || 0) * rates.ETH +
        (user.cryptoBalances.USDT || 0) * rates.USDT +
        (user.cryptoBalances.BNB || 0) * rates.BNB;

      const currentTotal = (user.fiatBalance || 0) + cryptoTotal;

      return res.json({
        history: [
          {
            totalBalance: currentTotal,
            snapshotDate: new Date(),
          },
        ],
      });
    }

    res.json({ history });
  } catch (error) {
    console.error('Portfolio history error:', error);
    res.status(500).json({ message: 'Error fetching portfolio history' });
  }
});

app.post('/api/portfolio/snapshot', authenticateToken, async (req, res) => {
  try {
    await createPortfolioSnapshot(req.user.userId);
    const user = await User.findById(req.user.userId);
    
    let rates = { BTC: 65432, ETH: 3456, USDT: 1, BNB: 587 };
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,bnb&vs_currencies=usd'
      );
      const data = await response.json();
      rates = {
        BTC: data.bitcoin?.usd || 65432,
        ETH: data.ethereum?.usd || 3456,
        USDT: data.tether?.usd || 1,
        BNB: data.bnb?.usd || 587,
      };
    } catch (err) {}

    const cryptoTotal = 
      (user.cryptoBalances.BTC || 0) * rates.BTC +
      (user.cryptoBalances.ETH || 0) * rates.ETH +
      (user.cryptoBalances.USDT || 0) * rates.USDT +
      (user.cryptoBalances.BNB || 0) * rates.BNB;

    const totalBalance = (user.fiatBalance || 0) + cryptoTotal;

    res.json({ message: 'Snapshot created', totalBalance });
  } catch (error) {
    console.error('Portfolio snapshot error:', error);
    res.status(500).json({ message: 'Error creating snapshot' });
  }
});

app.post('/api/portfolio/snapshot-all', async (req, res) => {
  try {
    const users = await User.find({ isApproved: true });
    let created = 0;

    let rates = { BTC: 65432, ETH: 3456, USDT: 1, BNB: 587 };
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,bnb&vs_currencies=usd'
      );
      const data = await response.json();
      rates = {
        BTC: data.bitcoin?.usd || 65432,
        ETH: data.ethereum?.usd || 3456,
        USDT: data.tether?.usd || 1,
        BNB: data.bnb?.usd || 587,
      };
    } catch (err) {}

    for (const user of users) {
      const cryptoTotal = 
        (user.cryptoBalances.BTC || 0) * rates.BTC +
        (user.cryptoBalances.ETH || 0) * rates.ETH +
        (user.cryptoBalances.USDT || 0) * rates.USDT +
        (user.cryptoBalances.BNB || 0) * rates.BNB;

      const totalBalance = (user.fiatBalance || 0) + cryptoTotal;

      await PortfolioHistory.create({
        userId: user._id,
        totalBalance,
        fiatBalance: user.fiatBalance,
        cryptoBalances: user.cryptoBalances,
        snapshotDate: new Date(),
      });
      created++;
    }

    res.json({ message: `Created ${created} snapshots`, created });
  } catch (error) {
    console.error('Snapshot all error:', error);
    res.status(500).json({ message: 'Error creating snapshots' });
  }
});

// ============ TEMPORARY ADMIN SETUP ============

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

app.post('/api/migrate-users', async (req, res) => {
  try {
    const users = await User.find({});
    let updated = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      
      if (!user.address) {
        user.address = { street: '', city: '', state: '', country: '', zipCode: '' };
        needsUpdate = true;
      }
      
      if (!user.contact) {
        user.contact = { email: user.email || '', phone: user.phone || '' };
        needsUpdate = true;
      }
      
      if (user.profilePicture === undefined) {
        user.profilePicture = '';
        needsUpdate = true;
      }
      
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
      
      if (user.withdrawalPin === undefined) {
        user.withdrawalPin = '';
        needsUpdate = true;
      }
      
      if (user.pinIssued === undefined) {
        user.pinIssued = false;
        needsUpdate = true;
      }
      
      if (!user.referralCode) {
        const generateReferralCode = () => {
          return 'BH' + Math.random().toString(36).substring(2, 8).toUpperCase();
        };
        user.referralCode = generateReferralCode();
        needsUpdate = true;
      }
      
      if (user.referralCount === undefined || user.referralCount === null) {
        user.referralCount = 0;
        needsUpdate = true;
      }
      
      if (user.referralEarnings === undefined || user.referralEarnings === null) {
        user.referralEarnings = 0;
        needsUpdate = true;
      }
      
      if (user.referralBonusApplied === undefined) {
        user.referralBonusApplied = false;
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌸 Bloom Haven server running on port ${PORT}`);
  console.log(`🌿 http://localhost:${PORT}`);
});