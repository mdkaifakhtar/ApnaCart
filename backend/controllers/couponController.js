const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

exports.list = asyncHandler(async (_req, res) => res.json(await Coupon.find().sort({ createdAt: -1 })));
exports.create = asyncHandler(async (req, res) => res.status(201).json(await Coupon.create(req.body)));
exports.update = asyncHandler(async (req, res) => res.json(await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true })));
exports.remove = asyncHandler(async (req, res) => { await Coupon.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

exports.apply = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({ code: (code || '').toUpperCase(), active: true });
  if (!coupon) { res.status(404); throw new Error('Invalid coupon'); }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) { res.status(400); throw new Error('Coupon expired'); }
  if (subtotal < coupon.minOrder) { res.status(400); throw new Error(`Minimum order ₹${coupon.minOrder}`); }
  const discount = coupon.type === 'flat' ? coupon.value : Math.round((subtotal * coupon.value) / 100);
  res.json({ code: coupon.code, discount, type: coupon.type, value: coupon.value });
});
