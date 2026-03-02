const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

class SystemMonitor {
    constructor(interval = 1000) {
        this.interval = interval;
        this.metrics = [];
        this.isRunning = false;
        this.startTime = null;
    }

    async getNodeMetrics() {
        const memUsage = process.memoryUsage();
        const eventLoopLag = await this.measureEventLoopLag();

        return {
            memory: {
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external,
                rss: memUsage.rss,
                heapUsedMB: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
                heapTotalMB: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
                rssMB: (memUsage.rss / 1024 / 1024).toFixed(2),
            },
            eventLoopLag: eventLoopLag,
            uptime: process.uptime(),
        };
    }

    measureEventLoopLag() {
        return new Promise((resolve) => {
            const start = Date.now();
            setImmediate(() => {
                const lag = Date.now() - start;
                resolve(lag);
            });
        });
    }

    getCPUUsage() {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach((cpu) => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });

        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        const usage = 100 - ~~(100 * idle / total);

        return {
            usage: usage,
            cores: cpus.length,
            model: cpus[0].model,
        };
    }

    getMemoryUsage() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        return {
            total: totalMem,
            free: freeMem,
            used: usedMem,
            usagePercent: ((usedMem / totalMem) * 100).toFixed(2),
            totalGB: (totalMem / 1024 / 1024 / 1024).toFixed(2),
            freeGB: (freeMem / 1024 / 1024 / 1024).toFixed(2),
            usedGB: (usedMem / 1024 / 1024 / 1024).toFixed(2),
        };
    }

    async getPostgresMetrics() {
        // This would require database connection
        // Placeholder for now
        return {
            connections: 0,
            queries: 0,
            locks: 0,
        };
    }

    async collectMetrics() {
        const timestamp = Date.now();
        const elapsed = this.startTime ? (timestamp - this.startTime) / 1000 : 0;

        const nodeMetrics = await this.getNodeMetrics();
        const cpuMetrics = this.getCPUUsage();
        const memMetrics = this.getMemoryUsage();

        const metric = {
            timestamp,
            elapsed: elapsed.toFixed(2),
            node: nodeMetrics,
            cpu: cpuMetrics,
            memory: memMetrics,
        };

        this.metrics.push(metric);
        return metric;
    }

    async start() {
        if (this.isRunning) {
            console.log('Monitor already running');
            return;
        }

        this.isRunning = true;
        this.startTime = Date.now();
        this.metrics = [];

        console.log('🔍 System Monitor Started');
        console.log('='.repeat(80));

        this.intervalId = setInterval(async () => {
            const metric = await this.collectMetrics();

            // Print real-time metrics
            console.log(`[${metric.elapsed}s] CPU: ${metric.cpu.usage}% | ` +
                `RAM: ${metric.memory.usagePercent}% | ` +
                `Heap: ${metric.node.memory.heapUsedMB}MB | ` +
                `Event Loop Lag: ${metric.node.eventLoopLag}ms`);
        }, this.interval);
    }

    stop() {
        if (!this.isRunning) {
            console.log('Monitor not running');
            return;
        }

        clearInterval(this.intervalId);
        this.isRunning = false;

        console.log('='.repeat(80));
        console.log('🛑 System Monitor Stopped');

        return this.generateReport();
    }

    generateReport() {
        if (this.metrics.length === 0) {
            return { error: 'No metrics collected' };
        }

        // Calculate statistics
        const cpuUsages = this.metrics.map(m => m.cpu.usage);
        const memUsages = this.metrics.map(m => parseFloat(m.memory.usagePercent));
        const heapUsages = this.metrics.map(m => parseFloat(m.node.memory.heapUsedMB));
        const eventLoopLags = this.metrics.map(m => m.node.eventLoopLag);

        const report = {
            duration: this.metrics[this.metrics.length - 1].elapsed,
            samples: this.metrics.length,
            cpu: {
                avg: this.avg(cpuUsages),
                min: Math.min(...cpuUsages),
                max: Math.max(...cpuUsages),
                p95: this.percentile(cpuUsages, 95),
                p99: this.percentile(cpuUsages, 99),
            },
            memory: {
                avg: this.avg(memUsages),
                min: Math.min(...memUsages),
                max: Math.max(...memUsages),
                p95: this.percentile(memUsages, 95),
                p99: this.percentile(memUsages, 99),
            },
            heap: {
                avg: this.avg(heapUsages),
                min: Math.min(...heapUsages),
                max: Math.max(...heapUsages),
                p95: this.percentile(heapUsages, 95),
                p99: this.percentile(heapUsages, 99),
            },
            eventLoopLag: {
                avg: this.avg(eventLoopLags),
                min: Math.min(...eventLoopLags),
                max: Math.max(...eventLoopLags),
                p95: this.percentile(eventLoopLags, 95),
                p99: this.percentile(eventLoopLags, 99),
            },
            rawMetrics: this.metrics,
        };

        return report;
    }

    avg(arr) {
        return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
    }

    percentile(arr, p) {
        const sorted = arr.slice().sort((a, b) => a - b);
        const index = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[index].toFixed(2);
    }

    saveReport(filename = 'system-metrics.json') {
        const report = this.generateReport();
        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        console.log(`📊 Report saved to ${filename}`);
        return report;
    }
}

// CLI usage
if (require.main === module) {
    const monitor = new SystemMonitor(1000);

    monitor.start();

    // Stop on SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
        console.log('\n\nReceived SIGINT, stopping monitor...');
        const report = monitor.stop();
        monitor.saveReport('system-metrics.json');

        console.log('\n📊 SYSTEM METRICS SUMMARY');
        console.log('='.repeat(80));
        console.log(`Duration: ${report.duration}s`);
        console.log(`Samples: ${report.samples}`);
        console.log('\nCPU Usage:');
        console.log(`  Average: ${report.cpu.avg}%`);
        console.log(`  Max: ${report.cpu.max}%`);
        console.log(`  P95: ${report.cpu.p95}%`);
        console.log(`  P99: ${report.cpu.p99}%`);
        console.log('\nMemory Usage:');
        console.log(`  Average: ${report.memory.avg}%`);
        console.log(`  Max: ${report.memory.max}%`);
        console.log(`  P95: ${report.memory.p95}%`);
        console.log('\nEvent Loop Lag:');
        console.log(`  Average: ${report.eventLoopLag.avg}ms`);
        console.log(`  Max: ${report.eventLoopLag.max}ms`);
        console.log(`  P95: ${report.eventLoopLag.p95}ms`);
        console.log('='.repeat(80));

        process.exit(0);
    });
}

module.exports = SystemMonitor;
