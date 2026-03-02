'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Key,
    Package,
    FileText,
    LogOut
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Usuários', href: '/dashboard/users', icon: Users },
    { name: 'Planos', href: '/dashboard/plans', icon: Package },
    { name: 'Licenças', href: '/dashboard/licenses', icon: Key },
    { name: 'Assinaturas', href: '/dashboard/subscriptions', icon: CreditCard },
    { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: FileText },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { admin, logout } = useAuthStore()

    return (
        <div className="flex flex-col w-64 bg-gray-900 h-screen">
            <div className="flex items-center justify-center h-16 bg-gray-800">
                <h1 className="text-white text-xl font-bold">Admin Panel</h1>
            </div>

            <div className="flex-1 overflow-y-auto">
                <nav className="px-2 py-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                )}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 bg-gray-800">
                <div className="flex items-center mb-3">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white">{admin?.name}</p>
                        <p className="text-xs text-gray-400">{admin?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sair
                </button>
            </div>
        </div>
    )
}
