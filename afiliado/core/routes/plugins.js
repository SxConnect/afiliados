const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '../../plugins');

/**
 * GET /api/plugins
 * Lista todos os plugins disponíveis
 */
router.get('/', async (req, res) => {
    try {
        const pluginDirs = await fs.readdir(PLUGINS_DIR);
        const plugins = [];

        for (const dir of pluginDirs) {
            const manifestPath = path.join(PLUGINS_DIR, dir, 'manifest.json');

            try {
                const manifestData = await fs.readFile(manifestPath, 'utf8');
                const manifest = JSON.parse(manifestData);

                // Verifica se o usuário tem permissão para este plugin
                const hasPermission = req.user.plugins.includes(manifest.id) ||
                    req.user.plugins.includes('*');

                plugins.push({
                    ...manifest,
                    enabled: hasPermission,
                    locked: !hasPermission
                });
            } catch (error) {
                console.error(`Erro ao ler manifest do plugin ${dir}:`, error);
            }
        }

        res.json({
            success: true,
            plugins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/plugins/:id/execute
 * Executa um plugin específico
 */
router.post('/:id/execute', async (req, res) => {
    try {
        const { id } = req.params;
        const { action, params } = req.body;

        // Verifica permissão
        if (!req.user.plugins.includes(id) && !req.user.plugins.includes('*')) {
            return res.status(403).json({
                success: false,
                error: 'Plugin não autorizado no seu plano'
            });
        }

        // Carrega o plugin
        const pluginPath = path.join(PLUGINS_DIR, id, 'index.js');
        const plugin = require(pluginPath);

        // Executa a ação
        const result = await plugin.execute(action, params);

        res.json({
            success: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
