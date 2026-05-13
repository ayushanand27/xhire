/**
 * Input validation utilities
 */

export const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body
      if (Object.keys(req.body).length > 0) {
        const { error, value } = validateObject(req.body, schema);
        if (error) {
          return res.status(400).json({
            error: {
              message: "Validation failed",
              details: error
            }
          });
        }
        req.body = value;
      }

      // Validate query params
      if (Object.keys(req.query).length > 0) {
        const querySchema = schema.query || {};
        const { error, value } = validateObject(req.query, querySchema);
        if (error) {
          return res.status(400).json({
            error: {
              message: "Invalid query parameters",
              details: error
            }
          });
        }
        req.query = value;
      }

      next();
    } catch (error) {
      res.status(400).json({ error: { message: "Invalid input" } });
    }
  };
};

/**
 * Simple validation helper
 * Returns { error, value }
 */
export const validateObject = (obj, schema) => {
  const errors = [];
  const validated = { ...obj };

  for (const [key, rules] of Object.entries(schema)) {
    if (!rules) continue;

    const value = obj[key];

    // Check if required
    if (rules.required && !value) {
      errors.push(`${key} is required`);
      continue;
    }

    // Skip if not provided and not required
    if (!value) {
      delete validated[key];
      continue;
    }

    // Type check
    if (rules.type) {
      const actualType = Array.isArray(value) ? "array" : typeof value;
      if (actualType !== rules.type) {
        errors.push(`${key} must be ${rules.type}, got ${actualType}`);
      }
    }

    // String validation
    if (rules.type === "string") {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${key} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${key} must be at most ${rules.maxLength} characters`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${key} format is invalid`);
      }
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${key} must be one of: ${rules.enum.join(", ")}`);
      }
    }

    // Number validation
    if (rules.type === "number") {
      if (rules.min && value < rules.min) {
        errors.push(`${key} must be at least ${rules.min}`);
      }
      if (rules.max && value > rules.max) {
        errors.push(`${key} must be at most ${rules.max}`);
      }
    }

    // Custom validator
    if (rules.validate && !rules.validate(value)) {
      errors.push(`${key} validation failed`);
    }
  }

  return {
    error: errors.length > 0 ? errors : null,
    value: validated
  };
};
