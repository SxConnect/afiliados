/**
 * RSA-2048 Cryptography Module
 * Handles RSA key generation, signing, and verification
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class RSACrypto {
    constructor() {
        this.privateKey = null;
        this.publicKey = null;
        this.loadKeys();
    }

    /**
     * Load RSA keys from environment or files
     */
    loadKeys() {
        try {
            // Try to load from environment first
            if (process.env.RSA_PRIVATE_KEY) {
                this.privateKey = process.env.RSA_PRIVATE_KEY.replace(/\\n/g, '\n');
            }
            if (process.env.RSA_PUBLIC_KEY) {
                this.publicKey = process.env.RSA_PUBLIC_KEY.replace(/\\n/g, '\n');
            }

            // If not in environment, try to load from files
            if (!this.privateKey || !this.publicKey) {
                const keysPath = path.join(__dirname, '../../keys');

                if (fs.existsSync(path.join(keysPath, 'private.pem'))) {
                    this.privateKey = fs.readFileSync(path.join(keysPath, 'private.pem'), 'utf8');
                }
                if (fs.existsSync(path.join(keysPath, 'public.pem'))) {
                    this.publicKey = fs.readFileSync(path.join(keysPath, 'public.pem'), 'utf8');
                }
            }

            if (!this.privateKey || !this.publicKey) {
                console.warn('⚠️  RSA keys not found. Generating new keys...');
                this.generateKeys();
            }
        } catch (error) {
            console.error('❌ Error loading RSA keys:', error.message);
            throw error;
        }
    }

    /**
     * Generate new RSA-2048 key pair
     */
    generateKeys() {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        this.privateKey = privateKey;
        this.publicKey = publicKey;

        // Save to files
        const keysPath = path.join(__dirname, '../../keys');
        if (!fs.existsSync(keysPath)) {
            fs.mkdirSync(keysPath, { recursive: true });
        }

        fs.writeFileSync(path.join(keysPath, 'private.pem'), privateKey);
        fs.writeFileSync(path.join(keysPath, 'public.pem'), publicKey);

        console.log('✅ New RSA keys generated and saved');
    }

    /**
     * Sign data with private key
     * @param {Object|String} data - Data to sign
     * @returns {String} - Base64 encoded signature
     */
    sign(data) {
        try {
            const dataString = typeof data === 'string' ? data : JSON.stringify(data);
            const sign = crypto.createSign('RSA-SHA256');
            sign.update(dataString);
            sign.end();
            return sign.sign(this.privateKey, 'base64');
        } catch (error) {
            console.error('❌ Error signing data:', error.message);
            throw error;
        }
    }

    /**
     * Verify signature with public key
     * @param {Object|String} data - Original data
     * @param {String} signature - Base64 encoded signature
     * @returns {Boolean} - True if signature is valid
     */
    verify(data, signature) {
        try {
            const dataString = typeof data === 'string' ? data : JSON.stringify(data);
            const verify = crypto.createVerify('RSA-SHA256');
            verify.update(dataString);
            verify.end();
            return verify.verify(this.publicKey, signature, 'base64');
        } catch (error) {
            console.error('❌ Error verifying signature:', error.message);
            return false;
        }
    }

    /**
     * Get public key
     * @returns {String} - Public key in PEM format
     */
    getPublicKey() {
        return this.publicKey;
    }

    /**
     * Encrypt data with public key
     * @param {String} data - Data to encrypt
     * @returns {String} - Base64 encoded encrypted data
     */
    encrypt(data) {
        try {
            const buffer = Buffer.from(data, 'utf8');
            const encrypted = crypto.publicEncrypt(
                {
                    key: this.publicKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256'
                },
                buffer
            );
            return encrypted.toString('base64');
        } catch (error) {
            console.error('❌ Error encrypting data:', error.message);
            throw error;
        }
    }

    /**
     * Decrypt data with private key
     * @param {String} encryptedData - Base64 encoded encrypted data
     * @returns {String} - Decrypted data
     */
    decrypt(encryptedData) {
        try {
            const buffer = Buffer.from(encryptedData, 'base64');
            const decrypted = crypto.privateDecrypt(
                {
                    key: this.privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256'
                },
                buffer
            );
            return decrypted.toString('utf8');
        } catch (error) {
            console.error('❌ Error decrypting data:', error.message);
            throw error;
        }
    }
}

// Singleton instance
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new RSACrypto();
        }
        return instance;
    },
    RSACrypto
};
