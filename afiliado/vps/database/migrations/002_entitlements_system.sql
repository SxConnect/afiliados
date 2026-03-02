-- ============================================================================
-- MIGRATION 002: Entitlements System (FASE 2.5)
-- Description: Sistema profissional de controle granular de permissões
-- Author: System
-- Date: 2026-03-01
-- Version: 2.5.0
-- ============================================================================

-- ============================================================================
-- FEATURES TABLE
-- Catálogo central de todas as features/permissões disponíveis no sistema
-- ============================================================================
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    feature_type VARCHAR(50) NOT NULL CHECK (feature_type IN ('boolean', 'quota', 'limit', 'plugin_access')),
    default_value JSONB DEFAULT 'null'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_features_key ON features(feature_key) WHERE deleted_at IS NULL;
CREATE INDEX idx_features_type ON features(feature_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_features_active ON features(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE features IS 'Catálogo central de features/permissões do sistema';
COMMENT ON COLUMN features.feature_type IS 'boolean: true/false, quota: número mensal, limit: número máximo, plugin_access: acesso a plugin';

-- ============================================================================
-- PLAN_FEATURES TABLE
-- Define quais features cada plano concede e seus valores
-- ============================================================================
CREATE TABLE plan_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    value JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_plan_features_unique ON plan_features(plan_id, feature_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_plan_features_plan ON plan_features(plan_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_plan_features_feature ON plan_features(feature_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE plan_features IS 'Relacionamento entre planos e features com valores específicos';

-- ============================================================================
-- PLUGIN_REGISTRY TABLE
-- Registro central de todos os plugins disponíveis no sistema
-- ============================================================================
CREATE TABLE plugin_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plugin_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50),
    category VARCHAR(100),
    is_premium BOOLEAN DEFAULT FALSE,
    base_price DECIMAL(10, 2),
    requires_features JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_plugin_registry_key ON plugin_registry(plugin_key) WHERE deleted_at IS NULL;
CREATE INDEX idx_plugin_registry_premium ON plugin_registry(is_premium) WHERE deleted_at IS NULL;
CREATE INDEX idx_plugin_registry_active ON plugin_registry(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE plugin_registry IS 'Catálogo central de plugins (não hardcoded)';

-- ============================================================================
-- PLUGIN_ENTITLEMENTS TABLE
-- Controle específico de acesso a plugins por usuário/licença
-- ============================================================================
CREATE TABLE plugin_entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    plugin_id UUID NOT NULL REFERENCES plugin_registry(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT TRUE,
    granted_by VARCHAR(50) NOT NULL CHECK (granted_by IN ('plan', 'addon', 'trial', 'admin_override')),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    quota_limit INTEGER,
    quota_used INTEGER DEFAULT 0,
    quota_reset_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_plugin_entitlements_unique ON plugin_entitlements(license_id, plugin_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_plugin_entitlements_user ON plugin_entitlements(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_plugin_entitlements_license ON plugin_entitlements(license_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_plugin_entitlements_plugin ON plugin_entitlements(plugin_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_plugin_entitlements_trial ON plugin_entitlements(trial_ends_at) WHERE trial_ends_at IS NOT NULL AND deleted_at IS NULL;

COMMENT ON TABLE plugin_entitlements IS 'Controle granular de acesso a plugins por licença';

-- ============================================================================
-- SUBSCRIPTION_ADDONS TABLE
-- Add-ons adicionais que complementam o plano base
-- ============================================================================
CREATE TABLE subscription_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    addon_type VARCHAR(50) NOT NULL CHECK (addon_type IN ('feature', 'plugin', 'quota', 'machine_limit')),
    addon_key VARCHAR(100) NOT NULL,
    addon_value JSONB NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'one_time')),
    is_active BOOLEAN DEFAULT TRUE,
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_subscription_addons_subscription ON subscription_addons(subscription_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_subscription_addons_type ON subscription_addons(addon_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_subscription_addons_key ON subscription_addons(addon_key) WHERE deleted_at IS NULL;
CREATE INDEX idx_subscription_addons_active ON subscription_addons(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE subscription_addons IS 'Add-ons que complementam o plano base da assinatura';

-- ============================================================================
-- ENTITLEMENTS TABLE
-- Snapshot consolidado de todas as permissões efetivas de um usuário
-- ============================================================================
CREATE TABLE entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    snapshot_version INTEGER NOT NULL DEFAULT 1,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    plugins JSONB NOT NULL DEFAULT '{}'::jsonb,
    quotas JSONB NOT NULL DEFAULT '{}'::jsonb,
    limits JSONB NOT NULL DEFAULT '{}'::jsonb,
    overrides JSONB DEFAULT '{}'::jsonb,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_valid BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_entitlements_license_version ON entitlements(license_id, snapshot_version) WHERE is_valid = TRUE;
CREATE INDEX idx_entitlements_user ON entitlements(user_id);
CREATE INDEX idx_entitlements_license ON entitlements(license_id);
CREATE INDEX idx_entitlements_valid ON entitlements(is_valid);
CREATE INDEX idx_entitlements_expires ON entitlements(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE entitlements IS 'Snapshot consolidado e cacheável de todas as permissões efetivas';
COMMENT ON COLUMN entitlements.snapshot_version IS 'Versão do snapshot para controle de cache';
COMMENT ON COLUMN entitlements.features IS 'JSON com todas as features: {feature_key: value}';
COMMENT ON COLUMN entitlements.plugins IS 'JSON com plugins: {plugin_key: {enabled, quota, trial_ends}}';
COMMENT ON COLUMN entitlements.quotas IS 'JSON com quotas: {quota_key: {limit, used, reset_at}}';

-- ============================================================================
-- USAGE_COUNTERS TABLE
-- Contadores de uso em tempo real para quotas e limites
-- ============================================================================
CREATE TABLE usage_counters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    counter_type VARCHAR(50) NOT NULL CHECK (counter_type IN ('feature', 'plugin', 'resource', 'api_call')),
    counter_key VARCHAR(100) NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'monthly', 'yearly', 'lifetime')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    limit_value INTEGER,
    current_value INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_usage_counters_unique ON usage_counters(license_id, counter_type, counter_key, period_start);
CREATE INDEX idx_usage_counters_user ON usage_counters(user_id);
CREATE INDEX idx_usage_counters_license ON usage_counters(license_id);
CREATE INDEX idx_usage_counters_type ON usage_counters(counter_type);
CREATE INDEX idx_usage_counters_period ON usage_counters(period_start, period_end);
CREATE INDEX idx_usage_counters_blocked ON usage_counters(is_blocked) WHERE is_blocked = TRUE;

COMMENT ON TABLE usage_counters IS 'Contadores de uso em tempo real para controle de quotas';

-- ============================================================================
-- ENTITLEMENT_OVERRIDES TABLE
-- Overrides administrativos de permissões específicas
-- ============================================================================
CREATE TABLE entitlement_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    override_type VARCHAR(50) NOT NULL CHECK (override_type IN ('feature', 'plugin', 'quota', 'limit')),
    override_key VARCHAR(100) NOT NULL,
    override_value JSONB NOT NULL,
    reason TEXT,
    applied_by UUID REFERENCES admin_users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_entitlement_overrides_user ON entitlement_overrides(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_entitlement_overrides_license ON entitlement_overrides(license_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_entitlement_overrides_type ON entitlement_overrides(override_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_entitlement_overrides_active ON entitlement_overrides(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE entitlement_overrides IS 'Overrides administrativos de permissões';

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_features_updated_at BEFORE UPDATE ON plan_features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_registry_updated_at BEFORE UPDATE ON plugin_registry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_entitlements_updated_at BEFORE UPDATE ON plugin_entitlements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_addons_updated_at BEFORE UPDATE ON subscription_addons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entitlements_updated_at BEFORE UPDATE ON entitlements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_counters_updated_at BEFORE UPDATE ON usage_counters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entitlement_overrides_updated_at BEFORE UPDATE ON entitlement_overrides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================================

-- View: Entitlements consolidados com informações do plano
CREATE OR REPLACE VIEW v_user_entitlements AS
SELECT 
    e.id,
    e.user_id,
    e.license_id,
    u.name as user_name,
    u.email as user_email,
    l.license_key,
    p.name as plan_name,
    p.slug as plan_slug,
    e.snapshot_version,
    e.features,
    e.plugins,
    e.quotas,
    e.limits,
    e.overrides,
    e.computed_at,
    e.expires_at,
    e.is_valid
FROM entitlements e
JOIN users u ON e.user_id = u.id
JOIN licenses l ON e.license_id = l.id
JOIN plans p ON l.plan_id = p.id
WHERE e.is_valid = TRUE;

-- View: Plugin entitlements ativos
CREATE OR REPLACE VIEW v_active_plugin_entitlements AS
SELECT 
    pe.id,
    pe.user_id,
    pe.license_id,
    u.name as user_name,
    l.license_key,
    pr.plugin_key,
    pr.name as plugin_name,
    pr.is_premium,
    pe.is_enabled,
    pe.granted_by,
    pe.trial_ends_at,
    pe.quota_limit,
    pe.quota_used,
    CASE 
        WHEN pe.trial_ends_at IS NOT NULL AND pe.trial_ends_at > CURRENT_TIMESTAMP THEN TRUE
        ELSE FALSE
    END as is_trial_active
FROM plugin_entitlements pe
JOIN users u ON pe.user_id = u.id
JOIN licenses l ON pe.license_id = l.id
JOIN plugin_registry pr ON pe.plugin_id = pr.id
WHERE pe.deleted_at IS NULL AND pe.is_enabled = TRUE;

-- View: Usage counters ativos
CREATE OR REPLACE VIEW v_active_usage_counters AS
SELECT 
    uc.id,
    uc.user_id,
    uc.license_id,
    u.name as user_name,
    l.license_key,
    uc.counter_type,
    uc.counter_key,
    uc.period_type,
    uc.limit_value,
    uc.current_value,
    CASE 
        WHEN uc.limit_value IS NOT NULL THEN 
            ROUND((uc.current_value::DECIMAL / uc.limit_value::DECIMAL) * 100, 2)
        ELSE NULL
    END as usage_percentage,
    uc.is_blocked,
    uc.period_start,
    uc.period_end
FROM usage_counters uc
JOIN users u ON uc.user_id = u.id
JOIN licenses l ON uc.license_id = l.id
WHERE uc.period_end > CURRENT_TIMESTAMP;

COMMENT ON VIEW v_user_entitlements IS 'View consolidada de entitlements com informações do usuário e plano';
COMMENT ON VIEW v_active_plugin_entitlements IS 'View de plugin entitlements ativos incluindo trials';
COMMENT ON VIEW v_active_usage_counters IS 'View de usage counters ativos com percentual de uso';
