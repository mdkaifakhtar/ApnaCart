const r = require('express').Router();
const c = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');
r.use(protect);
r.get('/', c.get);
r.post('/', c.add);
r.delete('/:productId', c.remove);
module.exports = r;
