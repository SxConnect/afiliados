# 🚀 Quick Start - Teste de Carga

## ⚡ Início Rápido (5 minutos)

### 1. Instalar k6

**Windows (PowerShell como Admin):**
```powershell
choco install k6
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install k6
```

**macOS:**
```bash
brew install k6
```

### 2. Iniciar o Servidor

```bash
cd afiliado/vps
npm start
```

Aguarde até ver: `✅ License API Server running on port 3000`

### 3. Executar Teste

**Em outro terminal:**

**Windows:**
```bash
cd afiliado/vps/load-tests
run-load-test.bat
```

**Linux/macOS:**
```bash
cd afiliado/vps/load-tests
chmod +x run-load-test.sh
./run-load-test.sh
```

### 4. Aguardar Resultados

⏱️ Duração: ~16 minutos

O teste executará automaticamente:
- ✅ Cenário A: 100 req/s (2 min)
- ✅ Cenário B: 250 req/s (3 min)
- ✅ Cenário C: 500 req/s (3 min)
- ✅ Cenário D: Stress test (5 min)

### 5. Ver Relatório

Ao final, o relatório será exibido automaticamente no terminal.

Arquivos salvos em: `results/YYYYMMDD_HHMMSS/`

---

## 📊 Interpretando o Resultado

### Exemplo de Output

```
🎯 CAPACIDADE ATUAL DO SISTEMA:
   Usuários Simultâneos Suportados: 12,450
   ✅ Sistema PRONTO para 10K usuários
```

### O Que Significa?

- **< 10K usuários:** ⚠️ Sistema precisa ajustes
- **10K - 50K usuários:** ✅ Bom para começar, monitorar crescimento
- **> 50K usuários:** 🚀 Excelente capacidade

### Recomendações Comuns

Se o relatório recomendar **Redis Cache**:

```bash
# 1. Implementar Redis
node implement-redis-cache.js

# 2. Instalar dependências
npm install

# 3. Iniciar Redis (Docker)
docker run -d -p 6379:6379 redis:alpine

# 4. Configurar .env
echo "REDIS_HOST=localhost" >> .env
echo "REDIS_PORT=6379" >> .env
echo "CACHE_TTL=300" >> .env

# 5. Re-executar teste
./run-load-test.sh
```

---

## 🆘 Problemas Comuns

### "k6 not found"
```bash
# Instale o k6 conforme instruções acima
k6 version
```

### "Server not responding"
```bash
# Verifique se o servidor está rodando
curl http://localhost:3000/health

# Se não estiver, inicie:
cd afiliado/vps
npm start
```

### "Permission denied" (Linux/macOS)
```bash
chmod +x run-load-test.sh
```

### Monitor não para
```bash
# Linux/macOS
pkill -f monitor-system.js

# Windows
taskkill /F /IM node.exe
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `README.md` - Documentação completa
- `../planejamento/TESTE_DE_CARGA_SOLUCAO.md` - Visão geral da solução

---

## ✅ Checklist Pré-Teste

- [ ] k6 instalado (`k6 version`)
- [ ] Node.js >= 20 (`node --version`)
- [ ] Servidor rodando (`curl http://localhost:3000/health`)
- [ ] Porta 3000 disponível
- [ ] ~2GB RAM livre
- [ ] ~16 minutos disponíveis

---

## 🎯 Objetivo

Responder com dados reais:

> **"Quantos usuários simultâneos o sistema suporta com segurança?"**

Sem suposições. Apenas dados.

---

**Pronto para começar? Execute o passo 3! 🚀**
