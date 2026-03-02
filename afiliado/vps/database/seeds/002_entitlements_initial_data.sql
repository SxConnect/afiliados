-- ============================================================================
-- SEED 002: Entitlements Initial Data (FASE 2.5)
-- Description: Dados iniciais para o sistema de entitlements
-- Author: System
-- Date: 2026-03-01
-- ============================================================================

-- ============================================================================
-- FEATURES (Catálogo de Features)
-- ============================================================================

-- Features de Quota
INSERT INTO features (feature_key, name, description, feature_type, default_value) VALUES
('monthly_executions', 'Execuções Mensais', 'Número máximo de execuções por mês', 'quota', '1000'),
('daily_api_calls', 'Chamadas API Diárias', 'Número máximo de chamadas API por dia', 'quota', '100'),
('monthly_messages', 'Mensagens Mensais', 'Número máximo de mensagens por mês', 'quota', '500');

-- Features de Limite
INSERT INTO features (feature_key, name, description, feature_type, default_value) VALUES
('max_machines', 'Máquinas Máximas', 'Número máximo de máquinas simultâneas', 'limit', '1'),
('max_contacts', 'Contatos Máximos', 'Número máximo de contatos', 'limit', '100'),
('max_campaigns', 'Campanhas Máximas', 'Número máximo de campanhas ativas', 'limit', '3');

-- Features Booleanas
INSERT INTO features (feature_key, name, description, feature_type, default_value) VALUES
('export_enabled', 'Exportação Habilitada', 'Permite exportar dados', 'boolean', 'false'),
('api_access', 'Acesso à API', 'Permite acesso à API REST', 'boolean', 'false'),
('webhooks_enabled', 'Webhooks Habilitados', 'Permite configurar webhooks', 'boolean', 'false'),
('priority_support', 'Suporte Prioritário', 'Acesso a suporte prioritário', 'boolean', 'false'),
('white_label', 'White Label', 'Remove branding do sistema', 'boolean', 'false'),
('custom_domain', 'Domínio Customizado', 'Permite usar domínio próprio', 'boolean', 'false');

-- Features de Plugin Access
INSERT INTO features (feature_key, name, description, feature_type, default_value) VALUES
('plugin_auto_responder', 'Plugin Auto Responder', 'Acesso ao plugin de respostas automáticas', 'plugin_access', 'false'),
('plugin_scheduler', 'Plugin Agendador', 'Acesso ao plugin de agendamento', 'plugin_access', 'false'),
('plugin_analytics', 'Plugin Analytics', 'Acesso ao plugin de analytics avançado', 'plugin_access', 'false'),
('plugin_crm', 'Plugin CRM', 'Acesso ao plugin de CRM integrado', 'plugin_access', 'false');

-- ============================================================================
-- PLUGIN REGISTRY (Catálogo de Plugins)
-- ============================================================================

INSERT INTO plugin_registry (plugin_key, name, description, version, category, is_premium, base_price, requires_features) VALUES
('auto-responder', 'Auto Responder', 'Respostas automáticas inteligentes baseadas em palavras-chave', '1.0.0', 'automation', false, 0.00, '["plugin_auto_responder"]'),
('message-scheduler', 'Message Scheduler', 'Agendamento de mensagens para envio futuro', '1.0.0', 'automation', false, 0.00, '["plugin_scheduler"]'),
('analytics-pro', 'Analytics Pro', 'Analytics avançado com relatórios detalhados e insights', '1.0.0', 'analytics', true, 29.90, '["plugin_analytics", "api_access"]'),
('crm-integration', 'CRM Integration', 'Integração completa com CRM para gestão de leads', '1.0.0', 'integration', true, 49.90, '["plugin_crm", "api_access", "webhooks_enabled"]'),
('bulk-sender', 'Bulk Sender', 'Envio em massa com controle de velocidade', '1.0.0', 'messaging', true, 19.90, '["monthly_messages"]'),
('ai-assistant', 'AI Assistant', 'Assistente com IA para respostas inteligentes', '1.0.0', 'ai', true, 79.90, '["plugin_auto_responder", "api_access"]');

-- ============================================================================
-- PLAN_FEATURES (Features por Plano)
-- ============================================================================

