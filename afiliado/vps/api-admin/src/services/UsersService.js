/**
 * Users Service (Admin)
 * CRUD operations for users
 */

const { getInstance: getQueries } = require('../../../shared/database/queries');
const { getInstance: getLogger } = require('../../../shared/utils/logger');
const Validators = require('../../../shared/validators');

class UsersService {
    constructor() {
        this.queries = getQueries();
        this.logger = getLogger();
    }

    /**
     * List users with pagination
     */
    async list({ limit = 50, offset = 0, status, search } = {}) {
        try {
            let query = `
                SELECT u.*, 
                       COUNT(l.id) as license_count,
                       COUNT(CASE WHEN l.status = 'active' THEN 1 END) as active_licenses
                FROM users u
                LEFT JOIN licenses l ON u.id = l.user_id AND l.deleted_at IS NULL
                WHERE u.deleted_at IS NULL
            `;
            const params = [];
            let paramIndex = 1;

            // Filter by status
            if (status) {
                query += ` AND u.status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }

            // Search
            if (search) {
                query += ` AND (u.phone LIKE $${paramIndex} OR u.email LIKE $${paramIndex} OR u.name LIKE $${paramIndex})`;
                params.push(`%${search}%`);
                paramIndex++;
            }

            query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const users = await this.queries.pool.queryMany(query, params);

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL`;
            const { total } = await this.queries.pool.queryOne(countQuery);

            return {
                success: true,
                users,
                pagination: {
                    total: parseInt(total),
                    limit,
                    offset,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            this.logger.error('Error listing users', { error: error.message });
            throw error;
        }
    }

    /**
     * Get user by ID
     */
    async getById(userId) {
        try {
            const user = await this.queries.findById('users', userId);
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            // Get licenses
            const licenses = await this.queries.findLicensesByUserId(userId);

            // Get subscriptions
            const subscriptions = await this.queries.pool.queryMany(
                `SELECT s.*, p.name as plan_name
                 FROM subscriptions s
                 JOIN plans p ON s.plan_id = p.id
                 WHERE s.user_id = $1 AND s.deleted_at IS NULL
                 ORDER BY s.created_at DESC`,
                [userId]
            );

            return {
                success: true,
                user: {
                    ...user,
                    licenses,
                    subscriptions
                }
            };

        } catch (error) {
            this.logger.error('Error getting user', { error: error.message, userId });
            throw error;
        }
    }

    /**
     * Create user
     */
    async create(data, adminId) {
        try {
            // Validate
            const validation = Validators.validateUserData(data);
            if (!validation.valid) {
                return { success: false, errors: validation.errors };
            }

            // Check if phone already exists
            const existing = await this.queries.findUserByPhone(data.phone);
            if (existing) {
                return { success: false, error: 'Phone already registered' };
            }

            // Create user
            const user = await this.queries.create('users', {
                phone: data.phone,
                email: data.email || null,
                name: data.name || null,
                company: data.company || null,
                document: data.document || null,
                status: data.status || 'active',
                metadata: data.metadata || {}
            });

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'create',
                resource_type: 'users',
                resource_id: user.id,
                changes: { created: user }
            });

            this.logger.info('User created', { userId: user.id, adminId });

            return { success: true, user };

        } catch (error) {
            this.logger.error('Error creating user', { error: error.message });
            throw error;
        }
    }

    /**
     * Update user
     */
    async update(userId, data, adminId) {
        try {
            const oldUser = await this.queries.findById('users', userId);
            if (!oldUser) {
                return { success: false, error: 'User not found' };
            }

            // Update user
            const user = await this.queries.update('users', userId, {
                email: data.email !== undefined ? data.email : oldUser.email,
                name: data.name !== undefined ? data.name : oldUser.name,
                company: data.company !== undefined ? data.company : oldUser.company,
                document: data.document !== undefined ? data.document : oldUser.document,
                status: data.status !== undefined ? data.status : oldUser.status,
                metadata: data.metadata !== undefined ? data.metadata : oldUser.metadata
            });

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'update',
                resource_type: 'users',
                resource_id: userId,
                changes: { old: oldUser, new: user }
            });

            this.logger.info('User updated', { userId, adminId });

            return { success: true, user };

        } catch (error) {
            this.logger.error('Error updating user', { error: error.message, userId });
            throw error;
        }
    }

    /**
     * Delete user (soft delete)
     */
    async delete(userId, adminId) {
        try {
            const user = await this.queries.softDelete('users', userId);
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'delete',
                resource_type: 'users',
                resource_id: userId
            });

            this.logger.info('User deleted', { userId, adminId });

            return { success: true };

        } catch (error) {
            this.logger.error('Error deleting user', { error: error.message, userId });
            throw error;
        }
    }
}

module.exports = UsersService;
