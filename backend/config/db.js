const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI missing');
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (e) {
    console.error('Mongo error:', e.message);
    process.exit(1);
  }
};
