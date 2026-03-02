/**
 * Anti-Piracy Service
 * Detects and prevents suspicious activities
 */

const { getInstance: getQueries } = require('../../../shared/database/queries');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

class AntiPiracyService {
    constructor() {
        this.queries = getQueries();
        this.logger = getLogger();

        // Thresholds
        this.maxIpChangesPerDay = 10;
        this.maxValidationsPerHour = 100;
        this.maxFingerprintChangesPerDay = 3;
    }

    /**
     * Check for suspicious activity
     */
    async checkSuspiciousActivity(licenseId, machineId, ipAddress, fingerprint) {
        const suspiciousActivities = [];

        try {
            // 1. Check IP changes
            const ipChanges = await this.checkIpChanges(licenseId, ipAddress);
            if (ipChanges.suspicious) {
                suspiciousActivities.push(ipChanges);
            }

            // 2. Check validation rate
            const validationRate = await this.checkValidationRate(licenseId);
            if (validationRate.suspicious) {
                suspiciousActivities.push(validationRate);
            }

            // 3. Check fingerprint changes
            const fingerprintChanges = await this.checkFingerprintChanges(licenseId, fingerprint);
            if (fingerprintChanges.suspicious) {
                suspiciousActivities.push(fingerprintChanges);
            }

            // 4. Check concurrent machines
            const concurrentMachines = await this.checkConcurrentMachines(licenseId);
            if (concurrentMachines.suspicious) {
                suspiciousActivities.push(concurrentMachines);
            }

            // Log suspicious activities
            if (suspiciousActivities.length > 0) {
                await this.logSuspiciousActivities(licenseId, machineId, suspiciousActivities);

                // Auto-block if critical
                const criticalCount = suspiciousActivities.filter(a => a.severity === 'critical').length;
                if (criticalCount > 0) {
                    await this.autoBlock(licenseId, machineId, suspiciousActivities);
                }
            }

            return {
                suspicious: suspiciousActivities.length > 0,
                activities: suspiciousActivities,
                shouldBlock: suspiciousActivities.some(a => a.severity === 'critical')
            };

        } catch (error) {
            this.logger.error('Error checking suspicious activity', { error: error.message, licenseId });
            return { suspicious: false, activities: [] };
        }
    }

    /**
     * Check IP changes
     */
    async checkIpChanges(licenseId, currentIp) {
        const query = `
            SELECT COUNT(DISTINCT ip_address) as ip_count
            FROM usage_logs_2026_03
            WHERE license_id = $1 
            AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
        `;

        const result = await this.queries.pool.queryOne(query, [licenseId]);
        const ipCount = parseInt(result.ip_count);

        if (ipCount > this.maxIpChangesPerDay) {
            return {
                suspicious: true,
                type: 'excessive_ip_changes',
                severity: 'high',
                description: `${ipCount} different IPs in 24 hours`,
                metadata: { ip_count: ipCount, current_ip: currentIp }
            };
        }

        return { suspicious: false };
    }

    /**
     * Check validation rate
     */
    async checkValidationRate(licenseId) {
        const query = `
            SELECT COUNT(*) as validation_count
            FROM usage_logs_2026_03
            WHERE license_id = $1 
            AND action = 'validate_license'
            AND created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
        `;

        const result = await this.queries.pool.queryOne(query, [licenseId]);
        const validationCount = parseInt(result.validation_count);

        if (validationCount > this.maxValidationsPerHour) {
            return {
                suspicious: true,
                type: 'excessive_validations',
                severity: 'critical',
                description: `${validationCount} validations in 1 hour`,
                metadata: { validation_count: validationCount }
            };
        }

        return { suspicious: false };
    }

    /**
     * Check fingerprint changes
     */
    async checkFingerprintChanges(licenseId, currentFingerprint) {
        const query = `
            SELECT COUNT(DISTINCT fingerprint_hash) as fingerprint_count
            FROM machines
            WHERE license_id = $1 
            AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
            AND deleted_at IS NULL
        `;

        const result = await this.queries.pool.queryOne(query, [licenseId]);
        const fingerprintCount = parseInt(result.fingerprint_count);

        if (fingerprintCount > this.maxFingerprintChangesPerDay) {
            return {
                suspicious: true,
                type: 'excessive_fingerprint_changes',
                severity: 'critical',
                description: `${fingerprintCount} different fingerprints in 24 hours`,
                metadata: { fingerprint_count: fingerprintCount }
            };
        }

        return { suspicious: false };
    }

    /**
     * Check concurrent machines
     */
    async checkConcurrentMachines(licenseId) {
        const license = await this.queries.findById('licenses', licenseId);
        const plan = await this.queries.findById('plans', license.plan_id);

        const machineCount = await this.queries.countMachinesByLicense(licenseId);

        if (machineCount > plan.max_machines) {
            return {
                suspicious: true,
                type: 'machine_limit_exceeded',
                severity: 'high',
                description: `${machineCount} machines active (limit: ${plan.max_machines})`,
                metadata: { machine_count: machineCount, max_machines: plan.max_machines }
            };
        }

        return { suspicious: false };
    }

    /**
     * Log suspicious activities
     */
    async logSuspiciousActivities(licenseId, machineId, activities) {
        for (const activity of activities) {
            await this.queries.createSuspiciousActivity({
                license_id: licenseId,
                machine_id: machineId,
                activity_type: activity.type,
                severity: activity.severity,
                description: activity.description,
                metadata: activity.metadata
            });

            this.logger.security('Suspicious activity detected', {
                licenseId,
                machineId,
                type: activity.type,
                severity: activity.severity
            });
        }
    }

    /**
     * Auto-block license or machine
     */
    async autoBlock(licenseId, machineId, activities) {
        const criticalActivities = activities.filter(a => a.severity === 'critical');
        const reason = criticalActivities.map(a => a.description).join('; ');

        // Block machine
        await this.queries.update('machines', machineId, {
            is_blocked: true,
            block_reason: `Auto-blocked: ${reason}`
        });

        // If multiple critical issues, suspend license
        if (criticalActivities.length >= 2) {
            await this.queries.update('licenses', licenseId, {
                status: 'suspended'
            });

            this.logger.security('License auto-suspended', {
                licenseId,
                reason,
                criticalCount: criticalActivities.length
            });
        }

        this.logger.security('Machine auto-blocked', {
            licenseId,
            machineId,
            reason
        });
    }

    /**
     * Check if machine should be allowed
     */
    async shouldAllowMachine(licenseId, machineId, ipAddress, fingerprint) {
        const check = await this.checkSuspiciousActivity(licenseId, machineId, ipAddress, fingerprint);

        return {
            allowed: !check.shouldBlock,
            reason: check.shouldBlock ? 'Suspicious activity detected' : null,
            activities: check.activities
        };
    }
}

module.exports = AntiPiracyService;
