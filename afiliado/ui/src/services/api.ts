import axios from 'axios';
import { ValidationResponse, QuotaStatus } from '../../../shared/types';

const API_BASE = 'http://localhost:8080/api/v1';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (phone: string): Promise<ValidationResponse> => {
    const response = await api.post('/login', { phone });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

export const getStatus = async () => {
    const response = await api.get('/status');
    return response.data;
};

export const getQuota = async (): Promise<QuotaStatus> => {
    const response = await api.get('/quota');
    return response.data;
};

export const getPlugins = async () => {
    const response = await api.get('/plugins');
    return response.data;
};

export const validateAction = async (action: string) => {
    const response = await api.post('/validate-action', { action });
    return response.data;
};

export default api;