-- Plano FREE (assumindo que existe um plano com slug 'free')
DO $$
DECLARE
    plan_free_id UUID;
BEGIN
    -- Buscar ID do plano Free (ou criar se não existir)
    SELECT id INTO plan_free_id FROM plans WHERE slug = 'free' LIMIT 1;
    
    IF plan_free_id IS NULL THEN
        INSERT INTO plans (name, slug, description, price_monthly, price_yearly, quota_monthly, max_machines, is_active)
        VALUES ('Free', 'free', 'Plano gratuito com recursos básicos', 0.00, 0.00, 1000, 1, true)
        RETURNING id INTO plan_free_id;
    END IF;

    -- Features do Plano Free
    INSERT INTO plan_features (plan_id, feature_id, value, is_enabled)
    SELECT plan_free_id, id, default_value, true
    FROM features
    WHERE feature_key IN (
        'monthly_executions',
        'daily_api_calls',
        'max_machines',
        'max_contacts',
        'plugin_auto_responder',
        'plugin_scheduler'
    );

    -- Ajustar valores específicos do Free
    UPDATE plan_features pf
    SET value = '500'
    FROM features f
    WHERE pf.feature_id = f.id 
    AND pf.plan_id = plan_free_id
    AND f.feature_key = 'monthly_executions';

    UPDATE plan_features pf
    SET value = '50'
    FROM features f
    WHERE pf.feature_id = f.id 
    AND pf.plan_id = plan_free_id
    AND f.feature_key = 'daily_api_calls';

    UPDATE plan_features pf
    SET value = '50'
    FROM features f
    WHERE pf.feature_id = f.id 
    AND pf.plan_id = plan_free_id
    AND f.feature_key = 'max_contacts';
END $$;

-- Plano PRO (assumindo que existe um plano com slug 'pro')
DO $$
DECLARE
    plan_pro_id UUID;
BEGIN
    -- Buscar ID do plano Pro (ou criar se não existir)
    SELECT id INTO plan_pro_id FROM plans WHERE slug = 'pro' LIMIT 1;
    
    IF plan_pro_id IS NULL THEN
        INSERT INTO plans (name, slug, description, price_monthly, price_yearly, quota_monthly, max_machines, is_active)
        VALUES ('Pro', 'pro', 'Plano profissional com recursos avançados', 99.90, 999.00, 10000, 3, true)
        RETURNING id INTO plan_pro_id;
    END IF;

    -- Features do Plano Pro
    INSERT INTO plan_features (plan_id, feature_id, value, is_enabled)
    SELECT plan_pro_id, id, 
        CASE 
            WHEN feature_type = 'boolean' THEN 'true'
            WHEN feature_key = 'monthly_executions' THEN '10000'
            WHEN feature_key = 'daily_api_calls' THEN '1000'
            WHEN feature_key = 'monthly_messages' THEN '5000'
            WHEN feature_key = 'max_machines' THEN '3'
            WHEN feature_key = 'max_contacts' THEN '1000'
            WHEN feature_key = 'max_campaigns' THEN '10'
            ELSE default_value
        END,
        true
    FROM features
    WHERE feature_key IN (
        'monthly_executions',
        'daily_api_calls',
        'monthly_messages',
        'max_machines',
        'max_contacts',
        'max_campaigns',
        'export_enabled',
        'api_access',
        'webhooks_enabled',
        'priority_support',
        'plugin_auto_responder',
        'plugin_scheduler',
        'plugin_analytics'
    );
END $$;

-- Plano ENTERPRISE (criar se não existir)
DO $$
DECLARE
    plan_enterprise_id UUID;
