#!/usr/bin/env node

/**
 * Script para executar migrations do banco de dados
 * 
 * Uso:
 *   node scripts/run-migrations.js
 *   node scripts/run-migrations.js --rollback
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'saas_licenses',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 5
});

const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');
const SEEDS_DIR = path.join(__dirname, '../database/seeds');

async function createMigrationsTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await pool.query(query);
    console.log('✅ Migrations table ready');
}

async function getExecutedMigrations() {
    const result = await pool.query('SELECT filename FROM migrations ORDER BY id');
    return result.rows.map(row => row.filename);
}

async function executeMigration(filename) {
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`\n📄 Executing migration: ${filename}`);

    try {
        // Executar migration em transação
        await pool.query('BEGIN');
        await pool.query(sql);
        await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
        await pool.query('COMMIT');

        console.log(`✅ Migration executed: ${filename}`);
        return true;
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(`❌ Migration failed: ${filename}`);
        console.error(`Error: ${error.message}`);
        throw error;
    }
}

async function executeSeed(filename) {
    const filePath = path.join(SEEDS_DIR, filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`\n🌱 Executing seed: ${filename}`);

    try {
        await pool.query(sql);
        console.log(`✅ Seed executed: ${filename}`);
        return true;
    } catch (error) {
        console.error(`❌ Seed failed: ${filename}`);
        console.error(`Error: ${error.message}`);
        // Seeds não devem parar o processo
        return false;
    }
}

async function runMigrations() {
    console.log('='.repeat(60));
    console.log('DATABASE MIGRATIONS');
    console.log('='.repeat(60));

    try {
        // Criar tabela de controle
        await createMigrationsTable();

        // Buscar migrations executadas
        const executed = await getExecutedMigrations();
        console.log(`\n📊 Executed migrations: ${executed.length}`);

        // Buscar arquivos de migration
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log(`📁 Available migrations: ${files.length}`);

        // Executar migrations pendentes
        let count = 0;
        for (const file of files) {
            if (!executed.includes(file)) {
                await executeMigration(file);
                count++;
            } else {
                console.log(`⏭️  Skipping (already executed): ${file}`);
            }
        }

        if (count === 0) {
            console.log('\n✅ No pending migrations');
        } else {
            console.log(`\n✅ Executed ${count} migration(s)`);
        }

        // Executar seeds se solicitado
        const args = process.argv.slice(2);
        if (args.includes('--seed')) {
            console.log('\n' + '='.repeat(60));
            console.log('DATABASE SEEDS');
            console.log('='.repeat(60));

            const seedFiles = fs.readdirSync(SEEDS_DIR)
                .filter(f => f.endsWith('.sql'))
                .sort();

            console.log(`\n📁 Available seeds: ${seedFiles.length}`);

            for (const file of seedFiles) {
                await executeSeed(file);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ MIGRATIONS COMPLETED SUCCESSFULLY');
        console.log('='.repeat(60));

        process.exit(0);

    } catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('❌ MIGRATIONS FAILED');
        console.error('='.repeat(60));
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

async function showStatus() {
    console.log('='.repeat(60));
    console.log('MIGRATIONS STATUS');
    console.log('='.repeat(60));

    try {
        await createMigrationsTable();

        const executed = await getExecutedMigrations();
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log(`\n📊 Total migrations: ${files.length}`);
        console.log(`✅ Executed: ${executed.length}`);
        console.log(`⏳ Pending: ${files.length - executed.length}`);

        console.log('\n📋 Executed migrations:');
        for (const file of executed) {
            console.log(`  ✅ ${file}`);
        }

        console.log('\n📋 Pending migrations:');
        for (const file of files) {
            if (!executed.includes(file)) {
                console.log(`  ⏳ ${file}`);
            }
        }

        console.log('\n' + '='.repeat(60));

        process.exit(0);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Main
const args = process.argv.slice(2);

if (args.includes('--status')) {
    showStatus();
} else {
    runMigrations();
}

