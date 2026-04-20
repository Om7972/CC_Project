const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { subscribeSchema, upgradeSchema } = require('../validators/subscriptionValidators');
const {
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
} = require('../controllers/subscriptionController');

const router = express.Router();

// Public routes
router.get('/plans', getPlans);
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Protected routes
router.use(verifyToken);

router.get('/current', getCurrentSubscription);
router.post('/subscribe', validate(subscribeSchema), subscribe);
router.post('/upgrade', validate(upgradeSchema), upgrade);
router.post('/cancel', cancel);
router.post('/reactivate', reactivate);
router.post('/pause', pause);
router.post('/resume', resume);
router.get('/invoices', getInvoices);
router.get('/invoices/:id/download', downloadInvoice);

module.exports = router;
