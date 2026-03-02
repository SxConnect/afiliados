const fs = require('fs');
const path = require('path');

class LoadTestAnalyzer {
    constructor(k6ResultsPath, systemMetricsPath) {
        this.k6Results = this.loadJSON(k6ResultsPath);
        this.systemMetrics = this.loadJSON(systemMetricsPath);
    }

    loadJSON(filepath) {
        try {
            const data = fs.readFileSync(filepath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error loading ${filepath}:`, error.message);
            return null;
        }
    }

    analyzeScenario(scenarioName) {
        const metrics = this.k6Results.metrics;

        // Extract HTTP metrics
        const httpDuration = metrics.http_req_duration;
        const httpFailed = metrics.http_req_failed;
        const httpReqs = metrics.http_reqs;

        const analysis = {
            scenario: scenarioName,
            application: {
                latencyAvg: httpDuration?.values?.avg || 0,
                latencyP95: httpDuration?.values?.['p(95)'] || 0,
                latencyP99: httpDuration?.values?.['p(99)'] || 0,
                latencyMax: httpDuration?.values?.max || 0,
                throughput: httpReqs?.values?.rate || 0,
                errorRate: (httpFailed?.values?.rate || 0) * 100,
                totalRequests: httpReqs?.values?.count || 0,
            },
            infrastructure: this.systemMetrics ? {
                cpuAvg: parseFloat(this.systemMetrics.cpu?.avg || 0),
                cpuMax: parseFloat(this.systemMetrics.cpu?.max || 0),
                cpuP95: parseFloat(this.systemMetrics.cpu?.p95 || 0),
                memoryAvg: parseFloat(this.systemMetrics.memory?.avg || 0),
                memoryMax: parseFloat(this.systemMetrics.memory?.max || 0),
                eventLoopLagAvg: parseFloat(this.systemMetrics.eventLoopLag?.avg || 0),
                eventLoopLagMax: parseFloat(this.systemMetrics.eventLoopLag?.max || 0),
                eventLoopLagP95: parseFloat(this.systemMetrics.eventLoopLag?.p95 || 0),
            } : null,
        };

        return analysis;
    }

    classifyHealth(analysis) {
        const { application, infrastructure } = analysis;

        let issues = [];
        let severity = 'SAUDÁVEL';

        // Check application metrics
        if (application.latencyP95 > 200) {
            issues.push(`Latência P95 alta: ${application.latencyP95.toFixed(2)}ms (limite: 200ms)`);
            severity = 'LIMITE PRÓXIMO';
        }

        if (application.latencyP99 > 500) {
            issues.push(`Latência P99 alta: ${application.latencyP99.toFixed(2)}ms (limite: 500ms)`);
            severity = 'INSTÁVEL';
        }

        if (application.errorRate > 1) {
            issues.push(`Taxa de erro alta: ${application.errorRate.toFixed(2)}% (limite: 1%)`);
            severity = 'CRÍTICO';
        }

        // Check infrastructure metrics
        if (infrastructure) {
            if (infrastructure.cpuP95 > 75) {
                issues.push(`CPU P95 alta: ${infrastructure.cpuP95}% (limite: 75%)`);
                if (severity === 'SAUDÁVEL') severity = 'LIMITE PRÓXIMO';
            }

            if (infrastructure.cpuMax > 90) {
                issues.push(`CPU Max crítica: ${infrastructure.cpuMax}%`);
                severity = 'CRÍTICO';
            }

            if (infrastructure.memoryMax > 85) {
                issues.push(`Memória alta: ${infrastructure.memoryMax}%`);
                if (severity === 'SAUDÁVEL') severity = 'LIMITE PRÓXIMO';
            }

            if (infrastructure.eventLoopLagP95 > 100) {
                issues.push(`Event Loop Lag alto: ${infrastructure.eventLoopLagP95}ms`);
                if (severity === 'SAUDÁVEL') severity = 'INSTÁVEL';
            }
        }

        return {
            severity,
            issues,
            needsImprovement: severity !== 'SAUDÁVEL',
        };
    }

    identifyBottleneck(analysis) {
        const { application, infrastructure } = analysis;
        const bottlenecks = [];

        if (!infrastructure) {
            return ['Sem dados de infraestrutura disponíveis'];
        }

        // CPU bottleneck
        if (infrastructure.cpuP95 > 75) {
            bottlenecks.push({
                type: 'CPU',
                severity: infrastructure.cpuP95 > 90 ? 'CRÍTICO' : 'ALTO',
                value: `${infrastructure.cpuP95}%`,
                recommendation: 'Considerar otimização de código ou escalonamento horizontal',
            });
        }

        // Memory bottleneck
        if (infrastructure.memoryMax > 80) {
            bottlenecks.push({
                type: 'MEMÓRIA',
                severity: infrastructure.memoryMax > 90 ? 'CRÍTICO' : 'ALTO',
                value: `${infrastructure.memoryMax}%`,
                recommendation: 'Verificar memory leaks ou aumentar RAM',
            });
        }

        // Event Loop bottleneck
        if (infrastructure.eventLoopLagP95 > 100) {
            bottlenecks.push({
                type: 'EVENT LOOP',
                severity: infrastructure.eventLoopLagP95 > 200 ? 'CRÍTICO' : 'ALTO',
                value: `${infrastructure.eventLoopLagP95}ms`,
                recommendation: 'Operações síncronas bloqueando o event loop',
            });
        }

        // Latency bottleneck
        if (application.latencyP95 > 200) {
            bottlenecks.push({
                type: 'LATÊNCIA',
                severity: application.latencyP95 > 500 ? 'CRÍTICO' : 'ALTO',
                value: `${application.latencyP95.toFixed(2)}ms`,
                recommendation: 'Implementar cache (Redis) ou otimizar queries',
            });
        }

        if (bottlenecks.length === 0) {
            return [{ type: 'NENHUM', severity: 'OK', value: 'Sistema operando normalmente' }];
        }

        return bottlenecks;
    }

    estimateCapacity(analysis) {
        const { application, infrastructure } = analysis;

        // Estimate based on current throughput and resource usage
        const currentRPS = application.throughput;
        const cpuUsage = infrastructure?.cpuP95 || 50;
        const memUsage = infrastructure?.memoryMax || 50;

        // Calculate headroom
        const cpuHeadroom = Math.max(0, (75 - cpuUsage) / cpuUsage);
        const memHeadroom = Math.max(0, (80 - memUsage) / memUsage);
        const headroom = Math.min(cpuHeadroom, memHeadroom);

        // Estimate max sustainable RPS
        const maxRPS = currentRPS * (1 + headroom);

        // Estimate concurrent users (assuming 1 request per user per 5 seconds)
        const concurrentUsers = Math.floor(maxRPS * 5);

        return {
            currentRPS: currentRPS.toFixed(2),
            maxSustainableRPS: maxRPS.toFixed(2),
            estimatedConcurrentUsers: concurrentUsers,
            headroom: (headroom * 100).toFixed(2) + '%',
            confidence: cpuUsage > 60 ? 'ALTA' : 'MÉDIA',
        };
    }

    generateRecommendations(analysis, health, bottlenecks) {
        const recommendations = [];

        if (health.severity === 'SAUDÁVEL') {
            recommendations.push({
                priority: 'BAIXA',
                action: 'Sistema operando dentro dos parâmetros',
                reason: 'Todas as métricas estão saudáveis',
            });
            return recommendations;
        }

        // Check if Redis cache is needed
        if (analysis.application.latencyP95 > 200 ||
            (analysis.infrastructure?.cpuP95 || 0) > 75) {
            recommendations.push({
                priority: 'ALTA',
                action: 'Implementar Redis Cache',
                reason: 'Latência alta ou CPU saturada',
                implementation: 'Cache de snapshots com TTL configurável',
            });
        }

        // Check if database optimization is needed
        if (analysis.application.latencyP99 > 500) {
            recommendations.push({
                priority: 'ALTA',
                action: 'Otimizar queries do banco de dados',
                reason: 'Latência P99 acima do limite',
                implementation: 'Adicionar índices, revisar queries N+1',
            });
        }

        // Check if horizontal scaling is needed
        if ((analysis.infrastructure?.cpuMax || 0) > 90) {
            recommendations.push({
                priority: 'CRÍTICA',
                action: 'Escalonamento horizontal',
                reason: 'CPU saturada',
                implementation: 'Load balancer + múltiplas instâncias',
            });
        }

        // Check connection pool
        if (bottlenecks.some(b => b.type === 'EVENT LOOP')) {
            recommendations.push({
                priority: 'MÉDIA',
                action: 'Ajustar pool de conexões',
                reason: 'Event loop bloqueado',
                implementation: 'Aumentar pool size ou usar worker threads',
            });
        }

        return recommendations;
    }

    generateReport() {
        console.log('\n' + '='.repeat(100));
        console.log('RELATÓRIO TÉCNICO DE TESTE DE CARGA');
        console.log('='.repeat(100));
        console.log(`Data: ${new Date().toISOString()}`);
        console.log(`Versão do Node: ${process.version}`);
        console.log('='.repeat(100));

        const scenarios = ['A-Base', 'B-Moderate', 'C-High', 'D-Stress'];
        const analyses = [];

        for (const scenario of scenarios) {
            console.log(`\n${'─'.repeat(100)}`);
            console.log(`CENÁRIO: ${scenario}`);
            console.log('─'.repeat(100));

            const analysis = this.analyzeScenario(scenario);
            const health = this.classifyHealth(analysis);
            const bottlenecks = this.identifyBottleneck(analysis);
            const capacity = this.estimateCapacity(analysis);

            analyses.push({ scenario, analysis, health, bottlenecks, capacity });

            // Application Metrics
            console.log('\n📊 MÉTRICAS DA APLICAÇÃO:');
            console.log(`  Latência Média:     ${analysis.application.latencyAvg.toFixed(2)}ms`);
            console.log(`  Latência P95:       ${analysis.application.latencyP95.toFixed(2)}ms`);
            console.log(`  Latência P99:       ${analysis.application.latencyP99.toFixed(2)}ms`);
            console.log(`  Latência Máxima:    ${analysis.application.latencyMax.toFixed(2)}ms`);
            console.log(`  Throughput:         ${analysis.application.throughput.toFixed(2)} req/s`);
            console.log(`  Taxa de Erro:       ${analysis.application.errorRate.toFixed(2)}%`);
            console.log(`  Total Requisições:  ${analysis.application.totalRequests}`);

            // Infrastructure Metrics
            if (analysis.infrastructure) {
                console.log('\n🖥️  MÉTRICAS DE INFRAESTRUTURA:');
                console.log(`  CPU Média:          ${analysis.infrastructure.cpuAvg}%`);
                console.log(`  CPU Máxima:         ${analysis.infrastructure.cpuMax}%`);
                console.log(`  CPU P95:            ${analysis.infrastructure.cpuP95}%`);
                console.log(`  Memória Média:      ${analysis.infrastructure.memoryAvg}%`);
                console.log(`  Memória Máxima:     ${analysis.infrastructure.memoryMax}%`);
                console.log(`  Event Loop Lag Avg: ${analysis.infrastructure.eventLoopLagAvg}ms`);
                console.log(`  Event Loop Lag P95: ${analysis.infrastructure.eventLoopLagP95}ms`);
            }

            // Health Status
            console.log(`\n🏥 STATUS DE SAÚDE: ${health.severity}`);
            if (health.issues.length > 0) {
                console.log('  Problemas identificados:');
                health.issues.forEach(issue => console.log(`    ⚠️  ${issue}`));
            }

            // Bottlenecks
            console.log('\n🔍 GARGALOS IDENTIFICADOS:');
            bottlenecks.forEach(b => {
                console.log(`  ${b.type}: ${b.severity} (${b.value})`);
                if (b.recommendation) {
                    console.log(`    → ${b.recommendation}`);
                }
            });

            // Capacity Estimation
            console.log('\n📈 ESTIMATIVA DE CAPACIDADE:');
            console.log(`  RPS Atual:          ${capacity.currentRPS}`);
            console.log(`  RPS Máximo:         ${capacity.maxSustainableRPS}`);
            console.log(`  Usuários Simultâneos: ${capacity.estimatedConcurrentUsers}`);
            console.log(`  Margem:             ${capacity.headroom}`);
            console.log(`  Confiança:          ${capacity.confidence}`);
        }

        // Final Recommendations
        console.log('\n' + '='.repeat(100));
        console.log('RECOMENDAÇÕES FINAIS');
        console.log('='.repeat(100));

        const worstCase = analyses.reduce((worst, current) => {
            return current.health.severity === 'CRÍTICO' ? current : worst;
        }, analyses[0]);

        const recommendations = this.generateRecommendations(
            worstCase.analysis,
            worstCase.health,
            worstCase.bottlenecks
        );

        recommendations.forEach((rec, idx) => {
            console.log(`\n${idx + 1}. [${rec.priority}] ${rec.action}`);
            console.log(`   Razão: ${rec.reason}`);
            if (rec.implementation) {
                console.log(`   Implementação: ${rec.implementation}`);
            }
        });

        // Final Verdict
        console.log('\n' + '='.repeat(100));
        console.log('VEREDICTO EXECUTIVO');
        console.log('='.repeat(100));

        const bestCapacity = analyses.reduce((best, current) => {
            return current.capacity.estimatedConcurrentUsers > best.capacity.estimatedConcurrentUsers
                ? current : best;
        }, analyses[0]);

        const maxUsers = bestCapacity.capacity.estimatedConcurrentUsers;

        console.log(`\n🎯 CAPACIDADE ATUAL DO SISTEMA:`);
        console.log(`   Usuários Simultâneos Suportados: ${maxUsers}`);

        if (maxUsers >= 50000) {
            console.log(`   ✅ Sistema PRONTO para 50K usuários`);
        } else if (maxUsers >= 10000) {
            console.log(`   ✅ Sistema PRONTO para 10K usuários`);
            console.log(`   ⚠️  Precisa ajustes para 50K`);
        } else {
            console.log(`   ⚠️  Sistema PRECISA AJUSTES para escala`);
        }

        const needsRedis = recommendations.some(r => r.action.includes('Redis'));
        if (needsRedis) {
            console.log(`   🔴 Redis Cache é OBRIGATÓRIO para escala`);
        }

        console.log('\n' + '='.repeat(100));
        console.log('Relatório baseado em dados reais de teste de carga');
        console.log('='.repeat(100) + '\n');

        // Save detailed report
        const detailedReport = {
            timestamp: new Date().toISOString(),
            nodeVersion: process.version,
            scenarios: analyses,
            recommendations,
            verdict: {
                maxConcurrentUsers: maxUsers,
                readyFor10K: maxUsers >= 10000,
                readyFor50K: maxUsers >= 50000,
                needsRedis,
            },
        };

        fs.writeFileSync('load-test-analysis.json', JSON.stringify(detailedReport, null, 2));
        console.log('📄 Relatório detalhado salvo em: load-test-analysis.json\n');

        return detailedReport;
    }
}

// CLI usage
if (require.main === module) {
    const k6Results = process.argv[2] || 'load-test-results.json';
    const systemMetrics = process.argv[3] || 'system-metrics.json';

    console.log(`\n📊 Analisando resultados...`);
    console.log(`  K6 Results: ${k6Results}`);
    console.log(`  System Metrics: ${systemMetrics}`);

    const analyzer = new LoadTestAnalyzer(k6Results, systemMetrics);
    analyzer.generateReport();
}

module.exports = LoadTestAnalyzer;
