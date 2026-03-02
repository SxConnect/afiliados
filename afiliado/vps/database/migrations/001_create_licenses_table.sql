-- Migration: Create licenses table with indexes
-- Otimizado para 10K usuários

CREATE TABLE IF NOT EXISTS licenses (
    id SERIAL PRIMARY KEY,
    whatsapp VARCHAR(20) NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    fingerprint VARCHAR(255) NOT NULL,
    plugins JSONB DEFAULT '[]'::jsonb,
    quota INTEGER NOT NULL DEFAULT 10,
    quota_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_quota_positive CHECK (quota >= 0),
    CONSTRAINT check_quota_used_positive CHECK (quota_used >= 0),
    CONSTRAINT check_quota_used_lte_quota CHECK (quota_used <= quota)
);

-- Índices obrigatórios para performance
CREATE INDEX IF NOT EXISTS idx_licenses_whatsapp ON licenses(whatsapp);
CREATE INDEX IF NOT EXISTS idx_licenses_fingerprint ON licenses(fingerprint);
CREATE INDEX IF NOT EXISTS idx_licenses_plan ON licenses(plan);
CREATE INDEX IF NOT EXISTS idx_licenses_created_at ON licenses(created_at);

-- Índice para plugins (GIN para JSONB)
CREATE INDEX IF NOT EXISTS idx_licenses_plugins ON licenses USING GIN (plugins);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE licenses IS 'Tabela de licenças de usuários';
COMMENT ON COLUMN licenses.whatsapp IS 'Número do WhatsApp (único)';
COMMENT ON COLUMN licenses.plan IS 'Plano do usuário (free, pro, enterprise)';
COMMENT ON COLUMN licenses.fingerprint IS 'Fingerprint do dispositivo';
COMMENT ON COLUMN licenses.plugins IS 'Array de plugins habilitados (JSONB)';
COMMENT ON COLUMN licenses.quota IS 'Quota total do usuário';
COMMENT ON COLUMN licenses.quota_used IS 'Quota já utilizada';
