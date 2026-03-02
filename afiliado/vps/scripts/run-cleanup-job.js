#!/usr/bin/env node

/**
 * Script para executar jobs de limpeza
 * Pode ser executado manualmente ou via cron
 * 
 * Uso:
 *   node scripts/run-cleanup-job.js
 *   node scripts/run-cleanup-job.js --stats
 */

require('dotenv').config();
const { getInstance: getCleanupJob } = require('../shared/jobs/CleanupJob');
const { getInstance: getLogger } = require('../shared/utils/logger');

const logger = getLogger();

async function main() {
    const args = process.argv.slice(2);
    const showStats = args.includes('--stats');

    try {
        logger.info('='.repeat(60));
        logger.info('CLEANUP JOB STARTED');
        logger.info('='.repeat(60));

        const cleanupJob = getCleanupJob();

        // Executar limpeza
        const results = await cleanupJob.runAll();

        logger.info('='.repeat(60));
        logger.info('CLEANUP RESULTS:');
        logger.info(`  Snapshots cleaned: ${results.snapshots_cleaned}`);
        logger.info(`  Counters reset: ${results.counters_reset}`);
        logger.info(`  Trials cleaned: ${results.trials_cleaned}`);
        logger.info(`  Overrides cleaned: ${results.overrides_cleaned}`);

        if (results.errors.length > 0) {
            logger.warn(`  Errors: ${results.errors.length}`);
            results.errors.forEach(err => logger.error(`    - ${err}`));
        }

        // Mostrar estatísticas se solicitado
        if (showStats) {
            logger.info('='.repeat(60));
            logger.info('DATABASE STATISTICS:');
            const stats = await cleanupJob.getDatabaseStats();
            stats.forEach(stat => {
                logger.info(`  ${stat.tablename}: ${stat.size} (${stat.row_count} rows)`);
            });
        }

        logger.info('='.repeat(60));
        logger.info('CLEANUP JOB COMPLETED SUCCESSFULLY');
        logger.info('='.repeat(60));

        process.exit(0);

    } catch (error) {
        logger.error('='.repeat(60));
        logger.error('CLEANUP JOB FAILED');
        logger.error('='.repeat(60));
        logger.error('Error:', error.message);
        logger.error('Stack:', error.stack);
        process.exit(1);
    }
}

main();

