/**
 * Teste de Carga Nativo em Node.js
 * Alternativa ao k6 quando não está disponível
 */

const http = require('http');
const { performance } = require('perf_hooks');

class LoadTester {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
        this.results = {
            scenarios: {},
            startTime: Date.now(),
        };
    }

    async makeRequest(endpoint, payload) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const url = new URL(endpoint, this.baseUrl);

            const options = {
                hostname: url.hostname,
                port: url.port || 80,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(JSON.stringify(payload)),
                },
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    const duration = performance.now() - startTime;
                    resolve({
                        status: res.statusCode,
                        duration,
                        success: res.statusCode >= 200 && res.statusCode < 300,
                        body: data,
                    });
                });
            });

            req.on('error', (error) => {
                const duration = performance.now() - startTime;
                resolve({
                    status: 0,
                    duration,
                    success: false,
                    error: error.message,
                });
            });

            req.write(JSON.stringify(payload));
            req.end();
        });
    }

    generateTestUser() {
        const userId = Math.floor(Math.random() * 10000);
        return {
            whatsapp: `5511${String(userId).padStart(8, '0')}`,
            fingerprint: `fp-${userId}-${Date.now()}`,
        };
    }

    async runScenario(name, config) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`EXECUTANDO CENÁRIO: ${name}`);
        console.log(`Configuração: ${config.rps} req/s por ${config.duration}s`);
        console.log('='.repeat(80));

        const results = {
            name,
            config,
            requests: [],
            startTime: Date.now(),
        };

        const totalRequests = config.rps * config.duration;
        const intervalMs = 1000 / config.rps;
        let completed = 0;
        let errors = 0;

        const progressInterval = setInterval(() => {
            const progress = ((completed / totalRequests) * 100).toFixed(1);
            const elapsed = ((Date.now() - results.startTime) / 1000).toFixed(1);
            process.stdout.write(`\r⏳ Progresso: ${progress}% | Completadas: ${completed}/${totalRequests} | Erros: ${errors} | Tempo: ${elapsed}s`);
        }, 500);

        for (let i = 0; i < totalRequests; i++) {
            const requestPromise = (async () => {
                const user = this.generateTestUser();
                const endpoint = this.selectEndpoint(i);
                const payload = this.generatePayload(endpoint, user);

                const result = await this.makeRequest(endpoint.path, payload);

                results.requests.push({
                    endpoint: endpoint.name,
                    ...result,
                });

                completed++;
                if (!result.success) errors++;
            })();

            // Não aguardar para simular concorrência
            if (i < totalRequests - 1) {
                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }
        }

        // Aguardar todas as requisições completarem
        await new Promise(resolve => setTimeout(resolve, 5000));
        clearInterval(progressInterval);

        results.endTime = Date.now();
        results.totalDuration = (results.endTime - results.startTime) / 1000;

        console.log(`\n✅ Cenário concluído em ${results.totalDuration.toFixed(2)}s`);
        console.log(`   Total: ${completed} | Erros: ${errors} (${((errors / completed) * 100).toFixed(2)}%)`);

        this.results.scenarios[name] = results;
        return results;
    }

    selectEndpoint(index) {
        const endpoints = [
            { name: 'validate-license', path: '/api/validate-license', weight: 25 },
            { name: 'check-quota', path: '/api/check-quota', weight: 35 },
            { name: 'consume-quota', path: '/api/consume-quota', weight: 30 },
            { name: 'validate-plugin', path: '/api/validate-plugin', weight: 10 },
        ];

        const rand = (index % 100);
        let cumulative = 0;

        for (const endpoint of endpoints) {
            cumulative += endpoint.weight;
            if (rand < cumulative) {
                return endpoint;
            }
        }

        return endpoints[0];
    }

    generatePayload(endpoint, user) {
        switch (endpoint.name) {
            case 'validate-license':
                return {
                    whatsapp: user.whatsapp,
                    fingerprint: user.fingerprint,
                    signature: 'test-signature',
                };
            case 'check-quota':
                return {
                    whatsapp: user.whatsapp,
                    token: 'test-token',
                };
            case 'consume-quota':
                return {
                    whatsapp: user.whatsapp,
                    token: 'test-token',
                    amount: 1,
                };
            case 'validate-plugin':
                return {
                    whatsapp: user.whatsapp,
                    token: 'test-token',
                    pluginId: 'auto-responder',
                };
            default:
                return {};
        }
    }

    calculateMetrics(scenarioResults) {
        const durations = scenarioResults.requests.map(r => r.duration);
        const successful = scenarioResults.requests.filter(r => r.success);
        const failed = scenarioResults.requests.filter(r => !r.success);

        durations.sort((a, b) => a - b);

        const percentile = (arr, p) => {
            const index = Math.ceil((p / 100) * arr.length) - 1;
            return arr[index] || 0;
        };

        const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

        return {
            total: scenarioResults.requests.length,
            successful: successful.length,
            failed: failed.length,
            errorRate: (failed.length / scenarioResults.requests.length) * 100,
            latency: {
                avg: avg(durations),
                min: Math.min(...durations),
                max: Math.max(...durations),
                p50: percentile(durations, 50),
                p95: percentile(durations, 95),
                p99: percentile(durations, 99),
            },
            throughput: scenarioResults.requests.length / scenarioResults.totalDuration,
        };
    }

    generateReport() {
        console.log('\n\n' + '='.repeat(100));
        console.log('RELATÓRIO TÉCNICO DE TESTE DE CARGA');
        console.log('='.repeat(100));
        console.log(`Data: ${new Date().toISOString()}`);
        console.log(`Versão do Node: ${process.version}`);
        console.log(`Base URL: ${this.baseUrl}`);
        console.log('='.repeat(100));

        const report = {
            timestamp: new Date().toISOString(),
            nodeVersion: process.version,
            baseUrl: this.baseUrl,
            scenarios: {},
        };

        for (const [name, scenarioResults] of Object.entries(this.results.scenarios)) {
            console.log(`\n${'─'.repeat(100)}`);
            console.log(`CENÁRIO: ${name}`);
            console.log('─'.repeat(100));

            const metrics = this.calculateMetrics(scenarioResults);
            report.scenarios[name] = metrics;

            console.log('\n📊 MÉTRICAS DA APLICAÇÃO:');
            console.log(`  Latência Média:     ${metrics.latency.avg.toFixed(2)}ms`);
            console.log(`  Latência P50:       ${metrics.latency.p50.toFixed(2)}ms`);
            console.log(`  Latência P95:       ${metrics.latency.p95.toFixed(2)}ms`);
            console.log(`  Latência P99:       ${metrics.latency.p99.toFixed(2)}ms`);
            console.log(`  Latência Máxima:    ${metrics.latency.max.toFixed(2)}ms`);
            console.log(`  Throughput:         ${metrics.throughput.toFixed(2)} req/s`);
            console.log(`  Taxa de Erro:       ${metrics.errorRate.toFixed(2)}%`);
            console.log(`  Total Requisições:  ${metrics.total}`);
            console.log(`  Sucesso:            ${metrics.successful}`);
            console.log(`  Falhas:             ${metrics.failed}`);

            // Classificação de saúde
            let health = 'SAUDÁVEL ✅';
            if (metrics.latency.p95 > 200 || metrics.errorRate > 1) {
                health = 'LIMITE PRÓXIMO ⚠️';
            }
            if (metrics.latency.p99 > 500 || metrics.errorRate > 5) {
                health = 'INSTÁVEL 🔶';
            }
            if (metrics.errorRate > 10) {
                health = 'CRÍTICO 🔴';
            }

            console.log(`\n🏥 STATUS DE SAÚDE: ${health}`);
        }

        console.log('\n' + '='.repeat(100));
        console.log('FIM DO RELATÓRIO');
        console.log('='.repeat(100) + '\n');

        return report;
    }

    async run() {
        console.log('\n🚀 INICIANDO TESTES DE CARGA');
        console.log('='.repeat(100));

        // Verificar servidor
        console.log('\n🔍 Verificando servidor...');
        try {
            const health = await this.makeRequest('/health', {});
            if (health.success) {
                console.log('✅ Servidor respondendo');
            } else {
                console.log('❌ Servidor não está respondendo corretamente');
                return;
            }
        } catch (error) {
            console.log('❌ Erro ao conectar ao servidor:', error.message);
            return;
        }

        // Cenário A - Base
        await this.runScenario('A-Base', {
            rps: 50,  // Reduzido para teste rápido
            duration: 30, // 30 segundos
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Cenário B - Moderado
        await this.runScenario('B-Moderado', {
            rps: 100,
            duration: 30,
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Cenário C - Alto
        await this.runScenario('C-Alto', {
            rps: 200,
            duration: 30,
        });

        // Gerar relatório
        const report = this.generateReport();

        // Salvar relatório
        const fs = require('fs');
        const reportPath = `load-test-report-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Relatório salvo em: ${reportPath}`);

        return report;
    }
}

// Executar
if (require.main === module) {
    const tester = new LoadTester();
    tester.run().then(() => {
        console.log('\n✅ Testes concluídos!');
        process.exit(0);
    }).catch(error => {
        console.error('\n❌ Erro durante os testes:', error);
        process.exit(1);
    });
}

module.exports = LoadTester;
