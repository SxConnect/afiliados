const express = require('express');
const router = express.Router();
const PAPIService = require('../services/PAPIService');
const VPSService = require('../services/VPSService');

/**
 * POST /api/whatsapp/instance/create
 * Cria nova instância do WhatsApp
 */
router.post('/instance/create', async (req, res) => {
    try {
        const { instanceId } = req.body;

        if (!instanceId) {
            return res.status(400).json({
                success: false,
                error: 'instanceId obrigatório'
            });
        }

        const result = await PAPIService.createInstance(instanceId);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/whatsapp/instance/:id/qr
 * Obtém QR Code
 */
router.get('/instance/:id/qr', async (req, res) => {
    try {
        const result = await PAPIService.getQRCode(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/whatsapp/instance/:id/status
 * Verifica status da instância
 */
router.get('/instance/:id/status', async (req, res) => {
    try {
        const result = await PAPIService.getStatus(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/whatsapp/send/text
 * Envia mensagem de texto
 */
router.post('/send/text', async (req, res) => {
    try {
        const { instanceId, jid, text } = req.body;

        // Verifica quota antes de enviar
        const quotaCheck = await VPSService.checkQuota(req.user.token);

        if (!quotaCheck.success || quotaCheck.available <= 0) {
            return res.status(403).json({
                success: false,
                error: 'Quota esgotada',
                quota: quotaCheck
            });
        }

        // Envia mensagem
        const result = await PAPIService.sendText(instanceId, jid, text);

        if (result.success) {
            // Consome quota
            await VPSService.consumeQuota(req.user.token, 1);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/whatsapp/send/image
 * Envia imagem
 */
router.post('/send/image', async (req, res) => {
    try {
        const { instanceId, jid, url, caption } = req.body;

        const quotaCheck = await VPSService.checkQuota(req.user.token);

        if (!quotaCheck.success || quotaCheck.available <= 0) {
            return res.status(403).json({
                success: false,
                error: 'Quota esgotada'
            });
        }

        const result = await PAPIService.sendImage(instanceId, jid, url, caption);

        if (result.success) {
            await VPSService.consumeQuota(req.user.token, 1);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/whatsapp/send/buttons
 * Envia mensagem com botões
 */
router.post('/send/buttons', async (req, res) => {
    try {
        const { instanceId, jid, text, buttons, footer } = req.body;

        const quotaCheck = await VPSService.checkQuota(req.user.token);

        if (!quotaCheck.success || quotaCheck.available <= 0) {
            return res.status(403).json({
                success: false,
                error: 'Quota esgotada'
            });
        }

        const result = await PAPIService.sendButtons(instanceId, jid, text, buttons, footer);

        if (result.success) {
            await VPSService.consumeQuota(req.user.token, 1);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/whatsapp/webhook/configure
 * Configura webhook
 */
router.post('/webhook/configure', async (req, res) => {
    try {
        const { instanceId, webhookUrl, events } = req.body;

        const result = await PAPIService.configureWebhook(instanceId, webhookUrl, events);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/whatsapp/instance/:id
 * Deleta instância
 */
router.delete('/instance/:id', async (req, res) => {
    try {
        const result = await PAPIService.deleteInstance(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
