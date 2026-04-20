/**
 * Standardized API Response Utility
 * Format: { success, data, message, pagination? }
 */

class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200, pagination = null) {
    const response = {
      success: true,
      message,
      data
    };
    
    if (pagination) {
      response.pagination = pagination;
    }
    
    return res.status(statusCode).json(response);
  }

  static error(res, message = 'Error occurred', statusCode = 400, errors = null) {
    const response = {
      success: false,
      message
    };
    
    if (errors) {
      response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static noContent(res, message = 'Operation successful') {
    return res.status(204).send();
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static conflict(res, message = 'Resource conflict') {
    return this.error(res, message, 409);
  }

  static validationError(res, errors, message = 'Validation failed') {
    return this.error(res, message, 400, errors);
  }

  static serverError(res, message = 'Internal server error') {
    return this.error(res, message, 500);
  }
}

module.exports = ApiResponse;
