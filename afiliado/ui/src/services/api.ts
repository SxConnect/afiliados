import axios from 'axios';
import { useAuthStore } from '@store/authStore';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Serviços de API
export const licenseService = {
    validate: async (phoneNumber: string, instanceId?: string) => {
        const { data } = await api.post('/license/validate', {
            phoneNumber,
            instanceId: instanceId || 'default-instance'
        });
        return data;
    },

    getStatus: async () => {
        const { data } = await api.get('/license/status');
        return data;
    },
};

export const whatsappService = {
    createInstance: async (instanceId: string) => {
        const { data } = await api.post('/whatsapp/instance/create', { instanceId });
        return data;
    },

    getQRCode: async (instanceId: string) => {
        const { data } = await api.get(`/whatsapp/instance/${instanceId}/qr`);
        return data;
    },

    getStatus: async (instanceId: string) => {
        const { data } = await api.get(`/whatsapp/instance/${instanceId}/status`);
        return data;
    },

    sendText: async (instanceId: string, jid: string, text: string) => {
        const { data } = await api.post('/whatsapp/send/text', {
            instanceId,
            jid,
            text,
        });
        return data;
    },

    sendImage: async (instanceId: string, jid: string, url: string, caption?: string) => {
        const { data } = await api.post('/whatsapp/send/image', {
            instanceId,
            jid,
            url,
            caption,
        });
        return data;
    },

    sendButtons: async (
        instanceId: string,
        jid: string,
        text: string,
        buttons: any[],
        footer?: string
    ) => {
        const { data } = await api.post('/whatsapp/send/buttons', {
            instanceId,
            jid,
            text,
            buttons,
            footer,
        });
        return data;
    },

    deleteInstance: async (instanceId: string) => {
        const { data } = await api.delete(`/whatsapp/instance/${instanceId}`);
        return data;
    },
};

export const pluginService = {
    list: async () => {
        const { data } = await api.get('/plugins');
        return data;
    },

    execute: async (pluginId: string, action: string, params: any) => {
        const { data } = await api.post(`/plugins/${pluginId}/execute`, {
            action,
            params,
        });
        return data;
    },
};

export const metricsService = {
    getQuota: async () => {
        const { data } = await api.get('/metrics/quota');
        return data;
    },

    getSystem: async () => {
        const { data } = await api.get('/metrics/system');
        return data;
    },
};
