const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) token = header.split(' ')[1];
  if (!token) { res.status(401); throw new Error('Not authorized, no token'); }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) { res.status(401); throw new Error('User not found'); }
    next();
  } catch (e) {
    res.status(401); throw new Error('Token invalid or expired');
  }
});

module.exports = { protect };
