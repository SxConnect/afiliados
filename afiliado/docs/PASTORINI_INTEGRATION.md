# Integração com Pastorini API

## Visão Geral

O sistema utiliza a Pastorini API para validação de números de WhatsApp durante o processo de login. Esta integração garante que apenas números válidos e registrados no WhatsApp possam acessar o sistema.

## Configuração

### Variáveis de Ambiente

```bash
# .env ou variáveis de ambiente do sistema
PASTORINI_API_KEY=sua-chave-api-pastorini
PASTORINI_INSTANCE_ID=afiliado-validation
VPS_ENDPOINT=https://sua-api-pastorini.com
```

### Obter Credenciais

1. Acesse o painel da Pastorini API
2. Crie uma nova instância do WhatsApp
3. Copie o ID da instância para `PASTORINI_INSTANCE_ID`
4. Gere uma API Key no painel (se `PANEL_API_KEY` estiver configurado)
5. Configure `PASTORINI_API_KEY` com a chave gerada

## Fluxo de Validação

```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO DE LOGIN COM PASTORINI                   │
└─────────────────────────────────────────────────────────────┘

1. Usuário insere WhatsApp
         │
         ▼
2. UI envia para Core
         │
         ▼
3. Core valida com Pastorini API
   GET /api/instances/{id}/check-number/{phone}
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Existe    Não Existe
    │         │
    │         └──► Erro 400: "Número não registrado"
    │
    ▼
4. Core gera Fingerprint
         │
         ▼
5. Core valida com VPS interno
         │
         ▼
6. VPS retorna dados do usuário
         │
         ▼
7. Core verifica assinatura
         │
         ▼
8. UI recebe autorização ✓
```

## Endpoints Utilizados

### 1. Validação de Número

```http
GET /api/instances/{instanceId}/check-number/{phone}
Headers:
  x-api-key: {PASTORINI_API_KEY}
```

**Resposta (Número Existe):**
```json
{
  "exists": true,
  "jid": "5511999999999@s.whatsapp.net"
}
```

**Resposta (Número Não Existe):**
```json
{
  "exists": false,
  "jid": null
}
```

## Implementação no Core

### Cliente VPS

```go
// core/internal/vps/client.go

func (c *Client) ValidateNumberWithPastorini(instanceID, phone string) (bool, string, error) {
    url := fmt.Sprintf("%s/api/instances/%s/check-number/%s", 
        c.endpoint, instanceID, phone)
    
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return false, "", err
    }

    // Adicionar API Key
    if c.apiKey != "" {
        req.Header.Set("x-api-key", c.apiKey)
    }

    resp, err := c.client.Do(req)
    if err != nil {
        return false, "", err
    }
    defer resp.Body.Close()

    var result PastoriniCheckNumberResponse
    json.NewDecoder(resp.Body).Decode(&result)

    return result.Exists, result.JID, nil
}
```

### Handler de Login

```go
// core/internal/api/server.go

func (s *Server) handleLogin(c *gin.Context) {
    // 1. Validar com Pastorini
    exists, jid, err := s.vpsClient.ValidateNumberWithPastorini(
        s.config.PastoriniInstanceID,
        req.Phone,
    )
    
    if !exists {
        c.JSON(400, gin.H{
            "error": "Número não registrado no WhatsApp",
            "phone": req.Phone,
        })
        return
    }

    // 2. Continuar com validação interna...
}
```

## Tratamento de Erros

### Erro 400 - Número Inválido

```json
{
  "error": "Número não registrado no WhatsApp",
  "phone": "5511999999999"
}
```

**Causa**: Número não existe no WhatsApp  
**Ação**: Solicitar ao usuário que verifique o número

### Erro 401 - API Key Inválida

```json
{
  "error": "Unauthorized",
  "message": "API key required"
}
```

**Causa**: `PASTORINI_API_KEY` não configurada ou inválida  
**Ação**: Verificar configuração da API Key

### Erro 404 - Instância Não Encontrada

