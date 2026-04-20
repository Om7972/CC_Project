const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(6),
  newPassword: z.string().min(8).max(128)
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(6)
});

const resendVerificationSchema = z.object({
  email: z.string().email()
});

const googleAuthSchema = z.object({
  idToken: z.string().min(1)
});

const enable2FASchema = z.object({
  password: z.string().min(8)
});

const verify2FASchema = z.object({
  code: z.string().length(6)
});

const disable2FASchema = z.object({
  code: z.string().length(6)
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  googleAuthSchema,
  enable2FASchema,
  verify2FASchema,
  disable2FASchema
};
