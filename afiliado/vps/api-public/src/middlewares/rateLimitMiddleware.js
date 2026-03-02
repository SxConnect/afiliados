/**
 * Rate Limit Middleware
 * Prevents abuse with configurable rate limiting
 */

const rateLimit = require('express-rate-limit');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

const logger = getLogger();

/**
 * General API rate limit
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path
        });
        res.status(429).json({
            error: 'Too many requests',
            retryAfter: req.rateLimit.resetTime
        });
    }
});

/**
 * Auth endpoints rate limit (stricter)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: { error: 'Too many authentication attempts' },
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        logger.security('Auth rate limit exceeded', {
            ip: req.ip,
            path: req.path
        });
        res.status(429).json({
            error: 'Too many authentication attempts',
            retryAfter: req.rateLimit.resetTime
        });
    }
});

/**
 * Usage reporting rate limit
 */
const usageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: { error: 'Too many usage reports' },
    keyGenerator: (req) => {
        // Rate limit by license ID if authenticated
        return req.user?.licenseId || req.ip;
    }
});

/**
 * Custom rate limiter by fingerprint
 */
const fingerprintLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per hour
    keyGenerator: (req) => {
        return req.user?.fingerprint || req.ip;
    },
    handler: (req, res) => {
        logger.security('Fingerprint rate limit exceeded', {
            fingerprint: req.user?.fingerprint,
            ip: req.ip
        });
        res.status(429).json({
            error: 'Rate limit exceeded for this machine'
        });
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    usageLimiter,
    fingerprintLimiter
};
