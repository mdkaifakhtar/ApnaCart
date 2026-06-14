const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  categorySlug: { type: String, required: true, index: true },
  brand: String,
  description: String,
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  image: { type: String, required: true },
  images: [String],
  rating: { type: Number, default: 4 },
  reviewCount: { type: Number, default: 0 },
  stock: { type: Number, default: 50 },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
}, { timestamps: true });

schema.index({ name: 'text', description: 'text', brand: 'text' });
module.exports = mongoose.model('Product', schema);
