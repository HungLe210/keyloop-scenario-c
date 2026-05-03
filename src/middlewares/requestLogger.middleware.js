const logger = require('../utils/logger');

function requestLogger(req, res, next) {
    logger.info({
        message: 'Incoming request',
        method: req.method,
        path: req.path,
        url: req.url,
        timestamp: new Date().toISOString()
    });

    next();
}

module.exports = requestLogger;
