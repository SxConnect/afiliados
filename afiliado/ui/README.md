# 🎨 UI - Sistema Afiliados

Interface gráfica moderna construída com Electron + React + TypeScript.

## 🛠️ Tecnologias

- **Electron 28** - Framework desktop
- **React 18** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 3** - Estilização
- **Vite 5** - Build tool
- **Zustand** - State management
- **React Router 6** - Roteamento
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações

## 📁 Estrutura

```
ui/
├── electron/
│   ├── main.js          # Processo principal Electron
│   └── preload.js       # Script de preload
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── pages/           # Páginas da aplicação
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── PluginsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/        # Serviços de API
│   │   └── api.ts
│   ├── store/           # Estado global
│   │   └── authStore.ts
│   ├── types/           # Tipos TypeScript
│   │   └── index.ts
│   ├── hooks/           # Custom hooks
│   │   └── useWhatsApp.ts
│   ├── utils/           # Utilitários
│   │   ├── cn.ts
│   │   └── format.ts
│   ├── App.tsx          # Componente raiz
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globais
├── public/              # Arquivos estáticos
├── index.html           # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🚀 Desenvolvimento

### Instalar Dependências

```bash
npm install
```

### Iniciar em Desenvolvimento

```bash
# Apenas React (navegador)
npm run dev:react

# Electron completo
npm run dev
```

### Build

```bash
# Build da UI
npm run build

# Build do Electron (executável)
npm run build:electron
```

## 📄 Páginas

### 1. Login (`/login`)

- Autenticação via número WhatsApp
- Validação de licença
- 3 licenças de teste pré-configuradas
- Design moderno com gradiente

### 2. Dashboard (`/`)

- Estatísticas em cards
- Conexão WhatsApp (QR Code)
- Envio de mensagens de teste
- Métricas do sistema em tempo real

### 3. Plugins (`/plugins`)

- Lista de plugins disponíveis
- Status (ativo/bloqueado)
- Informações detalhadas
- Indicador de plano necessário

### 4. Settings (`/settings`)

- Informações da conta
- Configurações PAPI API
- Preferências do sistema
- Segurança (fingerprint, token)

## 🎨 Design System

### Cores

```css
/* Primary */
--primary-500: #0ea5e9;
--primary-600: #0284c7;
--primary-700: #0369a1;

/* Dark */
--dark-700: #334155;
--dark-800: #1e293b;
--dark-900: #0f172a;
```

### Componentes

```tsx
// Botões
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>

// Inputs
<input className="input" />

// Cards
<div className="card">Content</div>

// Glass effect
<div className="glass">Content</div>
```

## 🔌 API Integration

### Configuração

```typescript
// src/services/api.ts
const API_BASE_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Uso

```typescript
import { whatsappService } from '@services/api';

// Criar instância
const data = await whatsappService.createInstance('my-instance');

// Enviar mensagem
await whatsappService.sendText(
  'my-instance',
  '5511999999999@s.whatsapp.net',
  'Hello!'
);
```

## 📦 State Management

### Zustand Store

```typescript
import { useAuthStore } from '@store/authStore';

function Component() {
  const { user, login, logout } = useAuthStore();
  
  return (
    <div>
      <p>{user?.phoneNumber}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🎯 Custom Hooks

### useWhatsApp

```typescript
import { useWhatsApp } from '@hooks/useWhatsApp';

function Component() {
  const { loading, createInstance, sendMessage } = useWhatsApp();
  
  const handleSend = async () => {
    await sendMessage('instance-id', 'jid', 'message');
  };
  
  return <button onClick={handleSend}>Send</button>;
}
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Cobertura
npm run test:coverage
```

## 📱 Build Electron

### Windows

```bash
npm run build:electron
# Output: dist-electron/Sistema Afiliados Setup.exe
```

### macOS

```bash
npm run build:electron
# Output: dist-electron/Sistema Afiliados.dmg
```

### Linux

```bash
npm run build:electron
# Output: dist-electron/Sistema Afiliados.AppImage
```

## 🔧 Configuração

### electron-builder

```json
{
  "build": {
    "appId": "com.afiliado.app",
    "productName": "Sistema Afiliados",
    "win": {
      "target": ["nsis"],
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": ["AppImage"],
      "icon": "assets/icon.png"
    }
  }
}
```

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 5173 already in use"

```bash
# Matar processo
lsof -ti:5173 | xargs kill -9
```

### Electron não inicia

```bash
# Verificar logs
npm run dev:electron 2>&1 | tee electron.log
```

## 📚 Recursos

- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Electron Docs](https://www.electronjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Docs](https://vitejs.dev/)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Proprietary - Todos os direitos reservados
