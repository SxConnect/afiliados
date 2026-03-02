'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { FileText, Search, Filter } from 'lucide-react'

interface AuditLog {
    id: string
    actor_type: string
    actor_id: string
    actor_name: string
    action: string
    resource_type: string
    resource_id: string
    changes: any
    ip_address: string
    created_at: string
}

interface Pagination {
    total: number
    limit: number
    offset: number
    pages: number
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        limit: 50,
        offset: 0,
        pages: 0,
    })
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState({
        actorType: '',
        action: '',
        resourceType: '',
        search: '',
    })

    useEffect(() => {
        loadLogs()
    }, [filter, pagination.offset])

    const loadLogs = async () => {
        try {
            const response = await api.get('/admin/audit-logs', {
                params: {
                    ...filter,
                    limit: pagination.limit,
                    offset: pagination.offset,
                },
            })
            setLogs(response.data.logs)
            setPagination(response.data.pagination)
        } catch (error) {
            console.error('Error loading audit logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const getActionColor = (action: string) => {
        const colors: Record<string, string> = {
            create: 'bg-green-100 text-green-800',
            update: 'bg-blue-100 text-blue-800',
            delete: 'bg-red-100 text-red-800',
            suspend: 'bg-yellow-100 text-yellow-800',
            reactivate: 'bg-green-100 text-green-800',
            cancel: 'bg-red-100 text-red-800',
        }
        return colors[action] || 'bg-gray-100 text-gray-800'
    }

    const getActorTypeColor = (actorType: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-800',
            user: 'bg-blue-100 text-blue-800',
            system: 'bg-gray-100 text-gray-800',
        }
        return colors[actorType] || 'bg-gray-100 text-gray-800'
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
                <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
                <p className="text-gray-600 mt-1">Histórico de ações no sistema</p>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                        value={filter.actorType}
                        onChange={(e) => setFilter({ ...filter, actorType: e.target.value })}
                    >
                        <option value="">Todos os atores</option>
                        <option value="admin">Admin</option>
                        <option value="user">Usuário</option>
                        <option value="system">Sistema</option>
                    </select>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filter.action}
                        onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                    >
                        <option value="">Todas as ações</option>
                        <option value="create">Criar</option>
                        <option value="update">Atualizar</option>
                        <option value="delete">Deletar</option>
                        <option value="suspend">Suspender</option>
                        <option value="reactivate">Reativar</option>
                    </select>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filter.resourceType}
                        onChange={(e) => setFilter({ ...filter, resourceType: e.target.value })}
                    >
                        <option value="">Todos os recursos</option>
                        <option value="users">Usuários</option>
                        <option value="plans">Planos</option>
                        <option value="licenses">Licenças</option>
                        <option value="subscriptions">Assinaturas</option>
                    </select>
                    <button
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                        onClick={() =>
                            setFilter({ actorType: '', action: '', resourceType: '', search: '' })
                        }
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
                                Data/Hora
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ator
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ação
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Recurso
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                IP
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(log.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{log.actor_name}</div>
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActorTypeColor(
                                                log.actor_type
                                            )}`}
                                        >
                                            {log.actor_type}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                                            log.action
                                        )}`}
                                    >
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{log.resource_type}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">
                                        {log.resource_id}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.ip_address || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900">Ver Detalhes</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() =>
                                setPagination({ ...pagination, offset: pagination.offset - pagination.limit })
                            }
                            disabled={pagination.offset === 0}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() =>
                                setPagination({ ...pagination, offset: pagination.offset + pagination.limit })
                            }
                            disabled={pagination.offset + pagination.limit >= pagination.total}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Próxima
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{pagination.offset + 1}</span> até{' '}
                                <span className="font-medium">
                                    {Math.min(pagination.offset + pagination.limit, pagination.total)}
                                </span>{' '}
                                de <span className="font-medium">{pagination.total}</span> resultados
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() =>
                                        setPagination({ ...pagination, offset: pagination.offset - pagination.limit })
                                    }
                                    disabled={pagination.offset === 0}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() =>
                                        setPagination({ ...pagination, offset: pagination.offset + pagination.limit })
                                    }
                                    disabled={pagination.offset + pagination.limit >= pagination.total}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Próxima
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {logs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum log</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Nenhum log de auditoria encontrado com os filtros aplicados.
                    </p>
                </div>
            )}
        </div>
    )
}
