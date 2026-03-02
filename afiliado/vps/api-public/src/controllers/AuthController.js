/**
 * Auth Controller
 * Handles authentication endpoints
 */

const AuthService = require('../services/AuthService');
const AntiPiracyService = require('../services/AntiPiracyService');
const Validators = require('../../../shared/validators');

class AuthController {
    constructor() {
        this.authService = new AuthService();
        this.antiPiracyService = new AntiPiracyService();
    }

    /**
     * POST /auth/validate
     * Validate license and generate tokens
     */
    async validate(req, res) {
        try {
            const { phone, machineData, fingerprint } = req.body;

            // Validate input
            const phoneValidation = Validators.validatePhone(phone);
            if (!phoneValidation.valid) {
                return res.status(400).json({ error: phoneValidation.error });
            }

            const machineValidation = Validators.validateMachineData(machineData);
            if (!machineValidation.valid) {
                return res.status(400).json({ errors: machineValidation.errors });
            }

            const fingerprintValidation = Validators.validateFingerprint(fingerprint);
            if (!fingerprintValidation.valid) {
                return res.status(400).json({ error: fingerprintValidation.error });
            }

            // Get IP address
            const ipAddress = req.ip || req.connection.remoteAddress;

            // Validate license
            const result = await this.authService.validateLicense(
                phoneValidation.value,
                machineValidation.value,
                ipAddress
            );

            if (!result.success) {
                return res.status(401).json({
                    error: result.error,
                    plan: result.plan
                });
            }

            // Check anti-piracy
            const antiPiracyCheck = await this.antiPiracyService.shouldAllowMachine(
                result.license.id,
                result.machine.id,
                ipAddress,
                fingerprintValidation.value
            );

            if (!antiPiracyCheck.allowed) {
                return res.status(403).json({
                    error: antiPiracyCheck.reason,
                    activities: antiPiracyCheck.activities
                });
            }

            // Return success
            res.json({
                success: true,
                user: result.user,
                license: result.license,
                machine: result.machine,
                tokens: result.tokens
            });

        } catch (error) {
            console.error('Error in validate:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * POST /auth/refresh
     * Refresh access token
     */
    async refresh(req, res) {
        try {
            const { refreshToken, fingerprint } = req.body;

            if (!refreshToken || !fingerprint) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const fingerprintValidation = Validators.validateFingerprint(fingerprint);
            if (!fingerprintValidation.valid) {
                return res.status(400).json({ error: fingerprintValidation.error });
            }

            const result = await this.authService.refreshToken(
                refreshToken,
                fingerprintValidation.value
            );

            if (!result.success) {
                return res.status(401).json({ error: result.error });
            }

            res.json({
                success: true,
                accessToken: result.accessToken
            });

        } catch (error) {
            console.error('Error in refresh:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /auth/verify
     * Verify token validity
     */
    async verify(req, res) {
        try {
            // Token already verified by middleware
            const { userId, licenseId, plan } = req.user;

            res.json({
                success: true,
                valid: true,
                user: {
                    id: userId,
                    licenseId,
                    plan
                }
            });

        } catch (error) {
            console.error('Error in verify:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new AuthController();
