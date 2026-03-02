-- Migration: Create usage_counters table with indexes
-- Para tracking de uso de features

CREATE TABLE IF NOT EXISTS usage_counters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    feature_id VARCHAR(100) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Unique constraint
    CONSTRAINT unique_user_feature UNIQUE (user_id, feature_id),
    
    -- Check constraint
    CONSTRAINT check_count_positive CHECK (count >= 0)
);

-- Índices obrigatórios para performance
CREATE INDEX IF NOT EXISTS idx_usage_counters_user_id ON usage_counters(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_counters_feature_id ON usage_counters(feature_id);
CREATE INDEX IF NOT EXISTS idx_usage_counters_user_feature ON usage_counters(user_id, feature_id);
CREATE INDEX IF NOT EXISTS idx_usage_counters_last_used ON usage_counters(last_used_at);

-- Comentários
COMMENT ON TABLE usage_counters IS 'Contadores de uso de features por usuário';
COMMENT ON COLUMN usage_counters.user_id IS 'ID do usuário (FK para licenses)';
COMMENT ON COLUMN usage_counters.feature_id IS 'ID da feature utilizada';
COMMENT ON COLUMN usage_counters.count IS 'Número de vezes que a feature foi usada';