BEGIN
    -- Buscar ID do plano Enterprise (ou criar se não existir)
    SELECT id INTO plan_enterprise_id FROM plans WHERE slug = 'enterprise' LIMIT 1;
    
    IF plan_enterprise_id IS NULL THEN
        INSERT INTO plans (name, slug, description, price_monthly, price_yearly, quota_monthly, max_machines, is_active)
        VALUES ('Enterprise', 'enterprise', 'Plano enterprise com recursos ilimitados', 299.90, 2999.00, 100000, 10, true)
        RETURNING id INTO plan_enterprise_id;
    END IF;

    -- Features do Plano Enterprise (todas habilitadas com valores máximos)
    INSERT INTO plan_features (plan_id, feature_id, value, is_enabled)
    SELECT plan_enterprise_id, id,
        CASE 
            WHEN feature_type = 'boolean' THEN 'true'
            WHEN feature_key = 'monthly_executions' THEN '100000'
            WHEN feature_key = 'daily_api_calls' THEN '10000'
            WHEN feature_key = 'monthly_messages' THEN '50000'
            WHEN feature_key = 'max_machines' THEN '10'
            WHEN feature_key = 'max_contacts' THEN '10000'
            WHEN feature_key = 'max_campaigns' THEN '50'
            ELSE default_value
        END,
        true
    FROM features;
END $$;

-- ============================================================================
-- EXEMPLO: Criar entitlement para usuário de teste (se existir)
-- ============================================================================

-- Este bloco só executa se houver um usuário e licença de teste
DO $$
DECLARE
    test_user_id UUID;
    test_license_id UUID;
    test_plan_id UUID;
    entitlement_features JSONB;
    entitlement_plugins JSONB;
    entitlement_quotas JSONB;
    entitlement_limits JSONB;
BEGIN
    -- Buscar primeiro usuário e licença ativos
    SELECT u.id, l.id, l.plan_id 
    INTO test_user_id, test_license_id, test_plan_id
    FROM users u
    JOIN licenses l ON u.id = l.user_id
    WHERE u.deleted_at IS NULL 
    AND l.deleted_at IS NULL 
    AND l.status = 'active'
    LIMIT 1;

    -- Se encontrou, criar entitlement de exemplo
    IF test_user_id IS NOT NULL THEN
        -- Construir features do plano
        SELECT jsonb_object_agg(f.feature_key, pf.value)
        INTO entitlement_features
        FROM plan_features pf
        JOIN features f ON pf.feature_id = f.id
        WHERE pf.plan_id = test_plan_id 
        AND pf.is_enabled = true
        AND pf.deleted_at IS NULL;

        -- Construir plugins disponíveis
        entitlement_plugins := '{}'::jsonb;
        
        -- Construir quotas
        entitlement_quotas := jsonb_build_object(
            'monthly_executions', jsonb_build_object(
                'limit', 10000,
                'used', 0,
                'reset_at', (CURRENT_TIMESTAMP + INTERVAL '1 month')::text
            ),
            'daily_api_calls', jsonb_build_object(
                'limit', 1000,
                'used', 0,
                'reset_at', (CURRENT_TIMESTAMP + INTERVAL '1 day')::text
            )
        );

        -- Construir limits
        entitlement_limits := jsonb_build_object(
            'max_machines', 3,
            'max_contacts', 1000,
            'max_campaigns', 10
        );

        -- Inserir entitlement
        INSERT INTO entitlements (
            user_id,
            license_id,
            snapshot_version,
            features,
            plugins,
            quotas,
            limits,
            computed_at,
            expires_at,
            is_valid
        ) VALUES (
            test_user_id,
            test_license_id,
            1,
            entitlement_features,
            entitlement_plugins,
            entitlement_quotas,
            entitlement_limits,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP + INTERVAL '30 days',
            true
        );

        RAISE NOTICE 'Entitlement de exemplo criado para usuário %', test_user_id;
    END IF;
END $$;

-- ============================================================================
-- COMENTÁRIOS FINAIS
-- ============================================================================

COMMENT ON SCHEMA public IS 'Schema principal com sistema de entitlements implementado';

-- Estatísticas
DO $$
DECLARE
    features_count INTEGER;
    plugins_count INTEGER;
    plans_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO features_count FROM features WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO plugins_count FROM plugin_registry WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO plans_count FROM plans WHERE deleted_at IS NULL;
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'SEED 002 - Entitlements System';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Features criadas: %', features_count;
    RAISE NOTICE 'Plugins registrados: %', plugins_count;
    RAISE NOTICE 'Planos configurados: %', plans_count;
    RAISE NOTICE '===========================================';
END $$;
