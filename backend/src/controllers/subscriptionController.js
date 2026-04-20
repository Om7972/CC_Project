const User = require('../models/User');
const Subscription = require('../models/Subscription');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { stripe } = require('../config/stripe');
const {
  getPriceIds,
  createCustomer,
  createSubscription: stripeCreateSubscription,
  upgradeSubscription,
  cancelSubscription: stripeCancelSubscription,
  pauseSubscription,
  constructWebhookEvent
} = require('../services/stripe');
const { sendMessage } = require('../services/sqsService');

const PLAN_FEATURES = {
  free: {
    maxProducts: 10,
    analyticsAccess: false,
    apiAccess: false,
    customDomain: false,
    prioritySupport: false,
    whiteLabel: false
  },
  pro: {
    maxProducts: 100,
    analyticsAccess: true,
    apiAccess: true,
    customDomain: false,
    prioritySupport: true,
    whiteLabel: false
  },
  enterprise: {
    maxProducts: -1, // unlimited
    analyticsAccess: true,
    apiAccess: true,
    customDomain: true,
    prioritySupport: true,
    whiteLabel: true
  }
};

// GET /api/subscriptions/plans
const getPlans = asyncHandler(async (req, res) => {
  const priceIds = getPriceIds();

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      features: PLAN_FEATURES.free,
      stripePriceId: null
    },
    pro: {
      name: 'Pro',
      price: { monthly: 29, annual: 290 },
      features: PLAN_FEATURES.pro,
      stripePriceId: {
        monthly: priceIds.pro_monthly,
        annual: priceIds.pro_annual
      }
    },
    enterprise: {
      name: 'Enterprise',
      price: { monthly: 99, annual: 990 },
      features: PLAN_FEATURES.enterprise,
      stripePriceId: {
        monthly: priceIds.enterprise_monthly,
        annual: priceIds.enterprise_annual
      }
    }
  };

  return ApiResponse.success(res, plans, 'Plans retrieved successfully');
});

// GET /api/subscriptions/current
const getCurrentSubscription = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findById(userId).select('plan planExpiresAt stripeSubscriptionId');
  const subscription = await Subscription.findOne({ user: userId, status: { $in: ['active', 'trialing'] } })
    .sort('-createdAt')
    .lean();

  const data = {
    plan: user.plan,
    status: subscription?.status || 'free',
    renewalDate: user.planExpiresAt,
    features: PLAN_FEATURES[user.plan],
    billingCycle: subscription?.billingCycle,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
    invoices: subscription?.invoices || []
  };

  return ApiResponse.success(res, data, 'Subscription retrieved successfully');
});

// POST /api/subscriptions/subscribe
const subscribe = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { plan, billingCycle } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  if (user.plan !== 'free') {
    return ApiResponse.error(res, 'Already subscribed. Use upgrade endpoint', 400);
  }

  const priceIds = getPriceIds();
  const priceId = priceIds[`${plan}_${billingCycle}`];

  if (!priceId) {
    return ApiResponse.error(res, 'Invalid plan or billing cycle', 400);
  }

  // Create or get Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await createCustomer(user);
    customerId = customer.id;
    user.stripeCustomerId = customerId;
    await user.save();
  }

  // Create Stripe subscription
  const stripeSubscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent']
  });

  // Create subscription document
  await Subscription.create({
    user: userId,
    plan,
    billingCycle,
    stripeSubscriptionId: stripeSubscription.id,
    stripeCustomerId: customerId,
    stripePriceId: priceId,
    status: 'active',
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    features: PLAN_FEATURES[plan]
  });

  const clientSecret = stripeSubscription.latest_invoice.payment_intent.client_secret;

  return ApiResponse.created(res, {
    subscriptionId: stripeSubscription.id,
    clientSecret
  }, 'Subscription created. Complete payment on frontend.');
});

// POST /api/subscriptions/upgrade
const upgrade = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { newPlan, billingCycle } = req.body;

  const user = await User.findById(userId);
  if (!user || !user.stripeSubscriptionId) {
    return ApiResponse.error(res, 'No active subscription found', 400);
  }

  const priceIds = getPriceIds();
  const newPriceId = priceIds[`${newPlan}_${billingCycle}`];

  if (!newPriceId) {
    return ApiResponse.error(res, 'Invalid plan or billing cycle', 400);
  }

  // Get current subscription
  const stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
  
  // Update subscription with proration
  const updated = await stripe.subscriptions.update(user.stripeSubscriptionId, {
    items: [{
      id: stripeSubscription.items.data[0].id,
      price: newPriceId
    }],
    proration_behavior: 'create_prorations'
  });

  // Update local subscription
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: user.stripeSubscriptionId },
    {
      plan: newPlan,
      billingCycle,
      stripePriceId: newPriceId,
      features: PLAN_FEATURES[newPlan],
      currentPeriodEnd: new Date(updated.current_period_end * 1000)
    }
  );

  // Update user
  user.plan = newPlan;
  user.planExpiresAt = new Date(updated.current_period_end * 1000);
  await user.save();

  return ApiResponse.success(res, null, 'Subscription upgraded successfully');
});

