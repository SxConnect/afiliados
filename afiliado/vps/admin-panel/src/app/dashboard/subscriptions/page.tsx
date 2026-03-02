'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, Search, Filter, TrendingUp } from 'lucide-react'

interface Subscription {
    id: string
    user_phone: string
    user_name: string
    plan_name: string
    license_key: string
    provider: string
    external_id: string
    status: string
    billing_cycle: string
    amount: number
    currency: string
    next_billing_date: string
    created_at: string
}

interface Stats {
    total_subscriptions: number
    active_subscriptions: number
    cancelled_subscriptions: number
    paused_subscriptions: number
    mercadopago_count: number
    stripe_count: number
    manual_count: number
    monthly_recurring_revenue: number
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState({
        status: '',
        provider: '',
        search: '',
    })

    useEffect(() => {
        loadData()
    }, [filter])

    const loadData = async () => {
        try {
            const [subsResponse, statsResponse] = await Promise.all([
                api.get('/admin/subscriptions', { params: filter }),
                api.get('/admin/subscriptions/statistics'),
            ])
            setSubscriptions(subsResponse.data.subscriptions)
            setStats(statsResponse.data.stats)
        } catch (error) {
            console.error('Error loading subscriptions:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
            paused: 'bg-gray-100 text-gray-800',
            expired: 'bg-red-100 text-red-800',
            failed: 'bg-red-100 text-red-800',
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getProviderColor = (provider: string) => {
        const colors: Record<string, string> = {
            mercadopago: 'bg-blue-100 text-blue-800',
            stripe: 'bg-purple-100 text-purple-800',
            manual: 'bg-gray-100 text-gray-800',
        }
        return colors[provider] || 'bg-gray-100 text-gray-800'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Carregando...</div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Assinaturas</h1>
                <p className="text-gray-600 mt-1">Gerenciar assinaturas e pagamentos</p>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_subscriptions}</p>
                            </div>
                            <CreditCard className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Ativas</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active_subscriptions}</p>
                            </div>
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-bold">✓</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Canceladas</p>
                                <p className="text-2xl font-bold text-red-600">{stats.cancelled_subscriptions}</p>
                            </div>
                            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-bold">✕</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">MRR</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(stats.monthly_recurring_revenue)}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-blue-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    >
                        <option value="">Todos os status</option>
                        <option value="active">Ativa</option>
                        <option value="pending">Pendente</option>
                        <option value="cancelled">Cancelada</option>
                        <option value="paused">Pausada</option>
                    </select>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filter.provider}
                        onChange={(e) => setFilter({ ...filter, provider: e.target.value })}
                    >
                        <option value="">Todos os provedores</option>
                        <option value="mercadopago">Mercado Pago</option>
                        <option value="stripe">Stripe</option>
                        <option value="manual">Manual</option>
                    </select>
                    <button
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                        onClick={() => setFilter({ status: '', provider: '', search: '' })}
                    >
                        <Filter className="h-5 w-5" />
                        Limpar
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuário
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plano
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Provedor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Próximo Pagamento
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {subscriptions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{sub.user_name}</div>
                                        <div className="text-sm text-gray-500">{sub.user_phone}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{sub.plan_name}</div>
                                    <div className="text-xs text-gray-500">{sub.billing_cycle}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getProviderColor(
                                            sub.provider
                                        )}`}
                                    >
                                        {sub.provider}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                            sub.status
                                        )}`}
                                    >
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(sub.amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(sub.next_billing_date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900">Ver</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {subscriptions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma assinatura</h3>
                    <p className="mt-1 text-sm text-gray-500">Nenhuma assinatura encontrada com os filtros aplicados.</p>
                </div>
            )}
        </div>
    )
}
