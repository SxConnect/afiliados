/**
 * Request Logger Middleware
 * Logs all HTTP requests
 */

const { getInstance: getLogger } = require('../../../shared/utils/logger');

const logger = getLogger();

/**
 * Log HTTP requests
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request
    logger.debug('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.http(req, res, duration);
    });

    next();
};

module.exports = requestLogger;
