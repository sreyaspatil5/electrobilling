const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isActive: true });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account pending approval' });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    logger.info(`User logged in: ${user.email}`);
    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register (one-time setup — disable after first use in prod)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }
    const user = await User.create({ name, email, passwordHash: password, status: 'pending', role: 'admin' });
    logger.info(`New user registered and pending approval: ${email}`);
    res.status(201).json({ success: true, message: 'Registration successful. Waiting for admin approval.', user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// GET /api/auth/pending-users
exports.getPendingUsers = async (req, res, next) => {
  try {
    const users = await User.find({ status: 'pending' }).select('-passwordHash');
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/admins
exports.getAdmins = async (req, res, next) => {
  try {
    // Return all users that are active, excluding superadmin if desired, or all active
    const users = await User.find({ status: 'active' }).select('-passwordHash').sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/approve/:userId
exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.status = 'active';
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'User approved successfully', user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/auth/reject/:userId
exports.rejectUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.userId, status: 'pending' });
    if (!user) return res.status(404).json({ success: false, message: 'Pending user not found' });
    
    res.json({ success: true, message: 'User rejected and removed' });
  } catch (err) {
    next(err);
  }
};
