const jwt = require('jsonwebtoken');
const User = require('../models/User');
 
// Verify JWT token and attach user to request
const protect = async (req, res, next) => {
  let token;
 
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
 
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: 'User not found' });
      }
 
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: 'Token invalid or expired' });
    }
  }
 
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'No token, access denied' });
  }
};
 
// Restrict route to HR role only
const hrOnly = (req, res, next) => {
  if (req.user && req.user.role === 'hr') {
    next();
  } else {
    res
      .status(403)
      .json({ success: false, message: 'Access denied. HR only.' });
  }
};
 
module.exports = { protect, hrOnly };