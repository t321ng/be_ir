/**
 * Error handling utility for API responses
 */

export const errorHandler = {
  // Validation error
  validationError: (res, message = "Validation error", details = null) => {
    return res.status(400).json({
      status: "error",
      message,
      ...(details && { details }),
    });
  },

  // Missing required field
  missingField: (res, fieldName) => {
    return res.status(400).json({
      status: "error",
      message: `${fieldName} is required and cannot be empty`,
    });
  },

  // Invalid format
  invalidFormat: (res, fieldName) => {
    return res.status(400).json({
      status: "error",
      message: `Invalid ${fieldName} format`,
    });
  },

  // Not found
  notFound: (res, resourceName) => {
    return res.status(404).json({
      status: "error",
      message: `${resourceName} not found or you do not have permission to access this resource`,
    });
  },

  // Unauthorized
  unauthorized: (res, message = "Unauthorized access") => {
    return res.status(403).json({
      status: "error",
      message,
    });
  },

  // Conflict (duplicate)
  conflict: (res, message) => {
    return res.status(409).json({
      status: "error",
      message,
    });
  },

  // Server error
  serverError: (res, error) => {
    console.error("Server error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  },

  // Handle different error types
  handle: (res, error) => {
    // Validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return errorHandler.validationError(res, "Validation error", messages);
    }

    // Duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return errorHandler.conflict(
        res,
        `${field} already exists`
      );
    }

    // Invalid ObjectId
    if (error.kind === "ObjectId") {
      return errorHandler.invalidFormat(res, "ID");
    }

    // Default server error
    return errorHandler.serverError(res, error);
  },
};

export default errorHandler;
