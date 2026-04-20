const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Analytics = require('../models/Analytics');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { paginate } = require('../utils/paginate');
const { get, set, del, CacheKeys } = require('../config/redis');
const { getPresignedUrl } = require('../services/s3Service');
const { stripe } = require('../config/stripe');
const { sendMessage } = require('../services/sqsService');

// POST /api/vendors/register
const registerVendor = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { storeName, description, category } = req.body;

  // Check if user already has a vendor account
  const existingVendor = await Vendor.findOne({ owner: userId });
  if (existingVendor) {
    return ApiResponse.error(res, 'You already have a vendor account', 400);
  }

  const vendor = await Vendor.create({
    owner: userId,
    storeName,
    storeSlug: storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description,
    category,
    status: 'pending'
  });

  // Notify admin
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await sendMessage(process.env.EMAIL_QUEUE_URL, {
      type: 'VENDOR_REGISTRATION',
      to: admin.email,
      data: { vendorName: storeName, vendorEmail: req.user.email }
    });
  }

  return ApiResponse.created(res, vendor, 'Vendor registration submitted for approval');
});

// GET /api/vendors/me
const getMyVendor = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const vendor = await Vendor.findOne({ owner: userId }).populate('owner', 'email displayName');

  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor account not found');
  }

  // Get stats
  const totalProducts = await Product.countDocuments({ vendor: vendor._id });
  const activeProducts = await Product.countDocuments({ vendor: vendor._id, status: 'active' });
  const totalOrders = await Order.countDocuments({ 'items.vendor': vendor._id });

  const stats = {
    totalProducts,
    activeProducts,
    totalOrders,
    rating: vendor.rating,
    totalReviews: vendor.totalReviews
  };

  return ApiResponse.success(res, { ...vendor.toObject(), stats }, 'Vendor profile retrieved');
});

// PATCH /api/vendors/me
const updateMyVendor = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { storeName, description, socialLinks } = req.body;

  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor account not found');
  }

  if (storeName) vendor.storeName = storeName;
  if (description) vendor.description = description;
  if (socialLinks) vendor.socialLinks = { ...vendor.socialLinks, ...socialLinks };

  await vendor.save();

  return ApiResponse.success(res, vendor, 'Vendor profile updated');
});

// POST /api/vendors/me/logo
const getLogoUploadUrl = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { contentType = 'image/png' } = req.body;

  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor account not found');
  }

  const key = `vendors/${vendor._id}/logo-${Date.now()}.png`;
  const uploadUrl = await getPresignedUrl(process.env.AWS_S3_BUCKET, key, contentType);
  const logoUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  vendor.logo = logoUrl;
  await vendor.save();

  return ApiResponse.success(res, { uploadUrl, logoUrl }, 'Logo upload URL generated');
});

// POST /api/vendors/me/banner
const getBannerUploadUrl = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { contentType = 'image/jpeg' } = req.body;

  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor account not found');
  }

  const key = `vendors/${vendor._id}/banner-${Date.now()}.jpg`;
  const uploadUrl = await getPresignedUrl(process.env.AWS_S3_BUCKET, key, contentType);
  const bannerUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  vendor.banner = bannerUrl;
  await vendor.save();

  return ApiResponse.success(res, { uploadUrl, bannerUrl }, 'Banner upload URL generated');
});

