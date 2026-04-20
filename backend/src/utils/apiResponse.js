const success = (res, data = {}, message = 'OK', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const error = (res, message = 'Error', statusCode = 400, details) =>
  res.status(statusCode).json({ success: false, message, details });

module.exports = { success, error };
