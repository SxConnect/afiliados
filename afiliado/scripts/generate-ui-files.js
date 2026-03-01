const fs = require('fs');
const path = require('path');

// Criar diretórios
const dirs = [
    'ui/src/types',
    'ui/src/hooks',
    'ui/src/utils',
    'ui/public',
    'ui/assets'
];

dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Criado: ${dir}`);
    }
});

// Criar arquivos TypeScript
const files = {
    'ui/src/types/index.ts': `export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  category: string;
  requiredPlan: string;
  enabled: boolean;
  locked: boolean;
  permissions: string[];
  actions: PluginAction[];
}

export interface PluginAction {
  id: string;
  name: string;
  params?: Record<string, string>;
}

export interface WhatsAppInstance {
  id: string;
  status: string;
  name?: string;
  phoneNumber?: string;
}

export interface QuotaInfo {
  total: number;
  used: number;
  available: number;
}

export interface SystemMetrics {
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  uptime: number;
  platform: string;
  nodeVersion: string;
}
`,

    'ui/src/hooks/useWhatsApp.ts': `import { useState, useCallback } from 'react';
import { whatsappService } from '@services/api';
import { toast } from 'react-hot-toast';

export function useWhatsApp() {
  const [loading, setLoading] = useState(false);

  const createInstance = useCallback(async (instanceId: string) => {
    setLoading(true);
    try {
      const data = await whatsappService.createInstance(instanceId);
      if (data.success) {
        toast.success('Instância criada!');
        return data;
      }
      toast.error(data.error);
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getQRCode = useCallback(async (instanceId: string) => {
    setLoading(true);
    try {
      const data = await whatsappService.getQRCode(instanceId);
      return data.success ? data.qrImage : null;
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (
    instanceId: string,
    jid: string,
    text: string
  ) => {
    setLoading(true);
    try {
      const data = await whatsappService.sendText(instanceId, jid, text);
      if (data.success) {
        toast.success('Mensagem enviada!');
        return true;
      }
      toast.error(data.error);
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createInstance,
    getQRCode,
    sendMessage,
  };
}
`,

    'ui/src/utils/cn.ts': `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,

    'ui/src/utils/format.ts': `export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return \`\${hours}h \${minutes}m\`;
  }
  if (minutes > 0) {
    return \`\${minutes}m \${secs}s\`;
  }
  return \`\${secs}s\`;
}
`,

    'ui/public/vite.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>`
};

Object.entries(files).forEach(([filePath, content]) => {
    const fullPath = path.join(__dirname, '..', filePath);
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Criado: ${filePath}`);
});

console.log('\n🎉 Todos os arquivos da UI foram criados!');
