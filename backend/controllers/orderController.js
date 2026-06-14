const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

exports.place = asyncHandler(async (req, res) => {
  const { address, paymentMethod = 'cod', couponCode } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || !cart.items.length) { res.status(400); throw new Error('Cart is empty'); }

  const items = cart.items.map((i) => ({
    product: i.product._id, name: i.product.name, image: i.product.image,
    price: i.product.price, quantity: i.quantity,
  }));
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
    if (coupon && (!coupon.expiresAt || coupon.expiresAt >= new Date()) && subtotal >= coupon.minOrder) {
      discount = coupon.type === 'flat' ? coupon.value : Math.round((subtotal * coupon.value) / 100);
    }
  }
  const shipping = subtotal - discount >= 499 ? 0 : 49;
  const total = subtotal - discount + shipping;

  const order = await Order.create({
    user: req.user._id, items, subtotal, discount, shipping, total,
    address, paymentMethod, couponCode: couponCode || undefined,
    timeline: [{ status: 'placed' }],
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
  });

  // Decrement stock
  for (const it of items) {
    await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.quantity } });
  }
  // Clear cart
  cart.items = []; await cart.save();

  res.status(201).json(order);
});

exports.myOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

exports.detail = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403); throw new Error('Forbidden');
  }
  res.json(order);
});

exports.cancel = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || String(order.user) !== String(req.user._id)) { res.status(404); throw new Error('Not found'); }
  if (['shipped','out_for_delivery','delivered','cancelled'].includes(order.status)) {
    res.status(400); throw new Error('Order can no longer be cancelled');
  }
  order.status = 'cancelled';
  order.timeline.push({ status: 'cancelled' });
  await order.save();
  res.json(order);
});

// admin
exports.adminList = asyncHandler(async (_req, res) => {
  res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }));
});
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Not found'); }
  order.status = status;
  order.timeline.push({ status });
  if (status === 'delivered') order.paymentStatus = 'paid';
  await order.save();
  res.json(order);
});
