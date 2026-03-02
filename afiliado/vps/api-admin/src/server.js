/**
 * API Admin Server
 * Real admin panel backend with full CRUD
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Controllers
const AdminAuthController = require('./controllers/AdminAuthController');
const UsersController = require('./controllers/UsersController');
const DashboardController = require('./controllers/DashboardController');
const PlansController = require('./controllers/PlansController');
const LicensesController = require('./controllers/LicensesController');
const SubscriptionsController = require('./controllers/SubscriptionsController');
const AuditLogsController = require('./controllers/AuditLogsController');

// Middlewares
const { verifyAdminToken, requireRole } = require('./middlewares/adminAuthMiddleware');
const { getInstance: getLogger } = require('../../shared/utils/logger');

const app = express();
const PORT = process.env.PORT || 4001;
const logger = getLogger();

// Trust proxy
app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(cors({
    origin: process.env.ADMIN_CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Rate limiting (stricter for admin)
const adminLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000,
    message: { error: 'Too many requests' }
});

app.use('/admin/', adminLimiter);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ============================================================================
// AUTH ROUTES (Public)
// ============================================================================

app.post('/admin/auth/login', AdminAuthController.login.bind(AdminAuthController));
app.post('/admin/auth/2fa/verify', AdminAuthController.verify2FA.bind(AdminAuthController));

// ============================================================================
// PROTECTED ROUTES (Require Auth)
// ============================================================================

// Auth routes (authenticated)
app.get('/admin/auth/me', verifyAdminToken, AdminAuthController.me.bind(AdminAuthController));
app.post('/admin/auth/2fa/setup', verifyAdminToken, AdminAuthController.setup2FA.bind(AdminAuthController));
app.post('/admin/auth/2fa/enable', verifyAdminToken, AdminAuthController.enable2FA.bind(AdminAuthController));

// Dashboard routes
app.get('/admin/dashboard/metrics', verifyAdminToken, DashboardController.getMetrics.bind(DashboardController));
app.get('/admin/dashboard/revenue-chart', verifyAdminToken, DashboardController.getRevenueChart.bind(DashboardController));
app.get('/admin/dashboard/users-growth', verifyAdminToken, DashboardController.getUsersGrowth.bind(DashboardController));
app.get('/admin/dashboard/plans-distribution', verifyAdminToken, DashboardController.getPlansDistribution.bind(DashboardController));

// Users routes (require admin or super_admin)
app.get('/admin/users', verifyAdminToken, requireRole('admin', 'super_admin'), UsersController.list.bind(UsersController));
app.get('/admin/users/:id', verifyAdminToken, requireRole('admin', 'super_admin'), UsersController.getById.bind(UsersController));
app.post('/admin/users', verifyAdminToken, requireRole('admin', 'super_admin'), UsersController.create.bind(UsersController));
app.put('/admin/users/:id', verifyAdminToken, requireRole('admin', 'super_admin'), UsersController.update.bind(UsersController));
app.delete('/admin/users/:id', verifyAdminToken, requireRole('super_admin'), UsersController.delete.bind(UsersController));

// Plans routes (require admin or super_admin)
app.get('/admin/plans', verifyAdminToken, requireRole('admin', 'super_admin'), PlansController.list.bind(PlansController));
app.get('/admin/plans/:id', verifyAdminToken, requireRole('admin', 'super_admin'), PlansController.getById.bind(PlansController));
app.post('/admin/plans', verifyAdminToken, requireRole('super_admin'), PlansController.create.bind(PlansController));
app.put('/admin/plans/:id', verifyAdminToken, requireRole('super_admin'), PlansController.update.bind(PlansController));
app.delete('/admin/plans/:id', verifyAdminToken, requireRole('super_admin'), PlansController.delete.bind(PlansController));
app.post('/admin/plans/:id/plugins', verifyAdminToken, requireRole('super_admin'), PlansController.addPlugin.bind(PlansController));
app.delete('/admin/plans/:id/plugins/:pluginId', verifyAdminToken, requireRole('super_admin'), PlansController.removePlugin.bind(PlansController));

// Licenses routes (require admin or super_admin)
app.get('/admin/licenses', verifyAdminToken, requireRole('admin', 'super_admin'), LicensesController.list.bind(LicensesController));
app.get('/admin/licenses/:id', verifyAdminToken, requireRole('admin', 'super_admin'), LicensesController.getById.bind(LicensesController));
app.post('/admin/licenses', verifyAdminToken, requireRole('admin', 'super_admin'), LicensesController.create.bind(LicensesController));
app.put('/admin/licenses/:id', verifyAdminToken, requireRole('admin', 'super_admin'), LicensesController.update.bind(LicensesController));
app.delete('/admin/licenses/:id', verifyAdminToken, requireRole('super_admin'), LicensesController.delete.bind(LicensesController));
app.post('/admin/licenses/:id/suspend', verifyAdminToken, requireRole('admin', 'super_admin'), LicensesController.suspend.bind(LicensesController));
app.post('/admin/licenses/:id/reactivate', verifyAdminToken, requireRole('admin', 'super_admin'), LicensesController.reactivate.bind(LicensesController));
app.post('/admin/licenses/:id/reset-quota', verifyAdminToken, requireRole('admin', 'super_admin'), LicensesController.resetQuota.bind(LicensesController));

// Subscriptions routes (require admin or super_admin)
app.get('/admin/subscriptions', verifyAdminToken, requireRole('admin', 'super_admin'), SubscriptionsController.list.bind(SubscriptionsController));
app.get('/admin/subscriptions/:id', verifyAdminToken, requireRole('admin', 'super_admin'), SubscriptionsController.getById.bind(SubscriptionsController));
app.post('/admin/subscriptions', verifyAdminToken, requireRole('admin', 'super_admin'), SubscriptionsController.create.bind(SubscriptionsController));
app.put('/admin/subscriptions/:id', verifyAdminToken, requireRole('admin', 'super_admin'), SubscriptionsController.update.bind(SubscriptionsController));
app.post('/admin/subscriptions/:id/cancel', verifyAdminToken, requireRole('admin', 'super_admin'), SubscriptionsController.cancel.bind(SubscriptionsController));
app.post('/admin/subscriptions/:id/pause', verifyAdminToken, requireRole('admin', 'super_admin'), SubscriptionsController.pause.bind(SubscriptionsController));
app.post('/admin/subscriptions/:id/resume', verifyAdminToken, requireRole('admin', 'super_admin'), SubscriptionsController.resume.bind(SubscriptionsController));
app.get('/admin/subscriptions/statistics', verifyAdminToken, requireRole('admin', 'super_admin'), SubscriptionsController.getStatistics.bind(SubscriptionsController));

// Audit Logs routes (require admin or super_admin)
app.get('/admin/audit-logs', verifyAdminToken, requireRole('admin', 'super_admin'), AuditLogsController.list.bind(AuditLogsController));
app.get('/admin/audit-logs/:id', verifyAdminToken, requireRole('admin', 'super_admin'), AuditLogsController.getById.bind(AuditLogsController));
app.get('/admin/audit-logs/statistics', verifyAdminToken, requireRole('admin', 'super_admin'), AuditLogsController.getStatistics.bind(AuditLogsController));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path
    });
    res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
let server;

function gracefulShutdown(signal) {
    console.log(`\n${signal} received, shutting down gracefully...`);

    if (server) {
        server.close(() => {
            console.log('✅ HTTP server closed');
            process.exit(0);
        });

        setTimeout(() => {
            console.error('⚠️  Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
server = app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('  🔐 API Admin Server');
    console.log('========================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Security: JWT + 2FA`);
    console.log(`👥 Role-based access control`);
    console.log('========================================');
});

module.exports = app;
