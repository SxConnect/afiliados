-- ============================================================================
-- SEED 001: Initial Data
-- Description: Insert initial data for development and production
-- Author: System
-- Date: 2026-03-01
-- ============================================================================

-- ============================================================================
-- ADMIN USERS
-- ============================================================================
-- Password: Admin@123 (bcrypt hash)
INSERT INTO admin_users (id, email, password_hash, name, role, two_factor_enabled, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@sxconnect.com.br', '$2b$10$rKvVPZxH8Y9mXH7YvGxZxOqK5J5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Super Admin', 'super_admin', false, true),
('00000000-0000-0000-0000-000000000002', 'suporte@sxconnect.com.br', '$2b$10$rKvVPZxH8Y9mXH7YvGxZxOqK5J5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Suporte', 'support', false, true);

-- ============================================================================
-- PLANS
-- ============================================================================
INSERT INTO plans (id, name, slug, description, price_monthly, price_yearly, quota_monthly, max_machines, features, is_active, sort_order) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'Free',
    'free',
    'Plano gratuito para testar o sistema',
    0.00,
    0.00,
    10,
    1,
    '[
        "10 gerações por mês",
        "1 máquina",
        "Suporte por email",
        "Plugins básicos"
    ]'::jsonb,
    true,
    1
),
(
    '10000000-0000-0000-0000-000000000002',
    'Basic',
    'basic',
    'Plano básico para pequenos negócios',
    29.90,
    299.00,
    100,
    2,
    '[
        "100 gerações por mês",
        "2 máquinas",
        "Suporte prioritário",
        "Todos os plugins",
        "Relatórios básicos"
    ]'::jsonb,
    true,
    2
),
(
    '10000000-0000-0000-0000-000000000003',
    'Pro',
    'pro',
    'Plano profissional para médias empresas',
    79.90,
    799.00,
    500,
    5,
    '[
        "500 gerações por mês",
        "5 máquinas",
        "Suporte prioritário 24/7",
        "Todos os plugins premium",
        "Relatórios avançados",
        "API access",
        "Webhooks personalizados"
    ]'::jsonb,
    true,
    3
),
(
    '10000000-0000-0000-0000-000000000004',
    'Enterprise',
    'enterprise',
    'Plano empresarial para grandes volumes',
    299.90,
    2999.00,
    999999,
    999,
    '[
        "Gerações ilimitadas",
        "Máquinas ilimitadas",
        "Suporte dedicado 24/7",
        "Todos os plugins premium",
        "Relatórios personalizados",
        "API access ilimitado",
        "Webhooks personalizados",
        "SLA garantido",
        "Onboarding personalizado",
        "Treinamento da equipe"
    ]'::jsonb,
    true,
    4
);

-- ============================================================================
-- PLUGIN PERMISSIONS
-- ============================================================================
-- Free plan - apenas plugins básicos
INSERT INTO plugin_permissions (plan_id, plugin_id, plugin_name, is_enabled) VALUES
('10000000-0000-0000-0000-000000000001', 'auto-responder', 'Auto Responder', true);

-- Basic plan - todos os plugins básicos
INSERT INTO plugin_permissions (plan_id, plugin_id, plugin_name, is_enabled) VALUES
('10000000-0000-0000-0000-000000000002', 'auto-responder', 'Auto Responder', true),
('10000000-0000-0000-0000-000000000002', 'message-scheduler', 'Message Scheduler', true);

-- Pro plan - todos os plugins incluindo premium
INSERT INTO plugin_permissions (plan_id, plugin_id, plugin_name, is_enabled) VALUES
('10000000-0000-0000-0000-000000000003', 'auto-responder', 'Auto Responder', true),
('10000000-0000-0000-0000-000000000003', 'message-scheduler', 'Message Scheduler', true),
('10000000-0000-0000-0000-000000000003', 'bulk-sender', 'Bulk Sender', true),
('10000000-0000-0000-0000-000000000003', 'analytics', 'Analytics Dashboard', true);

