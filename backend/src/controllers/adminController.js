const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { paginate } = require('../utils/paginate');
const { sendMessage } = require('../services/sqsService');

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalVendors = await Vendor.countDocuments({ status: 'approved' });
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  const revenueData = await Order.aggregate([
    { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = revenueData[0]?.total || 0;

  const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });

  // Calculate MRR
  const subscriptions = await Subscription.find({ status: 'active' });
  let mrr = 0;
  subscriptions.forEach(sub => {
    const priceMap = { pro: { monthly: 29, annual: 24.17 }, enterprise: { monthly: 99, annual: 82.5 } };
    mrr += priceMap[sub.plan]?.[sub.billingCycle] || 0;
  });

  const stats = {
    totalUsers,
    totalVendors,
    totalProducts,
    totalOrders,
    totalRevenue,
    MRR: Math.round(mrr),
    activeSubscriptions
  };

  return ApiResponse.success(res, stats, 'Platform stats retrieved');
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { role, plan, status, search, page, limit } = req.query;
  const { skip, limit: pageLimit } = paginate({ page, limit });

  const filter = {};
  if (role) filter.role = role;
  if (plan) filter.plan = plan;
  if (status === 'banned') filter.isBanned = true;
  if (search) filter.$or = [
    { email: { $regex: search, $options: 'i' } },
    { displayName: { $regex: search, $options: 'i' } }
  ];

  const users = await User.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(pageLimit)
    .select('-password -twoFactorSecret')
    .lean();

  const total = await User.countDocuments(filter);

  return ApiResponse.success(res, users, 'Users retrieved', 200, {
    page: parseInt(page) || 1,
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit)
  });
});

// PATCH /api/admin/users/:id/ban
const banUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { isBanned: true, banReason: reason || 'Violation of terms' },
    { new: true }
  );

  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  return ApiResponse.success(res, user, 'User banned successfully');
});

// PATCH /api/admin/users/:id/unban
const unbanUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { isBanned: false, banReason: null },
    { new: true }
  );

  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  return ApiResponse.success(res, user, 'User unbanned successfully');
});

// PATCH /api/admin/users/:id/role
const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['buyer', 'vendor', 'admin'].includes(role)) {
    return ApiResponse.error(res, 'Invalid role', 400);
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true });

  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  return ApiResponse.success(res, user, 'User role updated');
});

// GET /api/admin/vendors
const getVendors = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const { skip, limit: pageLimit } = paginate({ page, limit });

  const filter = {};
  if (status) filter.status = status;

  const vendors = await Vendor.find(filter)
    .populate('owner', 'email displayName')
    .sort('-createdAt')
    .skip(skip)
    .limit(pageLimit)
    .lean();

  const total = await Vendor.countDocuments(filter);

  return ApiResponse.success(res, vendors, 'Vendors retrieved', 200, {
    page: parseInt(page) || 1,
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit)
  });
});

// PATCH /api/admin/vendors/:id/approve
const approveVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vendor = await Vendor.findByIdAndUpdate(
    id,
    { status: 'approved' },
    { new: true }
  ).populate('owner', 'email displayName');

  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor not found');
  }

  // Update user role
  await User.findByIdAndUpdate(vendor.owner._id, { role: 'vendor' });

  // Send approval email
  await sendMessage(process.env.EMAIL_QUEUE_URL, {
    type: 'VENDOR_APPROVED',
    to: vendor.owner.email,
    data: { storeName: vendor.storeName }
  });

  return ApiResponse.success(res, vendor, 'Vendor approved successfully');
});

// PATCH /api/admin/vendors/:id/reject
const rejectVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const vendor = await Vendor.findByIdAndUpdate(
    id,
    { status: 'rejected', rejectionReason: reason },
    { new: true }
  ).populate('owner', 'email displayName');

  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor not found');
  }

  // Send rejection email
  await sendMessage(process.env.EMAIL_QUEUE_URL, {
    type: 'VENDOR_REJECTED',
    to: vendor.owner.email,
    data: { storeName: vendor.storeName, reason }
  });

  return ApiResponse.success(res, vendor, 'Vendor rejected');
});

// PATCH /api/admin/vendors/:id/suspend
const suspendVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const vendor = await Vendor.findByIdAndUpdate(
    id,
    { status: 'suspended', suspensionReason: reason },
    { new: true }
  );

  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor not found');
  }

  return ApiResponse.success(res, vendor, 'Vendor suspended');
});

// GET /api/admin/orders
const getOrders = asyncHandler(async (req, res) => {
  const { status, vendor, startDate, endDate, page, limit } = req.query;
  const { skip, limit: pageLimit } = paginate({ page, limit });

  const filter = {};
  if (status) filter.status = status;
  if (vendor) filter['items.vendor'] = vendor;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const orders = await Order.find(filter)
    .populate('buyer', 'displayName email')
    .sort('-createdAt')
    .skip(skip)
    .limit(pageLimit)
    .lean();

  const total = await Order.countDocuments(filter);

  return ApiResponse.success(res, orders, 'Orders retrieved', 200, {
    page: parseInt(page) || 1,
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit)
  });
});

// GET /api/admin/products
const getProducts = asyncHandler(async (req, res) => {
  const { status, category, page, limit } = req.query;
  const { skip, limit: pageLimit } = paginate({ page, limit });

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  const products = await Product.find(filter)
    .populate('vendor', 'storeName')
    .sort('-createdAt')
    .skip(skip)
    .limit(pageLimit)
    .lean();

  const total = await Product.countDocuments(filter);

  return ApiResponse.success(res, products, 'Products retrieved', 200, {
    page: parseInt(page) || 1,
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit)
  });
});

// PATCH /api/admin/products/:id/feature
const toggleFeatureProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isFeatured, featuredUntil } = req.body;

  const product = await Product.findByIdAndUpdate(
    id,
    { isFeatured, featuredUntil: featuredUntil ? new Date(featuredUntil) : null },
    { new: true }
  );

  if (!product) {
    return ApiResponse.notFound(res, 'Product not found');
  }

  return ApiResponse.success(res, product, 'Product feature status updated');
});

// GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  // Revenue chart
  const revenueChart = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // User growth
  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Top vendors
  const topVendors = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.vendor', revenue: { $sum: '$items.totalPrice' }, orders: { $sum: 1 } } },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'vendor' } },
    { $unwind: '$vendor' }
  ]);

  // Top products
  const topProducts = await Product.find()
    .sort('-soldCount')
    .limit(10)
    .populate('vendor', 'storeName')
    .select('name slug price soldCount revenue')
    .lean();

  // Subscription breakdown
  const subscriptionBreakdown = await Subscription.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: { plan: '$plan', billingCycle: '$billingCycle' }, count: { $sum: 1 } } }
  ]);

  return ApiResponse.success(res, {
    revenueChart,
    userGrowth,
    topVendors,
    topProducts,
    subscriptionBreakdown
  }, 'Analytics retrieved');
});

module.exports = {
  getStats,
  getUsers,
  banUser,
  unbanUser,
  changeUserRole,
  getVendors,
  approveVendor,
  rejectVendor,
  suspendVendor,
  getOrders,
  getProducts,
  toggleFeatureProduct,
  getAnalytics
};
