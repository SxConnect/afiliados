/**
 * Authentication Service
 * Handles license validation and token generation
 */

const { getInstance: getJWT } = require('../../../shared/crypto/jwt');
const { getInstance: getFingerprint } = require('../../../shared/crypto/fingerprint');
const { getInstance: getQueries } = require('../../../shared/database/queries');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

class AuthService {
    constructor() {
        this.jwt = getJWT();
        this.fingerprint = getFingerprint();
        this.queries = getQueries();
        this.logger = getLogger();
    }

    /**
     * Validate license and generate tokens
     */
    async validateLicense(phone, machineData, ipAddress) {
        try {
            // 1. Find user by phone
            const user = await this.queries.findUserByPhone(phone);
            if (!user) {
                this.logger.warn('User not found', { phone });
                return { success: false, error: 'User not found', plan: 'free' };
            }

            // Check user status
            if (user.status !== 'active') {
                this.logger.warn('User not active', { phone, status: user.status });
                return { success: false, error: `User is ${user.status}`, plan: 'free' };
            }

            // 2. Find active license
            const licenses = await this.queries.findLicensesByUserId(user.id);
            const activeLicense = licenses.find(l => l.status === 'active');

            if (!activeLicense) {
                this.logger.warn('No active license', { phone });
                return { success: false, error: 'No active license found', plan: 'free' };
            }

            // Check expiration
            if (activeLicense.expiration_date && new Date(activeLicense.expiration_date) < new Date()) {
                this.logger.warn('License expired', { phone, licenseId: activeLicense.id });
                return { success: false, error: 'License expired', plan: activeLicense.plan_name };
            }

            // 3. Generate fingerprint
            const fingerprintHash = this.fingerprint.generate(machineData);

            // 4. Check machine
            let machine = await this.queries.findMachineByFingerprint(activeLicense.id, fingerprintHash);

            if (!machine) {
                // Check machine limit
                const machineCount = await this.queries.countMachinesByLicense(activeLicense.id);
                if (machineCount >= activeLicense.max_machines) {
                    this.logger.warn('Machine limit reached', {
                        phone,
                        licenseId: activeLicense.id,
                        count: machineCount,
                        max: activeLicense.max_machines
                    });
                    return {
                        success: false,
                        error: `Machine limit reached (${activeLicense.max_machines})`,
                        plan: activeLicense.plan_name
                    };
                }

                // Create new machine
                machine = await this.queries.create('machines', {
                    license_id: activeLicense.id,
                    fingerprint_hash: fingerprintHash,
                    machine_name: machineData.machineName || 'Unknown',
                    os_info: machineData.osInfo || 'Unknown',
                    cpu_info: machineData.cpuId || 'Unknown',
                    last_ip: ipAddress,
                    is_active: true
                });

                this.logger.info('New machine registered', {
                    phone,
                    licenseId: activeLicense.id,
                    machineId: machine.id
                });
            } else {
                // Update machine last seen
                await this.queries.update('machines', machine.id, {
                    last_seen_at: new Date(),
                    last_ip: ipAddress
                });
            }

            // Check if machine is blocked
            if (machine.is_blocked) {
                this.logger.warn('Machine is blocked', {
                    phone,
                    machineId: machine.id,
                    reason: machine.block_reason
                });
                return {
                    success: false,
                    error: 'Machine is blocked',
                    plan: activeLicense.plan_name
                };
            }

            // 5. Update license last validation
            await this.queries.update('licenses', activeLicense.id, {
                last_validation_at: new Date(),
                last_validation_ip: ipAddress
            });

            // 6. Generate tokens
            const payload = {
                userId: user.id,
                licenseId: activeLicense.id,
                machineId: machine.id,
                fingerprint: fingerprintHash,
                plan: activeLicense.plan_name,
                quota: activeLicense.quota_monthly,
                quotaUsed: activeLicense.quota_used
            };

            const tokens = this.jwt.generateTokenPair(payload);

            // 7. Save refresh token
            const crypto = require('crypto');
            const tokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');

            await this.queries.create('refresh_tokens', {
                user_id: user.id,
                machine_id: machine.id,
                token_hash: tokenHash,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            });

            // 8. Log usage
            await this.queries.createUsageLog({
                license_id: activeLicense.id,
                machine_id: machine.id,
                action: 'validate_license',
                ip_address: ipAddress
            });

            this.logger.info('License validated successfully', {
                phone,
                licenseId: activeLicense.id,
                plan: activeLicense.plan_name
            });

            return {
                success: true,
                user: {
                    id: user.id,
                    phone: user.phone,
                    name: user.name
                },
                license: {
                    id: activeLicense.id,
                    plan: activeLicense.plan_name,
                    quota: activeLicense.quota_monthly,
                    quotaUsed: activeLicense.quota_used,
                    quotaRemaining: activeLicense.quota_monthly - activeLicense.quota_used,
                    expiresAt: activeLicense.expiration_date
                },
                machine: {
                    id: machine.id,
                    name: machine.machine_name
                },
                tokens
            };

        } catch (error) {
            this.logger.error('Error validating license', { error: error.message, phone });
            throw error;
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken, fingerprint) {
        try {
            // 1. Verify refresh token
            const decoded = this.jwt.verifyToken(refreshToken);

            if (decoded.type !== 'refresh') {
                return { success: false, error: 'Invalid token type' };
            }

            // 2. Verify fingerprint
            if (decoded.fingerprint !== fingerprint) {
                this.logger.security('Fingerprint mismatch on refresh', {
                    userId: decoded.userId,
                    expected: decoded.fingerprint,
                    received: fingerprint
                });
                return { success: false, error: 'Invalid fingerprint' };
            }

            // 3. Check if token is revoked
            const crypto = require('crypto');
            const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

            const storedToken = await this.queries.pool.queryOne(
                'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND is_revoked = false',
                [tokenHash]
            );

            if (!storedToken) {
                return { success: false, error: 'Token revoked or not found' };
            }

            // 4. Generate new access token
            const payload = {
                userId: decoded.userId,
                licenseId: decoded.licenseId,
                machineId: decoded.machineId,
                fingerprint: decoded.fingerprint,
                plan: decoded.plan
            };

            const accessToken = this.jwt.generateAccessToken(payload);

            this.logger.info('Token refreshed', { userId: decoded.userId });

            return {
                success: true,
                accessToken
            };

        } catch (error) {
            this.logger.error('Error refreshing token', { error: error.message });
            return { success: false, error: error.message };
        }
    }
}

module.exports = AuthService;
