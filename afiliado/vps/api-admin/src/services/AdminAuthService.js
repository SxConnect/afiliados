/**
 * Admin Auth Service
 * Handles admin authentication with 2FA
 */

const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { getInstance: getJWT } = require('../../../shared/crypto/jwt');
const { getInstance: getQueries } = require('../../../shared/database/queries');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

class AdminAuthService {
    constructor() {
        this.jwt = getJWT();
        this.queries = getQueries();
        this.logger = getLogger();
    }

    /**
     * Admin login
     */
    async login(email, password, ipAddress) {
        try {
            // Find admin user
            const admin = await this.queries.pool.queryOne(
                'SELECT * FROM admin_users WHERE email = $1 AND is_active = true AND deleted_at IS NULL',
                [email]
            );

            if (!admin) {
                this.logger.warn('Admin login failed - user not found', { email });
                return { success: false, error: 'Invalid credentials' };
            }

            // Verify password
            const passwordMatch = await bcrypt.compare(password, admin.password_hash);
            if (!passwordMatch) {
                this.logger.warn('Admin login failed - wrong password', { email });
                return { success: false, error: 'Invalid credentials' };
            }

            // Check if 2FA is enabled
            if (admin.two_factor_enabled) {
                // Return temporary token for 2FA verification
                const tempToken = this.jwt.generateAccessToken({
                    adminId: admin.id,
                    email: admin.email,
                    temp: true,
                    twoFactorPending: true
                });

                return {
                    success: true,
                    requiresTwoFactor: true,
                    tempToken
                };
            }

            // Generate tokens
            const tokens = this.generateAdminTokens(admin);

            // Update last login
            await this.queries.update('admin_users', admin.id, {
                last_login_at: new Date(),
                last_login_ip: ipAddress
            });

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: admin.id,
                action: 'login',
                resource_type: 'admin_users',
                resource_id: admin.id,
                ip_address: ipAddress
            });

            this.logger.info('Admin logged in', { adminId: admin.id, email });

            return {
                success: true,
                admin: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role
                },
                tokens
            };

        } catch (error) {
            this.logger.error('Error in admin login', { error: error.message });
            throw error;
        }
    }

    /**
     * Verify 2FA code
     */
    async verify2FA(tempToken, code) {
        try {
            // Verify temp token
            const decoded = this.jwt.verifyToken(tempToken);

            if (!decoded.temp || !decoded.twoFactorPending) {
                return { success: false, error: 'Invalid token' };
            }

            // Get admin
            const admin = await this.queries.findById('admin_users', decoded.adminId);
            if (!admin || !admin.two_factor_enabled) {
                return { success: false, error: 'Invalid request' };
            }

            // Verify 2FA code
            const verified = speakeasy.totp.verify({
                secret: admin.two_factor_secret,
                encoding: 'base32',
                token: code,
                window: 2
            });

            if (!verified) {
                this.logger.warn('2FA verification failed', { adminId: admin.id });
                return { success: false, error: 'Invalid code' };
            }

            // Generate tokens
            const tokens = this.generateAdminTokens(admin);

            this.logger.info('2FA verified', { adminId: admin.id });

            return {
                success: true,
                admin: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role
                },
                tokens
            };

        } catch (error) {
            this.logger.error('Error verifying 2FA', { error: error.message });
            return { success: false, error: error.message };
        }
    }

    /**
     * Setup 2FA
     */
    async setup2FA(adminId) {
        try {
            const admin = await this.queries.findById('admin_users', adminId);
            if (!admin) {
                return { success: false, error: 'Admin not found' };
            }

            // Generate secret
            const secret = speakeasy.generateSecret({
                name: `Afiliados Admin (${admin.email})`,
                issuer: 'Afiliados'
            });

            // Generate QR code
            const qrCode = await QRCode.toDataURL(secret.otpauth_url);

            // Save secret (not enabled yet)
            await this.queries.update('admin_users', adminId, {
                two_factor_secret: secret.base32
            });

            return {
                success: true,
                secret: secret.base32,
                qrCode
            };

        } catch (error) {
            this.logger.error('Error setting up 2FA', { error: error.message });
            throw error;
        }
    }

    /**
     * Enable 2FA
     */
    async enable2FA(adminId, code) {
        try {
            const admin = await this.queries.findById('admin_users', adminId);
            if (!admin || !admin.two_factor_secret) {
                return { success: false, error: 'Setup 2FA first' };
            }

            // Verify code
            const verified = speakeasy.totp.verify({
                secret: admin.two_factor_secret,
                encoding: 'base32',
                token: code,
                window: 2
            });

            if (!verified) {
                return { success: false, error: 'Invalid code' };
            }

            // Enable 2FA
            await this.queries.update('admin_users', adminId, {
                two_factor_enabled: true
            });

            this.logger.info('2FA enabled', { adminId });

            return { success: true };

        } catch (error) {
            this.logger.error('Error enabling 2FA', { error: error.message });
            throw error;
        }
    }

    /**
     * Generate admin tokens
     */
    generateAdminTokens(admin) {
        const payload = {
            adminId: admin.id,
            email: admin.email,
            role: admin.role,
            type: 'admin'
        };

        return this.jwt.generateTokenPair(payload);
    }

    /**
     * Hash password
     */
    async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }
}

module.exports = AdminAuthService;
