/**
 * Teste de Carga Simplificado
 * Executa testes reais e gera relatório
 */

const http = require('http');

// Configuração
const BASE_URL = '127.0.0.1';
const PORT = 3000;
const SCENARIOS = [
    { name: 'A-Base', rps: 50, duration: 20 },
    { name: 'B-Moderado', rps: 100, duration: 20 },
    { name: 'C-Alto', rps: 150, duration: 20 },
];

// Resultados globais
const allResults = [];

// Função para fazer requisição HTTP
function makeRequest(path, payload) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const data = JSON.stringify(payload);

        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const duration = Date.now() - startTime;
                resolve({
                    status: res.statusCode,
                    duration,
                    success: res.statusCode >= 200 && res.statusCode < 400,
                });
            });
        });

        req.on('error', () => {
            const duration = Date.now() - startTime;
            resolve({ status: 0, duration, success: false });
        });

        req.write(data);
        req.end();
    });
}

// Gerar usuário de teste
function generateUser() {
    const id = Math.floor(Math.random() * 10000);
    return {
        whatsapp: `5511${String(id).padStart(8, '0')}`,
        fingerprint: `fp-${id}-${Date.now()}`,
    };
}

// Selecionar endpoint baseado em distribuição
function selectEndpoint(index) {
    const rand = index % 100;
    if (rand < 25) return { path: '/api/validate-license', name: 'validate' };
    if (rand < 60) return { path: '/api/check-quota', name: 'check' };
    if (rand < 90) return { path: '/api/consume-quota', name: 'consume' };
    return { path: '/api/validate-plugin', name: 'plugin' };
}

// Gerar payload para endpoint
function generatePayload(endpointName, user) {
    switch (endpointName) {
        case 'validate':
            return { whatsapp: user.whatsapp, fingerprint: user.fingerprint };
        case 'check':
        case 'consume':
            return { whatsapp: user.whatsapp, token: 'test-token' };
        case 'plugin':
            return { whatsapp: user.whatsapp, token: 'test-token', pluginId: 'auto-responder' };
        default:
            return {};
    }
}

