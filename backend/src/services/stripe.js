const { stripe } = require('../config/stripe');

const getPriceIds = () => ({
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
  enterprise_annual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
});

const createCustomer = (user) =>
  stripe.customers.create({ email: user.email, name: user.displayName || user.name, metadata: { userId: String(user._id) } });

const createSubscription = (customerId, priceId) =>
  stripe.subscriptions.create({ customer: customerId, items: [{ price: priceId }] });

const upgradeSubscription = (subId, newPriceId) =>
  stripe.subscriptions.update(subId, { items: [{ price: newPriceId }] });

const cancelSubscription = (subId, immediately = false) =>
  immediately ? stripe.subscriptions.cancel(subId) : stripe.subscriptions.update(subId, { cancel_at_period_end: true });

const pauseSubscription = (subId) => stripe.subscriptions.update(subId, { pause_collection: { behavior: 'void' } });

const createPaymentIntent = (amount, currency = 'usd', vendorAccountId) =>
  stripe.paymentIntents.create({ amount, currency, metadata: { vendorAccountId: vendorAccountId || '' } });

const transferToVendor = (amount, vendorStripeAccountId, orderId) =>
  stripe.transfers.create({ amount, currency: 'usd', destination: vendorStripeAccountId, metadata: { orderId } });

const createRefund = (chargeId, amount) => stripe.refunds.create({ charge: chargeId, amount });

const constructWebhookEvent = (payload, sig) =>
  stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

module.exports = {
  getPriceIds,
  createCustomer,
  createSubscription,
  upgradeSubscription,
  cancelSubscription,
  pauseSubscription,
  createPaymentIntent,
  transferToVendor,
  createRefund,
  constructWebhookEvent,
};
