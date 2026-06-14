const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');

const populated = (u) => Cart.findOne({ user: u }).populate('items.product');

exports.get = asyncHandler(async (req, res) => {
  const cart = (await populated(req.user._id)) || (await Cart.create({ user: req.user._id, items: [] }));
  res.json(cart);
});

exports.add = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  const line = cart.items.find((i) => String(i.product) === String(productId));
  if (line) line.quantity += quantity;
  else cart.items.push({ product: productId, quantity });
  await cart.save();
  res.json(await populated(req.user._id));
});

exports.update = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  const line = cart.items.find((i) => String(i.product) === String(productId));
  if (!line) { res.status(404); throw new Error('Item not in cart'); }
  if (quantity <= 0) cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
  else line.quantity = quantity;
  await cart.save();
  res.json(await populated(req.user._id));
});

exports.remove = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = cart.items.filter((i) => String(i.product) !== String(req.params.productId));
    await cart.save();
  }
  res.json(await populated(req.user._id));
});

exports.clear = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ ok: true });
});
