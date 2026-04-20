const { z } = require('zod');

const registerVendorSchema = z.object({
  storeName: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.string().min(2).max(50)
});

const updateVendorSchema = z.object({
  storeName: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional()
  }).optional()
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['confirmed', 'processing', 'shipped'])
});

const requestPayoutSchema = z.object({
  amount: z.number().positive().optional()
});

module.exports = {
  registerVendorSchema,
  updateVendorSchema,
  updateOrderStatusSchema,
  requestPayoutSchema
};
