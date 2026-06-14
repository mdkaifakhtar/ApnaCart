const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  type: { type: String, enum: ['flat', 'percent'], required: true },
  value: { type: Number, required: true },
  minOrder: { type: Number, default: 0 },
  expiresAt: Date,
  active: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Coupon', schema);
