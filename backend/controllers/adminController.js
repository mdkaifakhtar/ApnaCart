const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.stats = asyncHandler(async (_req, res) => {
  const [users, products, orders, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
  ]);
  res.json({
    users, products, orders,
    revenue: revenueAgg[0]?.total || 0,
  });
});

exports.sales = asyncHandler(async (_req, res) => {
  const data = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' }, orders: { $sum: 1 },
    }},
    { $sort: { _id: 1 } }, { $limit: 30 },
  ]);
  res.json(data.map((d) => ({ date: d._id, revenue: d.revenue, orders: d.orders })));
});

exports.users = asyncHandler(async (_req, res) => {
  res.json(await User.find().select('-passwordHash').sort({ createdAt: -1 }));
});

exports.setRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) { res.status(400); throw new Error('Bad role'); }
  const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
  res.json(u);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});
