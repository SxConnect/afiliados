/**
 * Licenses Controller (Admin)
 * Handle HTTP requests for licenses management
 */

const LicensesService = require('../services/LicensesService');

class LicensesController {
    constructor() {
        this.service = new LicensesService();
    }

    /**
     * List licenses
     * GET /api/admin/licenses
     */
    async list(req, res) {
        try {
            const { limit, offset, status, userId, planId, search } = req.query;
            const result = await this.service.list({
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0,
                status,
                userId,
                planId,
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
     * Get license by ID
     * GET /api/admin/licenses/:id
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
     * Create license
     * POST /api/admin/licenses
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
     * Update license
     * PUT /api/admin/licenses/:id
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
     * Suspend license
     * POST /api/admin/licenses/:id/suspend
     */
    async suspend(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const adminId = req.admin.id;
            const result = await this.service.suspend(id, reason, adminId);

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
     * Reactivate license
     * POST /api/admin/licenses/:id/reactivate
     */
    async reactivate(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin.id;
            const result = await this.service.reactivate(id, adminId);

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
     * Reset quota
     * POST /api/admin/licenses/:id/reset-quota
     */
    async resetQuota(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin.id;
            const result = await this.service.resetQuota(id, adminId);

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
     * Delete license
     * DELETE /api/admin/licenses/:id
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin.id;
            const result = await this.service.delete(id, adminId);

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
}

module.exports = LicensesController;
