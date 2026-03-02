/**
 * Plans Controller (Admin)
 * Handle HTTP requests for plans management
 */

const PlansService = require('../services/PlansService');

class PlansController {
    constructor() {
        this.service = new PlansService();
    }

    /**
     * List all plans
     * GET /api/admin/plans
     */
    async list(req, res) {
        try {
            const { includeInactive } = req.query;
            const result = await this.service.list({
                includeInactive: includeInactive === 'true'
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
     * Get plan by ID
     * GET /api/admin/plans/:id
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
     * Create plan
     * POST /api/admin/plans
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
     * Update plan
     * PUT /api/admin/plans/:id
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
     * Delete plan
     * DELETE /api/admin/plans/:id
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

    /**
     * Add plugin to plan
     * POST /api/admin/plans/:id/plugins
     */
    async addPlugin(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin.id;
            const result = await this.service.addPlugin(id, req.body, adminId);

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
     * Remove plugin from plan
     * DELETE /api/admin/plans/:id/plugins/:pluginId
     */
    async removePlugin(req, res) {
        try {
            const { id, pluginId } = req.params;
            const adminId = req.admin.id;
            const result = await this.service.removePlugin(id, pluginId, adminId);

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

module.exports = PlansController;
