const r = require('express').Router();
const c = require('../controllers/aiController');
r.post('/chat', c.chat);
r.post('/generate-logo', c.generateLogo);
module.exports = r;
