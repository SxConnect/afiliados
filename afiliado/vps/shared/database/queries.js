/**
 * Database Query Builder
 * Provides reusable queries for all tables
 */

const { getInstance: getPool } = require('./pool');

class QueryBuilder {
    constructor() {
        this.pool = getPool();
    }

    // ============================================================================
    // GENERIC CRUD OPERATIONS
    // ============================================================================

    /**
     * Find by ID
     */
    async findById(table, id) {
        const query = `SELECT * FROM ${table} WHERE id = $1 AND deleted_at IS NULL`;
        return await this.pool.queryOne(query, [id]);
    }

    /**
     * Find all with pagination
     */
    async findAll(table, { limit = 50, offset = 0, orderBy = 'created_at', order = 'DESC' } = {}) {
        const query = `
            SELECT * FROM ${table} 
            WHERE deleted_at IS NULL 
            ORDER BY ${orderBy} ${order}
            LIMIT $1 OFFSET $2
        `;
        return await this.pool.queryMany(query, [limit, offset]);
    }

    /**
     * Count records
     */
    async count(table, where = {}) {
        let query = `SELECT COUNT(*) as count FROM ${table} WHERE deleted_at IS NULL`;
        const params = [];
        let paramIndex = 1;

        Object.entries(where).forEach(([key, value]) => {
            query += ` AND ${key} = $${paramIndex}`;
            params.push(value);
            paramIndex++;
        });

        const result = await this.pool.queryOne(query, params);
        return parseInt(result.count);
    }

