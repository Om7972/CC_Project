const Order = require('../models/Order');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { createPaymentIntent, confirmPaymentIntent } = require('../services/paymentService');
const { publishOrderEvent } = require('../services/sqsService');
const User = require('../models/User');

const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
};

const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];
    let firstProduct = null;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (!firstProduct) firstProduct = product;

      subtotal += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.thumbnail || product.processedImageUrls?.w400 || product.images?.[0]?.url,
      });
    }

    if (!firstProduct) {
      return res.status(400).json({ error: 'Invalid order items' });
    }

    const taxRate = 0.1; // 10% tax
    const tax = subtotal * taxRate;
    const totalAmount = subtotal + tax;

    const orderId = generateOrderId();

    // Skip payment processing for now - TODO: integrate Stripe
    // const paymentIntent = await createPaymentIntent(totalAmount, 'usd', {
    //   orderId,
    //   buyerId: req.user.userId,
    // });

    const vendor = await Vendor.findById(firstProduct.vendorId).populate('userId', 'email');

    const order = new Order({
      orderId,
      buyerId: req.user.userId,
      vendorId: firstProduct.vendorId,
      items: orderItems,
      subtotal,
      tax,
      totalAmount,
      paymentMethod: paymentMethod || 'test',
      paymentStatus: 'completed', // Set to completed for testing
      // stripePaymentIntentId: paymentIntent.id,
      shippingAddress,
      billingAddress,
      status: 'placed',
    });

    await order.save();

    // Publish to SQS for async processing
    try {
      const buyer = await User.findById(req.user.userId);
      await publishOrderEvent({
        orderId,
        buyerId: req.user.userId,
        vendorId: order.vendorId,
        totalAmount,
        buyerEmail: buyer.email,
        vendorEmail: vendor?.userId?.email,
        items: orderItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      });
    } catch (error) {
      console.error('Error publishing order event:', error);
    }

    res.status(201).json({
      order,
      // clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { buyerId: req.user.userId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('vendorId', 'storeName')
      .populate('items.productId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
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

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId')
      .populate('vendorId')
      .populate('items.productId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    if (order.buyerId._id.toString() !== req.user.userId.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID required' });
    }

    const paymentIntent = await confirmPaymentIntent(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const order = await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { paymentStatus: 'completed', status: 'confirmed' },
        { new: true }
      );

      return res.json({ message: 'Payment confirmed', order });
    }

    res.status(400).json({ error: 'Payment not completed' });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  confirmPayment,
  updateOrderStatus,
};
