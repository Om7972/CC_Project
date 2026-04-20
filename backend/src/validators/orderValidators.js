const { z } = require('zod');

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().nonnegative(),
    })
  ).min(1),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    address1: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    zip: z.string().min(3),
    country: z.string().min(2),
  }),
});

module.exports = { createOrderSchema };
