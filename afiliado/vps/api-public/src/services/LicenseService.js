/**
 * License Service
 * Handles license status and quota management
 */

const { getInstance: getQueries } = require('../../../shared/database/queries');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

class LicenseService {
    constructor() {
        this.queries = getQueries();
        this.logger = getLogger();
    }

    /**
     * Get license status
     */
    async getStatus(licenseId, userId) {
        try {
            const license = await this.queries.findById('licenses', licenseId);

            if (!license || license.user_id !== userId) {
                return { success: false, error: 'License not found' };
            }

            // Get plan details
            const plan = await this.queries.findById('plans', license.plan_id);

            // Get machines
            const machines = await this.queries.findMachinesByLicense(licenseId);

            // Calculate quota
            const quotaRemaining = license.quota_used >= plan.quota_monthly
                ? 0
                : plan.quota_monthly - license.quota_used;

            const quotaPercentage = plan.quota_monthly > 0
                ? Math.round((license.quota_used / plan.quota_monthly) * 100)
                : 0;

            // Check expiration
            const now = new Date();
            const expiresAt = license.expiration_date ? new Date(license.expiration_date) : null;
            const isExpired = expiresAt && expiresAt < now;
            const daysUntilExpiration = expiresAt
                ? Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
                : null;

            return {
                success: true,
                license: {
                    id: license.id,
                    key: license.license_key,
                    status: license.status,
                    isExpired,
                    expiresAt: license.expiration_date,
                    daysUntilExpiration,
                    activatedAt: license.activation_date,
                    lastValidation: license.last_validation_at
                },
                plan: {
                    name: plan.name,
                    quota: plan.quota_monthly,
                    maxMachines: plan.max_machines
                },
                usage: {
                    quotaUsed: license.quota_used,
                    quotaRemaining,
                    quotaPercentage,
                    machinesUsed: machines.filter(m => m.is_active).length,
                    machinesMax: plan.max_machines
                },
                machines: machines.map(m => ({
                    id: m.id,
                    name: m.machine_name,
                    os: m.os_info,
                    isActive: m.is_active,
                    lastSeen: m.last_seen_at,
                    firstSeen: m.first_seen_at
                }))
            };

        } catch (error) {
            this.logger.error('Error getting license status', { error: error.message, licenseId });
            throw error;
        }
    }

    /**
     * Check quota availability
     */
    async checkQuota(licenseId, userId, amount = 1) {
        try {
            const license = await this.queries.findById('licenses', licenseId);

            if (!license || license.user_id !== userId) {
                return { success: false, error: 'License not found' };
            }

            const plan = await this.queries.findById('plans', license.plan_id);
            const available = plan.quota_monthly - license.quota_used;

            return {
                success: true,
                quota: plan.quota_monthly,
                used: license.quota_used,
                available,
                canConsume: available >= amount,
                requested: amount
            };

        } catch (error) {
            this.logger.error('Error checking quota', { error: error.message, licenseId });
            throw error;
        }
    }

    /**
     * Consume quota
     */
    async consumeQuota(licenseId, userId, machineId, amount = 1, action = 'generate', ipAddress = null) {
        try {
            const license = await this.queries.findById('licenses', licenseId);

            if (!license || license.user_id !== userId) {
                return { success: false, error: 'License not found' };
            }

            const plan = await this.queries.findById('plans', license.plan_id);
            const available = plan.quota_monthly - license.quota_used;

            if (available < amount) {
                this.logger.warn('Insufficient quota', {
                    licenseId,
                    available,
                    requested: amount
                });
                return {
                    success: false,
                    error: 'Insufficient quota',
                    available,
                    requested: amount
                };
            }

            // Update quota
            const newQuotaUsed = license.quota_used + amount;
            await this.queries.updateLicenseQuota(licenseId, newQuotaUsed);

            // Log usage
            await this.queries.createUsageLog({
                license_id: licenseId,
                machine_id: machineId,
                action,
                quota_consumed: amount,
                ip_address: ipAddress
            });

            this.logger.info('Quota consumed', {
                licenseId,
                amount,
                newTotal: newQuotaUsed
            });

            return {
                success: true,
                quotaUsed: newQuotaUsed,
                quotaRemaining: plan.quota_monthly - newQuotaUsed,
                consumed: amount
            };

        } catch (error) {
            this.logger.error('Error consuming quota', { error: error.message, licenseId });
            throw error;
        }
    }

    /**
     * Reset quota (monthly reset)
     */
    async resetQuota(licenseId) {
        try {
            await this.queries.update('licenses', licenseId, {
                quota_used: 0,
                quota_reset_at: new Date()
            });

            this.logger.info('Quota reset', { licenseId });

            return { success: true };

        } catch (error) {
            this.logger.error('Error resetting quota', { error: error.message, licenseId });
            throw error;
        }
    }
}

module.exports = LicenseService;
