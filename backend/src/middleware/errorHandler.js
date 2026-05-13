/**
 * Global error handling middleware
 * Must be registered LAST after all other middleware and routes
 */

export const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  // Log error details
  console.error("❌ API Error:", {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    ...(isDevelopment && { stack: err.stack })
  });

  // Default error response
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: {
      message,
      status,
      ...(isDevelopment && { stack: err.stack })
    }
  });
};

/**
 * Async wrapper to catch errors in route handlers
 * Usage: router.get("/path", asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for API errors
 * Usage: throw new ApiError(400, "Invalid input")
 */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}
