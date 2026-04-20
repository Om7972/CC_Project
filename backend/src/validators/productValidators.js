const { z } = require('zod');

const productCreateSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(2),
  price: z.number().nonnegative(),
});

module.exports = { productCreateSchema };
