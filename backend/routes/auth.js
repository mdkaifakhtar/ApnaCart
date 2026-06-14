const r = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');
r.post('/register', c.register);
r.post('/login', c.login);
r.post('/google', c.google);
r.get('/me', protect, c.me);
r.put('/me', protect, c.updateProfile);
module.exports = r;
