const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

const CacheKeys = Object.freeze({
  PRODUCT: 'PRODUCT',
  USER_PROFILE: 'USER_PROFILE',
  VENDOR_DASHBOARD: 'VENDOR_DASHBOARD',
  RECOMMENDATIONS: 'RECOMMENDATIONS',
});

const get = async (key) => {
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
};

const set = async (key, value, ttlSeconds) => {
  const payload = JSON.stringify(value);
  if (ttlSeconds) return redis.set(key, payload, 'EX', ttlSeconds);
  return redis.set(key, payload);
};

const del = async (key) => redis.del(key);

const invalidatePattern = async (pattern) => {
  const keys = await redis.keys(pattern);
  if (!keys.length) return 0;
  return redis.del(keys);
};

module.exports = { redis, CacheKeys, get, set, del, invalidatePattern };
