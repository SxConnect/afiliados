# 🎛️ ADMIN PANEL - OPÇÕES DE DEPLOY

## ❓ Pergunta: O Admin Panel está na imagem do GHCR?

**RESPOSTA: NÃO!**

A imagem `ghcr.io/sxconnect/afiliados-vps:2.0.0` contém apenas:
- ✅ Servidor de licenças (API)
- ✅ Serviços de validação
- ✅ Migrações do banco
- ❌ **NÃO contém o Admin Panel**

---

## 🎯 3 OPÇÕES PARA TER O ADMIN PANEL

### Opção 1: Imagem Docker Separada (Recomendado) ⭐

**Vantagens:**
- Isolamento completo
- Escalabilidade independente
- Fácil atualização
- Melhor para produção

**Como fazer:**

1. **Build e Push da Imagem**
   ```bash
   cd afiliado/vps/admin-panel
   
   # Windows
   set GITHUB_TOKEN=seu_token
   .\deploy-to-ghcr.bat
   
   # Linux/Mac
   export GITHUB_TOKEN=seu_token
   bash deploy-to-ghcr.sh
   ```

2. **Usar o docker-compose.production.yml**
   ```bash
   # No servidor VPS
   docker-compose pull admin-panel
   docker-compose up -d admin-panel
   ```

3. **Acessar**
   - URL: `http://seu-servidor:3001`
   - Ou: `https://admin.seu-dominio.com` (com Traefik)

---

### Opção 2: Instalar Manualmente no Servidor

**Vantagens:**
- Sem Docker
- Controle total
- Fácil debug

**Como fazer:**

```bash
# 1. SSH no servidor
ssh usuario@servidor-vps.com

# 2. Clonar repositório (se ainda não tiver)
git clone https://github.com/SxConnect/afiliados.git
cd afiliados/afiliado/vps/admin-panel

# 3. Instalar dependências
npm install

# 4. Build
npm run build

# 5. Configurar variáveis
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

# 6. Iniciar com PM2
pm2 start npm --name "admin-panel" -- start
pm2 save
```

---

### Opção 3: Incluir na Mesma Imagem Docker

**Vantagens:**
- Tudo em uma imagem
- Menos containers

**Desvantagens:**
- Imagem maior
- Menos flexível
- Não recomendado para produção

**Como fazer:**

Modificar o `Dockerfile` principal para incluir o admin-panel (não recomendado).

---

## 🚀 RECOMENDAÇÃO: Opção 1

Use a **Opção 1** (imagem separada) porque:

1. ✅ **Isolamento:** Admin e API separados
2. ✅ **Segurança:** Pode ter regras de firewall diferentes
3. ✅ **Escalabilidade:** Escala independentemente
4. ✅ **Manutenção:** Atualiza um sem afetar o outro
5. ✅ **Profissional:** Padrão da indústria

---

## 📋 PASSO A PASSO COMPLETO (Opção 1)

### 1. Build e Push do Admin Panel

```bash
# No seu computador local
cd afiliado/vps/admin-panel

# Definir token
set GITHUB_TOKEN=seu_token_aqui

# Build e push
.\deploy-to-ghcr.bat
```

**Resultado esperado:**
```
✅ Build concluído
✅ Push para GHCR concluído
📦 Imagem: ghcr.io/sxconnect/afiliados-admin-panel:1.0.0
```

### 2. Atualizar docker-compose.yml no Servidor

O arquivo `docker-compose.production.yml` já está configurado com:

```yaml
services:
  admin-panel:
    image: ghcr.io/sxconnect/afiliados-admin-panel:1.0.0
    ports:
      - "3001:3001"
    environment:
      NEXT_PUBLIC_API_URL: http://vps:3000
```

### 3. Deploy no Servidor

```bash
# SSH no servidor
ssh usuario@servidor-vps.com

# Navegar até o diretório
cd /opt/afiliados-vps

# Pull das imagens
docker-compose pull

# Iniciar serviços
docker-compose up -d

# Verificar
docker-compose ps
curl http://localhost:3001
```

### 4. Configurar DNS (Opcional)

Se quiser usar domínio:

1. Criar registro DNS: `admin.seu-dominio.com` → IP do servidor
2. Traefik vai gerar certificado SSL automaticamente
3. Acessar: `https://admin.seu-dominio.com`

---

## 🔐 Segurança

### Recomendações:

1. **Firewall:**
   ```bash
   # Bloquear porta 3001 externamente
   ufw deny 3001
   
   # Permitir apenas via Traefik (porta 443)
   ufw allow 443
   ```

2. **Autenticação:**
   - Implementar login no admin-panel
   - Usar JWT tokens
   - Sessões seguras

3. **HTTPS:**
   - Sempre usar HTTPS em produção
   - Traefik gera certificados automaticamente

---

## 📊 Comparação das Opções

| Aspecto | Opção 1 (Docker) | Opção 2 (Manual) | Opção 3 (Mesma Imagem) |
|---------|------------------|------------------|------------------------|
| Facilidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Isolamento | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Escalabilidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Manutenção | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Produção | ✅ Recomendado | ✅ OK | ❌ Não recomendado |

---

## 🎯 RESUMO

### Para ter o Admin Panel rodando:

1. ✅ **Build da imagem do admin-panel** (ainda não feito)
2. ✅ **Push para GHCR** (ainda não feito)
3. ✅ **Atualizar docker-compose** (já configurado)
4. ✅ **Deploy no servidor** (próximo passo)

### Próxima Ação:

```bash
cd afiliado/vps/admin-panel
set GITHUB_TOKEN=seu_token
.\deploy-to-ghcr.bat
```

---

**Sem marketing. Sem suposição. Baseado em arquitetura.**

**Status:** 📝 DOCUMENTADO - PRONTO PARA BUILD DO ADMIN-PANEL
