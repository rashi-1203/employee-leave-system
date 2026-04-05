const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
 
// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
 
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
 
    if (!name || !email || !password || !department) {
      return res
        .status(400)
        .json({ success: false, message: 'Please fill all required fields' });
    }
 
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already registered' });
    }
 
    const user = await User.create({ name, email, password, role, department });
 
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        leaveBalance: user.leaveBalance,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// @route   POST /api/auth/login
// @desc    Login user and return token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
 
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required' });
    }
 
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }
 
    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: 'Account deactivated. Contact HR.' });
    }
 
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        leaveBalance: user.leaveBalance,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// @route   GET /api/auth/me
// @desc    Get logged-in user's profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});
 
module.exports = router;