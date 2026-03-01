#!/usr/bin/env node

/**
 * Script de Teste do Fluxo de Validação
 * 
 * Testa todo o fluxo de validação:
 * 1. Validação de número no WhatsApp (PAPI)
 * 2. Validação de licença no banco de dados (VPS)
 * 3. Verificação de machine fingerprint
 * 4. Geração de token JWT
 */

const axios = require('axios');
const { machineIdSync } = require('node-machine-id');

const CORE_URL = 'http://localhost:3001/api';
const VPS_URL = 'http://localhost:4000/api';

// Cores para output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n[PASSO ${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
    log(`✓ ${message}`, 'green');
}

function logError(message) {
    log(`✗ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠ ${message}`, 'yellow');
}

async function testHealthCheck() {
    logStep(1, 'Verificando saúde dos servidores');

    try {
        // Testa Core Engine
        const coreHealth = await axios.get('http://localhost:3001/health');
        logSuccess(`Core Engine: ${coreHealth.data.status}`);
    } catch (error) {
        logError('Core Engine não está respondendo');
        logWarning('Execute: cd afiliado && npm start');
        return false;
    }

    try {
        // Testa VPS
        const vpsPlans = await axios.get(`${VPS_URL}/plans`);
        logSuccess(`VPS Server: ${vpsPlans.data.plans.length} planos disponíveis`);
    } catch (error) {
        logError('VPS Server não está respondendo');
        logWarning('Execute: cd afiliado/vps && npm start');
        return false;
    }

    return true;
}

async function testLicenseValidation(phoneNumber) {
    logStep(2, `Testando validação de licença: ${phoneNumber}`);

    try {
        const response = await axios.post(`${CORE_URL}/license/validate`, {
            phoneNumber,
            instanceId: 'test-instance'
        });

        if (response.data.success) {
            logSuccess('Validação bem-sucedida!');
            log(`   Plano: ${response.data.plan}`, 'blue');
            log(`   Quota: ${response.data.quota.available}/${response.data.quota.total}`, 'blue');
            log(`   Plugins: ${response.data.plugins.join(', ')}`, 'blue');
            log(`   Machine ID: ${response.data.machineId}`, 'blue');
            return response.data;
        } else {
            logError(`Validação falhou: ${response.data.error}`);
            return null;
        }
    } catch (error) {
        logError(`Erro na validação: ${error.response?.data?.error || error.message}`);
        if (error.response?.data?.details) {
            log(`   Detalhes: ${error.response.data.details}`, 'yellow');
        }
        return null;
    }
}

