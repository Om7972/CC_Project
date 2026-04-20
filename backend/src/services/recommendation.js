const Product = require('../models/Product');
const { redis, CacheKeys, get, set } = require('../config/redis');

const getRecommendations = async (userId, limit = 8) => {
  const key = `${CacheKeys.RECOMMENDATIONS}_${userId}`;
  const cached = await get(key);
  if (cached) return cached;
  const products = await Product.find({ status: 'active' }).sort({ purchaseCount: -1, viewCount: -1 }).limit(limit).lean();
  await set(key, products, 60 * 30);
  return products;
};

const trackProductView = async (userId, productId) => {
  await redis.zadd(`views:${userId}`, Date.now(), productId);
  await redis.expire(`views:${userId}`, 60 * 60 * 24 * 30);
};

const getPopularProducts = async (category, limit = 10) => {
  const key = `popular:${category || 'all'}:${limit}`;
  const cached = await get(key);
  if (cached) return cached;
  const query = { status: 'active' };
  if (category) query.category = category;
  const products = await Product.find(query).sort({ purchaseCount: -1, viewCount: -1 }).limit(limit).lean();
  await set(key, products, 60 * 30);
  return products;
};

module.exports = { getRecommendations, trackProductView, getPopularProducts };
