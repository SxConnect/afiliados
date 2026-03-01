-- ========================================
-- Dados de Seed - VPS Afiliados
-- ========================================

-- ========================================
-- Inserir Planos
-- ========================================
INSERT INTO plans (id, name, price, quota, plugins, features, active) VALUES
('free', 'Free', 0.00, 10, '{}', 
 ARRAY['Funcionalidades básicas', '10 mensagens/mês'], 
 true),

('basic', 'Basic', 29.90, 100, ARRAY['auto-responder'], 
 ARRAY['100 mensagens/mês', '1 plugin', 'Suporte por email'], 
 true),

('growth', 'Growth', 79.90, 500, ARRAY['auto-responder', 'message-scheduler'], 
 ARRAY['500 mensagens/mês', '3 plugins', 'Suporte prioritário'], 
 true),

('pro', 'Pro', 199.90, 999999, ARRAY['*'], 
 ARRAY['Mensagens ilimitadas', 'Todos os plugins', 'Suporte 24/7'], 
 true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    quota = EXCLUDED.quota,
    plugins = EXCLUDED.plugins,
    features = EXCLUDED.features,
    updated_at = NOW();

-- ========================================
-- Inserir Licenças de Teste
-- ========================================

-- Licença Pro (Ilimitado)
INSERT INTO licenses (
    phone_number, 
    plan, 
    quota_total, 
    quota_used, 
    plugins, 
    active, 
    expires_at
) VALUES (
    '5511999999999',
    'pro',
    999999,
    0,
    ARRAY['*'],
    true,
    NOW() + INTERVAL '30 days'
) ON CONFLICT (phone_number) DO UPDATE SET
    plan = EXCLUDED.plan,
    quota_total = EXCLUDED.quota_total,
    plugins = EXCLUDED.plugins,
    active = EXCLUDED.active,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();

-- Licença Growth (500 mensagens)
INSERT INTO licenses (
    phone_number, 
    plan, 
    quota_total, 
    quota_used, 
    plugins, 
    active, 
    expires_at
) VALUES (
    '5511888888888',
    'growth',
    500,
    0,
    ARRAY['auto-responder', 'message-scheduler'],
    true,
    NOW() + INTERVAL '30 days'
) ON CONFLICT (phone_number) DO UPDATE SET
    plan = EXCLUDED.plan,
    quota_total = EXCLUDED.quota_total,
    plugins = EXCLUDED.plugins,
    active = EXCLUDED.active,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();

-- Licença Basic (100 mensagens)
INSERT INTO licenses (
    phone_number, 
    plan, 
    quota_total, 
    quota_used, 
    plugins, 
    active, 
    expires_at
) VALUES (
    '5511777777777',
    'basic',
    100,
    0,
    ARRAY['auto-responder'],
    true,
    NOW() + INTERVAL '30 days'
) ON CONFLICT (phone_number) DO UPDATE SET
    plan = EXCLUDED.plan,
    quota_total = EXCLUDED.quota_total,
    plugins = EXCLUDED.plugins,
    active = EXCLUDED.active,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();

-- Licença Free (10 mensagens)
INSERT INTO licenses (
    phone_number, 
    plan, 
    quota_total, 
    quota_used, 
    plugins, 
    active, 
    expires_at
) VALUES (
    '5511666666666',
    'free',
    10,
    0,
    ARRAY[]::TEXT[],
    true,
    NOW() + INTERVAL '30 days'
) ON CONFLICT (phone_number) DO UPDATE SET
    plan = EXCLUDED.plan,
    quota_total = EXCLUDED.quota_total,
    plugins = EXCLUDED.plugins,
    active = EXCLUDED.active,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();

-- Licença Expirada (para testes)
INSERT INTO licenses (
    phone_number, 
    plan, 
    quota_total, 
    quota_used, 
    plugins, 
    active, 
    expires_at
) VALUES (
    '5511555555555',
    'basic',
    100,
    50,
    ARRAY['auto-responder'],
    true,
    NOW() - INTERVAL '1 day'
) ON CONFLICT (phone_number) DO UPDATE SET
    plan = EXCLUDED.plan,
    quota_total = EXCLUDED.quota_total,
    quota_used = EXCLUDED.quota_used,
    plugins = EXCLUDED.plugins,
    active = EXCLUDED.active,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();

-- Licença Inativa (para testes)
INSERT INTO licenses (
    phone_number, 
    plan, 
    quota_total, 
    quota_used, 
    plugins, 
    active, 
    expires_at
) VALUES (
    '5511444444444',
    'basic',
    100,
    0,
    ARRAY['auto-responder'],
    false,
    NOW() + INTERVAL '30 days'
) ON CONFLICT (phone_number) DO UPDATE SET
    plan = EXCLUDED.plan,
    quota_total = EXCLUDED.quota_total,
    plugins = EXCLUDED.plugins,
    active = EXCLUDED.active,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();

-- ========================================
-- Estatísticas
-- ========================================
SELECT 
    'Seed concluído!' as message,
    (SELECT COUNT(*) FROM plans) as total_plans,
    (SELECT COUNT(*) FROM licenses) as total_licenses,
    (SELECT COUNT(*) FROM licenses WHERE active = true) as active_licenses;

-- ========================================
-- Informações das Licenças de Teste
-- ========================================
SELECT 
    phone_number,
    plan,
    quota_total,
    quota_used,
    (quota_total - quota_used) as quota_available,
    active,
    expires_at,
    CASE 
        WHEN expires_at < NOW() THEN 'EXPIRADA'
        WHEN NOT active THEN 'INATIVA'
        ELSE 'ATIVA'
    END as status
FROM licenses
ORDER BY plan DESC, phone_number;