    /**
     * Create record
     */
    async create(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
            INSERT INTO ${table} (${keys.join(', ')})
            VALUES (${placeholders})
            RETURNING *
        `;

        return await this.pool.queryOne(query, values);
    }

    /**
     * Update record
     */
    async update(table, id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

        const query = `
            UPDATE ${table}
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${keys.length + 1} AND deleted_at IS NULL
            RETURNING *
        `;

        return await this.pool.queryOne(query, [...values, id]);
    }

    /**
     * Soft delete record
     */
    async softDelete(table, id) {
        const query = `
            UPDATE ${table}
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING *
        `;
        return await this.pool.queryOne(query, [id]);
    }

    /**
     * Hard delete record
     */
    async hardDelete(table, id) {
        const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
        return await this.pool.queryOne(query, [id]);
    }

    // ============================================================================
    // USERS QUERIES
    // ============================================================================

    async findUserByPhone(phone) {
        const query = `SELECT * FROM users WHERE phone = $1 AND deleted_at IS NULL`;
        return await this.pool.queryOne(query, [phone]);
    }

    async findUserByEmail(email) {
        const query = `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`;
        return await this.pool.queryOne(query, [email]);
    }

    // ============================================================================
    // LICENSES QUERIES
    // ============================================================================

    async findLicenseByKey(licenseKey) {
        const query = `
            SELECT l.*, p.name as plan_name, p.quota_monthly, p.max_machines
            FROM licenses l
            JOIN plans p ON l.plan_id = p.id
            WHERE l.license_key = $1 AND l.deleted_at IS NULL
        `;
        return await this.pool.queryOne(query, [licenseKey]);
    }

    async findLicensesByUserId(userId) {
        const query = `
            SELECT l.*, p.name as plan_name
            FROM licenses l
            JOIN plans p ON l.plan_id = p.id
            WHERE l.user_id = $1 AND l.deleted_at IS NULL
            ORDER BY l.created_at DESC
        `;
        return await this.pool.queryMany(query, [userId]);
    }

    async updateLicenseQuota(licenseId, quotaUsed) {
        const query = `
            UPDATE licenses
            SET quota_used = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND deleted_at IS NULL
            RETURNING *
        `;
        return await this.pool.queryOne(query, [quotaUsed, licenseId]);
    }

    // ============================================================================
    // MACHINES QUERIES
    // ============================================================================

    async findMachineByFingerprint(licenseId, fingerprintHash) {
        const query = `
            SELECT * FROM machines
            WHERE license_id = $1 AND fingerprint_hash = $2 AND deleted_at IS NULL
        `;
        return await this.pool.queryOne(query, [licenseId, fingerprintHash]);
    }

    async countMachinesByLicense(licenseId) {
        const query = `
            SELECT COUNT(*) as count FROM machines
            WHERE license_id = $1 AND is_active = true AND deleted_at IS NULL
        `;
        const result = await this.pool.queryOne(query, [licenseId]);
        return parseInt(result.count);
    }

    async findMachinesByLicense(licenseId) {
        const query = `
            SELECT * FROM machines
            WHERE license_id = $1 AND deleted_at IS NULL
            ORDER BY last_seen_at DESC
        `;
        return await this.pool.queryMany(query, [licenseId]);
    }

    // ============================================================================
    // SUBSCRIPTIONS QUERIES
    // ============================================================================

    async findActiveSubscriptionByUser(userId) {
        const query = `
            SELECT s.*, p.name as plan_name
            FROM subscriptions s
            JOIN plans p ON s.plan_id = p.id
            WHERE s.user_id = $1 AND s.status = 'active' AND s.deleted_at IS NULL
            ORDER BY s.created_at DESC
            LIMIT 1
        `;
        return await this.pool.queryOne(query, [userId]);
    }

    async findSubscriptionByExternalId(externalId) {
        const query = `
            SELECT * FROM subscriptions
            WHERE external_id = $1 AND deleted_at IS NULL
        `;
        return await this.pool.queryOne(query, [externalId]);
    }

    // ============================================================================
    // PAYMENTS QUERIES
    // ============================================================================

    async findPaymentsBySubscription(subscriptionId) {
        const query = `
            SELECT * FROM payments
            WHERE subscription_id = $1
            ORDER BY created_at DESC
        `;
        return await this.pool.queryMany(query, [subscriptionId]);
    }

    async findPaymentByExternalId(externalId) {
        const query = `
            SELECT * FROM payments
            WHERE external_id = $1
        `;
        return await this.pool.queryOne(query, [externalId]);
    }

    // ============================================================================
    // AUDIT LOGS
    // ============================================================================

    async createAuditLog(data) {
        const query = `
            INSERT INTO audit_logs_2026_03 
            (actor_type, actor_id, action, resource_type, resource_id, changes, ip_address, user_agent, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [
            data.actor_type,
            data.actor_id,
            data.action,
            data.resource_type,
            data.resource_id,
            JSON.stringify(data.changes || {}),
            data.ip_address,
            data.user_agent,
            JSON.stringify(data.metadata || {})
        ];
        return await this.pool.queryOne(query, values);
    }

    // ============================================================================
    // USAGE LOGS
    // ============================================================================

    async createUsageLog(data) {
        const query = `
            INSERT INTO usage_logs_2026_03
            (license_id, machine_id, action, quota_consumed, ip_address, user_agent, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            data.license_id,
            data.machine_id,
            data.action,
            data.quota_consumed || 0,
            data.ip_address,
            data.user_agent,
            JSON.stringify(data.metadata || {})
        ];
        return await this.pool.queryOne(query, values);
    }

    // ============================================================================
    // SUSPICIOUS ACTIVITIES
    // ============================================================================

    async createSuspiciousActivity(data) {
        return await this.create('suspicious_activities', data);
    }

    async findUnresolvedSuspiciousActivities() {
        const query = `
            SELECT * FROM suspicious_activities
            WHERE is_resolved = false
            ORDER BY severity DESC, created_at DESC
        `;
        return await this.pool.queryMany(query);
    }

    // ============================================================================
    // DASHBOARD METRICS
    // ============================================================================

    async getDashboardMetrics() {
        const query = `
            SELECT
                (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
                (SELECT COUNT(*) FROM licenses WHERE status = 'active' AND deleted_at IS NULL) as active_licenses,
                (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND deleted_at IS NULL) as active_subscriptions,
                (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'approved' AND paid_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_30d,
                (SELECT COUNT(*) FROM suspicious_activities WHERE is_resolved = false) as unresolved_suspicious
        `;
        return await this.pool.queryOne(query);
    }
}

// Singleton instance
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new QueryBuilder();
        }
        return instance;
    },
    QueryBuilder
};
