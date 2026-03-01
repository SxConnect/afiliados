# ⚡ Início Rápido - 5 Minutos

## 🎯 Objetivo
Ter o sistema rodando em menos de 5 minutos!

## 📋 Checklist Rápido

### 1️⃣ Instalar Dependências (2 min)

```bash
# Na pasta afiliado
npm install

# Na pasta vps
cd vps
npm install
cd ..
```

### 2️⃣ Configurar PAPI (1 min)

Edite o arquivo `.env`:

```env
PAPI_URL=http://localhost:3000/api
PAPI_API_KEY=sua-chave-aqui
```

> 💡 Se não tiver a PAPI instalada, veja: [Documentação da PAPI](../Documentação%20da%20papi)

### 3️⃣ Iniciar Servidores (1 min)

**Windows:**
```bash
scripts\start-all.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/start-all.sh
./scripts/start-all.sh
```

Você verá:
```
🔐 VPS Simulada rodando na porta 4000
🚀 Core Engine rodando na porta 3001
```

### 4️⃣ Testar (1 min)

Abra `test-client.html` no navegador e:

1. **Validar Licença**
   - Use: `5511999999999` (Plano Pro)
   - Clique: "🔐 Validar Licença"
   - ✅ Você receberá um token JWT

2. **Criar Instância WhatsApp**
   - ID: `teste`
   - Clique: "📱 Criar Instância"
   - Clique: "📷 Ver QR Code"
   - Escaneie com WhatsApp

3. **Enviar Mensagem**
   - Número: `5511888888888@s.whatsapp.net`
   - Mensagem: "Teste"
   - Clique: "📤 Enviar Mensagem"

## 🎉 Pronto!

Se tudo funcionou, você tem:
- ✅ Sistema rodando
- ✅ WhatsApp conectado
- ✅ Mensagem enviada

## 🔧 Problemas Comuns

### Erro: "ECONNREFUSED"
**Solução:** Verifique se todos os servidores estão rodando

### Erro: "PAPI_API_KEY inválida"
**Solução:** Configure a chave correta no `.env`

### Erro: "Instance not found"
**Solução:** Crie a instância primeiro (passo 2)

## 📚 Próximos Passos

1. Leia: [GUIA_INSTALACAO.md](./GUIA_INSTALACAO.md)
2. Explore: [EXEMPLOS_USO.md](./EXEMPLOS_USO.md)
3. Consulte: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🆘 Precisa de Ajuda?

- Verifique os logs dos servidores
- Consulte o [RESUMO_PROJETO.md](./RESUMO_PROJETO.md)
- Revise as configurações do `.env`

---

**Tempo total:** ~5 minutos ⏱️

Bom desenvolvimento! 🚀
