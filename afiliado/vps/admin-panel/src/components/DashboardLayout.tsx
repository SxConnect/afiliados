'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Sidebar from './Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { admin, loadFromStorage } = useAuthStore()

    useEffect(() => {
        loadFromStorage()
    }, [loadFromStorage])

    useEffect(() => {
        if (!admin) {
            router.push('/login')
        }
    }, [admin, router])

    if (!admin) {
        return null
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <main className="p-6">{children}</main>
            </div>
        </div>
    )
}
