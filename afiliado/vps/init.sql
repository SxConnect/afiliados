-- ========================================
-- Schema de Inicialização - VPS Afiliados
-- ========================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- Tabela de Licenças
-- ========================================
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'basic', 'growth', 'pro')),
    quota_total INTEGER NOT NULL DEFAULT 0,
    quota_used INTEGER NOT NULL DEFAULT 0,
    plugins TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    machine_id VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    
    -- Constraints
    CONSTRAINT quota_check CHECK (quota_used >= 0 AND quota_used <= quota_total),
    CONSTRAINT phone_format CHECK (phone_number ~ '^[0-9]{10,15}$')
);

-- Índices para performance
CREATE INDEX idx_licenses_phone ON licenses(phone_number);
CREATE INDEX idx_licenses_active ON licenses(active);
CREATE INDEX idx_licenses_expires_at ON licenses(expires_at);
CREATE INDEX idx_licenses_machine_id ON licenses(machine_id);
CREATE INDEX idx_licenses_plan ON licenses(plan);

-- ========================================
-- Tabela de Histórico de Validações
-- ========================================
CREATE TABLE IF NOT EXISTS validation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    machine_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    validated_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    CONSTRAINT fk_license FOREIGN KEY (license_id) REFERENCES licenses(id)
);

CREATE INDEX idx_validation_history_license ON validation_history(license_id);
CREATE INDEX idx_validation_history_phone ON validation_history(phone_number);
CREATE INDEX idx_validation_history_validated_at ON validation_history(validated_at);

-- ========================================
-- Tabela de Consumo de Quota
-- ========================================
CREATE TABLE IF NOT EXISTS quota_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 1,
    action VARCHAR(50),
    metadata JSONB,
    consumed_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT quota_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_quota_usage_license ON quota_usage(license_id);
CREATE INDEX idx_quota_usage_phone ON quota_usage(phone_number);
CREATE INDEX idx_quota_usage_consumed_at ON quota_usage(consumed_at);

-- ========================================
-- Tabela de Planos
-- ========================================
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    quota INTEGER NOT NULL DEFAULT 0,
    plugins TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- Funções e Triggers
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para licenses
CREATE TRIGGER update_licenses_updated_at 
    BEFORE UPDATE ON licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para plans
CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para consumir quota
CREATE OR REPLACE FUNCTION consume_quota(
    p_phone_number VARCHAR(20),
    p_amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    v_license_id UUID;
    v_available INTEGER;
BEGIN
    -- Buscar licença e verificar quota disponível
    SELECT id, (quota_total - quota_used) INTO v_license_id, v_available
    FROM licenses
    WHERE phone_number = p_phone_number
    AND active = true
    AND expires_at > NOW()
    FOR UPDATE;
    
    -- Verificar se tem quota disponível
    IF v_available < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Atualizar quota
    UPDATE licenses
    SET quota_used = quota_used + p_amount,
        updated_at = NOW()
    WHERE id = v_license_id;
    
    -- Registrar consumo
    INSERT INTO quota_usage (license_id, phone_number, amount)
    VALUES (v_license_id, p_phone_number, p_amount);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para resetar quota mensal
CREATE OR REPLACE FUNCTION reset_monthly_quota()
RETURNS void AS $$
BEGIN
    UPDATE licenses
    SET quota_used = 0,
        updated_at = NOW()
    WHERE active = true;
    
    RAISE NOTICE 'Quota resetada para todas as licenças ativas';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Views úteis
-- ========================================

-- View de licenças ativas
CREATE OR REPLACE VIEW active_licenses AS
SELECT 
    l.*,
    (l.quota_total - l.quota_used) as quota_available,
    CASE 
        WHEN l.expires_at < NOW() THEN 'expired'
        WHEN l.expires_at < NOW() + INTERVAL '7 days' THEN 'expiring_soon'
        ELSE 'active'
    END as status
FROM licenses l
WHERE l.active = true;

-- View de estatísticas por plano
CREATE OR REPLACE VIEW plan_statistics AS
SELECT 
    plan,
    COUNT(*) as total_licenses,
    COUNT(*) FILTER (WHERE active = true) as active_licenses,
    COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_licenses,
    SUM(quota_total) as total_quota,
    SUM(quota_used) as used_quota,
    AVG(quota_used::FLOAT / NULLIF(quota_total, 0) * 100) as avg_usage_percent
FROM licenses
GROUP BY plan;

-- ========================================
-- Comentários
-- ========================================
COMMENT ON TABLE licenses IS 'Tabela principal de licenças de usuários';
COMMENT ON TABLE validation_history IS 'Histórico de todas as validações de licença';
COMMENT ON TABLE quota_usage IS 'Registro de consumo de quota';
COMMENT ON TABLE plans IS 'Definição dos planos disponíveis';

COMMENT ON COLUMN licenses.phone_number IS 'Número de telefone do WhatsApp (apenas dígitos)';
COMMENT ON COLUMN licenses.machine_id IS 'Fingerprint único da máquina autorizada';
COMMENT ON COLUMN licenses.plugins IS 'Array de plugins habilitados (* = todos)';

-- ========================================
-- Grants (ajustar conforme necessário)
-- ========================================
GRANT SELECT, INSERT, UPDATE ON licenses TO afiliados_vps_user;
GRANT SELECT, INSERT ON validation_history TO afiliados_vps_user;
GRANT SELECT, INSERT ON quota_usage TO afiliados_vps_user;
GRANT SELECT ON plans TO afiliados_vps_user;
GRANT SELECT ON active_licenses TO afiliados_vps_user;
GRANT SELECT ON plan_statistics TO afiliados_vps_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO afiliados_vps_user;

-- Finalizado
SELECT 'Schema criado com sucesso!' as message;
