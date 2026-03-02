/**
 * Subscriptions Controller (Admin)
 * Handle HTTP requests for subscriptions management
 */

const SubscriptionsService = require('../services/SubscriptionsService');

class SubscriptionsController {
    constructor() {
        this.service = new SubscriptionsService();
    }

    /**
     * List subscriptions
     * GET /api/admin/subscriptions
     */
    async list(req, res) {
        try {
            const { limit, offset, status, userId, provider, search } = req.query;
            const result = await this.service.list({
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0,
                status,
                userId,
                provider,
                search
            });

            return res.json(result);

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get subscription by ID
     * GET /api/admin/subscriptions/:id
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await this.service.getById(id);

            if (!result.success) {
                return res.status(404).json(result);
            }

            return res.json(result);

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Create subscription (manual)
     * POST /api/admin/subscriptions
     */
    async create(req, res) {
        try {
            const adminId = req.admin.id;
            const result = await this.service.create(req.body, adminId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(201).json(result);

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Update subscription
     * PUT /api/admin/subscriptions/:id
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin.id;
            const result = await this.service.update(id, req.body, adminId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.json(result);

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Cancel subscription
     * POST /api/admin/subscriptions/:id/cancel
     */
    async cancel(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const adminId = req.admin.id;
            const result = await this.service.cancel(id, reason, adminId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.json(result);

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Pause subscription
     * POST /api/admin/subscriptions/:id/pause
     */
    async pause(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin.id;
            const result = await this.service.pause(id, adminId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.json(result);

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Resume subscription
     * POST /api/admin/subscriptions/:id/resume
     */
    async resume(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin.id;
            const result = await this.service.resume(id, adminId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.json(result);

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get subscription statistics
     * GET /api/admin/subscriptions/statistics
     */
    async getStatistics(req, res) {
        try {
            const result = await this.service.getStatistics();

            return res.json(result);

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

module.exports = SubscriptionsController;
