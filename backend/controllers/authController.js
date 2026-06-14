const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

let firebaseAdmin = null;
function getFirebase() {
  if (firebaseAdmin) return firebaseAdmin;
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) return null;
  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
  firebaseAdmin = admin;
  return admin;
}

const sign = (u) => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const safe = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar, addresses: u.addresses });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) { res.status(400); throw new Error('All fields required'); }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) { res.status(400); throw new Error('Email already registered'); }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
  res.status(201).json({ token: sign(user), user: safe(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !user.passwordHash) { res.status(401); throw new Error('Invalid credentials'); }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) { res.status(401); throw new Error('Invalid credentials'); }
  res.json({ token: sign(user), user: safe(user) });
});

exports.google = asyncHandler(async (req, res) => {
  const fb = getFirebase();
  if (!fb) { res.status(500); throw new Error('Google sign-in not configured on the server'); }
  const { idToken } = req.body;
  if (!idToken) { res.status(400); throw new Error('idToken required'); }
  const decoded = await fb.auth().verifyIdToken(idToken);
  const email = decoded.email.toLowerCase();
  let user = await User.findOne({ email });
  if (!user) user = await User.create({ name: decoded.name || email.split('@')[0], email, googleId: decoded.uid, avatar: decoded.picture });
  res.json({ token: sign(user), user: safe(user) });
});

exports.me = asyncHandler(async (req, res) => res.json({ user: safe(req.user) }));

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, addresses } = req.body;
  if (name) req.user.name = name;
  if (addresses) req.user.addresses = addresses;
  await req.user.save();
  res.json({ user: safe(req.user) });
});
