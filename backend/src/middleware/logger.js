/**
 * Request logging middleware
 */

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  console.log(`📨 ${req.method} ${req.path}`, {
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    auth: req.headers.authorization ? "✅ Present" : "❌ Missing"
  });

  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusEmoji = status < 400 ? "✅" : status < 500 ? "⚠️" : "❌";
    
    console.log(`${statusEmoji} ${req.method} ${req.path} - ${status} (${duration}ms)`);
    
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  
  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Disable iframe embedding
  res.setHeader("X-Frame-Options", "DENY");
  
  // No referrer
  res.setHeader("Referrer-Policy", "no-referrer");
  
  next();
};
