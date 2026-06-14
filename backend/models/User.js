const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  fullName: String, phone: String, line1: String, line2: String,
  city: String, state: String, pincode: String, country: { type: String, default: 'India' },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String },
  avatar: String,
  addresses: [addressSchema],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
