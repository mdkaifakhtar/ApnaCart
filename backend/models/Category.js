const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  icon: String,
  image: String,
}, { timestamps: true });
module.exports = mongoose.model('Category', schema);