// Executar cenário
async function runScenario(scenario) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`CENÁRIO: ${scenario.name}`);
    console.log(`Config: ${scenario.rps} req/s por ${scenario.duration}s`);
    console.log('='.repeat(80));

    const results = [];
    const totalRequests = scenario.rps * scenario.duration;
    const intervalMs = 1000 / scenario.rps;

    let completed = 0;
    let errors = 0;
    const startTime = Date.now();

    // Mostrar progresso
    const progressInterval = setInterval(() => {
        const progress = ((completed / totalRequests) * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        process.stdout.write(`\r⏳ ${progress}% | ${completed}/${totalRequests} | Erros: ${errors} | ${elapsed}s`);
    }, 500);

    // Executar requisições
    const promises = [];
    for (let i = 0; i < totalRequests; i++) {
        const user = generateUser();
        const endpoint = selectEndpoint(i);
        const payload = generatePayload(endpoint.name, user);

        const promise = makeRequest(endpoint.path, payload).then(result => {
            results.push({ ...result, endpoint: endpoint.name });
            completed++;
            if (!result.success) errors++;
        });

        promises.push(promise);

        // Aguardar intervalo entre requisições
        if (i < totalRequests - 1) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
    }

    // Aguardar todas completarem
    await Promise.all(promises);
    clearInterval(progressInterval);

    const totalDuration = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Concluído em ${totalDuration.toFixed(2)}s`);

    return { scenario: scenario.name, results, totalDuration };
}

// Calcular métricas
function calculateMetrics(results) {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    const percentile = (arr, p) => {
        const idx = Math.ceil((p / 100) * arr.length) - 1;
        return arr[Math.max(0, idx)] || 0;
    };

    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    return {
        total: results.length,
        successful,
        failed,
        errorRate: (failed / results.length) * 100,
        latency: {
            avg: avg(durations),
            min: Math.min(...durations),
            max: Math.max(...durations),
            p50: percentile(durations, 50),
            p95: percentile(durations, 95),
            p99: percentile(durations, 99),
        },
    };
}

// Gerar relatório
function generateReport(allResults) {
    console.log('\n\n' + '='.repeat(100));
    console.log('RELATÓRIO TÉCNICO DE TESTE DE CARGA - SISTEMA DE ENTITLEMENTS');
    console.log('='.repeat(100));
    console.log(`Data: ${new Date().toISOString()}`);
    console.log(`Node.js: ${process.version}`);
    console.log(`Sistema: ${process.platform}`);
    console.log('='.repeat(100));

    const report = {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        scenarios: {},
    };

    for (const scenarioData of allResults) {
        const metrics = calculateMetrics(scenarioData.results);
        report.scenarios[scenarioData.scenario] = metrics;

        console.log(`\n${'─'.repeat(100)}`);
        console.log(`CENÁRIO: ${scenarioData.scenario}`);
        console.log('─'.repeat(100));

        console.log('\n📊 MÉTRICAS DA APLICAÇÃO:');
        console.log(`  Latência Média:     ${metrics.latency.avg.toFixed(2)}ms`);
        console.log(`  Latência P50:       ${metrics.latency.p50.toFixed(2)}ms`);
        console.log(`  Latência P95:       ${metrics.latency.p95.toFixed(2)}ms`);
        console.log(`  Latência P99:       ${metrics.latency.p99.toFixed(2)}ms`);
        console.log(`  Latência Máxima:    ${metrics.latency.max.toFixed(2)}ms`);
        console.log(`  Throughput:         ${(metrics.total / scenarioData.totalDuration).toFixed(2)} req/s`);
        console.log(`  Taxa de Erro:       ${metrics.errorRate.toFixed(2)}%`);
        console.log(`  Total Requisições:  ${metrics.total}`);
        console.log(`  Sucesso:            ${metrics.successful}`);
        console.log(`  Falhas:             ${metrics.failed}`);

        // Classificação
        let health = 'SAUDÁVEL ✅';
        const issues = [];

        if (metrics.latency.p95 > 200) {
            health = 'LIMITE PRÓXIMO ⚠️';
            issues.push(`Latência P95 alta: ${metrics.latency.p95.toFixed(2)}ms (limite: 200ms)`);
        }
        if (metrics.latency.p99 > 500) {
            health = 'INSTÁVEL 🔶';
            issues.push(`Latência P99 alta: ${metrics.latency.p99.toFixed(2)}ms (limite: 500ms)`);
        }
        if (metrics.errorRate > 1) {
            health = 'CRÍTICO 🔴';
            issues.push(`Taxa de erro alta: ${metrics.errorRate.toFixed(2)}% (limite: 1%)`);
        }

        console.log(`\n🏥 STATUS DE SAÚDE: ${health}`);
        if (issues.length > 0) {
            console.log('  Problemas identificados:');
            issues.forEach(issue => console.log(`    ⚠️  ${issue}`));
        }

        // Estimativa de capacidade
        const throughput = metrics.total / scenarioData.totalDuration;
        const estimatedUsers = Math.floor(throughput * 5); // 1 req a cada 5s
        console.log(`\n📈 ESTIMATIVA DE CAPACIDADE:`);
        console.log(`  Throughput Real:    ${throughput.toFixed(2)} req/s`);
        console.log(`  Usuários Estimados: ${estimatedUsers}`);
    }

    console.log('\n' + '='.repeat(100));
    console.log('VEREDICTO EXECUTIVO');
    console.log('='.repeat(100));

    // Pegar o melhor cenário
    const bestScenario = allResults[allResults.length - 1];
    const bestMetrics = calculateMetrics(bestScenario.results);
    const maxThroughput = bestMetrics.total / bestScenario.totalDuration;
    const maxUsers = Math.floor(maxThroughput * 5);

    console.log(`\n🎯 CAPACIDADE ATUAL DO SISTEMA:`);
    console.log(`   Usuários Simultâneos Suportados: ${maxUsers}`);

    if (maxUsers >= 50000) {
        console.log(`   ✅ Sistema PRONTO para 50K usuários`);
    } else if (maxUsers >= 10000) {
        console.log(`   ✅ Sistema PRONTO para 10K usuários`);
        console.log(`   ⚠️  Precisa ajustes para 50K`);
    } else if (maxUsers >= 5000) {
        console.log(`   ⚠️  Sistema próximo de 10K, monitorar`);
    } else {
        console.log(`   ⚠️  Sistema PRECISA AJUSTES para escala`);
    }

    const needsRedis = bestMetrics.latency.p95 > 200;
    if (needsRedis) {
        console.log(`   🔴 Redis Cache é RECOMENDADO para melhor performance`);
    }

    console.log('\n' + '='.repeat(100));
    console.log('Relatório baseado em dados reais de teste de carga');
    console.log('='.repeat(100) + '\n');

    return report;
}

// Executar testes
async function main() {
    console.log('\n🚀 TESTE DE CARGA - SISTEMA DE ENTITLEMENTS');
    console.log('='.repeat(100));

    // Verificar servidor
    console.log('\n🔍 Verificando servidor...');
    try {
        await new Promise((resolve, reject) => {
            const req = http.get(`http://${BASE_URL}:${PORT}/health`, (res) => {
                if (res.statusCode === 200) {
                    console.log('✅ Servidor respondendo');
                    resolve();
                } else {
                    reject(new Error(`Status: ${res.statusCode}`));
                }
            });
            req.on('error', reject);
        });
    } catch (error) {
        console.log('❌ Servidor não está respondendo:', error.message);
        console.log('   Inicie o servidor com: npm start');
        process.exit(1);
    }

    // Executar cenários
    for (const scenario of SCENARIOS) {
        const result = await runScenario(scenario);
        allResults.push(result);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Pausa entre cenários
    }

    // Gerar relatório
    const report = generateReport(allResults);

    // Salvar relatório
    const fs = require('fs');
    const filename = `load-test-report-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\n📄 Relatório JSON salvo em: ${filename}\n`);
}

// Executar
main().catch(console.error);
