const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Formats and sends error responses to client
 * 
 * @param {Error} err - Error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {NextFunction} next - Express next function
 */
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || 'INTERNAL_ERROR';

    // Structured error logging (flattened)
    logger.error(err.message, {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: statusCode,
        errorCode: errorCode,
        stack: err.stack,
        ...(err.field && { field: err.field }),
        ...(err.resource && { resource: err.resource })
    });

    // Build error response
    const errorResponse = {
        status: 'error',
        message: err.message || 'Internal server error',
        errorCode: errorCode,
        ...(req.requestId && { requestId: req.requestId })
    };

    // Include stack trace in development
    if (process.env.NODE_ENV !== 'production' && err.stack) {
        errorResponse.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;
