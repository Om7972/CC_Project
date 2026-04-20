const requireRole = (...roles) => (req, res, next) => {
  if (!req.currentUser && !req.user) return res.status(401).json({ error: 'Unauthorized' });
  const role = req.currentUser?.role || req.user?.role;
  if (!roles.includes(role)) return res.status(403).json({ error: 'Forbidden' });
  return next();
};

const requirePlan = (...plans) => (req, res, next) => {
  const plan = req.currentUser?.plan || 'free';
  if (!plans.includes(plan)) return res.status(403).json({ error: 'Plan upgrade required' });
  return next();
};

const requireVendorApproved = (req, res, next) => {
  if (req.currentUser?.role !== 'vendor') return res.status(403).json({ error: 'Vendor only' });
  if (!req.currentUser?.vendorStatus || req.currentUser.vendorStatus !== 'approved') {
    return res.status(403).json({ error: 'Vendor approval required' });
  }
  return next();
};

module.exports = { requireRole, requirePlan, requireVendorApproved };