-- Enterprise plan - todos os plugins
INSERT INTO plugin_permissions (plan_id, plugin_id, plugin_name, is_enabled) VALUES
('10000000-0000-0000-0000-000000000004', 'auto-responder', 'Auto Responder', true),
('10000000-0000-0000-0000-000000000004', 'message-scheduler', 'Message Scheduler', true),
('10000000-0000-0000-0000-000000000004', 'bulk-sender', 'Bulk Sender', true),
('10000000-0000-0000-0000-000000000004', 'analytics', 'Analytics Dashboard', true),
('10000000-0000-0000-0000-000000000004', 'api-integration', 'API Integration', true),
('10000000-0000-0000-0000-000000000004', 'custom-webhooks', 'Custom Webhooks', true);

-- ============================================================================
-- TEST USERS (Development only)
-- ============================================================================
INSERT INTO users (id, phone, email, name, company, status) VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '5511999999999',
    'teste@sxconnect.com.br',
    'Usuário Teste',
    'SxConnect',
    'active'
),
(
    '20000000-0000-0000-0000-000000000002',
    '5511888888888',
    'teste2@sxconnect.com.br',
    'Usuário Teste 2',
    'Empresa Teste',
    'active'
),
(
    '20000000-0000-0000-0000-000000000003',
    '5511777777777',
    'teste3@sxconnect.com.br',
    'Usuário Teste 3',
    'Startup XYZ',
    'active'
);

-- ============================================================================
-- TEST LICENSES (Development only)
-- ============================================================================
INSERT INTO licenses (
    id,
    user_id,
    plan_id,
    license_key,
    status,
    activation_date,
    expiration_date,
    quota_used,
    quota_reset_at
) VALUES
(
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'FREE-TEST-0001-XXXX-YYYY-ZZZZ',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    5,
    CURRENT_TIMESTAMP + INTERVAL '30 days'
),
(
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'BASIC-TEST-0002-XXXX-YYYY-ZZZZ',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    25,
    CURRENT_TIMESTAMP + INTERVAL '30 days'
),
(
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    'PRO-TEST-0003-XXXX-YYYY-ZZZZ',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '365 days',
    150,
    CURRENT_TIMESTAMP + INTERVAL '30 days'
);

-- ============================================================================
-- TEST MACHINES (Development only)
-- ============================================================================
INSERT INTO machines (
    id,
    license_id,
    fingerprint_hash,
    machine_name,
    os_info,
    cpu_info,
    last_ip,
    is_active
) VALUES
(
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    'DESKTOP-TEST-01',
    'Windows 11 Pro',
    'Intel Core i7-12700K',
    '192.168.1.100',
    true
),
(
    '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
    'LAPTOP-TEST-02',
    'Windows 10 Pro',
    'AMD Ryzen 7 5800X',
    '192.168.1.101',
    true
),
(
    '40000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000003',
    'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
    'WORKSTATION-TEST-03',
    'Windows 11 Pro',
    'Intel Core i9-13900K',
    '192.168.1.102',
    true
);

-- ============================================================================
-- TEST SUBSCRIPTIONS (Development only)
-- ============================================================================
INSERT INTO subscriptions (
    id,
    user_id,
    license_id,
    plan_id,
    provider,
    external_id,
    status,
    billing_cycle,
    amount,
    currency,
    next_billing_date
) VALUES
(
    '50000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'mercadopago',
    'MP-TEST-SUB-001',
    'active',
    'monthly',
    29.90,
    'BRL',
    CURRENT_TIMESTAMP + INTERVAL '30 days'
),
(
    '50000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    'mercadopago',
    'MP-TEST-SUB-002',
    'active',
    'yearly',
    799.00,
    'BRL',
    CURRENT_TIMESTAMP + INTERVAL '365 days'
);

-- ============================================================================
-- TEST PAYMENTS (Development only)
-- ============================================================================
INSERT INTO payments (
    id,
    subscription_id,
    user_id,
    provider,
    external_id,
    status,
    amount,
    currency,
    payment_method,
    paid_at
) VALUES
(
    '60000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    'mercadopago',
    'MP-TEST-PAY-001',
    'approved',
    29.90,
    'BRL',
    'credit_card',
    CURRENT_TIMESTAMP - INTERVAL '5 days'
),
(
    '60000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003',
    'mercadopago',
    'MP-TEST-PAY-002',
    'approved',
    799.00,
    'BRL',
    'pix',
    CURRENT_TIMESTAMP - INTERVAL '10 days'
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE admin_users IS 'Default admin password: Admin@123 (change in production!)';
COMMENT ON TABLE users IS 'Test users for development';
COMMENT ON TABLE licenses IS 'Test licenses with different plans';
