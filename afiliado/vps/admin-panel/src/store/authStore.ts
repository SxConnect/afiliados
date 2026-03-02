import { create } from 'zustand'
import api from '@/lib/api'

interface Admin {
    id: string
    email: string
    name: string
    role: string
    two_factor_enabled: boolean
}

interface AuthState {
    admin: Admin | null
    token: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    loadFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    admin: null,
    token: null,
    isLoading: false,

    login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
            const response = await api.post('/admin/auth/login', { email, password })
            const { token, admin } = response.data

            localStorage.setItem('admin_token', token)
            localStorage.setItem('admin_user', JSON.stringify(admin))

            set({ admin, token, isLoading: false })
        } catch (error) {
            set({ isLoading: false })
            throw error
        }
    },

    logout: () => {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        set({ admin: null, token: null })
    },

    loadFromStorage: () => {
        const token = localStorage.getItem('admin_token')
        const adminStr = localStorage.getItem('admin_user')

        if (token && adminStr) {
            const admin = JSON.parse(adminStr)
            set({ admin, token })
        }
    },
}))
