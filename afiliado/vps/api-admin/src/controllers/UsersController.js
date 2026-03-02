/**
 * Users Controller (Admin)
 * Real CRUD endpoints for user management
 */

const UsersService = require('../services/UsersService');

class UsersController {
    constructor() {
        this.usersService = new UsersService();
    }

    /**
     * GET /admin/users
     * List all users with pagination and filters
     */
    async list(req, res) {
        try {
            const { limit, offset, status, search } = req.query;

            const result = await this.usersService.list({
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0,
                status,
                search
            });

            res.json(result);

        } catch (error) {
            console.error('Error in list users:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /admin/users/:id
     * Get user details with licenses and subscriptions
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const result = await this.usersService.getById(id);

            if (!result.success) {
                return res.status(404).json({ error: result.error });
            }

            res.json(result);

        } catch (error) {
            console.error('Error in get user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * POST /admin/users
     * Create new user
     */
    async create(req, res) {
        try {
            const adminId = req.admin.adminId;
            const userData = req.body;

            const result = await this.usersService.create(userData, adminId);

            if (!result.success) {
                return res.status(400).json({
                    error: result.error,
                    errors: result.errors
                });
            }

            res.status(201).json(result);

        } catch (error) {
            console.error('Error in create user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * PUT /admin/users/:id
     * Update user
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin.adminId;
            const userData = req.body;

            const result = await this.usersService.update(id, userData, adminId);

            if (!result.success) {
                return res.status(404).json({ error: result.error });
            }

            res.json(result);

        } catch (error) {
            console.error('Error in update user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * DELETE /admin/users/:id
     * Soft delete user
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin.adminId;

            const result = await this.usersService.delete(id, adminId);

            if (!result.success) {
                return res.status(404).json({ error: result.error });
            }

            res.json(result);

        } catch (error) {
            console.error('Error in delete user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new UsersController();
