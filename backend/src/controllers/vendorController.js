const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Product = require('../models/Product');
const { sendVendorApprovalEmail } = require('../services/emailService');

const registerVendor = async (req, res, next) => {
  try {
    const { storeName, category, description, ...rest } = req.body;

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ userId: req.user.userId });
    if (existingVendor) {
      return res.status(400).json({ error: 'User is already a vendor' });
    }

    const vendor = new Vendor({
      userId: req.user.userId,
      storeName,
      category,
      description,
      ...rest,
      status: 'pending',
    });

    await vendor.save();

    res.status(201).json(vendor);
  } catch (error) {
    next(error);
  }
};

const getVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('userId', 'email name phone');

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

const getMyVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

const updateVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

const getVendorProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find({ vendorId: req.params.vendorId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ vendorId: req.params.vendorId });

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const approveVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        status: 'approved',
        approvedBy: req.user.userId,
        approvalDate: new Date(),
      },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Update user role to vendor
    await User.findByIdAndUpdate(vendor.userId, { role: 'vendor' });

    // Send approval email
    const user = await User.findById(vendor.userId);
    await sendVendorApprovalEmail(user.email, vendor.storeName, 'approved');

    res.json({ message: 'Vendor approved', vendor });
  } catch (error) {
    next(error);
  }
};

const rejectVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        status: 'rejected',
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Send rejection email
    const user = await User.findById(vendor.userId);
    await sendVendorApprovalEmail(user.email, vendor.storeName, 'rejected');

    res.json({ message: 'Vendor rejected', vendor });
  } catch (error) {
    next(error);
  }
};

const getVendorEarnings = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const earnings = await Order.aggregate([
      {
        $match: {
          vendorId: vendor._id,
          paymentStatus: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    res.json(earnings[0] || { totalEarnings: 0, totalOrders: 0 });
  } catch (error) {
    next(error);
  }
};

const getAllVendors = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = 'approved' } = req.query;
    const skip = (page - 1) * limit;

    const vendors = await Vendor.find({ status })
      .populate('userId', 'email name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Vendor.countDocuments({ status });

    res.json({
      vendors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerVendor,
  getVendorProfile,
  getMyVendorProfile,
  updateVendorProfile,
  getVendorProducts,
  approveVendor,
  rejectVendor,
  getVendorEarnings,
  getAllVendors,
};
