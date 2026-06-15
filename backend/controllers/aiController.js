const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

let chatModel = null;
function getChatModel() {
  if (chatModel) return chatModel;
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    chatModel = genAI.getGenerativeModel({
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
    return chatModel;
  } catch (err) {
    console.error('[ai] failed to init Gemini chat model:', err.message);
    return null;
  }
}

function getTextModel() {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
  } catch (err) {
    console.error('[ai] failed to init Gemini text model:', err.message);
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
  const m = getChatModel();

  if (!m) {
    const products = await fallbackSearch(last);
    const reply = products.length
      ? `Here are some matches for "${last}". Set GEMINI_API_KEY to enable smart AI replies.`
      : "Hi! I'm ApnaCart AI. I can help you find products. Try searching for something specific!";
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
    const products = await fallbackSearch(last).catch(() => []);
    res.json({
      reply: "I had trouble with the AI service, but here are some products that might match your query.",
      products,
      fallback: true,
    });
  }
});

exports.generateLogo = asyncHandler(async (req, res) => {
  const { brandName, description, colors, style } = req.body || {};
  if (!brandName || !brandName.trim()) {
    return res.status(400).json({ message: 'brandName is required' });
  }

  const primaryColor = (colors || '#0A2E73').split(',')[0].trim() || '#0A2E73';
  const secondaryColor = (colors || '#0A2E73,#FF7A1A').split(',')[1]?.trim() || '#FF7A1A';
  const initial = brandName.trim().charAt(0).toUpperCase();
  const safeLabel = brandName.trim().substring(0, 20);

  const tm = getTextModel();
  if (tm) {
    try {
      const prompt = `Generate a clean, professional SVG logo for a brand.

Brand Name: ${brandName}
Description: ${description || 'An e-commerce brand'}
Primary Color: ${primaryColor}
Secondary Color: ${secondaryColor}
Style: ${style || 'Modern and professional'}

Requirements:
- Output ONLY valid SVG code, nothing else, no markdown, no explanation
- viewBox="0 0 400 200" width="400" height="200"
- White background rectangle covering full area
- A simple geometric icon on the left side using the brand colors
- Brand name as bold text on the right
- Clean, minimal, professional appearance
- Must be a single complete SVG element

Start directly with <svg`;

      const result = await tm.generateContent(prompt);
      let raw = result.response.text().trim();
      const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
      if (match) {
        return res.json({ svg: match[0], brandName, aiGenerated: true });
      }
    } catch (err) {
      console.error('[ai] logo generation error:', err.message);
    }
  }

  const fallbackSvg = buildFallbackSvg(safeLabel, initial, primaryColor, secondaryColor, description, style);
  res.json({ svg: fallbackSvg, brandName, aiGenerated: false });
});

function buildFallbackSvg(brandName, initial, primary, secondary, description, style) {
  const isMinimal = (style || '').toLowerCase().includes('minimal');
  const isPlayful = (style || '').toLowerCase().includes('playful');

  if (isMinimal) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
  <rect width="400" height="200" fill="white"/>
  <rect x="20" y="75" width="6" height="50" rx="3" fill="${primary}"/>
  <text x="40" y="115" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="${primary}">${brandName}</text>
  <rect x="40" y="125" width="${Math.min(brandName.length * 25, 300)}" height="3" rx="1.5" fill="${secondary}"/>
</svg>`;
  }

  if (isPlayful) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
  <rect width="400" height="200" fill="white"/>
  <circle cx="60" cy="100" r="50" fill="${primary}"/>
  <circle cx="60" cy="100" r="38" fill="${secondary}"/>
  <text x="60" y="112" text-anchor="middle" font-family="Arial,sans-serif" font-size="36" font-weight="900" fill="white">${initial}</text>
  <text x="130" y="95" font-family="Arial,sans-serif" font-size="38" font-weight="800" fill="${primary}">${brandName}</text>
  <text x="132" y="120" font-family="Arial,sans-serif" font-size="13" fill="${secondary}" letter-spacing="2">${(description || '').substring(0, 24).toUpperCase()}</text>
</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
  <defs>
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="200" fill="white"/>
  <rect x="16" y="50" width="96" height="100" rx="16" fill="url(#iconGrad)"/>
  <text x="64" y="115" text-anchor="middle" font-family="Arial,sans-serif" font-size="52" font-weight="900" fill="white">${initial}</text>
  <text x="130" y="105" font-family="Arial,sans-serif" font-size="36" font-weight="700" fill="${primary}">${brandName}</text>
  <rect x="130" y="115" width="${Math.min(brandName.length * 20, 240)}" height="3" rx="1.5" fill="${secondary}"/>
  ${description ? `<text x="130" y="138" font-family="Arial,sans-serif" font-size="12" fill="#666">${description.substring(0, 30)}</text>` : ''}
</svg>`;
}
