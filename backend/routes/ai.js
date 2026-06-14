const r = require('express').Router();
const c = require('../controllers/aiController');
r.post('/chat', c.chat);
module.exports = r;
