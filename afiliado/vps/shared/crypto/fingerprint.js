/**
 * Machine Fingerprint Generator
 * Creates unique, salted fingerprints for machine binding
 */

const crypto = require('crypto');

class FingerprintGenerator {
    constructor() {
        this.salt = process.env.FINGERPRINT_SALT || 'default-salt-change-in-production';
        this.algorithm = 'sha256';
    }

    /**
     * Generate fingerprint from machine data
     * @param {Object} machineData - Machine information
     * @returns {String} - Hashed fingerprint
     */
    generate(machineData) {
        try {
            const {
                machineId,
                cpuId,
                diskSerial,
                macAddress,
                osInfo
            } = machineData;

            // Combine all identifiers
            const combined = [
                machineId || '',
                cpuId || '',
                diskSerial || '',
                macAddress || '',
                osInfo || '',
                this.salt
            ].join('|');

            // Generate hash
            const hash = crypto
                .createHash(this.algorithm)
                .update(combined)
                .digest('hex');

            return hash;
        } catch (error) {
            console.error('❌ Error generating fingerprint:', error.message);
            throw error;
        }
    }

    /**
     * Verify fingerprint matches machine data
     * @param {String} fingerprint - Stored fingerprint
     * @param {Object} machineData - Current machine data
     * @returns {Boolean} - True if matches
     */
    verify(fingerprint, machineData) {
        try {
            const generated = this.generate(machineData);
            return crypto.timingSafeEqual(
                Buffer.from(fingerprint),
                Buffer.from(generated)
            );
        } catch (error) {
            console.error('❌ Error verifying fingerprint:', error.message);
            return false;
        }
    }

    /**
     * Generate short fingerprint (for display)
     * @param {String} fingerprint - Full fingerprint
     * @returns {String} - Short version (first 16 chars)
     */
    shorten(fingerprint) {
        return fingerprint.substring(0, 16);
    }

    /**
     * Validate fingerprint format
     * @param {String} fingerprint - Fingerprint to validate
     * @returns {Boolean} - True if valid format
     */
    isValid(fingerprint) {
        if (!fingerprint || typeof fingerprint !== 'string') {
            return false;
        }
        // SHA256 produces 64 hex characters
        return /^[a-f0-9]{64}$/i.test(fingerprint);
    }

    /**
     * Generate fingerprint with additional entropy
     * @param {Object} machineData - Machine information
     * @param {String} additionalData - Extra data to include
     * @returns {String} - Hashed fingerprint
     */
    generateWithEntropy(machineData, additionalData = '') {
        try {
            const baseFingerprint = this.generate(machineData);
            const combined = baseFingerprint + additionalData + this.salt;

            return crypto
                .createHash(this.algorithm)
                .update(combined)
                .digest('hex');
        } catch (error) {
            console.error('❌ Error generating fingerprint with entropy:', error.message);
            throw error;
        }
    }

    /**
     * Compare two fingerprints safely
     * @param {String} fp1 - First fingerprint
     * @param {String} fp2 - Second fingerprint
     * @returns {Boolean} - True if equal
     */
    compare(fp1, fp2) {
        try {
            if (!fp1 || !fp2 || fp1.length !== fp2.length) {
                return false;
            }
            return crypto.timingSafeEqual(
                Buffer.from(fp1),
                Buffer.from(fp2)
            );
        } catch (error) {
            return false;
        }
    }
}

// Singleton instance
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new FingerprintGenerator();
        }
        return instance;
    },
    FingerprintGenerator
};
