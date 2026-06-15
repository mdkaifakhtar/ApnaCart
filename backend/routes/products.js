const r = require('express').Router();
const c = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

r.get('/', c.list);
r.get('/featured', c.featured);
r.get('/trending', c.trending);
r.get('/:slug', c.detail);
r.post('/', protect, admin, upload.array('images', 10), c.create);
r.put('/:id', protect, admin, upload.array('images', 10), c.update);
r.delete('/:id', protect, admin, c.remove);
module.exports = r;