```json
{
  "error": "Instance not found"
}
```

**Causa**: `PASTORINI_INSTANCE_ID` incorreto  
**Ação**: Verificar ID da instância no painel Pastorini

### Erro 500 - Erro Interno

```json
{
  "error": "erro ao validar número",
  "details": "connection timeout"
}
```

**Causa**: Problema de conexão com Pastorini API  
**Ação**: Verificar conectividade e status da API

## Segurança

### Autenticação

A Pastorini API suporta 3 métodos de autenticação:

1. **Header x-api-key** (Recomendado)
```http
x-api-key: SUA_CHAVE
```

2. **Authorization Bearer**
```http
Authorization: Bearer SUA_CHAVE
```

3. **Query Parameter** (Não recomendado)
```http
?key=SUA_CHAVE
```

### Proteção da API Key

- ✅ Armazenar em variável de ambiente
- ✅ Nunca commitar no código
- ✅ Usar .env.example sem valores reais
- ✅ Rotacionar periodicamente
- ❌ Não expor no frontend
- ❌ Não logar em arquivos

## Performance

### Cache de Validações

Para melhorar performance, considere implementar cache:

```go
// Exemplo de cache simples
var numberCache = make(map[string]bool)

func (c *Client) ValidateNumberCached(instanceID, phone string) (bool, string, error) {
    // Verificar cache
    if exists, found := numberCache[phone]; found {
        return exists, phone + "@s.whatsapp.net", nil
    }
    
    // Validar com API
    exists, jid, err := c.ValidateNumberWithPastorini(instanceID, phone)
    if err == nil {
        numberCache[phone] = exists
    }
    
    return exists, jid, err
}
```

### Rate Limiting

A Pastorini API tem rate limiting:
- 100 requisições por 15 minutos por IP
- Header `X-RateLimit-Remaining` indica requisições restantes

## Monitoramento

### Logs Recomendados

```go
log.Printf("Validando número com Pastorini: %s", phone)
log.Printf("Número válido: %v, JID: %s", exists, jid)
log.Printf("Erro na validação: %v", err)
```

### Métricas

- Total de validações
- Taxa de sucesso/falha
- Tempo médio de resposta
- Números inválidos por dia

## Troubleshooting

### Problema: Timeout na validação

**Solução:**
```go
// Aumentar timeout do cliente HTTP
client: &http.Client{
    Timeout: 30 * time.Second,
}
```

### Problema: Muitos números inválidos

**Solução:**
- Implementar validação de formato antes de chamar API
- Adicionar máscara de telefone no frontend
- Validar código de país

### Problema: API Key expirada

**Solução:**
1. Gerar nova API Key no painel Pastorini
2. Atualizar variável `PASTORINI_API_KEY`
3. Reiniciar Core Engine

## Testes

### Teste Manual

```bash
# Testar validação diretamente
curl -X GET "https://sua-api.com/api/instances/afiliado-validation/check-number/5511999999999" \
  -H "x-api-key: SUA_CHAVE"
```

### Teste Unitário

```go
func TestValidateNumberWithPastorini(t *testing.T) {
    client := NewClient("https://api-test.com", "test-key")
    
    exists, jid, err := client.ValidateNumberWithPastorini(
        "test-instance",
        "5511999999999",
    )
    
    assert.NoError(t, err)
    assert.True(t, exists)
    assert.Equal(t, "5511999999999@s.whatsapp.net", jid)
}
```

## Recursos Adicionais

### Documentação Pastorini API
- Documentação completa: `planejamento/Documentação da papi`
- Endpoint de validação: `/api/instances/:id/check-number/:phone`
- Painel web: Configurado via `PANEL_API_KEY`

### Suporte
- Issues: GitHub Issues
- Documentação: `/docs`
- API Pastorini: Contato direto com suporte

---

**Versão**: 1.0.0  
**Última Atualização**: Março 2024  
**Compatível com**: Pastorini API v1.6+
