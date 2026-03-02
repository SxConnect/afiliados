'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Users, Key, CreditCard, DollarSign, AlertTriangle } from 'lucide-react'

interface Metrics {
    total_users: number
    active_licenses: number
    active_subscriptions: number
    revenue_30d: number
    unresolved_suspicious: number
    new_users_today: number
    new_licenses_today: number
    revenue_today: number
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadMetrics()
    }, [])

    const loadMetrics = async () => {
        try {
            const response = await api.get('/admin/dashboard/metrics')
            setMetrics(response.data.metrics)
        } catch (error) {
            console.error('Error loading metrics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Carregando...</div>
            </div>
        )
    }

    const stats = [
        {
            name: 'Total de Usuários',
            value: formatNumber(metrics?.total_users || 0),
            icon: Users,
            color: 'bg-blue-500',
            change: `+${metrics?.new_users_today || 0} hoje`,
        },
        {
            name: 'Licenças Ativas',
            value: formatNumber(metrics?.active_licenses || 0),
            icon: Key,
            color: 'bg-green-500',
            change: `+${metrics?.new_licenses_today || 0} hoje`,
        },
        {
            name: 'Assinaturas Ativas',
            value: formatNumber(metrics?.active_subscriptions || 0),
            icon: CreditCard,
            color: 'bg-purple-500',
        },
        {
            name: 'Receita (30 dias)',
            value: formatCurrency(metrics?.revenue_30d || 0),
            icon: DollarSign,
            color: 'bg-yellow-500',
            change: formatCurrency(metrics?.revenue_today || 0) + ' hoje',
        },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Visão geral do sistema</p>
            </div>

            {metrics?.unresolved_suspicious > 0 && (
                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Existem <strong>{metrics.unresolved_suspicious}</strong> atividades suspeitas não resolvidas.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                                        </dd>
                                        {stat.change && (
                                            <dd className="text-sm text-gray-600 mt-1">{stat.change}</dd>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Atividade Recente</h2>
                    <p className="text-gray-500 text-sm">Implementar gráfico de atividades</p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Distribuição de Planos</h2>
                    <p className="text-gray-500 text-sm">Implementar gráfico de distribuição</p>
                </div>
            </div>
        </div>
    )
}