// GET /api/vendors/me/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const cacheKey = `${CacheKeys.VENDOR_DASHBOARD}_${userId}`;

  // Check cache
  let dashboard = await get(cacheKey);
  if (dashboard) {
    return ApiResponse.success(res, dashboard, 'Dashboard data retrieved from cache');
  }

  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor account not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Today's revenue
  const todayOrders = await Order.aggregate([
    { $match: { 'items.vendor': vendor._id, createdAt: { $gte: today }, status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
    { $unwind: '$items' },
    { $match: { 'items.vendor': vendor._id } },
    { $group: { _id: null, total: { $sum: '$items.totalPrice' } } }
  ]);
  const todayRevenue = todayOrders[0]?.total || 0;

  // Total revenue
  const totalOrders = await Order.aggregate([
    { $match: { 'items.vendor': vendor._id, status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
    { $unwind: '$items' },
    { $match: { 'items.vendor': vendor._id } },
    { $group: { _id: null, total: { $sum: '$items.totalPrice' } } }
  ]);
  const totalRevenue = totalOrders[0]?.total || 0;

  // Order counts
  const totalOrderCount = await Order.countDocuments({ 'items.vendor': vendor._id });
  const pendingOrders = await Order.countDocuments({ 'items.vendor': vendor._id, status: 'pending' });

  // Product counts
  const totalProducts = await Product.countDocuments({ vendor: vendor._id });
  const activeProducts = await Product.countDocuments({ vendor: vendor._id, status: 'active' });

  // Recent orders
  const recentOrders = await Order.find({ 'items.vendor': vendor._id })
    .sort('-createdAt')
    .limit(5)
    .populate('buyer', 'displayName email')
    .lean();

  // Top products
  const topProducts = await Product.find({ vendor: vendor._id })
    .sort('-soldCount -rating')
    .limit(5)
    .select('name slug price soldCount rating images')
    .lean();

  dashboard = {
    todayRevenue,
    totalRevenue,
    totalOrders: totalOrderCount,
    totalProducts,
    activeProducts,
    avgRating: vendor.rating,
    pendingOrders,
    recentOrders,
    topProducts
  };

  // Cache for 10 minutes
  await set(cacheKey, dashboard, 60 * 10);

  return ApiResponse.success(res, dashboard, 'Dashboard data retrieved');
});

// GET /api/vendors/me/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor account not found');
  }

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const groupFormat = {
    day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
    week: { $dateToString: { format: '%Y-W%V', date: '$date' } },
    month: { $dateToString: { format: '%Y-%m', date: '$date' } }
  };

  const analytics = await Analytics.aggregate([
    { $match: { vendor: vendor._id, date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: groupFormat[groupBy],
        revenue: { $sum: '$revenue' },
        orders: { $sum: '$orders' },
        views: { $sum: '$views' },
        conversions: { $sum: '$conversions' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return ApiResponse.success(res, analytics, 'Analytics retrieved');
});

// GET /api/vendors/me/orders
const getVendorOrders = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { page, limit, status } = req.query;
  const { skip, limit: pageLimit } = paginate({ page, limit });

  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor account not found');
  }

  const filter = { 'items.vendor': vendor._id };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(pageLimit)
    .populate('buyer', 'displayName email')
    .lean();

  const total = await Order.countDocuments(filter);

  return ApiResponse.success(res, orders, 'Orders retrieved', 200, {
    page: parseInt(page) || 1,
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit)
  });
});

// PATCH /api/vendors/me/orders/:orderId/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { orderId } = req.params;
  const { status } = req.body;

  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor account not found');
  }

  const order = await Order.findOne({ _id: orderId, 'items.vendor': vendor._id });
  if (!order) {
    return ApiResponse.notFound(res, 'Order not found');
  }

  // Vendors can only update to certain statuses
  const allowedStatuses = ['confirmed', 'processing', 'shipped'];
  if (!allowedStatuses.includes(status)) {
    return ApiResponse.error(res, 'Invalid status for vendor', 400);
  }

  order.status = status;
  order.statusHistory.push({ status, timestamp: new Date() });
  await order.save();

  // Send notification to buyer via Socket.io
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${order.buyer}`).emit('order_status_updated', {
      orderId: order._id,
      status,
      message: `Your order has been ${status}`
    });
  }

  return ApiResponse.success(res, order, 'Order status updated');
});

// GET /api/vendors/me/earnings
const getEarnings = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor account not found');
  }

  const earnings = {
    totalEarned: vendor.totalEarnings || 0,
    pendingPayout: vendor.pendingPayout || 0,
    availableForPayout: vendor.availableBalance || 0,
    payoutHistory: vendor.payouts || []
  };

  return ApiResponse.success(res, earnings, 'Earnings retrieved');
});

// POST /api/vendors/me/payout
const requestPayout = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { amount } = req.body;

  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor account not found');
  }

  if (!vendor.stripeAccountId) {
    return ApiResponse.error(res, 'Stripe account not connected', 400);
  }

  const payoutAmount = amount || vendor.availableBalance || 0;

  if (payoutAmount <= 0) {
    return ApiResponse.error(res, 'No funds available for payout', 400);
  }

  if (payoutAmount > vendor.availableBalance) {
    return ApiResponse.error(res, 'Insufficient balance', 400);
  }

  // Create Stripe transfer
  const transfer = await stripe.transfers.create({
    amount: Math.round(payoutAmount * 100),
    currency: 'usd',
    destination: vendor.stripeAccountId,
    metadata: { vendorId: vendor._id.toString() }
  });

  // Update vendor
  vendor.availableBalance -= payoutAmount;
  vendor.payouts.push({
    amount: payoutAmount,
    date: new Date(),
    stripeTransferId: transfer.id,
    status: 'completed'
  });
  await vendor.save();

  // Send notification
  const user = await User.findById(userId);
  await sendMessage(process.env.EMAIL_QUEUE_URL, {
    type: 'PAYOUT_COMPLETED',
    to: user.email,
    data: { amount: payoutAmount }
  });

  return ApiResponse.success(res, { amount: payoutAmount, transferId: transfer.id }, 'Payout processed');
});

// POST /api/vendors/me/stripe/connect
const createStripeConnect = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor) {
    return ApiResponse.notFound(res, 'Vendor account not found');
  }

  const user = await User.findById(userId);

  // Create Stripe Connect account
  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    },
    business_type: 'individual',
    metadata: { vendorId: vendor._id.toString() }
  });

  vendor.stripeAccountId = account.id;
  await vendor.save();

  // Create account link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.FRONTEND_URL}/vendor/stripe/connect`,
    return_url: `${process.env.FRONTEND_URL}/vendor/stripe/connect/callback`,
    type: 'account_onboarding'
  });

  return ApiResponse.success(res, { url: accountLink.url }, 'Stripe Connect onboarding URL created');
});

