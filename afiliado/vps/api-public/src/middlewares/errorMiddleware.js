/**
 * Error Handling Middleware
 * Centralized error handling
 */

const { getInstance: getLogger } = require('../../../shared/utils/logger');

const logger = getLogger();

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    // Determine status code
    const statusCode = err.statusCode || 500;

    // Send error response
    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    notFound,
    errorHandler,
    asyncHandler
};
