# Admin Panel - VPS License Server

Painel administrativo Next.js para gerenciamento do servidor de licenças.

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Ou usar yarn
yarn install
```

## 🔧 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento (porta 3001)
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start
```

## 📝 Nota sobre Erros TypeScript

Se você ver erros TypeScript no editor antes de instalar as dependências, isso é normal. Execute `npm install` para resolver.

## 🏗️ Estrutura

```
src/
├── app/              # Next.js App Router
│   ├── dashboard/    # Páginas do dashboard
│   ├── login/        # Página de login
│   └── layout.tsx    # Layout principal
├── components/       # Componentes React
├── lib/             # Utilitários e API client
└── store/           # Estado global (Zustand)
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📦 Dependências Principais

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Axios (HTTP client)
- Lucide React (ícones)
- Recharts (gráficos)

## 🚀 Deploy

O admin panel pode ser deployado junto com o VPS server ou separadamente.

### Opção 1: Docker (Recomendado)

```bash
# Build da imagem
docker build -t admin-panel .

# Executar
docker run -p 3001:3001 admin-panel
```

### Opção 2: Node.js

```bash
# Build
npm run build

# Iniciar
npm start
```

## 📚 Documentação

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
