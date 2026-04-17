const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { body, params, query } = req;
      const validationData = schema.parse({ body, params, query });
      req.validatedData = validationData;
      next();
    } catch (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
  };
};

module.exports = { validateRequest };
