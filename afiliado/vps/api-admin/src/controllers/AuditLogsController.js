/**
 * Audit Logs Controller (Admin)
 * View audit trail
 */

const { getInstance: getQueries } = require('../../../shared/database/queries');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

class AuditLogsController {
    constructor() {
        this.queries = getQueries();
        this.logger = getLogger();
    }

    /**
     * List audit logs with pagination
     * GET /api/admin/audit-logs
     */
    async list(req, res) {
        try {
            const {
                limit = 50,
                offset = 0,
                actorType,
                actorId,
                action,
                resourceType,
                resourceId,
                startDate,
                endDate
            } = req.query;

            let query = `
                SELECT al.*,
                       CASE 
                           WHEN al.actor_type = 'admin' THEN au.name
                           WHEN al.actor_type = 'user' THEN u.name
                           ELSE 'System'
                       END as actor_name
                FROM audit_logs_2026_03 al
                LEFT JOIN admin_users au ON al.actor_type = 'admin' AND al.actor_id = au.id
                LEFT JOIN users u ON al.actor_type = 'user' AND al.actor_id = u.id
                WHERE 1=1
            `;
            const params = [];
            let paramIndex = 1;

            if (actorType) {
                query += ` AND al.actor_type = $${paramIndex}`;
                params.push(actorType);
                paramIndex++;
            }

            if (actorId) {
                query += ` AND al.actor_id = $${paramIndex}`;
                params.push(actorId);
                paramIndex++;
            }

            if (action) {
                query += ` AND al.action = $${paramIndex}`;
                params.push(action);
                paramIndex++;
            }

            if (resourceType) {
                query += ` AND al.resource_type = $${paramIndex}`;
                params.push(resourceType);
                paramIndex++;
            }

            if (resourceId) {
                query += ` AND al.resource_id = $${paramIndex}`;
                params.push(resourceId);
                paramIndex++;
            }

            if (startDate) {
                query += ` AND al.created_at >= $${paramIndex}`;
                params.push(startDate);
                paramIndex++;
            }

            if (endDate) {
                query += ` AND al.created_at <= $${paramIndex}`;
                params.push(endDate);
                paramIndex++;
            }

            query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(parseInt(limit), parseInt(offset));

            const logs = await this.queries.pool.queryMany(query, params);

            // Get total count
            let countQuery = `SELECT COUNT(*) as total FROM audit_logs_2026_03 WHERE 1=1`;
            const countParams = [];
            let countParamIndex = 1;

            if (actorType) {
                countQuery += ` AND actor_type = $${countParamIndex}`;
                countParams.push(actorType);
                countParamIndex++;
            }

            if (actorId) {
                countQuery += ` AND actor_id = $${countParamIndex}`;
                countParams.push(actorId);
                countParamIndex++;
            }

            if (action) {
                countQuery += ` AND action = $${countParamIndex}`;
                countParams.push(action);
                countParamIndex++;
            }

            if (resourceType) {
                countQuery += ` AND resource_type = $${countParamIndex}`;
                countParams.push(resourceType);
                countParamIndex++;
            }

            if (resourceId) {
                countQuery += ` AND resource_id = $${countParamIndex}`;
                countParams.push(resourceId);
                countParamIndex++;
            }

            const { total } = await this.queries.pool.queryOne(countQuery, countParams);

            return res.json({
                success: true,
                logs,
                pagination: {
                    total: parseInt(total),
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            this.logger.error('Error listing audit logs', { error: error.message });
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get audit log by ID
     * GET /api/admin/audit-logs/:id
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const log = await this.queries.pool.queryOne(
                `SELECT al.*,
                        CASE 
                            WHEN al.actor_type = 'admin' THEN au.name
                            WHEN al.actor_type = 'user' THEN u.name
                            ELSE 'System'
                        END as actor_name,
                        CASE 
                            WHEN al.actor_type = 'admin' THEN au.email
                            WHEN al.actor_type = 'user' THEN u.email
                            ELSE NULL
                        END as actor_email
                 FROM audit_logs_2026_03 al
                 LEFT JOIN admin_users au ON al.actor_type = 'admin' AND al.actor_id = au.id
                 LEFT JOIN users u ON al.actor_type = 'user' AND al.actor_id = u.id
                 WHERE al.id = $1`,
                [id]
            );

            if (!log) {
                return res.status(404).json({
                    success: false,
                    error: 'Audit log not found'
                });
            }

            return res.json({
                success: true,
                log
            });

        } catch (error) {
            this.logger.error('Error getting audit log', { error: error.message, id: req.params.id });
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get audit statistics
     * GET /api/admin/audit-logs/statistics
     */
    async getStatistics(req, res) {
        try {
            const stats = await this.queries.pool.queryOne(`
                SELECT
                    COUNT(*) as total_logs,
                    COUNT(CASE WHEN actor_type = 'admin' THEN 1 END) as admin_actions,
                    COUNT(CASE WHEN actor_type = 'user' THEN 1 END) as user_actions,
                    COUNT(CASE WHEN actor_type = 'system' THEN 1 END) as system_actions,
                    COUNT(CASE WHEN action = 'create' THEN 1 END) as creates,
                    COUNT(CASE WHEN action = 'update' THEN 1 END) as updates,
                    COUNT(CASE WHEN action = 'delete' THEN 1 END) as deletes,
                    COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_logs,
                    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_logs
                FROM audit_logs_2026_03
            `);

            return res.json({
                success: true,
                stats
            });

        } catch (error) {
            this.logger.error('Error getting audit statistics', { error: error.message });
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

module.exports = AuditLogsController;
