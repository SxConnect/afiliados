-- ============================================================================
-- MIGRATION 003: Performance Indexes & Optimizations
-- Description: Índices otimizados para queries críticas identificadas na auditoria
-- Author: System
-- Date: 2026-03-01
-- Version: 2.5.1
-- ============================================================================

-- ============================================================================
-- USAGE COUNTERS OPTIMIZATIONS
-- ============================================================================

-- Índice para verificação rápida de quotas (query mais comum)
CREATE INDEX IF NOT EXISTS idx_usage_counters_check 
ON usage_counters(license_id, counter_key, is_blocked) 
WHERE period_end > CURRENT_TIMESTAMP;

COMMENT ON INDEX idx_usage_counters_check IS 'Otimiza verificação rápida de quotas ativas';

-- Índice para queries de limpeza de contadores expirados
CREATE INDEX IF NOT EXISTS idx_usage_counters_expired 
ON usage_counters(period_end, current_value) 
WHERE current_value > 0;

COMMENT ON INDEX idx_usage_counters_expired IS 'Otimiza job de reset de contadores expirados';

-- ============================================================================
-- ENTITLEMENTS OPTIMIZATIONS
-- ============================================================================

-- Índice para limpeza de snapshots antigos
CREATE INDEX IF NOT EXISTS idx_entitlements_cleanup 
ON entitlements(computed_at, is_valid) 
WHERE is_valid = false;

COMMENT ON INDEX idx_entitlements_cleanup IS 'Otimiza job de limpeza de snapshots antigos';

-- Índice para busca de entitlements válidos por usuário
CREATE INDEX IF NOT EXISTS idx_entitlements_user_valid 
ON entitlements(user_id, is_valid, expires_at) 
WHERE is_valid = true;

COMMENT ON INDEX idx_entitlements_user_valid IS 'Otimiza busca de entitlements válidos por usuário';

-- ============================================================================
-- PLUGIN REGISTRY OPTIMIZATIONS
-- ============================================================================

-- Índice composto para queries de plugins por categoria e status
CREATE INDEX IF NOT EXISTS idx_plugin_registry_category_active 
ON plugin_registry(category, is_premium, is_active) 
WHERE is_active = true AND deleted_at IS NULL;

COMMENT ON INDEX idx_plugin_registry_category_active IS 'Otimiza listagem de plugins por categoria';

-- ============================================================================
-- PLUGIN ENTITLEMENTS OPTIMIZATIONS
-- ============================================================================

-- Índice composto para verificação de acesso a plugin
CREATE INDEX IF NOT EXISTS idx_plugin_entitlements_access_check 
ON plugin_entitlements(license_id, plugin_id, is_enabled) 
WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_plugin_entitlements_access_check IS 'Otimiza verificação de acesso a plugins';

-- Índice para queries de trials ativos
CREATE INDEX IF NOT EXISTS idx_plugin_entitlements_active_trials 
ON plugin_entitlements(user_id, trial_ends_at) 
WHERE trial_ends_at > CURRENT_TIMESTAMP AND deleted_at IS NULL;

COMMENT ON INDEX idx_plugin_entitlements_active_trials IS 'Otimiza busca de trials ativos';

-- ============================================================================
-- PLAN FEATURES OPTIMIZATIONS
-- ============================================================================

-- Índice composto para resolução de features do plano
CREATE INDEX IF NOT EXISTS idx_plan_features_resolution 
ON plan_features(plan_id, feature_id, is_enabled) 
WHERE deleted_at IS NULL AND is_enabled = true;

COMMENT ON INDEX idx_plan_features_resolution IS 'Otimiza resolução de features do plano';

-- ============================================================================
-- SUBSCRIPTION ADDONS OPTIMIZATIONS
-- ============================================================================

-- Índice para busca de addons ativos por subscription
CREATE INDEX IF NOT EXISTS idx_subscription_addons_active 
ON subscription_addons(subscription_id, is_active, expires_at) 
WHERE deleted_at IS NULL AND is_active = true;

COMMENT ON INDEX idx_subscription_addons_active IS 'Otimiza busca de addons ativos';

-- ============================================================================
-- ENTITLEMENT OVERRIDES OPTIMIZATIONS
-- ============================================================================

-- Índice para busca de overrides ativos por licença
CREATE INDEX IF NOT EXISTS idx_entitlement_overrides_active_license 
ON entitlement_overrides(license_id, is_active, expires_at) 
WHERE deleted_at IS NULL AND is_active = true;

COMMENT ON INDEX idx_entitlement_overrides_active_license IS 'Otimiza busca de overrides ativos';

-- ============================================================================
-- ANALYZE TABLES
-- Atualiza estatísticas do PostgreSQL para otimização de queries
-- ============================================================================
ANALYZE features;
ANALYZE plan_features;
ANALYZE plugin_registry;
ANALYZE plugin_entitlements;
ANALYZE subscription_addons;
ANALYZE entitlements;
ANALYZE usage_counters;
ANALYZE entitlement_overrides;

