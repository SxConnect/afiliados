const PAPIService = require('../../src/services/PAPIService');

class AutoResponderPlugin {
    constructor() {
        this.rules = new Map();
    }

    async execute(action, params) {
        switch (action) {
            case 'add-rule':
                return this.addRule(params);
            case 'list-rules':
                return this.listRules();
            case 'remove-rule':
                return this.removeRule(params.ruleId);
            case 'process-message':
                return await this.processMessage(params);
            default:
                throw new Error(`Ação desconhecida: ${action}`);
        }
    }

    addRule(params) {
        const { trigger, response, matchType = 'exact' } = params;
        const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const rule = {
            id: ruleId,
            trigger,
            response,
            matchType, // exact, contains, regex
            active: true,
            createdAt: Date.now(),
            usageCount: 0
        };

        this.rules.set(ruleId, rule);

        return {
            success: true,
            ruleId,
            message: 'Regra criada com sucesso'
        };
    }

    listRules() {
        const rules = Array.from(this.rules.values());

        return {
            success: true,
            rules: rules.map(r => ({
                id: r.id,
                trigger: r.trigger,
                response: r.response.substring(0, 50) + '...',
                matchType: r.matchType,
                active: r.active,
                usageCount: r.usageCount
            })),
            total: rules.length
        };
    }

    removeRule(ruleId) {
        if (!this.rules.has(ruleId)) {
            throw new Error('Regra não encontrada');
        }

        this.rules.delete(ruleId);

        return {
            success: true,
            message: 'Regra removida'
        };
    }

    async processMessage(params) {
        const { instanceId, jid, messageText } = params;

        // Procura por regras que correspondam
        for (const rule of this.rules.values()) {
            if (!rule.active) continue;

            let matches = false;

            switch (rule.matchType) {
                case 'exact':
                    matches = messageText.toLowerCase() === rule.trigger.toLowerCase();
                    break;
                case 'contains':
                    matches = messageText.toLowerCase().includes(rule.trigger.toLowerCase());
                    break;
                case 'regex':
                    const regex = new RegExp(rule.trigger, 'i');
                    matches = regex.test(messageText);
                    break;
            }

            if (matches) {
                // Envia resposta automática
                await PAPIService.sendText(instanceId, jid, rule.response, false);

                rule.usageCount++;

                return {
                    success: true,
                    matched: true,
                    ruleId: rule.id,
                    response: rule.response
                };
            }
        }

        return {
            success: true,
            matched: false,
            message: 'Nenhuma regra correspondente'
        };
    }
}

module.exports = new AutoResponderPlugin();
