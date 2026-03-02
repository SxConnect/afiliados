/**
 * Admin Auth Controller
 * Real authentication with 2FA
 */

const AdminAuthService = require('../services/AdminAuthService');

class AdminAuthController {
    constructor() {
        this.authService = new AdminAuthService();
    }

    /**
     * POST /admin/auth/login
     * Admin login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }

            const ipAddress = req.ip || req.connection.remoteAddress;
            const result = await this.authService.login(email, password, ipAddress);

            if (!result.success) {
                return res.status(401).json({ error: result.error });
            }

            res.json(result);

        } catch (error) {
            console.error('Error in admin login:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * POST /admin/auth/2fa/verify
     * Verify 2FA code
     */
    async verify2FA(req, res) {
        try {
            const { tempToken, code } = req.body;

            if (!tempToken || !code) {
                return res.status(400).json({ error: 'Token and code required' });
            }

            const result = await this.authService.verify2FA(tempToken, code);

            if (!result.success) {
                return res.status(401).json({ error: result.error });
            }

            res.json(result);

        } catch (error) {
            console.error('Error in 2FA verification:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * POST /admin/auth/2fa/setup
     * Setup 2FA for admin
     */
    async setup2FA(req, res) {
        try {
            const adminId = req.admin.adminId;

            const result = await this.authService.setup2FA(adminId);

            if (!result.success) {
                return res.status(400).json({ error: result.error });
            }

            res.json(result);

        } catch (error) {
            console.error('Error in 2FA setup:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * POST /admin/auth/2fa/enable
     * Enable 2FA after setup
     */
    async enable2FA(req, res) {
        try {
            const adminId = req.admin.adminId;
            const { code } = req.body;

            if (!code) {
                return res.status(400).json({ error: 'Code required' });
            }

            const result = await this.authService.enable2FA(adminId, code);

            if (!result.success) {
                return res.status(400).json({ error: result.error });
            }

            res.json(result);

        } catch (error) {
            console.error('Error enabling 2FA:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /admin/auth/me
     * Get current admin info
     */
    async me(req, res) {
        try {
            const adminId = req.admin.adminId;

            const admin = await this.authService.queries.findById('admin_users', adminId);

            if (!admin) {
                return res.status(404).json({ error: 'Admin not found' });
            }

            res.json({
                success: true,
                admin: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role,
                    twoFactorEnabled: admin.two_factor_enabled,
                    lastLogin: admin.last_login_at
                }
            });

        } catch (error) {
            console.error('Error getting admin info:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new AdminAuthController();
