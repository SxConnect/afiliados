/**
 * Subscriptions Service (Admin)
 * Manage subscriptions and payments
 */

const { getInstance: getQueries } = require('../../../shared/database/queries');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

class SubscriptionsService {
    constructor() {
        this.queries = getQueries();
        this.logger = getLogger();
    }

    /**
     * List subscriptions with pagination
     */
    async list({ limit = 50, offset = 0, status, userId, provider, search } = {}) {
        try {
            let query = `
                SELECT s.*,
                       u.phone as user_phone,
                       u.name as user_name,
                       p.name as plan_name,
                       l.license_key
                FROM subscriptions s
                JOIN users u ON s.user_id = u.id
                JOIN plans p ON s.plan_id = p.id
                JOIN licenses l ON s.license_id = l.id
                WHERE s.deleted_at IS NULL
            `;
            const params = [];
            let paramIndex = 1;

            if (status) {
                query += ` AND s.status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }

            if (userId) {
                query += ` AND s.user_id = $${paramIndex}`;
                params.push(userId);
                paramIndex++;
            }

            if (provider) {
                query += ` AND s.provider = $${paramIndex}`;
                params.push(provider);
                paramIndex++;
            }

            if (search) {
                query += ` AND (s.external_id LIKE $${paramIndex} OR u.phone LIKE $${paramIndex} OR l.license_key LIKE $${paramIndex})`;
                params.push(`%${search}%`);
                paramIndex++;
            }

            query += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const subscriptions = await this.queries.pool.queryMany(query, params);

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM subscriptions WHERE deleted_at IS NULL`;
            const { total } = await this.queries.pool.queryOne(countQuery);

            return {
                success: true,
                subscriptions,
                pagination: {
                    total: parseInt(total),
                    limit,
                    offset,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            this.logger.error('Error listing subscriptions', { error: error.message });
            throw error;
        }
    }

    /**
     * Get subscription by ID
     */
    async getById(subscriptionId) {
        try {
            const subscription = await this.queries.pool.queryOne(
                `SELECT s.*,
                        u.phone as user_phone,
                        u.name as user_name,
                        u.email as user_email,
                        p.name as plan_name,
                        l.license_key
                 FROM subscriptions s
                 JOIN users u ON s.user_id = u.id
                 JOIN plans p ON s.plan_id = p.id
                 JOIN licenses l ON s.license_id = l.id
                 WHERE s.id = $1 AND s.deleted_at IS NULL`,
                [subscriptionId]
            );

            if (!subscription) {
                return { success: false, error: 'Subscription not found' };
            }

            // Get payments
            const payments = await this.queries.findPaymentsBySubscription(subscriptionId);

            return {
                success: true,
                subscription: {
                    ...subscription,
                    payments
                }
            };

        } catch (error) {
            this.logger.error('Error getting subscription', { error: error.message, subscriptionId });
            throw error;
        }
    }

    /**
     * Create subscription (manual)
     */
    async create(data, adminId) {
        try {
            // Validate required fields
            if (!data.user_id || !data.license_id || !data.plan_id || !data.amount) {
                return { success: false, error: 'Missing required fields' };
            }

            // Verify entities exist
            const user = await this.queries.findById('users', data.user_id);
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            const license = await this.queries.findById('licenses', data.license_id);
            if (!license) {
                return { success: false, error: 'License not found' };
            }

            const plan = await this.queries.findById('plans', data.plan_id);
            if (!plan) {
                return { success: false, error: 'Plan not found' };
            }

            // Calculate next billing date
            const nextBillingDate = new Date();
            if (data.billing_cycle === 'yearly') {
                nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
            } else {
                nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            }

            // Create subscription
            const subscription = await this.queries.create('subscriptions', {
                user_id: data.user_id,
                license_id: data.license_id,
                plan_id: data.plan_id,
                provider: 'manual',
                external_id: null,
                status: data.status || 'active',
                billing_cycle: data.billing_cycle || 'monthly',
                amount: data.amount,
                currency: data.currency || 'BRL',
                next_billing_date: nextBillingDate,
                metadata: data.metadata || {}
            });

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'create',
                resource_type: 'subscriptions',
                resource_id: subscription.id,
                changes: { created: subscription }
            });

            this.logger.info('Subscription created', { subscriptionId: subscription.id, adminId });

            return { success: true, subscription };

        } catch (error) {
            this.logger.error('Error creating subscription', { error: error.message });
            throw error;
        }
    }

    /**
     * Update subscription
     */
    async update(subscriptionId, data, adminId) {
        try {
            const oldSubscription = await this.queries.findById('subscriptions', subscriptionId);
            if (!oldSubscription) {
                return { success: false, error: 'Subscription not found' };
            }

            // Update subscription
            const subscription = await this.queries.update('subscriptions', subscriptionId, {
                status: data.status !== undefined ? data.status : oldSubscription.status,
                amount: data.amount !== undefined ? data.amount : oldSubscription.amount,
                next_billing_date: data.next_billing_date !== undefined ? data.next_billing_date : oldSubscription.next_billing_date,
                metadata: data.metadata !== undefined ? data.metadata : oldSubscription.metadata
            });

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'update',
                resource_type: 'subscriptions',
                resource_id: subscriptionId,
                changes: { old: oldSubscription, new: subscription }
            });

            this.logger.info('Subscription updated', { subscriptionId, adminId });

            return { success: true, subscription };

        } catch (error) {
            this.logger.error('Error updating subscription', { error: error.message, subscriptionId });
            throw error;
        }
    }

    /**
     * Cancel subscription
     */
    async cancel(subscriptionId, reason, adminId) {
        try {
            const subscription = await this.queries.update('subscriptions', subscriptionId, {
                status: 'cancelled',
                cancelled_at: new Date(),
                cancel_reason: reason
            });

            if (!subscription) {
                return { success: false, error: 'Subscription not found' };
            }

            // Update license to expired
            await this.queries.update('licenses', subscription.license_id, {
                status: 'expired'
            });

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'cancel',
                resource_type: 'subscriptions',
                resource_id: subscriptionId,
                changes: { reason }
            });

            this.logger.info('Subscription cancelled', { subscriptionId, reason, adminId });

            return { success: true, subscription };

        } catch (error) {
            this.logger.error('Error cancelling subscription', { error: error.message, subscriptionId });
            throw error;
        }
    }

    /**
     * Pause subscription
     */
    async pause(subscriptionId, adminId) {
        try {
            const subscription = await this.queries.update('subscriptions', subscriptionId, {
                status: 'paused'
            });

            if (!subscription) {
                return { success: false, error: 'Subscription not found' };
            }

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'pause',
                resource_type: 'subscriptions',
                resource_id: subscriptionId
            });

            this.logger.info('Subscription paused', { subscriptionId, adminId });

            return { success: true, subscription };

        } catch (error) {
            this.logger.error('Error pausing subscription', { error: error.message, subscriptionId });
            throw error;
        }
    }

    /**
     * Resume subscription
     */
    async resume(subscriptionId, adminId) {
        try {
            const subscription = await this.queries.update('subscriptions', subscriptionId, {
                status: 'active'
            });

            if (!subscription) {
                return { success: false, error: 'Subscription not found' };
            }

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'resume',
                resource_type: 'subscriptions',
                resource_id: subscriptionId
            });

            this.logger.info('Subscription resumed', { subscriptionId, adminId });

            return { success: true, subscription };

        } catch (error) {
            this.logger.error('Error resuming subscription', { error: error.message, subscriptionId });
            throw error;
        }
    }

    /**
     * Get subscription statistics
     */
    async getStatistics() {
        try {
            const stats = await this.queries.pool.queryOne(`
                SELECT
                    COUNT(*) as total_subscriptions,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
                    COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_subscriptions,
                    COUNT(CASE WHEN provider = 'mercadopago' THEN 1 END) as mercadopago_count,
                    COUNT(CASE WHEN provider = 'stripe' THEN 1 END) as stripe_count,
                    COUNT(CASE WHEN provider = 'manual' THEN 1 END) as manual_count,
                    COALESCE(SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END), 0) as monthly_recurring_revenue
                FROM subscriptions
                WHERE deleted_at IS NULL
            `);

            return { success: true, stats };

        } catch (error) {
            this.logger.error('Error getting subscription statistics', { error: error.message });
            throw error;
        }
    }
}

module.exports = SubscriptionsService;