async function testTokenValidation(token) {
    logStep(3, 'Testando validação de token JWT');

    try {
        const response = await axios.get(`${CORE_URL}/license/status`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data.success) {
            logSuccess('Token válido!');
            log(`   Plano: ${response.data.plan}`, 'blue');
            return true;
        } else {
            logError('Token inválido');
            return false;
        }
    } catch (error) {
        logError(`Erro ao validar token: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function testQuotaCheck(token) {
    logStep(4, 'Testando verificação de quota');

    try {
        const response = await axios.get(`${CORE_URL}/metrics/quota`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data.success) {
            const quota = response.data.quota;
            logSuccess('Quota verificada!');
            log(`   Disponível: ${quota.available}`, 'blue');
            log(`   Usado: ${quota.used}`, 'blue');
            log(`   Total: ${quota.total}`, 'blue');
            return true;
        } else {
            logError('Erro ao verificar quota');
            return false;
        }
    } catch (error) {
        logError(`Erro ao verificar quota: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function testPluginsList(token) {
    logStep(5, 'Testando listagem de plugins');

    try {
        const response = await axios.get(`${CORE_URL}/plugins`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data.success) {
            logSuccess(`${response.data.plugins.length} plugins encontrados`);
            response.data.plugins.forEach(plugin => {
                const status = plugin.enabled ? '✓ Habilitado' : '✗ Bloqueado';
                log(`   ${plugin.name} (${plugin.id}): ${status}`, plugin.enabled ? 'green' : 'red');
            });
            return true;
        } else {
            logError('Erro ao listar plugins');
            return false;
        }
    } catch (error) {
        logError(`Erro ao listar plugins: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function testInvalidLicense() {
    logStep(6, 'Testando licença inválida');

    try {
        await axios.post(`${CORE_URL}/license/validate`, {
            phoneNumber: '5511000000000',
            instanceId: 'test-instance'
        });

        logError('Deveria ter falhado mas passou!');
        return false;
    } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
            logSuccess('Licença inválida rejeitada corretamente');
            log(`   Erro: ${error.response.data.error}`, 'blue');
            return true;
        } else {
            logError(`Erro inesperado: ${error.message}`);
            return false;
        }
    }
}

async function testMachineFingerprint() {
    logStep(7, 'Testando machine fingerprint');

    try {
        const machineId = machineIdSync();
        logSuccess(`Machine ID gerado: ${machineId}`);
        log(`   Comprimento: ${machineId.length} caracteres`, 'blue');
        log(`   Tipo: ${typeof machineId}`, 'blue');
        return true;
    } catch (error) {
        logError(`Erro ao gerar machine ID: ${error.message}`);
        return false;
    }
}

async function testVPSPlans() {
    logStep(8, 'Testando listagem de planos da VPS');

    try {
        const response = await axios.get(`${VPS_URL}/plans`);

        if (response.data.success) {
            logSuccess(`${response.data.plans.length} planos disponíveis`);
            response.data.plans.forEach(plan => {
                log(`   ${plan.name} (${plan.id}): R$ ${plan.price} - ${plan.quota} msgs/mês`, 'blue');
            });
            return true;
        } else {
            logError('Erro ao listar planos');
            return false;
        }
    } catch (error) {
        logError(`Erro ao listar planos: ${error.message}`);
        return false;
    }
}

async function runTests() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║     TESTE DO FLUXO DE VALIDAÇÃO - SISTEMA AFILIADOS      ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');

    const results = {
        passed: 0,
        failed: 0,
        total: 0
    };

    // Teste 1: Health Check
    results.total++;
    if (await testHealthCheck()) {
        results.passed++;
    } else {
        results.failed++;
        log('\n❌ Servidores não estão rodando. Abortando testes.', 'red');
        return;
    }

    // Teste 2: Machine Fingerprint
    results.total++;
    if (await testMachineFingerprint()) {
        results.passed++;
    } else {
        results.failed++;
    }

    // Teste 3: VPS Plans
    results.total++;
    if (await testVPSPlans()) {
        results.passed++;
    } else {
        results.failed++;
    }

    // Teste 4: Licença Válida (Pro)
    results.total++;
    const validationResult = await testLicenseValidation('5511999999999');
    if (validationResult) {
        results.passed++;

        // Teste 5: Token Validation
        results.total++;
        if (await testTokenValidation(validationResult.token)) {
            results.passed++;
        } else {
            results.failed++;
        }

        // Teste 6: Quota Check
        results.total++;
        if (await testQuotaCheck(validationResult.token)) {
            results.passed++;
        } else {
            results.failed++;
        }

        // Teste 7: Plugins List
        results.total++;
        if (await testPluginsList(validationResult.token)) {
            results.passed++;
        } else {
            results.failed++;
        }
    } else {
        results.failed++;
    }

    // Teste 8: Licença Inválida
    results.total++;
    if (await testInvalidLicense()) {
        results.passed++;
    } else {
        results.failed++;
    }

    // Resumo
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║                      RESUMO DOS TESTES                     ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');
    log(`\nTotal de testes: ${results.total}`, 'blue');
    log(`Passou: ${results.passed}`, 'green');
    log(`Falhou: ${results.failed}`, 'red');
    log(`Taxa de sucesso: ${Math.round((results.passed / results.total) * 100)}%\n`, 'cyan');

    if (results.failed === 0) {
        log('🎉 TODOS OS TESTES PASSARAM! Sistema funcionando perfeitamente.', 'green');
    } else {
        log('⚠️  Alguns testes falharam. Verifique os logs acima.', 'yellow');
    }
}

// Executa os testes
runTests().catch(error => {
    logError(`Erro fatal: ${error.message}`);
    process.exit(1);
});
