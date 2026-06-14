const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

let model = null;
function getModel() {
  if (model) return model;
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      tools: [{
        functionDeclarations: [{
          name: 'searchProducts',
          description: 'Search the ApnaCart catalog for products by free-text query, optional category slug and max price.',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Free-text product query' },
              categorySlug: { type: 'string' },
              maxPrice: { type: 'number', description: 'Max price in INR' },
            },
            required: ['query'],
          },
        }],
      }],
    });
    return model;
  } catch (err) {
    console.error('[ai] failed to init Gemini:', err.message);
    return null;
  }
}

async function runTool(name, args) {
  if (name !== 'searchProducts') return { error: 'unknown tool' };
  const { query, categorySlug, maxPrice } = args || {};
  const filter = {};
  if (query) filter.$or = [{ name: new RegExp(query, 'i') }, { brand: new RegExp(query, 'i') }];
  if (categorySlug) filter.categorySlug = categorySlug;
  if (maxPrice) filter.price = { $lte: maxPrice };
  const products = await Product.find(filter).sort({ rating: -1 }).limit(6).lean();
  return {
    products: products.map((p) => ({
      slug: p.slug, name: p.name, brand: p.brand,
      price: p.price, rating: p.rating, image: p.image,
    })),
  };
}

// Local keyword-based fallback when no Gemini key is configured
async function fallbackSearch(text) {
  const q = (text || '').toLowerCase();
  const words = q.match(/[a-z]{3,}/g) || [];
  if (!words.length) return [];
  const re = new RegExp(words.slice(0, 4).join('|'), 'i');
  const products = await Product.find({ $or: [{ name: re }, { brand: re }] })
    .sort({ rating: -1 }).limit(6).lean();
  return products.map((p) => ({
    slug: p.slug, name: p.name, brand: p.brand,
    price: p.price, rating: p.rating, image: p.image,
  }));
}

exports.chat = asyncHandler(async (req, res) => {
  const { messages = [] } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'messages array is required' });
  }
  const last = messages[messages.length - 1]?.content || '';
  const m = getModel();

  // Fallback path: no API key configured — still useful
  if (!m) {
    const products = await fallbackSearch(last);
    const reply = products.length
      ? `Here are some matches for "${last}". (Configure GEMINI_API_KEY on the server to enable smart AI replies.)`
      : "Hi! I'm ApnaCart AI. To enable smart recommendations, set GEMINI_API_KEY on the server.";
    return res.json({ reply, products });
  }

  try {
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(msg.content || '') }],
    }));
    const chat = m.startChat({
      history,
      systemInstruction:
        'You are ApnaCart AI, a friendly Indian shopping assistant. Prices are in ₹ (INR). When the user asks for products, comparisons, or recommendations, ALWAYS call searchProducts. Keep replies concise and helpful.',
    });

    let response = await chat.sendMessage(last);
    let products = [];
    for (let i = 0; i < 3; i++) {
      const calls = (response.response.functionCalls && response.response.functionCalls()) || [];
      if (!calls.length) break;
      const results = await Promise.all(calls.map(async (c) => {
        const r = await runTool(c.name, c.args);
        if (r.products) products = products.concat(r.products);
        return { functionResponse: { name: c.name, response: r } };
      }));
      response = await chat.sendMessage(results);
    }

    const reply = (response.response.text && response.response.text()) || '';
    res.json({ reply, products: products.slice(0, 6) });
  } catch (err) {
    console.error('[ai] chat error:', err);
    // Graceful degradation — never 500 the chat
    const products = await fallbackSearch(last).catch(() => []);
    res.json({
      reply: "I had trouble reaching the AI service, but here are some products that might match your query.",
      products,
      fallback: true,
    });
  }
});
