const { ValidationError } = require('../errors');

/**
 * Zod validation middleware
 * Validates and sanitizes request data using Zod schemas
 * 
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            // Validate and transform (sanitize) the request
            const validated = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });

            // Replace request data with validated & sanitized data
            req.body = validated.body || req.body;
            req.query = validated.query || req.query;
            req.params = validated.params || req.params;

            next();
        } catch (error) {
            // Zod validation error - Zod uses 'issues' not 'errors'
            if (error.issues && Array.isArray(error.issues)) {
                // Get first error for consistent error format
                const firstError = error.issues[0];
                const field = firstError.path.slice(1).join('.'); // Remove 'body'/'query'/'params' prefix
                const message = firstError.message;

                return next(new ValidationError(message, field));
            }

            // Fallback for other errors
            return next(error);
        }
    };
};

module.exports = validate;
