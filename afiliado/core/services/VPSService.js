const axios = require('axios');
const crypto = require('crypto');
const { machineIdSync } = require('node-machine-id');

class VPSService {
    constructor() {
        this.vpsUrl = process.env.VPS_URL;
        this.publicKey = process.env.VPS_PUBLIC_KEY;
        this.machineId = machineIdSync();
    }

    /**
     * Valida licença com a VPS
     */
    async validateLicense(phoneNumber) {
        try {
            const response = await axios.post(`${this.vpsUrl}/validate`, {
                phoneNumber,
                machineId: this.machineId,
                timestamp: Date.now()
            }, {
                timeout: 10000
            });

            if (!response.data.success) {
                return {
                    valid: false,
                    error: response.data.error || 'Licença inválida'
                };
            }

            // Verifica assinatura da resposta
            const isValid = this.verifySignature(
                response.data.data,
                response.data.signature
            );

            if (!isValid) {
                return {
                    valid: false,
                    error: 'Assinatura inválida'
                };
            }

            return {
                valid: true,
                plan: response.data.data.plan,
                quota: response.data.data.quota,
                plugins: response.data.data.plugins,
                token: response.data.data.token,
                expiresAt: response.data.data.expiresAt
            };
        } catch (error) {
            console.error('Erro ao validar licença:', error.message);

            // Modo offline limitado
            return {
                valid: false,
                offline: true,
                error: 'Servidor offline - modo limitado ativado'
            };
        }
    }

    /**
     * Verifica quota disponível
     */
    async checkQuota(token) {
        try {
            const response = await axios.get(`${this.vpsUrl}/quota`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000
            });

            return {
                success: true,
                available: response.data.available,
                used: response.data.used,
                total: response.data.total
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Consome quota (registra uso)
     */
    async consumeQuota(token, amount = 1) {
        try {
            const response = await axios.post(`${this.vpsUrl}/quota/consume`, {
                amount
            }, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000
            });

            return {
                success: true,
                remaining: response.data.remaining
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verifica assinatura criptográfica
     */
    verifySignature(data, signature) {
        try {
            const verify = crypto.createVerify('SHA256');
            verify.update(JSON.stringify(data));
            verify.end();

            return verify.verify(this.publicKey, signature, 'base64');
        } catch (error) {
            console.error('Erro ao verificar assinatura:', error);
            return false;
        }
    }

    /**
     * Obtém fingerprint da máquina
     */
    getMachineFingerprint() {
        return this.machineId;
    }
}

module.exports = new VPSService();
