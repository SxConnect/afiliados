const axios = require('axios');

class PAPIService {
    constructor() {
        this.baseUrl = process.env.PAPI_URL;
        this.apiKey = process.env.PAPI_API_KEY;
    }

    /**
     * Cria uma nova instância do WhatsApp
     */
    async createInstance(instanceId) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/instances`,
                { id: instanceId },
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Obtém QR Code para conectar
     */
    async getQRCode(instanceId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/instances/${instanceId}/qr`,
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                qrImage: response.data.qrImage
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Verifica status da instância
     */
    async getStatus(instanceId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/instances/${instanceId}/status`,
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                status: response.data.status,
                name: response.data.name,
                phoneNumber: response.data.phoneNumber
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Envia mensagem de texto
     */
    async sendText(instanceId, jid, text, validateNumber = true) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/instances/${instanceId}/send-text`,
                { jid, text, validateNumber },
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                messageId: response.data.messageId,
                timestamp: response.data.timestamp
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Envia imagem
     */
    async sendImage(instanceId, jid, url, caption = '') {
        try {
            const response = await axios.post(
                `${this.baseUrl}/instances/${instanceId}/send-image`,
                { jid, url, caption },
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                messageId: response.data.messageId
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Envia botões interativos
     */
    async sendButtons(instanceId, jid, text, buttons, footer = '') {
        try {
            const response = await axios.post(
                `${this.baseUrl}/instances/${instanceId}/send-buttons`,
                { jid, text, buttons, footer },
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                messageId: response.data.messageId
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Configura webhook
     */
    async configureWebhook(instanceId, webhookUrl, events = ['messages']) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/instances/${instanceId}/webhook`,
                {
                    url: webhookUrl,
                    enabled: true,
                    events
                },
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                webhook: response.data.webhook
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Verifica se um número está registrado no WhatsApp
     */
    async checkNumber(instanceId, phone) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/instances/${instanceId}/check-number/${phone}`,
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                exists: response.data.exists,
                jid: response.data.jid
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Envia vídeo
     */
    async sendVideo(instanceId, jid, url, caption = '', gifPlayback = false) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/instances/${instanceId}/send-video`,
                { jid, url, caption, gifPlayback },
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                messageId: response.data.messageId
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Envia áudio
     */
    async sendAudio(instanceId, jid, url, ptt = true) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/instances/${instanceId}/send-audio`,
                { jid, url, ptt },
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                messageId: response.data.messageId
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Envia documento
     */
    async sendDocument(instanceId, jid, url, filename, mimetype) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/instances/${instanceId}/send-document`,
                { jid, url, filename, mimetype },
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                messageId: response.data.messageId
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Envia localização
     */
    async sendLocation(instanceId, jid, latitude, longitude, name, address) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/instances/${instanceId}/send-location`,
                { jid, latitude, longitude, name, address },
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                messageId: response.data.messageId
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Envia contato
     */
    async sendContact(instanceId, jid, name, phone) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/instances/${instanceId}/send-contact`,
                { jid, name, phone },
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                messageId: response.data.messageId
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Envia lista interativa
     */
    async sendList(instanceId, jid, title, text, buttonText, sections, footer = '') {
        try {
            const response = await axios.post(
                `${this.baseUrl}/instances/${instanceId}/send-list`,
                { jid, title, text, buttonText, sections, footer },
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                messageId: response.data.messageId
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Envia enquete
     */
    async sendPoll(instanceId, jid, name, options, selectableCount = 1) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/instances/${instanceId}/send-poll`,
                { jid, name, options, selectableCount },
                { headers: { 'x-api-key': this.apiKey } }
            );

            return {
                success: true,
                messageId: response.data.messageId
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    /**
     * Deleta instância
     */
    async deleteInstance(instanceId) {
        try {
            await axios.delete(
                `${this.baseUrl}/instances/${instanceId}`,
                { headers: { 'x-api-key': this.apiKey } }
            );

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }
}

module.exports = new PAPIService();
