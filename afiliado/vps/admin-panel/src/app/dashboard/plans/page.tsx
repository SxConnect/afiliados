'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit, Trash2, Package } from 'lucide-react'

interface Plan {
    id: string
    name: string
    slug: string
    description: string
    price_monthly: number
    price_yearly: number
    quota_monthly: number
    max_machines: number
    features: string[]
    is_active: boolean
    license_count: number
    subscription_count: number
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPlans()
    }, [])

    const loadPlans = async () => {
        try {
            const response = await api.get('/admin/plans?includeInactive=true')
            setPlans(response.data.plans)
        } catch (error) {
            console.error('Error loading plans:', error)
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

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Planos</h1>
                    <p className="text-gray-600 mt-1">Gerenciar planos de assinatura</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Novo Plano
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 rounded-lg p-2">
                                        <Package className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                        <p className="text-sm text-gray-500">{plan.slug}</p>
                                    </div>
                                </div>
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${plan.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {plan.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{plan.description}</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Mensal:</span>
                                    <span className="font-semibold text-gray-900">
                                        {formatCurrency(plan.price_monthly)}
                                    </span>
                                </div>
                                {plan.price_yearly && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Anual:</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(plan.price_yearly)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Quota Mensal:</span>
                                    <span className="font-semibold text-gray-900">
                                        {plan.quota_monthly.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Máquinas:</span>
                                    <span className="font-semibold text-gray-900">{plan.max_machines}</span>
                                </div>
                            </div>

                            <div className="border-t pt-4 mb-4">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{plan.license_count}</div>
                                        <div className="text-xs text-gray-500">Licenças</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {plan.subscription_count}
                                        </div>
                                        <div className="text-xs text-gray-500">Assinaturas</div>
                                    </div>
                                </div>
                            </div>

                            {plan.features && plan.features.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Features:</p>
                                    <ul className="space-y-1">
                                        {plan.features.slice(0, 3).map((feature, index) => (
                                            <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                                                <span className="text-green-500">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                        {plan.features.length > 3 && (
                                            <li className="text-xs text-gray-500">
                                                +{plan.features.length - 3} mais...
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 flex items-center justify-center gap-2 text-sm">
                                    <Edit className="h-4 w-4" />
                                    Editar
                                </button>
                                <button className="bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 flex items-center justify-center gap-2 text-sm">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {plans.length === 0 && (
                <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum plano</h3>
                    <p className="mt-1 text-sm text-gray-500">Comece criando um novo plano.</p>
                    <div className="mt-6">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto">
                            <Plus className="h-5 w-5" />
                            Novo Plano
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
