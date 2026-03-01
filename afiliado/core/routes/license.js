const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const VPSService = require('../services/VPSService');
const PAPIService = require('../services/PAPIService');

/**
 * POST /api/license/validate
 * Valida licença via número de WhatsApp
 * 
 * Fluxo de validação:
 * 1. Verifica se o número está registrado no WhatsApp (PAPI API)
 * 2. Valida no banco de dados da VPS (licença, plano, quota)
 * 3. Verifica fingerprint da máquina
 * 4. Gera token JWT assinado
 */
router.post('/validate', async (req, res) => {
    try {
        const { phoneNumber, instanceId } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Número de telefone obrigatório'
            });
        }

        console.log(`[License] Iniciando validação para: ${phoneNumber}`);

        // PASSO 1: Verificar se o número existe no WhatsApp (via PAPI API)
        // Isso garante que o número é válido e está registrado no WhatsApp
        if (instanceId && process.env.PAPI_URL && process.env.PAPI_API_KEY) {
            console.log(`[License] Verificando número no WhatsApp...`);

            const whatsappCheck = await PAPIService.checkNumber(instanceId, phoneNumber);

            if (!whatsappCheck.success || !whatsappCheck.exists) {
                console.log(`[License] Número não encontrado no WhatsApp: ${phoneNumber}`);
                return res.status(400).json({
                    success: false,
                    error: 'Número não está registrado no WhatsApp',
                    details: 'Verifique se o número está correto e possui WhatsApp ativo'
                });
            }

            console.log(`[License] ✓ Número verificado no WhatsApp: ${whatsappCheck.jid}`);
        }

        // PASSO 2: Validar no banco de dados da VPS
        // Verifica se o usuário tem licença ativa, qual plano, quota disponível, etc.
        console.log(`[License] Validando licença no banco de dados...`);

        const validation = await VPSService.validateLicense(phoneNumber);

        if (!validation.valid) {
            console.log(`[License] Licença inválida: ${validation.error}`);
            return res.status(401).json({
                success: false,
                error: validation.error,
                offline: validation.offline || false
            });
        }

        console.log(`[License] ✓ Licença válida - Plano: ${validation.plan}`);

        // PASSO 3: Obter fingerprint da máquina
        // Isso garante que a licença está sendo usada na máquina autorizada
        const machineId = VPSService.getMachineFingerprint();
        console.log(`[License] Machine ID: ${machineId}`);

        // PASSO 4: Gerar token JWT local
        // Token contém todas as informações necessárias para autorização
        const localToken = jwt.sign(
            {
                phoneNumber,
                plan: validation.plan,
                quota: validation.quota,
                plugins: validation.plugins,
                machineId,
                vpsToken: validation.token, // Token da VPS para validações futuras
                validatedAt: Date.now()
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`[License] ✓ Token JWT gerado com sucesso`);
        console.log(`[License] Validação completa para ${phoneNumber}`);

        res.json({
            success: true,
            token: localToken,
            plan: validation.plan,
            quota: validation.quota,
            plugins: validation.plugins,
            expiresAt: validation.expiresAt,
            machineId,
            message: 'Login realizado com sucesso'
        });
    } catch (error) {
        console.error('[License] Erro na validação:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao validar licença',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/license/status
 * Verifica status da licença atual
 */
router.get('/status', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token não fornecido'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.json({
            success: true,
            plan: decoded.plan,
            quota: decoded.quota,
            plugins: decoded.plugins,
            machineId: decoded.machineId
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Token inválido'
        });
    }
});

module.exports = router;
