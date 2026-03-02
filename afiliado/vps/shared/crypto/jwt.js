/**
 * JWT Manager with RS256
 * Handles JWT token generation, validation, and refresh
 */

const jwt = require('jsonwebtoken');
const { getInstance: getRSA } = require('./rsa');

class JWTManager {
    constructor() {
        this.rsa = getRSA();
        this.accessTokenExpiry = '15m'; // 15 minutes
        this.refreshTokenExpiry = '7d'; // 7 days
    }

    /**
     * Generate access token (short-lived)
     * @param {Object} payload - Token payload
     * @returns {String} - JWT token
     */
    generateAccessToken(payload) {
        try {
            const token = jwt.sign(
                {
                    ...payload,
                    type: 'access',
                    iat: Math.floor(Date.now() / 1000)
                },
                this.rsa.privateKey,
                {
                    algorithm: 'RS256',
                    expiresIn: this.accessTokenExpiry
                }
            );
            return token;
        } catch (error) {
            console.error('❌ Error generating access token:', error.message);
            throw error;
        }
    }

    /**
     * Generate refresh token (long-lived)
     * @param {Object} payload - Token payload
     * @returns {String} - JWT token
     */
    generateRefreshToken(payload) {
        try {
            const token = jwt.sign(
                {
                    ...payload,
                    type: 'refresh',
                    iat: Math.floor(Date.now() / 1000)
                },
                this.rsa.privateKey,
                {
                    algorithm: 'RS256',
                    expiresIn: this.refreshTokenExpiry
                }
            );
            return token;
        } catch (error) {
            console.error('❌ Error generating refresh token:', error.message);
            throw error;
        }
    }

    /**
     * Verify and decode token
     * @param {String} token - JWT token
     * @returns {Object} - Decoded payload
     */
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.rsa.publicKey, {
                algorithms: ['RS256']
            });
            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            throw error;
        }
    }

    /**
     * Decode token without verification (for debugging)
     * @param {String} token - JWT token
     * @returns {Object} - Decoded payload
     */
    decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            console.error('❌ Error decoding token:', error.message);
            return null;
        }
    }

    /**
     * Check if token is expired
     * @param {String} token - JWT token
     * @returns {Boolean} - True if expired
     */
    isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return true;
            }
            return decoded.exp < Math.floor(Date.now() / 1000);
        } catch (error) {
            return true;
        }
    }

    /**
     * Get token expiration time
     * @param {String} token - JWT token
     * @returns {Number} - Expiration timestamp
     */
    getTokenExpiration(token) {
        try {
            const decoded = this.decodeToken(token);
            return decoded?.exp || null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate token pair (access + refresh)
     * @param {Object} payload - Token payload
     * @returns {Object} - { accessToken, refreshToken }
     */
    generateTokenPair(payload) {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload)
        };
    }
}

// Singleton instance
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new JWTManager();
        }
        return instance;
    },
    JWTManager
};
