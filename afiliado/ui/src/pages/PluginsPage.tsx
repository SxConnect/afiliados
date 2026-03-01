import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Puzzle, Lock, Check, Loader2 } from 'lucide-react';
import { pluginService } from '@services/api';
import type { Plugin } from '@types';

export default function PluginsPage() {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlugins();
    }, []);

    const loadPlugins = async () => {
        try {
            const data = await pluginService.list();
            if (data.success) {
                setPlugins(data.plugins);
            }
        } catch (error) {
            toast.error('Erro ao carregar plugins');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Plugins</h1>
                <p className="text-dark-400">
                    Expanda as funcionalidades do seu sistema
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plugins.map((plugin) => (
                    <div
                        key={plugin.id}
                        className={`card relative ${plugin.locked ? 'opacity-60' : ''
                            }`}
                    >
                        {plugin.locked && (
                            <div className="absolute top-4 right-4">
                                <Lock className="w-5 h-5 text-yellow-400" />
                            </div>
                        )}

                        <div className="flex items-start gap-4 mb-4">
                            <div className="text-4xl">{plugin.icon}</div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1">
                                    {plugin.name}
                                </h3>
                                <p className="text-sm text-dark-400">{plugin.description}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-dark-400">Versão</span>
                                <span className="text-white">{plugin.version}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-dark-400">Categoria</span>
                                <span className="text-white capitalize">{plugin.category}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-dark-400">Plano Necessário</span>
                                <span className="text-white capitalize">
                                    {plugin.requiredPlan}
                                </span>
                            </div>
                        </div>

                        {plugin.enabled ? (
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                <Check className="w-4 h-4" />
                                <span>Ativo</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-yellow-400 text-sm">
                                <Lock className="w-4 h-4" />
                                <span>Bloqueado - Faça upgrade</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {plugins.length === 0 && (
                <div className="card text-center py-12">
                    <Puzzle className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <p className="text-dark-400">Nenhum plugin disponível</p>
                </div>
            )}
        </div>
    );
}
