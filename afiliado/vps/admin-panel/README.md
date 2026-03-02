# Admin Panel - Sistema de Licenças

Painel administrativo construído com Next.js 14, React 18 e TypeScript.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **React Hook Form** - Formulários
- **Recharts** - Gráficos
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

## 📁 Estrutura

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── dashboard/         # Páginas do dashboard
│   │   ├── page.tsx       # Dashboard principal
│   │   ├── users/         # Gerenciar usuários
│   │   ├── plans/         # Gerenciar planos
│   │   ├── licenses/      # Gerenciar licenças
│   │   ├── subscriptions/ # Gerenciar assinaturas
│   │   └── audit-logs/    # Logs de auditoria
│   ├── login/             # Página de login
│   ├── layout.tsx         # Layout raiz
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── Sidebar.tsx        # Menu lateral
│   └── DashboardLayout.tsx # Layout do dashboard
├── lib/                   # Utilitários
│   ├── api.ts            # Cliente API (Axios)
│   └── utils.ts          # Funções auxiliares
└── store/                # Estado global
    └── authStore.ts      # Store de autenticação
```

## 🎨 Páginas Implementadas

### ✅ Dashboard
- Métricas gerais (usuários, licenças, receita)
- Alertas de atividades suspeitas
- Cards com estatísticas

### ✅ Usuários
- Listagem com paginação
- Busca e filtros
- CRUD completo
- Visualização de licenças por usuário

### ✅ Planos
- Grid de cards com planos
- Informações de preço e features
- Estatísticas de uso
- Gerenciamento de plugins

### ✅ Licenças
- Tabela com filtros avançados
- Status e datas de expiração
- Ações (suspender, reativar, reset quota)
- Visualização de máquinas vinculadas

### ✅ Assinaturas
- Listagem com filtros
- Estatísticas (MRR, distribuição)
- Filtros por status e provider
- Ações de gerenciamento

### ✅ Audit Logs
- Histórico completo de ações
- Filtros por ator, ação, recurso
- Paginação
- Visualização de detalhes

### ✅ Login
- Autenticação com JWT
- Suporte a 2FA (preparado)
- Persistência de sessão

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com a URL da API

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start
```

## 🌐 Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
```

## 🐳 Docker

### Build
```bash
docker build -t admin-panel:latest .
```

### Run
```bash
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL=http://api-admin:4001 \
  admin-panel:latest
```

## 🔐 Autenticação

O painel usa JWT para autenticação. O token é armazenado no localStorage e enviado em todas as requisições via interceptor do Axios.

### Fluxo de Login
1. Usuário envia email/senha
2. API retorna token JWT + dados do admin
3. Token é armazenado no localStorage
4. Todas as requisições incluem o token no header Authorization

### Logout
- Remove token do localStorage
- Redireciona para /login

### Proteção de Rotas
- Middleware verifica token em todas as páginas do dashboard
- Se token inválido/expirado, redireciona para login

## 📊 Componentes Principais

### Sidebar
- Menu de navegação
- Informações do usuário logado
- Botão de logout
- Highlight da página ativa

### DashboardLayout
- Layout padrão com Sidebar
- Área de conteúdo responsiva
- Proteção de autenticação

### API Client (lib/api.ts)
- Instância configurada do Axios
- Interceptor para adicionar token
- Interceptor para tratar erros 401
- Base URL configurável

### Auth Store (store/authStore.ts)
- Estado global de autenticação
- Funções de login/logout
- Persistência no localStorage
- Tipagem TypeScript

## 🎨 Estilização

### Tailwind CSS
- Utility-first CSS framework
- Configuração customizada
- Classes responsivas
- Dark mode preparado

### Cores
- Primary: Blue (600)
- Success: Green (500)
- Warning: Yellow (500)
- Danger: Red (500)
- Gray scale para textos e backgrounds

## 📱 Responsividade

- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Grid responsivo
- Tabelas com scroll horizontal em mobile

## 🚀 Próximas Implementações

### Modais
- [ ] Modal de criação de usuário
- [ ] Modal de edição de plano
- [ ] Modal de detalhes de licença
- [ ] Modal de confirmação de ações

### Formulários
- [ ] Formulário de criação de plano
- [ ] Formulário de edição de usuário
- [ ] Formulário de criação de licença
- [ ] Validação com React Hook Form

### Gráficos
- [ ] Gráfico de receita (30 dias)
- [ ] Gráfico de crescimento de usuários
- [ ] Gráfico de distribuição de planos
- [ ] Gráfico de atividades

### Funcionalidades
- [ ] Exportar dados (CSV, Excel)
- [ ] Notificações em tempo real
- [ ] Busca global
- [ ] Temas (light/dark)
- [ ] Configurações de perfil
- [ ] 2FA completo

## 📝 Convenções de Código

### TypeScript
- Interfaces para tipos complexos
- Type inference quando possível
- Strict mode habilitado

### React
- Functional components
- Hooks para estado e efeitos
- Props tipadas

### Nomenclatura
- Componentes: PascalCase
- Funções: camelCase
- Constantes: UPPER_SNAKE_CASE
- Arquivos: kebab-case ou PascalCase

## 🧪 Testes (Futuro)

```bash
# Rodar testes
npm test

# Cobertura
npm run test:coverage
```

## 📚 Documentação

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

## 🤝 Contribuindo

1. Clone o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT
