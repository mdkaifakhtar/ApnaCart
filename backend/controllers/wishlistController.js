const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

exports.get = asyncHandler(async (req, res) => {
  const w = (await Wishlist.findOne({ user: req.user._id }).populate('products')) ||
            (await Wishlist.create({ user: req.user._id, products: [] }));
  res.json(w);
});
exports.add = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let w = await Wishlist.findOne({ user: req.user._id });
  if (!w) w = await Wishlist.create({ user: req.user._id, products: [] });
  if (!w.products.find((p) => String(p) === String(productId))) w.products.push(productId);
  await w.save();
  res.json(await Wishlist.findOne({ user: req.user._id }).populate('products'));
});
exports.remove = asyncHandler(async (req, res) => {
  const w = await Wishlist.findOne({ user: req.user._id });
  if (w) { w.products = w.products.filter((p) => String(p) !== String(req.params.productId)); await w.save(); }
  res.json(await Wishlist.findOne({ user: req.user._id }).populate('products'));
});
