const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const Category = require('../models/Category');

exports.list = asyncHandler(async (_req, res) => res.json(await Category.find().sort({ name: 1 })));
exports.create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!body.slug) body.slug = slugify(body.name, { lower: true, strict: true });
  res.status(201).json(await Category.create(body));
});
exports.update = asyncHandler(async (req, res) => res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })));
exports.remove = asyncHandler(async (req, res) => { await Category.findByIdAndDelete(req.params.id); res.json({ ok: true }); });