// GET /api/vendors/me/stripe/connect/callback
const stripeConnectCallback = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor || !vendor.stripeAccountId) {
    return ApiResponse.error(res, 'Stripe account not found', 400);
  }

  // Verify account status
  const account = await stripe.accounts.retrieve(vendor.stripeAccountId);

  vendor.stripeAccountStatus = account.charges_enabled ? 'active' : 'pending';
  await vendor.save();

  return ApiResponse.success(res, { status: vendor.stripeAccountStatus }, 'Stripe account status updated');
});

// GET /api/vendors/:storeSlug (public)
const getVendorStorefront = asyncHandler(async (req, res) => {
  const { storeSlug } = req.params;
  const cacheKey = `vendor_storefront_${storeSlug}`;

  // Check cache
  let vendor = await get(cacheKey);

  if (!vendor) {
    vendor = await Vendor.findOne({ storeSlug, status: 'approved' })
      .populate('owner', 'displayName')
      .lean();

    if (!vendor) {
      return ApiResponse.notFound(res, 'Vendor not found');
    }

    // Cache for 5 minutes
    await set(cacheKey, vendor, 60 * 5);
  }

  // Get products
  const products = await Product.find({ vendor: vendor._id, status: 'active' })
    .limit(20)
    .select('name slug price images rating soldCount')
    .lean();

  return ApiResponse.success(res, { ...vendor, products }, 'Vendor storefront retrieved');
});

// GET /api/vendors (public - list/search)
const listVendors = asyncHandler(async (req, res) => {
  const { category, rating, search, sort = '-createdAt', page, limit } = req.query;
  const { skip, limit: pageLimit } = paginate({ page, limit });

  const filter = { status: 'approved' };

  if (category) filter.category = category;
  if (rating) filter.rating = { $gte: parseFloat(rating) };
  if (search) filter.$text = { $search: search };

  const vendors = await Vendor.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(pageLimit)
    .select('storeName storeSlug logo description category rating totalReviews')
    .lean();

  const total = await Vendor.countDocuments(filter);

  return ApiResponse.success(res, vendors, 'Vendors retrieved', 200, {
    page: parseInt(page) || 1,
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit)
  });
});

module.exports = {
  registerVendor,
  getMyVendor,
  updateMyVendor,
  getLogoUploadUrl,
  getBannerUploadUrl,
  getDashboard,
  getAnalytics,
  getVendorOrders,
  updateOrderStatus,
  getEarnings,
  requestPayout,
  createStripeConnect,
  stripeConnectCallback,
  getVendorStorefront,
  listVendors
};
