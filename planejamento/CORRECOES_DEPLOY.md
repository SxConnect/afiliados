# 🔧 Correções Aplicadas no Deploy

## Problemas Encontrados e Soluções

### 1. ❌ Variável LICENSE_SECRET faltando
**Problema:** O servidor estava crashando porque a variável `LICENSE_SECRET` não estava sendo passada.

**Solução:** Adicionada a linha no docker-compose:
```yaml
- LICENSE_SECRET=${LICENSE_SECRET:-seu-license-secret-mude-em-producao}
```

### 2. ❌ Porta incorreta (VPS_PORT vs PORT)
**Problema:** O servidor estava rodando na porta 3000 em vez de 4000.

**Causa:** O código usa `process.env.PORT`, mas estávamos passando `VPS_PORT`.

**Solução:** Alterado de:
```yaml
- VPS_PORT=4000
```
Para:
```yaml
- PORT=4000
```

### 3. ❌ Health check com rota errada
**Problema:** O health check estava tentando acessar `/api/plans` que não existe.

**Solução:** Alterado de:
```yaml
test: ["CMD", "node", "-e", "require('http').get('http://localhost:4000/api/plans', ...]
```
Para:
```yaml
test: ["CMD", "node", "-e", "require('http').get('http://localhost:4000/health', ...]
```

## 📋 Rotas Disponíveis no Servidor

- `GET /health` - Health check
- `POST /api/validate-license` - Validar licença
- `POST /api/check-quota` - Verificar quota
- `POST /api/consume-quota` - Consumir quota
- `POST /api/validate-plugin` - Validar plugin

## 🚀 Próximos Passos

1. **Atualizar a stack no Portainer** com o docker-compose corrigido
2. **Aguardar** o container reiniciar (pode levar até 40 segundos)
3. **Verificar** se o status mudou para "healthy" (verde)
4. **Testar** a API:
   ```bash
   curl https://vpsafiliados.sxconnect.com.br/health
   ```

## ✅ Checklist de Verificação

Após atualizar a stack:
- [ ] Container `afiliados_vps_server` está com status "healthy" (verde)
- [ ] Logs mostram "License API Server running on port 4000"
- [ ] Health check retorna status 200
- [ ] Domínio responde corretamente
- [ ] Traefik está roteando para o container

## 📝 Docker Compose Atualizado

O arquivo `afiliado/vps/docker-compose.production.yml` foi atualizado com todas as correções.

Copie o conteúdo atualizado e cole no editor do Portainer, depois clique em "Update the stack".
