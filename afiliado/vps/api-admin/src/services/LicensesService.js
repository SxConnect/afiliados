/**
 * Licenses Service (Admin)
 * CRUD operations for licenses
 */

const crypto = require('crypto');
const { getInstance: getQueries } = require('../../../shared/database/queries');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

class LicensesService {
    constructor() {
        this.queries = getQueries();
        this.logger = getLogger();
    }

    /**
     * Generate license key
     */
    generateLicenseKey() {
        const segments = [];
        for (let i = 0; i < 4; i++) {
            segments.push(crypto.randomBytes(4).toString('hex').toUpperCase());
        }
        return segments.join('-');
    }

    /**
     * List licenses with pagination
     */
    async list({ limit = 50, offset = 0, status, userId, planId, search } = {}) {
        try {
            let query = `
                SELECT l.*,
                       u.phone as user_phone,
                       u.name as user_name,
                       p.name as plan_name,
                       COUNT(DISTINCT m.id) as machine_count
                FROM licenses l
                JOIN users u ON l.user_id = u.id
                JOIN plans p ON l.plan_id = p.id
                LEFT JOIN machines m ON l.id = m.license_id AND m.is_active = true AND m.deleted_at IS NULL
                WHERE l.deleted_at IS NULL
            `;
            const params = [];
            let paramIndex = 1;

            if (status) {
                query += ` AND l.status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }

            if (userId) {
                query += ` AND l.user_id = $${paramIndex}`;
                params.push(userId);
                paramIndex++;
            }

            if (planId) {
                query += ` AND l.plan_id = $${paramIndex}`;
                params.push(planId);
                paramIndex++;
            }

            if (search) {
                query += ` AND (l.license_key LIKE $${paramIndex} OR u.phone LIKE $${paramIndex} OR u.name LIKE $${paramIndex})`;
                params.push(`%${search}%`);
                paramIndex++;
            }

            query += ` GROUP BY l.id, u.id, p.id ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const licenses = await this.queries.pool.queryMany(query, params);

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM licenses WHERE deleted_at IS NULL`;
            const { total } = await this.queries.pool.queryOne(countQuery);

            return {
                success: true,
                licenses,
                pagination: {
                    total: parseInt(total),
                    limit,
                    offset,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            this.logger.error('Error listing licenses', { error: error.message });
            throw error;
        }
    }

    /**
     * Get license by ID
     */
    async getById(licenseId) {
        try {
            const license = await this.queries.pool.queryOne(
                `SELECT l.*,
                        u.phone as user_phone,
                        u.name as user_name,
                        u.email as user_email,
                        p.name as plan_name,
                        p.quota_monthly,
                        p.max_machines
                 FROM licenses l
                 JOIN users u ON l.user_id = u.id
                 JOIN plans p ON l.plan_id = p.id
                 WHERE l.id = $1 AND l.deleted_at IS NULL`,
                [licenseId]
            );

            if (!license) {
                return { success: false, error: 'License not found' };
            }

            // Get machines
            const machines = await this.queries.findMachinesByLicense(licenseId);

            // Get subscription
            const subscription = await this.queries.pool.queryOne(
                `SELECT * FROM subscriptions 
                 WHERE license_id = $1 AND deleted_at IS NULL
                 ORDER BY created_at DESC LIMIT 1`,
                [licenseId]
            );

            return {
                success: true,
                license: {
                    ...license,
                    machines,
                    subscription
                }
            };

        } catch (error) {
            this.logger.error('Error getting license', { error: error.message, licenseId });
            throw error;
        }
    }

    /**
     * Create license
     */
    async create(data, adminId) {
        try {
            // Validate required fields
            if (!data.user_id || !data.plan_id) {
                return { success: false, error: 'Missing required fields' };
            }

            // Verify user exists
            const user = await this.queries.findById('users', data.user_id);
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            // Verify plan exists
            const plan = await this.queries.findById('plans', data.plan_id);
            if (!plan) {
                return { success: false, error: 'Plan not found' };
            }

            // Generate license key
            const licenseKey = data.license_key || this.generateLicenseKey();

            // Calculate expiration date (1 month from now)
            const expirationDate = new Date();
            expirationDate.setMonth(expirationDate.getMonth() + 1);

            // Create license
            const license = await this.queries.create('licenses', {
                user_id: data.user_id,
                plan_id: data.plan_id,
                license_key: licenseKey,
                status: data.status || 'active',
                activation_date: new Date(),
                expiration_date: expirationDate,
                grace_period_end: null,
                quota_used: 0,
                quota_reset_at: new Date(),
                metadata: data.metadata || {}
            });

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'create',
                resource_type: 'licenses',
                resource_id: license.id,
                changes: { created: license }
            });

            this.logger.info('License created', { licenseId: license.id, adminId });

            return { success: true, license };

        } catch (error) {
            this.logger.error('Error creating license', { error: error.message });
            throw error;
        }
    }

    /**
     * Update license
     */
    async update(licenseId, data, adminId) {
        try {
            const oldLicense = await this.queries.findById('licenses', licenseId);
            if (!oldLicense) {
                return { success: false, error: 'License not found' };
            }

            // Update license
            const license = await this.queries.update('licenses', licenseId, {
                status: data.status !== undefined ? data.status : oldLicense.status,
                expiration_date: data.expiration_date !== undefined ? data.expiration_date : oldLicense.expiration_date,
                grace_period_end: data.grace_period_end !== undefined ? data.grace_period_end : oldLicense.grace_period_end,
                metadata: data.metadata !== undefined ? data.metadata : oldLicense.metadata
            });

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'update',
                resource_type: 'licenses',
                resource_id: licenseId,
                changes: { old: oldLicense, new: license }
            });

            this.logger.info('License updated', { licenseId, adminId });

            return { success: true, license };

        } catch (error) {
            this.logger.error('Error updating license', { error: error.message, licenseId });
            throw error;
        }
    }

    /**
     * Suspend license
     */
    async suspend(licenseId, reason, adminId) {
        try {
            const license = await this.queries.update('licenses', licenseId, {
                status: 'suspended',
                metadata: { suspend_reason: reason, suspended_at: new Date(), suspended_by: adminId }
            });

            if (!license) {
                return { success: false, error: 'License not found' };
            }

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'suspend',
                resource_type: 'licenses',
                resource_id: licenseId,
                changes: { reason }
            });

            this.logger.info('License suspended', { licenseId, reason, adminId });

            return { success: true, license };

        } catch (error) {
            this.logger.error('Error suspending license', { error: error.message, licenseId });
            throw error;
        }
    }

    /**
     * Reactivate license
     */
    async reactivate(licenseId, adminId) {
        try {
            const license = await this.queries.update('licenses', licenseId, {
                status: 'active'
            });

            if (!license) {
                return { success: false, error: 'License not found' };
            }

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'reactivate',
                resource_type: 'licenses',
                resource_id: licenseId
            });

            this.logger.info('License reactivated', { licenseId, adminId });

            return { success: true, license };

        } catch (error) {
            this.logger.error('Error reactivating license', { error: error.message, licenseId });
            throw error;
        }
    }

    /**
     * Delete license (soft delete)
     */
    async delete(licenseId, adminId) {
        try {
            const license = await this.queries.softDelete('licenses', licenseId);
            if (!license) {
                return { success: false, error: 'License not found' };
            }

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'delete',
                resource_type: 'licenses',
                resource_id: licenseId
            });

            this.logger.info('License deleted', { licenseId, adminId });

            return { success: true };

        } catch (error) {
            this.logger.error('Error deleting license', { error: error.message, licenseId });
            throw error;
        }
    }

    /**
     * Reset quota
     */
    async resetQuota(licenseId, adminId) {
        try {
            const license = await this.queries.update('licenses', licenseId, {
                quota_used: 0,
                quota_reset_at: new Date()
            });

            if (!license) {
                return { success: false, error: 'License not found' };
            }

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'reset_quota',
                resource_type: 'licenses',
                resource_id: licenseId
            });

            this.logger.info('License quota reset', { licenseId, adminId });

            return { success: true, license };

        } catch (error) {
            this.logger.error('Error resetting quota', { error: error.message, licenseId });
            throw error;
        }
    }
}

module.exports = LicensesService;
