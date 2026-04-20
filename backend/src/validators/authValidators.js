const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

module.exports = { registerSchema, loginSchema };
