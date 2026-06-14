const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

async function refreshAggregates(productId) {
  const items = await Review.find({ product: productId });
  const reviewCount = items.length;
  const rating = reviewCount ? +(items.reduce((s, r) => s + r.rating, 0) / reviewCount).toFixed(2) : 0;
  await Product.findByIdAndUpdate(productId, { rating, reviewCount });
}

exports.list = asyncHandler(async (req, res) => {
  const items = await Review.find({ product: req.params.productId }).populate('user', 'name avatar').sort({ createdAt: -1 });
  res.json(items);
});

exports.create = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, body } = req.body;
  const verified = !!(await Order.findOne({ user: req.user._id, 'items.product': productId, status: 'delivered' }));
  const review = await Review.findOneAndUpdate(
    { product: productId, user: req.user._id },
    { rating, title, body, verifiedPurchase: verified },
    { new: true, upsert: true }
  );
  await refreshAggregates(productId);
  res.status(201).json(review);
});

exports.update = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!review) { res.status(404); throw new Error('Review not found'); }
  await refreshAggregates(review.product);
  res.json(review);
});

exports.remove = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (review) await refreshAggregates(review.product);
  res.json({ ok: true });
});
