/**
 * Dashboard Controller
 * Real metrics and KPIs
 */

const { getInstance: getQueries } = require('../../../shared/database/queries');

class DashboardController {
    constructor() {
        this.queries = getQueries();
    }

    /**
     * GET /admin/dashboard/metrics
     * Get main dashboard metrics
     */
    async getMetrics(req, res) {
        try {
            const metrics = await this.queries.getDashboardMetrics();

            // Calculate MRR (Monthly Recurring Revenue)
            const mrrQuery = `
                SELECT COALESCE(SUM(amount), 0) as mrr
                FROM subscriptions
                WHERE status = 'active' 
                AND billing_cycle = 'monthly'
                AND deleted_at IS NULL
            `;
            const { mrr } = await this.queries.pool.queryOne(mrrQuery);

            // Calculate ARR (Annual Recurring Revenue)
            const arrQuery = `
                SELECT COALESCE(SUM(amount), 0) as arr
                FROM subscriptions
                WHERE status = 'active' 
                AND billing_cycle = 'yearly'
                AND deleted_at IS NULL
            `;
            const { arr } = await this.queries.pool.queryOne(arrQuery);

            // Churn rate (last 30 days)
            const churnQuery = `
                SELECT 
                    COUNT(*) FILTER (WHERE cancelled_at >= CURRENT_DATE - INTERVAL '30 days') as cancelled,
                    COUNT(*) as total
                FROM subscriptions
                WHERE created_at < CURRENT_DATE - INTERVAL '30 days'
                AND deleted_at IS NULL
            `;
            const churnData = await this.queries.pool.queryOne(churnQuery);
            const churnRate = churnData.total > 0
                ? ((churnData.cancelled / churnData.total) * 100).toFixed(2)
                : 0;

            res.json({
                success: true,
                metrics: {
                    totalUsers: parseInt(metrics.total_users),
                    activeLicenses: parseInt(metrics.active_licenses),
                    activeSubscriptions: parseInt(metrics.active_subscriptions),
                    revenue30d: parseFloat(metrics.revenue_30d),
                    mrr: parseFloat(mrr),
                    arr: parseFloat(arr),
                    churnRate: parseFloat(churnRate),
                    unresolvedSuspicious: parseInt(metrics.unresolved_suspicious)
                }
            });

        } catch (error) {
            console.error('Error getting metrics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /admin/dashboard/revenue-chart
     * Get revenue chart data (last 12 months)
     */
    async getRevenueChart(req, res) {
        try {
            const query = `
                SELECT 
                    DATE_TRUNC('month', paid_at) as month,
                    SUM(amount) as revenue,
                    COUNT(*) as payment_count
                FROM payments
                WHERE status = 'approved'
                AND paid_at >= CURRENT_DATE - INTERVAL '12 months'
                GROUP BY DATE_TRUNC('month', paid_at)
                ORDER BY month DESC
            `;

            const data = await this.queries.pool.queryMany(query);

            res.json({
                success: true,
                data: data.map(row => ({
                    month: row.month,
                    revenue: parseFloat(row.revenue),
                    paymentCount: parseInt(row.payment_count)
                }))
            });

        } catch (error) {
            console.error('Error getting revenue chart:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /admin/dashboard/users-growth
     * Get user growth chart (last 12 months)
     */
    async getUsersGrowth(req, res) {
        try {
            const query = `
                SELECT 
                    DATE_TRUNC('month', created_at) as month,
                    COUNT(*) as new_users
                FROM users
                WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
                AND deleted_at IS NULL
                GROUP BY DATE_TRUNC('month', created_at)
                ORDER BY month DESC
            `;

            const data = await this.queries.pool.queryMany(query);

            res.json({
                success: true,
                data: data.map(row => ({
                    month: row.month,
                    newUsers: parseInt(row.new_users)
                }))
            });

        } catch (error) {
            console.error('Error getting users growth:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /admin/dashboard/plans-distribution
     * Get distribution of users by plan
     */
    async getPlansDistribution(req, res) {
        try {
            const query = `
                SELECT 
                    p.name as plan_name,
                    COUNT(DISTINCT l.user_id) as user_count,
                    SUM(CASE WHEN l.status = 'active' THEN 1 ELSE 0 END) as active_count
                FROM plans p
                LEFT JOIN licenses l ON p.id = l.plan_id AND l.deleted_at IS NULL
                WHERE p.deleted_at IS NULL
                GROUP BY p.id, p.name
                ORDER BY user_count DESC
            `;

            const data = await this.queries.pool.queryMany(query);

            res.json({
                success: true,
                data: data.map(row => ({
                    plan: row.plan_name,
                    users: parseInt(row.user_count),
                    active: parseInt(row.active_count)
                }))
            });

        } catch (error) {
            console.error('Error getting plans distribution:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new DashboardController();
