/**
 * Auth Middleware
 * Verifies JWT tokens and extracts user data
 */

const { getInstance: getJWT } = require('../../../shared/crypto/jwt');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

const jwt = getJWT();
const logger = getLogger();

/**
 * Verify JWT token
 */
const verifyToken = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verify token
        const decoded = jwt.verifyToken(token);

        // Check token type
        if (decoded.type !== 'access') {
            return res.status(401).json({ error: 'Invalid token type' });
        }

        // Attach user data to request
        req.user = {
            userId: decoded.userId,
            licenseId: decoded.licenseId,
            machineId: decoded.machineId,
            fingerprint: decoded.fingerprint,
            plan: decoded.plan
        };

        next();

    } catch (error) {
        logger.warn('Token verification failed', { error: error.message });

        if (error.message === 'Token expired') {
            return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
        }

        return res.status(401).json({ error: 'Invalid token' });
    }
};

/**
 * Optional auth - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verifyToken(token);

            req.user = {
                userId: decoded.userId,
                licenseId: decoded.licenseId,
                machineId: decoded.machineId,
                fingerprint: decoded.fingerprint,
                plan: decoded.plan
            };
        }

        next();

    } catch (error) {
        // Continue without auth
        next();
    }
};

module.exports = {
    verifyToken,
    optionalAuth
};
