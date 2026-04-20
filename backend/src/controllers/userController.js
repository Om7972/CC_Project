const User = require('../models/User');
const Address = require('../models/Address');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { paginate } = require('../utils/paginate');
const { get, set, del, CacheKeys } = require('../config/redis');
const { getPresignedUrl } = require('../services/s3Service');
const { changePassword: cognitoChangePassword } = require('../services/cognitoService');
const bcrypt = require('bcryptjs');

// GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const cacheKey = `${CacheKeys.USER_PROFILE}_${userId}`;

  let user = await get(cacheKey);
  
  if (!user) {
    user = await User.findById(userId).lean();
    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }
    await set(cacheKey, user, 60 * 5);
  }

  return ApiResponse.success(res, user, 'Profile retrieved successfully');
});

// PATCH /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { displayName, bio, phone, location, website } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { displayName, bio, phone, location, website },
    { new: true, runValidators: true }
  );

  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  // Invalidate cache
  await del(`${CacheKeys.USER_PROFILE}_${userId}`);

  return ApiResponse.success(res, user, 'Profile updated successfully');
});

// POST /api/users/avatar
const getAvatarUploadUrl = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { contentType = 'image/jpeg' } = req.body;

  const key = `avatars/${userId}/${Date.now()}.jpg`;
  const uploadUrl = await getPresignedUrl(process.env.AWS_S3_BUCKET, key, contentType);
  const avatarUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return ApiResponse.success(res, { uploadUrl, avatarUrl, key }, 'Upload URL generated');
});

// PATCH /api/users/avatar/confirm
const confirmAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { avatarUrl } = req.body;

  if (!avatarUrl) {
    return ApiResponse.error(res, 'Avatar URL required', 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarUrl },
    { new: true }
  );

  // Invalidate cache
  await del(`${CacheKeys.USER_PROFILE}_${userId}`);

  return ApiResponse.success(res, { avatar: user.avatar }, 'Avatar updated successfully');
});

// DELETE /api/users/avatar
const deleteAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: null },
    { new: true }
  );

  // Invalidate cache
  await del(`${CacheKeys.USER_PROFILE}_${userId}`);

  return ApiResponse.success(res, null, 'Avatar deleted successfully');
});

// PATCH /api/users/password
const updatePassword = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  // If using Cognito, use Cognito password change
  if (user.loginProvider === 'cognito') {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      await cognitoChangePassword(accessToken, currentPassword, newPassword);
      return ApiResponse.success(res, null, 'Password updated successfully');
    } catch (error) {
      if (error.name === 'NotAuthorizedException') {
        return ApiResponse.error(res, 'Current password is incorrect', 400);
      }
      throw error;
    }
  }

  // For local users
  if (!user.password) {
    return ApiResponse.error(res, 'Password not set for this account', 400);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return ApiResponse.error(res, 'Current password is incorrect', 400);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  return ApiResponse.success(res, null, 'Password updated successfully');
});

// PATCH /api/users/preferences
const updatePreferences = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { theme, currency, language, notifications } = req.body;

  const updateData = {};
  if (theme) updateData['preferences.theme'] = theme;
  if (currency) updateData['preferences.currency'] = currency;
  if (language) updateData['preferences.language'] = language;
  if (notifications) {
    if (notifications.email !== undefined) updateData['preferences.notifications.email'] = notifications.email;
    if (notifications.push !== undefined) updateData['preferences.notifications.push'] = notifications.push;
    if (notifications.sms !== undefined) updateData['preferences.notifications.sms'] = notifications.sms;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true }
  );

  // Invalidate cache
  await del(`${CacheKeys.USER_PROFILE}_${userId}`);

  return ApiResponse.success(res, user.preferences, 'Preferences updated successfully');
});

// GET /api/users/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const wishlist = await Wishlist.findOne({ user: userId })
    .populate('products', 'name slug price images rating vendor')
    .lean();

  return ApiResponse.success(res, wishlist?.products || [], 'Wishlist retrieved successfully');
});

