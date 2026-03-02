-- Migration: Create plugin_entitlements table with indexes
-- Para gerenciar acesso a plugins

CREATE TABLE IF NOT EXISTS plugin_entitlements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    plugin_id VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    
    -- Unique constraint
    CONSTRAINT unique_user_plugin UNIQUE (user_id, plugin_id)
);

-- Índices obrigatórios para performance
CREATE INDEX IF NOT EXISTS idx_plugin_entitlements_user_id ON plugin_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_plugin_entitlements_plugin_id ON plugin_entitlements(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_entitlements_user_plugin ON plugin_entitlements(user_id, plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_entitlements_enabled ON plugin_entitlements(enabled);
CREATE INDEX IF NOT EXISTS idx_plugin_entitlements_expires_at ON plugin_entitlements(expires_at);

-- Comentários
COMMENT ON TABLE plugin_entitlements IS 'Entitlements de plugins por usuário';
COMMENT ON COLUMN plugin_entitlements.user_id IS 'ID do usuário (FK para licenses)';
COMMENT ON COLUMN plugin_entitlements.plugin_id IS 'ID do plugin';
COMMENT ON COLUMN plugin_entitlements.enabled IS 'Se o plugin está habilitado';
COMMENT ON COLUMN plugin_entitlements.expires_at IS 'Data de expiração do acesso';
