# Sistema de Plugins

## Visão Geral

O sistema de plugins permite extensão modular do software com funcionalidades pagas.

## Estrutura de um Plugin

```
plugins/
└── meu-plugin/
    ├── manifest.json
    ├── index.js
    ├── README.md
    └── assets/
        └── icon.png
```

## Manifest.json

```json
{
  "id": "meu-plugin",
  "name": "Meu Plugin",
  "version": "1.0.0",
  "description": "Descrição do plugin",
  "author": "Nome do Autor",
  "requiresPlan": "base",
  "entryPoint": "index.js",
  "permissions": [
    "api.llm",
    "storage.local"
  ],
  "dependencies": []
}
```

## Campos do Manifest

- `id`: Identificador único (kebab-case)
- `name`: Nome exibido
- `version`: Versão semântica
- `description`: Descrição curta
- `author`: Autor do plugin
- `requiresPlan`: Plano mínimo (free, base, growth, pro)
- `entryPoint`: Arquivo principal
- `permissions`: Permissões necessárias
- `dependencies`: Outros plugins necessários

## Criando um Plugin

### 1. Estrutura Básica

```javascript
// index.js
module.exports = {
  name: 'Meu Plugin',
  version: '1.0.0',
  
  // Inicialização
  async init(context) {
    console.log('Plugin inicializado');
    this.context = context;
  },
  
  // Métodos públicos
  async execute(params) {
    // Lógica do plugin
    return { success: true };
  },
  
  // Limpeza
  async destroy() {
    console.log('Plugin destruído');
  }
};
```

### 2. Context API

O objeto `context` fornece acesso a:

```javascript
{
  // Configuração do usuário
  user: {
    id: string,
    plan: string,
    quota: number
  },
  
  // APIs do sistema
  api: {
    llm: LLMClient,
    storage: StorageClient,
    http: HttpClient
  },
  
  // Eventos
  events: EventEmitter,
  
  // Logger
  logger: Logger
}
```

## Exemplo Completo

```javascript
// plugins/analytics/index.js
module.exports = {
  name: 'Analytics Avançado',
  version: '1.0.0',
  
  async init(context) {
    this.context = context;
    this.storage = context.api.storage;
    
    // Carregar dados salvos
    this.data = await this.storage.get('analytics') || {};
  },
  
  async trackEvent(event) {
    if (!this.data[event.type]) {
      this.data[event.type] = [];
    }
    
    this.data[event.type].push({
      timestamp: Date.now(),
      ...event
    });
    
    await this.storage.set('analytics', this.data);
    
    return { success: true };
  },
  
  async getReport(type, period) {
    const events = this.data[type] || [];
    const filtered = events.filter(e => 
      e.timestamp >= period.start && 
      e.timestamp <= period.end
    );
    
    return {
      total: filtered.length,
      events: filtered
    };
  },
  
  async destroy() {
    await this.storage.flush();
  }
};
```

## Permissões

### api.llm
Acesso às APIs de LLM (Groq/OpenAI)

### storage.local
Armazenamento local persistente

### storage.cloud
Sincronização cloud (futuro)

### network.http
Requisições HTTP externas

## Validação

O Core valida:
1. Manifest válido
2. Plano do usuário
3. Permissões necessárias
4. Dependências instaladas

## Distribuição

### Marketplace (Futuro)
- Upload de plugins
- Revisão de código
- Versionamento automático
- Sistema de pagamento

### Manual
1. Criar pasta em `plugins/`
2. Adicionar manifest.json
3. Implementar index.js
4. Reiniciar aplicação

## Boas Práticas

1. Sempre validar entrada
2. Tratar erros adequadamente
3. Limpar recursos no destroy
4. Documentar API pública
5. Versionar corretamente
6. Testar em diferentes planos

## Debugging

```javascript
// Usar logger do context
context.logger.info('Mensagem');
context.logger.error('Erro', error);
context.logger.debug('Debug', data);
```

## Limitações

- Plugins não podem acessar sistema de arquivos diretamente
- Requisições HTTP limitadas por rate
- Armazenamento limitado por plano
- Sem acesso a processos do sistema
