/**
 * Logger Utility
 * Structured logging with levels and formatting
 */

const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };

        this.currentLevel = this.levels[process.env.LOG_LEVEL || 'INFO'];
        this.logToFile = process.env.LOG_TO_FILE === 'true';
        this.logDir = process.env.LOG_DIR || path.join(__dirname, '../../logs');

        if (this.logToFile) {
            this.ensureLogDir();
        }
    }

    /**
     * Ensure log directory exists
     */
    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * Format log message
     */
    format(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const formatted = {
            timestamp,
            level,
            message,
            ...meta
        };

        return JSON.stringify(formatted);
    }

    /**
     * Write to file
     */
    writeToFile(level, message) {
        if (!this.logToFile) return;

        const date = new Date().toISOString().split('T')[0];
        const filename = `${date}-${level.toLowerCase()}.log`;
        const filepath = path.join(this.logDir, filename);

        fs.appendFileSync(filepath, message + '\n');
    }

    /**
     * Log error
     */
    error(message, meta = {}) {
        if (this.currentLevel >= this.levels.ERROR) {
            const formatted = this.format('ERROR', message, meta);
            console.error('❌', formatted);
            this.writeToFile('ERROR', formatted);
        }
    }

    /**
     * Log warning
     */
    warn(message, meta = {}) {
        if (this.currentLevel >= this.levels.WARN) {
            const formatted = this.format('WARN', message, meta);
            console.warn('⚠️ ', formatted);
            this.writeToFile('WARN', formatted);
        }
    }

    /**
     * Log info
     */
    info(message, meta = {}) {
        if (this.currentLevel >= this.levels.INFO) {
            const formatted = this.format('INFO', message, meta);
            console.log('ℹ️ ', formatted);
            this.writeToFile('INFO', formatted);
        }
    }

    /**
     * Log debug
     */
    debug(message, meta = {}) {
        if (this.currentLevel >= this.levels.DEBUG) {
            const formatted = this.format('DEBUG', message, meta);
            console.log('🐛', formatted);
            this.writeToFile('DEBUG', formatted);
        }
    }

    /**
     * Log HTTP request
     */
    http(req, res, duration) {
        const message = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;
        const meta = {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            ip: req.ip,
            userAgent: req.get('user-agent')
        };

        if (res.statusCode >= 500) {
            this.error(message, meta);
        } else if (res.statusCode >= 400) {
            this.warn(message, meta);
        } else {
            this.info(message, meta);
        }
    }

    /**
     * Log security event
     */
    security(event, meta = {}) {
        const message = `Security Event: ${event}`;
        this.warn(message, { ...meta, type: 'security' });
    }

    /**
     * Log audit event
     */
    audit(action, actor, resource, meta = {}) {
        const message = `Audit: ${actor} ${action} ${resource}`;
        this.info(message, { ...meta, type: 'audit' });
    }
}

// Singleton instance
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new Logger();
        }
        return instance;
    },
    Logger
};
