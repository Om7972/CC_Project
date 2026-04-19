const Product = require('../models/Product');

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

const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.query.userId || 'anonymous';
    const historyParam = req.query.history || req.body?.browsingHistory;
    const browsingHistory = Array.isArray(historyParam)
      ? historyParam
      : typeof historyParam === 'string'
        ? historyParam.split(',').filter(Boolean)
        : [];

    const remote = process.env.RECOMMENDATION_API_URL;
    if (remote) {
      const base = remote.replace(/\/$/, '');
      const url = `${base}/recommendations`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, browsingHistory }),
      });
      const data = await r.json();
      const ids = data.productIds || [];
      const products = await Product.find({ _id: { $in: ids }, status: 'active' })
        .populate('vendorId', 'storeName rating')
        .lean();
      const order = new Map(ids.map((id, i) => [String(id), i]));
      products.sort((a, b) => (order.get(String(a._id)) ?? 99) - (order.get(String(b._id)) ?? 99));
      return res.status(r.ok ? 200 : r.status).json({
        ...data,
        products,
        userId,
        source: 'lambda',
      });
    }

    const products = await Product.find({ status: 'active' })
      .select('_id name category rating reviewCount isFeatured tags')
      .limit(120)
      .lean();

    const productIds = heuristicRecommendations(products, browsingHistory, 6);

    const detailed = await Product.find({ _id: { $in: productIds }, status: 'active' })
      .populate('vendorId', 'storeName rating')
      .lean();
    const order = new Map(productIds.map((id, i) => [String(id), i]));
    detailed.sort((a, b) => (order.get(String(a._id)) ?? 99) - (order.get(String(b._id)) ?? 99));

    res.json({
      productIds,
      products: detailed,
      userId,
      source: 'heuristic',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
};
