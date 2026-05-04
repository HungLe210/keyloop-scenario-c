const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Request logger middleware
 * Adds requestId to all requests and logs request/response
 */
function requestLogger(req, res, next) {
    // Generate unique request ID
    req.requestId = crypto.randomUUID();
    req.startTime = Date.now();

    // Log response when finished
    res.on('finish', () => {
        const responseTime = Date.now() - req.startTime;

        // Single log entry with request + response info
        logger.info('Request completed', {
            requestId: req.requestId,
            method: req.method,
            path: req.originalUrl || req.url, // Use originalUrl to get full path
            statusCode: res.statusCode,
            responseTime: responseTime, // Number in ms
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    });

    next();
}

module.exports = requestLogger;
