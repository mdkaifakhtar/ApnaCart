const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const Product = require('../models/Product');
const Category = require('../models/Category');

exports.list = asyncHandler(async (req, res) => {
  const { q, category, min, max, sort = 'popular', page = 1, limit = 24 } = req.query;
  const filter = {};
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { brand: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
  if (category) filter.categorySlug = category;
  if (min || max) filter.price = { ...(min && { $gte: +min }), ...(max && { $lte: +max }) };
  const sortMap = { popular: { reviewCount: -1 }, rating: { rating: -1 }, priceAsc: { price: 1 }, priceDesc: { price: -1 }, newest: { createdAt: -1 } };
  const skip = (+page - 1) * +limit;
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sortMap[sort] || sortMap.popular).skip(skip).limit(+limit),
    Product.countDocuments(filter),
  ]);
  res.json({ items, total, page: +page, pages: Math.ceil(total / +limit) });
});

exports.featured = asyncHandler(async (_req, res) => {
  res.json(await Product.find({ isFeatured: true }).limit(12));
});
exports.trending = asyncHandler(async (_req, res) => {
  res.json(await Product.find({ isTrending: true }).limit(12));
});

exports.detail = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category');
  if (!product) { res.status(404); throw new Error('Product not found'); }
  const related = await Product.find({ categorySlug: product.categorySlug, _id: { $ne: product._id } }).limit(8);
  res.json({ product, related });
});

exports.create = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.files && req.files.length > 0) {
    const urls = req.files.map((f) => `/uploads/${f.filename}`);
    body.image = urls[0];
    body.images = urls;
  }

  if (!body.slug) body.slug = slugify(body.name, { lower: true, strict: true });

  let suffix = 0;
  let slug = body.slug;
  while (await Product.exists({ slug })) {
    suffix += 1;
    slug = `${body.slug}-${suffix}`;
  }
  body.slug = slug;

  if (body.category && !body.categorySlug) {
    const cat = await Category.findById(body.category);
    body.categorySlug = cat?.slug;
  }

  const product = await Product.create(body);
  res.status(201).json(product);
});

exports.update = asyncHandler(async (req, res) => {
  const update = { ...req.body };

  if (req.files && req.files.length > 0) {
    const urls = req.files.map((f) => `/uploads/${f.filename}`);
    update.image = urls[0];
    update.images = urls;
  }

  if (update.category && !update.categorySlug) {
    const cat = await Category.findById(update.category);
    if (cat) update.categorySlug = cat.slug;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!product) { res.status(404); throw new Error('Not found'); }
  res.json(product);
});

exports.remove = asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});
