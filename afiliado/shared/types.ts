// Tipos compartilhados entre UI e Core

export interface User {
    id: string;
    phone: string;
    plan: PlanType;
    quotaUsed: number;
    quotaLimit: number;
    activePlugins: string[];
    fingerprint: string;
}

export enum PlanType {
    FREE = 'free',
    BASE = 'base',
    GROWTH = 'growth',
    PRO = 'pro'
}

export interface PlanConfig {
    name: string;
    videoLimit: number;
    pluginLimit: number;
    features: string[];
}

export interface Plugin {
    id: string;
    name: string;
    version: string;
    enabled: boolean;
    requiresPlan: PlanType;
}

export interface SessionToken {
    token: string;
    expiresAt: number;
    signature: string;
}

export interface ValidationResponse {
    valid: boolean;
    user: User;
    token: SessionToken;
    plugins: Plugin[];
}

export interface QuotaStatus {
    used: number;
    limit: number;
    remaining: number;
    resetDate: string;
}

export interface APIConfig {
    groqKey?: string;
    openaiKey?: string;
}
