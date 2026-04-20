const { z } = require('zod');

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(280).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().max(200).optional()
});

const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR']).optional(),
  language: z.enum(['en', 'es', 'fr', 'de']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional()
  }).optional()
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(128)
});

const addAddressSchema = z.object({
  label: z.string().max(50),
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  addressLine1: z.string().min(5).max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().min(3).max(20),
  country: z.string().length(2),
  isDefault: z.boolean().optional()
});

module.exports = {
  updateProfileSchema,
  updatePreferencesSchema,
  updatePasswordSchema,
  addAddressSchema
};
