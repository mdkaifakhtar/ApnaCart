const r = require('express').Router();
const c = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
r.get('/:productId', c.list);
r.post('/:productId', protect, c.create);
r.put('/:id', protect, c.update);
r.delete('/:id', protect, c.remove);
module.exports = r;
