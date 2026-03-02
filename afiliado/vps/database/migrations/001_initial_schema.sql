-- ============================================================================
-- MIGRATION 001: Initial Schema
-- Description: Create all tables for SaaS license management system
-- Author: System
-- Date: 2026-03-01
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ADMIN USERS TABLE
-- ============================================================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'support')),
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_admin_users_email ON admin_users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_users_role ON admin_users(role) WHERE deleted_at IS NULL;

-- ============================================================================
-- PLANS TABLE
-- ============================================================================
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2),
    quota_monthly INTEGER NOT NULL DEFAULT 0,
    max_machines INTEGER NOT NULL DEFAULT 1,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_plans_slug ON plans(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_plans_is_active ON plans(is_active) WHERE deleted_at IS NULL;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    company VARCHAR(255),
    document VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'blocked', 'cancelled')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;

-- ============================================================================
-- LICENSES TABLE
-- ============================================================================
CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    license_key VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'cancelled', 'blocked')),
    activation_date TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    grace_period_end TIMESTAMP WITH TIME ZONE,
    quota_used INTEGER DEFAULT 0,
    quota_reset_at TIMESTAMP WITH TIME ZONE,
    last_validation_at TIMESTAMP WITH TIME ZONE,
    last_validation_ip INET,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_licenses_user_id ON licenses(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_licenses_plan_id ON licenses(plan_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_licenses_license_key ON licenses(license_key) WHERE deleted_at IS NULL;
CREATE INDEX idx_licenses_status ON licenses(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_licenses_expiration_date ON licenses(expiration_date) WHERE deleted_at IS NULL;

-- ============================================================================
-- MACHINES TABLE
-- ============================================================================
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    fingerprint_hash VARCHAR(255) NOT NULL,
    machine_name VARCHAR(255),
    os_info VARCHAR(255),
    cpu_info VARCHAR(255),
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_ip INET,
    is_active BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_machines_fingerprint_license ON machines(fingerprint_hash, license_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_machines_license_id ON machines(license_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_machines_fingerprint_hash ON machines(fingerprint_hash) WHERE deleted_at IS NULL;
CREATE INDEX idx_machines_is_active ON machines(is_active) WHERE deleted_at IS NULL;

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('mercadopago', 'stripe', 'manual')),
    external_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'cancelled', 'expired', 'failed')),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    next_billing_date TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_subscriptions_license_id ON subscriptions(license_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_subscriptions_external_id ON subscriptions(external_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_subscriptions_status ON subscriptions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_subscriptions_next_billing_date ON subscriptions(next_billing_date) WHERE deleted_at IS NULL;

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('mercadopago', 'stripe', 'manual')),
    external_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'cancelled', 'failed')),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    payment_method VARCHAR(50),
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_external_id ON payments(external_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

-- ============================================================================
-- USAGE_LOGS TABLE (Partitioned by month)
-- ============================================================================
CREATE TABLE usage_logs (
    id UUID DEFAULT uuid_generate_v4(),
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    quota_consumed INTEGER DEFAULT 0,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create partitions for current and next 12 months
CREATE TABLE usage_logs_2026_03 PARTITION OF usage_logs
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE INDEX idx_usage_logs_2026_03_license_id ON usage_logs_2026_03(license_id);
CREATE INDEX idx_usage_logs_2026_03_created_at ON usage_logs_2026_03(created_at);

-- ============================================================================
-- PLUGIN_PERMISSIONS TABLE
-- ============================================================================
CREATE TABLE plugin_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    plugin_id VARCHAR(100) NOT NULL,
    plugin_name VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_plugin_permissions_plan_plugin ON plugin_permissions(plan_id, plugin_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_plugin_permissions_plugin_id ON plugin_permissions(plugin_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- AUDIT_LOGS TABLE (Partitioned by month)
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4(),
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('admin', 'user', 'system')),
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create partitions for current and next 12 months
CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE INDEX idx_audit_logs_2026_03_actor_id ON audit_logs_2026_03(actor_id);
CREATE INDEX idx_audit_logs_2026_03_resource_id ON audit_logs_2026_03(resource_id);
CREATE INDEX idx_audit_logs_2026_03_created_at ON audit_logs_2026_03(created_at);

-- ============================================================================
-- SUSPICIOUS_ACTIVITIES TABLE
-- ============================================================================
CREATE TABLE suspicious_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    ip_address INET,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES admin_users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suspicious_activities_license_id ON suspicious_activities(license_id);
CREATE INDEX idx_suspicious_activities_user_id ON suspicious_activities(user_id);
CREATE INDEX idx_suspicious_activities_severity ON suspicious_activities(severity);
CREATE INDEX idx_suspicious_activities_is_resolved ON suspicious_activities(is_resolved);
CREATE INDEX idx_suspicious_activities_created_at ON suspicious_activities(created_at);

-- ============================================================================
-- REFRESH_TOKENS TABLE
-- ============================================================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoke_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_machine_id ON refresh_tokens(machine_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_permissions_updated_at BEFORE UPDATE ON plugin_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE admin_users IS 'Admin users with 2FA support';
COMMENT ON TABLE plans IS 'Subscription plans with pricing and features';
COMMENT ON TABLE users IS 'End users (customers)';
COMMENT ON TABLE licenses IS 'License keys assigned to users';
COMMENT ON TABLE machines IS 'Machines bound to licenses';
COMMENT ON TABLE subscriptions IS 'Active subscriptions';
COMMENT ON TABLE payments IS 'Payment transactions';
COMMENT ON TABLE usage_logs IS 'Usage tracking logs (partitioned by month)';
COMMENT ON TABLE plugin_permissions IS 'Plugin permissions per plan';
COMMENT ON TABLE audit_logs IS 'Audit trail (partitioned by month)';
COMMENT ON TABLE suspicious_activities IS 'Suspicious activity detection';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens';
