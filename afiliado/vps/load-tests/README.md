# 🔥 Load Testing Suite - Sistema de Entitlements

Suite completa de testes de carga para validar a capacidade do sistema antes da FASE 3 (Monetização de Plugins).

## 📋 Pré-requisitos

### Obrigatórios

1. **Node.js** >= 20.0.0
   ```bash
   node --version
   ```

2. **k6** - Ferramenta de teste de carga
   
   **Windows:**
   ```powershell
   choco install k6
   # ou
   winget install k6
   ```
   
   **Linux:**
   ```bash
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```
   
   **macOS:**
   ```bash
   brew install k6
   ```

3. **Servidor rodando** - O sistema deve estar em execução
   ```bash
   cd afiliado/vps
   npm start
   ```

### Opcionais

- PostgreSQL (para métricas de banco de dados)
- Grafana/Prometheus (para visualização em tempo real)

## 🚀 Como Executar

### Método 1: Script Automatizado (Recomendado)

**Windows:**
```bash
cd afiliado/vps/load-tests
./run-load-test.bat
```

**Linux/macOS:**
```bash
cd afiliado/vps/load-tests
chmod +x run-load-test.sh
./run-load-test.sh
```

### Método 2: Execução Manual

1. **Iniciar monitoramento do sistema:**
   ```bash
   node monitor-system.js
   ```

2. **Em outro terminal, executar k6:**
   ```bash
   k6 run k6-load-test.js
   ```

3. **Parar o monitor (Ctrl+C) e analisar:**
   ```bash
   node analyze-results.js load-test-results.json system-metrics.json
   ```

## 📊 Cenários de Teste

### Cenário A - Base (2 minutos)
- **Carga:** 100 requisições/segundo
- **Objetivo:** Estabelecer baseline de performance
- **VUs:** 50-100

### Cenário B - Moderado (3 minutos)
- **Carga:** 250 requisições/segundo
- **Objetivo:** Simular carga moderada de produção
- **VUs:** 100-200

### Cenário C - Alto (3 minutos)
- **Carga:** 500 requisições/segundo
- **Objetivo:** Testar limites do sistema
- **VUs:** 200-400

### Cenário D - Stress (5 minutos)
- **Carga:** Rampa de 500 até 2500 req/s
- **Objetivo:** Encontrar ponto de quebra (breakpoint)
- **VUs:** 400-1000

**Duração total:** ~16 minutos

## 🎯 Endpoints Testados

| Endpoint | % Tráfego | Descrição |
|----------|-----------|-----------|
| `/api/validate-license` | 25% | Validação de licença |
| `/api/check-quota` | 35% | Verificação de quota |
| `/api/consume-quota` | 30% | Consumo de quota |
| `/api/validate-plugin` | 10% | Validação de plugin |

## 📈 Métricas Coletadas

### Aplicação
- ✅ Latência média, P95, P99, máxima
- ✅ Throughput (req/s)
- ✅ Taxa de erro (%)
- ✅ Total de requisições

### Infraestrutura
- ✅ Uso de CPU (%, P95, P99)
- ✅ Uso de RAM (%, P95, P99)
- ✅ Event Loop Lag (ms)
- ✅ Heap Memory (MB)

### Banco de Dados (se disponível)
- ⏳ Queries por segundo
- ⏳ Tempo médio de query
- ⏳ Lock waits
- ⏳ Conexões ativas

## 🏥 Critérios de Saúde

| Métrica | Saudável | Limite | Instável | Crítico |
|---------|----------|--------|----------|---------|
| Latência P95 | < 100ms | 100-200ms | 200-500ms | > 500ms |
| Latência P99 | < 200ms | 200-500ms | 500-1000ms | > 1000ms |
| Taxa de Erro | < 0.1% | 0.1-1% | 1-5% | > 5% |
| CPU P95 | < 50% | 50-75% | 75-90% | > 90% |
| Memória | < 70% | 70-80% | 80-90% | > 90% |
| Event Loop Lag | < 50ms | 50-100ms | 100-200ms | > 200ms |

## 📁 Estrutura de Arquivos

