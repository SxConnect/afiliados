import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    phoneNumber: string;
    plan: string;
    quota: {
        total: number;
        used: number;
        available: number;
    };
    plugins: string[];
}

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateQuota: (used: number) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            token: null,
            user: null,

            login: (token, user) => {
                set({
                    isAuthenticated: true,
                    token,
                    user,
                });
            },

            logout: () => {
                set({
                    isAuthenticated: false,
                    token: null,
                    user: null,
                });
            },

            updateQuota: (used) => {
                set((state) => {
                    if (!state.user) return state;
                    return {
                        user: {
                            ...state.user,
                            quota: {
                                ...state.user.quota,
                                used,
                                available: state.user.quota.total - used,
                            },
                        },
                    };
                });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
