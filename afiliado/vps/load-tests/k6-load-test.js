import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const latencyTrend = new Trend('latency');
const quotaCheckLatency = new Trend('quota_check_latency');
const quotaConsumeLatency = new Trend('quota_consume_latency');
const pluginValidateLatency = new Trend('plugin_validate_latency');
const successfulRequests = new Counter('successful_requests');

// Test configuration
export const options = {
    scenarios: {
        // Cenário A - Base: 100 req/s por 2 minutos
        scenario_a_base: {
            executor: 'constant-arrival-rate',
            rate: 100,
            timeUnit: '1s',
            duration: '2m',
            preAllocatedVUs: 50,
            maxVUs: 100,
            startTime: '0s',
            tags: { scenario: 'A-Base' },
        },
        // Cenário B - Moderado: 250 req/s por 3 minutos
        scenario_b_moderate: {
            executor: 'constant-arrival-rate',
            rate: 250,
            timeUnit: '1s',
            duration: '3m',
            preAllocatedVUs: 100,
            maxVUs: 200,
            startTime: '3m',
            tags: { scenario: 'B-Moderate' },
        },
        // Cenário C - Alto: 500 req/s por 3 minutos
        scenario_c_high: {
            executor: 'constant-arrival-rate',
            rate: 500,
            timeUnit: '1s',
            duration: '3m',
            preAllocatedVUs: 200,
            maxVUs: 400,
            startTime: '7m',
            tags: { scenario: 'C-High' },
        },
        // Cenário D - Stress: Rampa até falha
        scenario_d_stress: {
            executor: 'ramping-arrival-rate',
            startRate: 500,
            timeUnit: '1s',
            preAllocatedVUs: 400,
            maxVUs: 1000,
            startTime: '11m',
            stages: [
                { duration: '1m', target: 750 },
                { duration: '1m', target: 1000 },
                { duration: '1m', target: 1500 },
                { duration: '1m', target: 2000 },
                { duration: '1m', target: 2500 },
            ],
            tags: { scenario: 'D-Stress' },
        },
    },
    thresholds: {
        'http_req_duration': ['p(95)<200', 'p(99)<500'],
        'http_req_failed': ['rate<0.01'], // < 1% errors
        'errors': ['rate<0.01'],
    },
};

// Environment variables
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const JWT_SECRET = __ENV.JWT_SECRET || 'test-secret';
const LICENSE_SECRET = __ENV.LICENSE_SECRET || 'test-license-secret';

// Helper function to generate test data
function generateTestUser() {
    const userId = Math.floor(Math.random() * 10000);
    return {
        whatsapp: `5511${String(userId).padStart(8, '0')}`,
        fingerprint: `fp-${userId}-${Date.now()}`,
    };
}

// Helper function to create signature (simplified for testing)
function createSignature(data) {
    // In production, this would use proper HMAC
    return 'test-signature';
}

export default function () {
    const user = generateTestUser();
    const scenario = __ITER % 4; // Rotate through different endpoints

    // 1. Validate License (25% of requests)
    if (scenario === 0) {
        const payload = {
            whatsapp: user.whatsapp,
            fingerprint: user.fingerprint,
            signature: createSignature({ whatsapp: user.whatsapp, fingerprint: user.fingerprint }),
        };

        const startTime = Date.now();
        const res = http.post(`${BASE_URL}/api/validate-license`, JSON.stringify(payload), {
            headers: { 'Content-Type': 'application/json' },
        });
        const duration = Date.now() - startTime;

        const success = check(res, {
            'validate license status 200': (r) => r.status === 200,
            'validate license has token': (r) => JSON.parse(r.body).token !== undefined,
        });

        errorRate.add(!success);
        latencyTrend.add(duration);
        if (success) successfulRequests.add(1);
    }

    // 2. Check Quota (35% of requests)
    if (scenario === 1) {
        const payload = {
            whatsapp: user.whatsapp,
            token: 'test-token', // In real test, use actual token from validate
        };

        const startTime = Date.now();
        const res = http.post(`${BASE_URL}/api/check-quota`, JSON.stringify(payload), {
            headers: { 'Content-Type': 'application/json' },
        });
        const duration = Date.now() - startTime;

        const success = check(res, {
            'check quota status 200 or 404': (r) => r.status === 200 || r.status === 404,
        });

        errorRate.add(!success);
        quotaCheckLatency.add(duration);
        if (success) successfulRequests.add(1);
    }

    // 3. Consume Quota (30% of requests)
    if (scenario === 2) {
        const payload = {
            whatsapp: user.whatsapp,
            token: 'test-token',
            amount: 1,
        };

        const startTime = Date.now();
        const res = http.post(`${BASE_URL}/api/consume-quota`, JSON.stringify(payload), {
            headers: { 'Content-Type': 'application/json' },
        });
        const duration = Date.now() - startTime;

        const success = check(res, {
            'consume quota status 200 or 403 or 404': (r) =>
                r.status === 200 || r.status === 403 || r.status === 404,
        });

        errorRate.add(!success);
        quotaConsumeLatency.add(duration);
        if (success) successfulRequests.add(1);
    }

    // 4. Validate Plugin (10% of requests)
    if (scenario === 3) {
        const payload = {
            whatsapp: user.whatsapp,
            token: 'test-token',
            pluginId: 'auto-responder',
        };

        const startTime = Date.now();
        const res = http.post(`${BASE_URL}/api/validate-plugin`, JSON.stringify(payload), {
            headers: { 'Content-Type': 'application/json' },
        });
        const duration = Date.now() - startTime;

        const success = check(res, {
            'validate plugin status 200 or 404': (r) => r.status === 200 || r.status === 404,
        });

        errorRate.add(!success);
        pluginValidateLatency.add(duration);
        if (success) successfulRequests.add(1);
    }

    sleep(0.1); // Small delay between requests
}

export function handleSummary(data) {
    return {
        'load-test-results.json': JSON.stringify(data, null, 2),
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    };
}

function textSummary(data, options) {
    const indent = options.indent || '';
    const enableColors = options.enableColors || false;

    let summary = '\n' + indent + '='.repeat(80) + '\n';
    summary += indent + 'LOAD TEST SUMMARY\n';
    summary += indent + '='.repeat(80) + '\n\n';

    // Scenarios
    for (const [name, scenario] of Object.entries(data.metrics)) {
        if (name.includes('scenario')) {
            summary += indent + `${name}: ${JSON.stringify(scenario.values)}\n`;
        }
    }

    summary += '\n' + indent + '-'.repeat(80) + '\n';
    summary += indent + 'HTTP Metrics:\n';
    summary += indent + '-'.repeat(80) + '\n';

    const httpMetrics = [
        'http_req_duration',
        'http_req_failed',
        'http_reqs',
        'errors',
        'successful_requests',
    ];

    for (const metric of httpMetrics) {
        if (data.metrics[metric]) {
            summary += indent + `${metric}: ${JSON.stringify(data.metrics[metric].values)}\n`;
        }
    }

    return summary;
}
