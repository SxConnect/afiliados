/**
 * Input Validators
 * Validates and sanitizes user input
 */

const validator = require('validator');

class Validators {
    /**
     * Validate phone number (Brazilian format)
     */
    static validatePhone(phone) {
        if (!phone || typeof phone !== 'string') {
            return { valid: false, error: 'Phone is required' };
        }

        // Remove non-numeric characters
        const cleaned = phone.replace(/\D/g, '');

        // Brazilian phone: 11-13 digits (with country code)
        if (cleaned.length < 10 || cleaned.length > 13) {
            return { valid: false, error: 'Invalid phone format' };
        }

        return { valid: true, value: cleaned };
    }

    /**
     * Validate email
     */
    static validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, error: 'Email is required' };
        }

        if (!validator.isEmail(email)) {
            return { valid: false, error: 'Invalid email format' };
        }

        return { valid: true, value: email.toLowerCase().trim() };
    }

    /**
     * Validate UUID
     */
    static validateUUID(uuid) {
        if (!uuid || typeof uuid !== 'string') {
            return { valid: false, error: 'UUID is required' };
        }

        if (!validator.isUUID(uuid)) {
            return { valid: false, error: 'Invalid UUID format' };
        }

        return { valid: true, value: uuid };
    }

    /**
     * Validate license key format
     */
    static validateLicenseKey(key) {
        if (!key || typeof key !== 'string') {
            return { valid: false, error: 'License key is required' };
        }

        // Format: PLAN-XXXX-XXXX-XXXX-XXXX
        const pattern = /^[A-Z]+-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        if (!pattern.test(key)) {
            return { valid: false, error: 'Invalid license key format' };
        }

        return { valid: true, value: key };
    }

    /**
     * Validate fingerprint
     */
    static validateFingerprint(fingerprint) {
        if (!fingerprint || typeof fingerprint !== 'string') {
            return { valid: false, error: 'Fingerprint is required' };
        }

        // SHA256 hash: 64 hex characters
        if (!/^[a-f0-9]{64}$/i.test(fingerprint)) {
            return { valid: false, error: 'Invalid fingerprint format' };
        }

        return { valid: true, value: fingerprint.toLowerCase() };
    }

    /**
     * Validate machine data
     */
    static validateMachineData(data) {
        const errors = [];

        if (!data || typeof data !== 'object') {
            return { valid: false, errors: ['Machine data is required'] };
        }

        if (!data.machineId) errors.push('machineId is required');
        if (!data.cpuId) errors.push('cpuId is required');
        if (!data.diskSerial) errors.push('diskSerial is required');

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        return { valid: true, value: data };
    }

    /**
     * Validate pagination params
     */
    static validatePagination(params) {
        const limit = parseInt(params.limit) || 50;
        const offset = parseInt(params.offset) || 0;

        if (limit < 1 || limit > 100) {
            return { valid: false, error: 'Limit must be between 1 and 100' };
        }

        if (offset < 0) {
            return { valid: false, error: 'Offset must be >= 0' };
        }

        return { valid: true, value: { limit, offset } };
    }

    /**
     * Validate plan data
     */
    static validatePlanData(data) {
        const errors = [];

        if (!data.name) errors.push('name is required');
        if (!data.slug) errors.push('slug is required');
        if (data.price_monthly === undefined) errors.push('price_monthly is required');
        if (data.quota_monthly === undefined) errors.push('quota_monthly is required');
        if (data.max_machines === undefined) errors.push('max_machines is required');

        if (data.price_monthly < 0) errors.push('price_monthly must be >= 0');
        if (data.quota_monthly < 0) errors.push('quota_monthly must be >= 0');
        if (data.max_machines < 1) errors.push('max_machines must be >= 1');

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        return { valid: true, value: data };
    }

    /**
     * Validate user data
     */
    static validateUserData(data) {
        const errors = [];

        const phoneValidation = this.validatePhone(data.phone);
        if (!phoneValidation.valid) {
            errors.push(phoneValidation.error);
        }

        if (data.email) {
            const emailValidation = this.validateEmail(data.email);
            if (!emailValidation.valid) {
                errors.push(emailValidation.error);
            }
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        return { valid: true, value: data };
    }

    /**
     * Sanitize string
     */
    static sanitizeString(str, maxLength = 255) {
        if (!str || typeof str !== 'string') {
            return '';
        }

        return validator.escape(str.trim().substring(0, maxLength));
    }

    /**
     * Validate IP address
     */
    static validateIP(ip) {
        if (!ip || typeof ip !== 'string') {
            return { valid: false, error: 'IP address is required' };
        }

        if (!validator.isIP(ip)) {
            return { valid: false, error: 'Invalid IP address' };
        }

        return { valid: true, value: ip };
    }

    /**
     * Validate date range
     */
    static validateDateRange(startDate, endDate) {
        if (!startDate || !endDate) {
            return { valid: false, error: 'Start and end dates are required' };
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { valid: false, error: 'Invalid date format' };
        }

        if (start > end) {
            return { valid: false, error: 'Start date must be before end date' };
        }

        return { valid: true, value: { startDate: start, endDate: end } };
    }

    /**
     * Validate webhook signature
     */
    static validateWebhookSignature(signature) {
        if (!signature || typeof signature !== 'string') {
            return { valid: false, error: 'Signature is required' };
        }

        // HMAC SHA256: 64 hex characters
        if (!/^[a-f0-9]{64}$/i.test(signature)) {
            return { valid: false, error: 'Invalid signature format' };
        }

        return { valid: true, value: signature };
    }
}

module.exports = Validators;
