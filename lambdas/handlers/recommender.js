const Redis = require('ioredis');
const { connect } = require('../lib/db');
const { getModels } = require('../lib/models');
const { OpenAI } = require('openai');

let redisClient;

function getRedis() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!redisClient) {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 2,
      connectTimeout: 3000,
    });
  }
  return redisClient;
}

async function getRecommendationsFromOpenAI({ browsingHistory, catalogSummary }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const openai = new OpenAI({ apiKey });
  const prompt = `You are a marketplace recommender. Given browsing history (MongoDB product ids): ${JSON.stringify(
    browsingHistory || []
  )} and catalog sample: ${catalogSummary.slice(0, 6000)}
Return a JSON object ONLY: {"productIds":["id1","id2"]} with exactly 6 distinct valid product ids from the catalog sample. Prefer same categories as history.`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 400,
  });

  const text = completion.choices[0]?.message?.content || '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  const parsed = JSON.parse(jsonMatch[0]);
  return Array.isArray(parsed.productIds) ? parsed.productIds : null;
}

function heuristicRecommendations(products, browsingHistory, limit = 6) {
  const viewed = new Set((browsingHistory || []).map(String));
  const seedCategories = new Set();
  for (const p of products) {
    if (viewed.has(String(p._id))) {
      seedCategories.add(p.category);
    }
  }
  const scored = products
    .filter((p) => !viewed.has(String(p._id)))
    .map((p) => {
      let score = (p.rating || 0) * (p.reviewCount || 0);
      if (seedCategories.size && seedCategories.has(p.category)) score += 50;
      if (p.isFeatured) score += 20;
      return { id: String(p._id), score };
    })
    .sort((a, b) => b.score - a.score);
  const out = [];
  const seen = new Set();
  for (const row of scored) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row.id);
    if (out.length >= limit) break;
  }
  let i = 0;
  while (out.length < limit && i < products.length) {
    const id = String(products[i]._id);
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
    i += 1;
  }
  return out.slice(0, limit);
}

module.exports.handler = async (event) => {
  await connect();
  const { Product } = getModels();

  const body = event.body
    ? typeof event.body === 'string'
      ? JSON.parse(event.body)
      : event.body
    : {};

  const userId = body.userId || 'anonymous';
  const browsingHistory = body.browsingHistory || [];

  const redis = getRedis();
  const cacheKey = `rec:${userId}:${JSON.stringify(browsingHistory).slice(0, 200)}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return json(200, { productIds: JSON.parse(cached), cached: true });
      }
    } catch (e) {
      console.warn('Redis cache read failed', e.message);
    }
  }

  const products = await Product.find({ status: 'active' })
    .select('_id name category rating reviewCount isFeatured tags')
    .limit(120)
    .lean();

  const catalogSummary = JSON.stringify(
    products.map((p) => ({
      _id: String(p._id),
      category: p.category,
      tags: p.tags,
      rating: p.rating,
      reviewCount: p.reviewCount,
    }))
  );

  let productIds = await getRecommendationsFromOpenAI({ browsingHistory, catalogSummary });
  if (!productIds || productIds.length < 6) {
    productIds = heuristicRecommendations(products, browsingHistory, 6);
  } else {
    productIds = [...new Set(productIds.map(String))].slice(0, 6);
  }

  if (redis && productIds.length) {
    try {
      await redis.setex(cacheKey, Number(process.env.CACHE_TTL_SECONDS || 1800), JSON.stringify(productIds));
    } catch (e) {
      console.warn('Redis cache write failed', e.message);
    }
  }

  return json(200, { productIds, cached: false });
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    },
    body: JSON.stringify(obj),
  };
}
