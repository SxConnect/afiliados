# Modelo de Segurança

## Objetivo

Tornar o crack economicamente inviável através de múltiplas camadas de proteção.

## Camadas de Segurança

### 1. Assinatura Criptográfica

#### Chaves RSA
- Chave privada: Apenas na VPS
- Chave pública: Distribuída com o Core
- Algoritmo: RSA-2048 + SHA-256

#### Fluxo
1. VPS gera token de sessão
2. VPS assina token com chave privada
3. Core recebe token + assinatura
4. Core verifica com chave pública
5. Token inválido = bloqueio

### 2. Validação Remota Obrigatória

#### Pontos de Validação
- Login inicial
- Antes de cada geração
- Verificação periódica (a cada 1h)
- Ao ativar plugins

#### Modo Offline
- Apenas funcionalidades Free
- Quota limitada (10 vídeos)
- Sem plugins
- Métricas básicas

### 3. Fingerprint da Máquina

#### Componentes
```go
fingerprint = SHA256(
  OS + 
  Arquitetura + 
  Hostname + 
  MAC Address (futuro)
)
```

#### Validação
- Fingerprint enviado no login
- VPS vincula licença ao fingerprint
- Mudança de máquina = bloqueio
- Reativação manual necessária

### 4. Controle de Quota Remoto

#### Armazenamento
- Quota NUNCA armazenada localmente
- Apenas na VPS
- Verificação obrigatória antes de uso

#### Fluxo
1. Usuário solicita geração
2. Core consulta VPS
3. VPS verifica quota disponível
4. VPS autoriza ou nega
5. Core executa apenas se autorizado
6. VPS incrementa contador

### 5. Tokens Temporários

#### Características
- Validade: 24 horas
- Renovação automática
- Assinados criptograficamente
- Vinculados ao fingerprint

#### Estrutura
```json
{
  "token": "hex-string",
  "expiresAt": timestamp,
  "signature": "base64-signature",
  "fingerprint": "sha256-hash"
}
```

### 6. Plugins Remotamente Controlados

#### Ativação
- Lista de plugins vem da VPS
- Core verifica permissão antes de carregar
- Plugin não autorizado = não carrega

#### Desativação Remota
- VPS pode desativar plugin a qualquer momento
- Próxima validação bloqueia acesso

### 7. Obfuscação (Camada Adicional)

#### UI
- Código minificado
- Variáveis ofuscadas
- Strings codificadas

#### Core
- Build com flags de otimização
- Strip de símbolos de debug
- Compressão UPX (opcional)

```bash
go build -ldflags="-s -w" -o core.exe
upx --best core.exe
```

### 8. Verificação de Integridade

#### Hash do Executável
- VPS armazena hash do executável oficial
- Core envia hash na validação
- Hash diferente = versão modificada

#### Implementação Futura
```go
func verifyIntegrity() bool {
  exe, _ := os.Executable()
  hash := sha256File(exe)
  return vps.ValidateHash(hash)
}
```

## Proteções Contra Ataques

### Man-in-the-Middle
- HTTPS obrigatório
- Certificate pinning (futuro)
- Assinatura de todas as respostas

### Replay Attack
- Tokens com timestamp
- Nonce único por requisição
- Janela de validade curta

### Reverse Engineering
- Ofuscação de código
- Anti-debug (futuro)
- Verificação de ambiente

### Quota Bypass
- Quota apenas na VPS
- Verificação antes de cada uso
- Logs de todas as tentativas

### Plugin Pirata
- Assinatura de plugins
- Verificação de hash
- Marketplace controlado

## Monitoramento

### Logs de Segurança
```javascript
{
  "event": "validation_failed",
  "userId": "...",
  "fingerprint": "...",
  "reason": "invalid_signature",
  "timestamp": "...",
  "ip": "..."
}
```

### Alertas
- Múltiplas tentativas de validação
- Fingerprint duplicado
- Quota excedida repetidamente
- Hash inválido

## Limitações Conhecidas

### Não Previne 100%
- Nenhum sistema é inquebrável
- Objetivo: tornar inviável economicamente

### Depende de Conexão
- Modo offline limitado
- Usuários sem internet prejudicados

### Fingerprint Pode Mudar
- Reinstalação do OS
- Troca de hardware
- Requer suporte manual

## Evolução Futura

### Hardware Security
- TPM integration
- Secure Enclave
- Hardware tokens

### Blockchain
- Licenças em blockchain
- Smart contracts
- Prova de propriedade

### Machine Learning
- Detecção de padrões anômalos
- Identificação de bots
- Análise comportamental
