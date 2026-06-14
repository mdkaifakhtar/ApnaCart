const r = require('express').Router();
const c = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');
r.get('/', c.list);
r.post('/', protect, admin, c.create);
r.put('/:id', protect, admin, c.update);
r.delete('/:id', protect, admin, c.remove);
module.exports = r;
