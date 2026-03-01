export interface Plugin {
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
