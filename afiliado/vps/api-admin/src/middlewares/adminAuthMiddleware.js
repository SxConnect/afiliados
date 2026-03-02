/**
 * Admin Auth Middleware
 * Real JWT verification for admin routes
 */

const { getInstance: getJWT } = require('../../../shared/crypto/jwt');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

const jwt = getJWT();
const logger = getLogger();

/**
 * Verify admin JWT token
 */
const verifyAdminToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verifyToken(token);

        // Check if it's an admin token
        if (decoded.type !== 'admin' && !decoded.adminId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Attach admin data to request
        req.admin = {
            adminId: decoded.adminId,
            email: decoded.email,
            role: decoded.role
        };

        next();

    } catch (error) {
        logger.warn('Admin token verification failed', { error: error.message });

        if (error.message === 'Token expired') {
            return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
        }

        return res.status(401).json({ error: 'Invalid token' });
    }
};

/**
 * Check admin role
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.admin || !roles.includes(req.admin.role)) {
            logger.security('Insufficient permissions', {
                adminId: req.admin?.adminId,
                requiredRoles: roles,
                actualRole: req.admin?.role
            });
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

module.exports = {
    verifyAdminToken,
    requireRole
};
