const { z } = require('zod');

const subscribeSchema = z.object({
  plan: z.enum(['pro', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual'])
});

const upgradeSchema = z.object({
  newPlan: z.enum(['pro', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual'])
});

module.exports = {
  subscribeSchema,
  upgradeSchema
};