// POST /api/subscriptions/cancel
const cancel = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findById(userId);
  if (!user || !user.stripeSubscriptionId) {
    return ApiResponse.error(res, 'No active subscription found', 400);
  }

  // Cancel at period end
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true
  });

  // Update local subscription
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: user.stripeSubscriptionId },
    { cancelAtPeriodEnd: true }
  );

  // Send cancellation email
  await sendMessage(process.env.EMAIL_QUEUE_URL, {
    type: 'SUBSCRIPTION_CANCELLED',
    to: user.email,
    data: { name: user.displayName, plan: user.plan }
  });

  return ApiResponse.success(res, null, 'Subscription will cancel at period end');
});

// POST /api/subscriptions/reactivate
const reactivate = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findById(userId);
  if (!user || !user.stripeSubscriptionId) {
    return ApiResponse.error(res, 'No subscription found', 400);
  }

  // Reactivate subscription
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: false
  });

  // Update local subscription
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: user.stripeSubscriptionId },
    { cancelAtPeriodEnd: false }
  );

  return ApiResponse.success(res, null, 'Subscription reactivated successfully');
});

// POST /api/subscriptions/pause
const pause = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findById(userId);
  if (!user || !user.stripeSubscriptionId) {
    return ApiResponse.error(res, 'No active subscription found', 400);
  }

  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    pause_collection: { behavior: 'void' }
  });

  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: user.stripeSubscriptionId },
    { status: 'paused', pausedAt: new Date() }
  );

  return ApiResponse.success(res, null, 'Subscription paused successfully');
});

// POST /api/subscriptions/resume
const resume = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findById(userId);
  if (!user || !user.stripeSubscriptionId) {
    return ApiResponse.error(res, 'No subscription found', 400);
  }

  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    pause_collection: null
  });

  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: user.stripeSubscriptionId },
    { status: 'active', pausedAt: null }
  );

  return ApiResponse.success(res, null, 'Subscription resumed successfully');
});

// GET /api/subscriptions/invoices
const getInvoices = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findById(userId);
  if (!user || !user.stripeCustomerId) {
    return ApiResponse.success(res, [], 'No invoices found');
  }

  const invoices = await stripe.invoices.list({
    customer: user.stripeCustomerId,
    limit: 100
  });

  const formattedInvoices = invoices.data.map(inv => ({
    id: inv.id,
    amount: inv.amount_paid / 100,
    currency: inv.currency.toUpperCase(),
    date: new Date(inv.created * 1000),
    status: inv.status,
    pdfUrl: inv.invoice_pdf
  }));

  return ApiResponse.success(res, formattedInvoices, 'Invoices retrieved successfully');
});

// GET /api/subscriptions/invoices/:id/download
const downloadInvoice = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  const user = await User.findById(userId);
  if (!user || !user.stripeCustomerId) {
    return ApiResponse.notFound(res, 'Invoice not found');
  }

  const invoice = await stripe.invoices.retrieve(id);

  if (invoice.customer !== user.stripeCustomerId) {
    return ApiResponse.forbidden(res, 'Access denied');
  }

  return res.redirect(invoice.invoice_pdf);
});

// POST /api/subscriptions/webhook/stripe
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = constructWebhookEvent(req.body, sig);
  } catch (err) {
    return ApiResponse.error(res, `Webhook Error: ${err.message}`, 400);
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      
      if (user) {
        const plan = subscription.items.data[0].price.id.includes('pro') ? 'pro' : 'enterprise';
        user.plan = plan;
        user.planExpiresAt = new Date(subscription.current_period_end * 1000);
        user.stripeSubscriptionId = subscription.id;
        await user.save();

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          },
          { upsert: true }
        );
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      
      if (user) {
        user.plan = 'free';
        user.planExpiresAt = null;
        user.stripeSubscriptionId = null;
        await user.save();

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          { status: 'cancelled' }
        );

        // Send email
        await sendMessage(process.env.EMAIL_QUEUE_URL, {
          type: 'SUBSCRIPTION_ENDED',
          to: user.email,
          data: { name: user.displayName }
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const subscription = await Subscription.findOne({ stripeCustomerId: invoice.customer });
      
      if (subscription) {
        subscription.invoices.push({
          stripeInvoiceId: invoice.id,
          amount: invoice.amount_paid / 100,
          paidAt: new Date(invoice.created * 1000),
          pdfUrl: invoice.invoice_pdf
        });
        await subscription.save();

        // Send receipt email
        const user = await User.findById(subscription.user);
        await sendMessage(process.env.EMAIL_QUEUE_URL, {
          type: 'PAYMENT_RECEIPT',
          to: user.email,
          data: { amount: invoice.amount_paid / 100, invoiceUrl: invoice.invoice_pdf }
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const user = await User.findOne({ stripeCustomerId: invoice.customer });
      
      if (user) {
        await Subscription.findOneAndUpdate(
          { stripeCustomerId: invoice.customer },
          { status: 'past_due' }
        );

        // Send payment failed email
        await sendMessage(process.env.EMAIL_QUEUE_URL, {
          type: 'PAYMENT_FAILED',
          to: user.email,
          data: { name: user.displayName }
        });
      }
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      // Handle order payment confirmation if needed
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return res.json({ received: true });
});

module.exports = {
  getPlans,
  getCurrentSubscription,
  subscribe,
  upgrade,
  cancel,
  reactivate,
  pause,
  resume,
  getInvoices,
  downloadInvoice,
  handleStripeWebhook
};
