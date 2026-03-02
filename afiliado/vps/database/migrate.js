/**
 * Database Migration Script
 * Executa todas as migrações pendentes
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigrations() {
    console.log('🚀 Starting database migrations...\n');

    // Configuração do banco
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'afiliados_vps_licenses',
        user: process.env.DB_USER || 'afiliados_vps_user',
        password: process.env.DB_PASSWORD,
    });

    try {
        // Testar conexão
        await pool.query('SELECT NOW()');
        console.log('✅ Database connected\n');

        // Criar tabela de controle de migrações
        await pool.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `);

        // Buscar migrações já executadas
        const executedResult = await pool.query('SELECT filename FROM migrations');
        const executedMigrations = executedResult.rows.map(row => row.filename);

        // Ler arquivos de migração
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log(`📁 Found ${files.length} migration files\n`);

        // Executar migrações pendentes
        for (const file of files) {
            if (executedMigrations.includes(file)) {
                console.log(`⏭️  Skipping ${file} (already executed)`);
                continue;
            }

            console.log(`▶️  Executing ${file}...`);

            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                await pool.query(sql);
                await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
                console.log(`✅ ${file} executed successfully\n`);
            } catch (error) {
                console.error(`❌ Error executing ${file}:`, error.message);
                throw error;
            }
        }

        console.log('✅ All migrations completed successfully!\n');

        // Mostrar estatísticas
        const stats = await pool.query(`
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);

        console.log('📊 Database Tables:');
        console.log('─'.repeat(60));
        stats.rows.forEach(row => {
            console.log(`  ${row.tablename.padEnd(30)} ${row.size}`);
        });
        console.log('─'.repeat(60));

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Executar
if (require.main === module) {
    runMigrations().then(() => {
        console.log('\n✅ Migration script completed');
        process.exit(0);
    }).catch(error => {
        console.error('\n❌ Migration script failed:', error);
        process.exit(1);
    });
}

module.exports = { runMigrations };