// POST /api/users/wishlist/:productId
const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.params;

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [productId] });
  } else {
    if (wishlist.products.includes(productId)) {
      return ApiResponse.error(res, 'Product already in wishlist', 400);
    }
    wishlist.products.push(productId);
    await wishlist.save();
  }

  return ApiResponse.success(res, null, 'Added to wishlist');
});

// DELETE /api/users/wishlist/:productId
const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    return ApiResponse.notFound(res, 'Wishlist not found');
  }

  wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
  await wishlist.save();

  return ApiResponse.success(res, null, 'Removed from wishlist');
});

// GET /api/users/addresses
const getAddresses = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const addresses = await Address.find({ user: userId }).sort('-isDefault -createdAt');

  return ApiResponse.success(res, addresses, 'Addresses retrieved successfully');
});

// POST /api/users/addresses
const addAddress = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const addressData = req.body;

  // Check max addresses (5)
  const count = await Address.countDocuments({ user: userId });
  if (count >= 5) {
    return ApiResponse.error(res, 'Maximum 5 addresses allowed', 400);
  }

  // If this is the first address or marked as default, set as default
  if (count === 0 || addressData.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
    addressData.isDefault = true;
  }

  const address = await Address.create({ ...addressData, user: userId });

  return ApiResponse.created(res, address, 'Address added successfully');
});

// PATCH /api/users/addresses/:id
const updateAddress = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const updateData = req.body;

  const address = await Address.findOneAndUpdate(
    { _id: id, user: userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!address) {
    return ApiResponse.notFound(res, 'Address not found');
  }

  return ApiResponse.success(res, address, 'Address updated successfully');
});

// DELETE /api/users/addresses/:id
const deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  const address = await Address.findOneAndDelete({ _id: id, user: userId });

  if (!address) {
    return ApiResponse.notFound(res, 'Address not found');
  }

  // If deleted address was default, set another as default
  if (address.isDefault) {
    const nextAddress = await Address.findOne({ user: userId });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return ApiResponse.success(res, null, 'Address deleted successfully');
});

// PATCH /api/users/addresses/:id/default
const setDefaultAddress = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  // Remove default from all addresses
  await Address.updateMany({ user: userId }, { isDefault: false });

  // Set new default
  const address = await Address.findOneAndUpdate(
    { _id: id, user: userId },
    { isDefault: true },
    { new: true }
  );

  if (!address) {
    return ApiResponse.notFound(res, 'Address not found');
  }

  return ApiResponse.success(res, address, 'Default address updated');
});

// GET /api/users/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { page, limit, isRead } = req.query;
  const { skip, limit: pageLimit } = paginate({ page, limit });

  const filter = { user: userId };
  if (isRead !== undefined) {
    filter.isRead = isRead === 'true';
  }

  const notifications = await Notification.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(pageLimit)
    .lean();

  const total = await Notification.countDocuments(filter);

  return ApiResponse.success(res, notifications, 'Notifications retrieved successfully', 200, {
    page: parseInt(page) || 1,
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit)
  });
});

// PATCH /api/users/notifications/read-all
const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );

  return ApiResponse.success(res, null, 'All notifications marked as read');
});

// PATCH /api/users/notifications/:id/read
const markNotificationRead = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return ApiResponse.notFound(res, 'Notification not found');
  }

  return ApiResponse.success(res, notification, 'Notification marked as read');
});

// DELETE /api/users/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({ _id: id, user: userId });

  if (!notification) {
    return ApiResponse.notFound(res, 'Notification not found');
  }

  return ApiResponse.success(res, null, 'Notification deleted successfully');
});

module.exports = {
  getProfile,
  updateProfile,
  getAvatarUploadUrl,
  confirmAvatar,
  deleteAvatar,
  updatePassword,
  updatePreferences,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification
};