```
load-tests/
├── k6-load-test.js          # Script k6 com cenários
├── monitor-system.js         # Monitor de sistema em tempo real
├── analyze-results.js        # Análise e geração de relatório
├── run-load-test.sh         # Script automatizado (Linux/macOS)
├── run-load-test.bat        # Script automatizado (Windows)
├── README.md                # Esta documentação
└── results/                 # Resultados dos testes
    └── YYYYMMDD_HHMMSS/
        ├── k6-summary.json
        ├── system-metrics.json
        ├── analysis-report.txt
        └── load-test-analysis.json
```

## 🔍 Interpretando Resultados

### Exemplo de Output

```
📊 MÉTRICAS DA APLICAÇÃO:
  Latência Média:     45.23ms
  Latência P95:       156.78ms
  Latência P99:       234.56ms
  Throughput:         487.32 req/s
  Taxa de Erro:       0.12%

🖥️  MÉTRICAS DE INFRAESTRUTURA:
  CPU P95:            68%
  Memória Máxima:     72%
  Event Loop Lag P95: 45ms

🏥 STATUS DE SAÚDE: SAUDÁVEL

📈 ESTIMATIVA DE CAPACIDADE:
  Usuários Simultâneos: 12,450
  RPS Máximo:          650
```

### Classificação

- **SAUDÁVEL** ✅ - Sistema operando normalmente
- **LIMITE PRÓXIMO** ⚠️ - Atenção necessária
- **INSTÁVEL** 🔶 - Ajustes recomendados
- **CRÍTICO** 🔴 - Ação imediata necessária

## 🛠️ Troubleshooting

### Erro: "k6 not found"
```bash
# Instale o k6 conforme instruções acima
k6 version
```

### Erro: "Server not responding"
```bash
# Verifique se o servidor está rodando
curl http://localhost:3000/health

# Inicie o servidor
cd afiliado/vps
npm start
```

### Erro: "ECONNREFUSED"
```bash
# Verifique a porta e URL base
export BASE_URL=http://localhost:3000
```

### Monitor não para
```bash
# Force kill do processo
pkill -f monitor-system.js
# ou no Windows
taskkill /F /IM node.exe
```

## 🎯 Decisões Arquiteturais

O script de análise automaticamente recomenda:

### Se Latência P95 > 200ms OU CPU > 75%
→ **Implementar Redis Cache**
- Snapshot em Redis
- TTL configurável
- Fallback para DB

### Se Latência P99 > 500ms
→ **Otimizar Queries**
- Adicionar índices
- Revisar queries N+1
- Connection pooling

### Se CPU Max > 90%
→ **Escalonamento Horizontal**
- Load balancer
- Múltiplas instâncias
- Auto-scaling

### Se Event Loop Lag > 100ms
→ **Ajustar Pool de Conexões**
- Aumentar pool size
- Worker threads
- Operações assíncronas

## 📊 Estimativa de Capacidade

O sistema calcula automaticamente:

```javascript
// Fórmula simplificada
maxRPS = currentRPS * (1 + headroom)
concurrentUsers = maxRPS * 5  // 1 req a cada 5s por usuário
```

**Exemplo:**
- RPS atual: 500
- CPU: 60% (headroom: 25%)
- Max RPS: 625
- **Usuários simultâneos: ~3,125**

## 🎓 Boas Práticas

1. **Execute em ambiente isolado** - Evite outras aplicações rodando
2. **Múltiplas execuções** - Execute 3x e tire a média
3. **Horários diferentes** - Teste em diferentes momentos
4. **Dados realistas** - Use dados similares à produção
5. **Monitore recursos** - CPU, RAM, Disco, Rede
6. **Documente mudanças** - Registre alterações entre testes

## 📚 Referências

- [k6 Documentation](https://k6.io/docs/)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

## 🤝 Contribuindo

Para adicionar novos cenários ou métricas:

1. Edite `k6-load-test.js` para novos cenários
2. Atualize `monitor-system.js` para novas métricas
3. Modifique `analyze-results.js` para nova análise
4. Documente as mudanças neste README

## 📝 Changelog

### v1.0.0 (2024-03-01)
- ✅ Implementação inicial
- ✅ 4 cenários de teste (A, B, C, D)
- ✅ Monitoramento de sistema
- ✅ Análise automatizada
- ✅ Relatório técnico estruturado
- ✅ Scripts para Windows e Linux

---

**Objetivo:** Tomar decisão técnica baseada em evidência antes da FASE 3.

**Sem marketing. Sem otimismo infundado. Somente engenharia baseada em dados.**
