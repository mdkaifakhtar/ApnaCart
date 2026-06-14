const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String, image: String, price: Number, quantity: Number,
  }],
  subtotal: Number,
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: Number,
  address: {
    fullName: String, phone: String, line1: String, line2: String,
    city: String, state: String, pincode: String, country: { type: String, default: 'India' },
  },
  paymentMethod: { type: String, enum: ['cod', 'card', 'upi'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: { type: String, enum: ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'], default: 'placed' },
  couponCode: String,
  timeline: [{ status: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });
module.exports = mongoose.model('Order', schema);
