import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Key, Bell, Shield, Info } from 'lucide-react';
import { useAuthStore } from '@store/authStore';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [papiUrl, setPapiUrl] = useState('http://localhost:3000/api');
    const [papiKey, setPapiKey] = useState('');
    const [notifications, setNotifications] = useState(true);
    const [autoConnect, setAutoConnect] = useState(true);

    const handleSave = () => {
        toast.success('Configurações salvas com sucesso!');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
                <p className="text-dark-400">
                    Gerencie as configurações do sistema
                </p>
            </div>

            {/* Informações da Conta */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <Info className="w-6 h-6 text-primary-400" />
                    <h2 className="text-xl font-semibold text-white">
                        Informações da Conta
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-dark-400 mb-2">
                            Número do WhatsApp
                        </label>
                        <input
                            type="text"
                            value={user?.phoneNumber || ''}
                            disabled
                            className="input w-full bg-dark-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-dark-400 mb-2">
                            Plano Atual
                        </label>
                        <input
                            type="text"
                            value={user?.plan.toUpperCase() || ''}
                            disabled
                            className="input w-full bg-dark-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-dark-400 mb-2">
                            Quota Total
                        </label>
                        <input
                            type="text"
                            value={
                                user?.quota.total === 999999
                                    ? 'Ilimitado'
                                    : user?.quota.total.toLocaleString() || '0'
                            }
                            disabled
                            className="input w-full bg-dark-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-dark-400 mb-2">
                            Quota Disponível
                        </label>
                        <input
                            type="text"
                            value={user?.quota.available.toLocaleString() || '0'}
                            disabled
                            className="input w-full bg-dark-900"
                        />
                    </div>
                </div>
            </div>

            {/* Configurações da API PAPI */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <Key className="w-6 h-6 text-primary-400" />
                    <h2 className="text-xl font-semibold text-white">
                        Configurações PAPI API
                    </h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-dark-400 mb-2">
                            URL da API PAPI
                        </label>
                        <input
                            type="text"
                            value={papiUrl}
                            onChange={(e) => setPapiUrl(e.target.value)}
                            className="input w-full"
                            placeholder="http://localhost:3000/api"
                        />
                        <p className="text-xs text-dark-500 mt-1">
                            URL base da API PAPI para comunicação com WhatsApp
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm text-dark-400 mb-2">
                            API Key da PAPI
                        </label>
                        <input
                            type="password"
                            value={papiKey}
                            onChange={(e) => setPapiKey(e.target.value)}
                            className="input w-full"
                            placeholder="sua-chave-api-aqui"
                        />
                        <p className="text-xs text-dark-500 mt-1">
                            Chave de autenticação da API PAPI
                        </p>
                    </div>
                </div>
            </div>

            {/* Preferências */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-6 h-6 text-primary-400" />
                    <h2 className="text-xl font-semibold text-white">Preferências</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Notificações</p>
                            <p className="text-sm text-dark-400">
                                Receber notificações do sistema
                            </p>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-primary-600' : 'bg-dark-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Conexão Automática</p>
                            <p className="text-sm text-dark-400">
                                Conectar automaticamente ao iniciar
                            </p>
                        </div>
                        <button
                            onClick={() => setAutoConnect(!autoConnect)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoConnect ? 'bg-primary-600' : 'bg-dark-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoConnect ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Segurança */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-primary-400" />
                    <h2 className="text-xl font-semibold text-white">Segurança</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-white font-medium mb-2">Fingerprint da Máquina</p>
                        <input
                            type="text"
                            value="abc123def456..."
                            disabled
                            className="input w-full bg-dark-900 font-mono text-sm"
                        />
                        <p className="text-xs text-dark-500 mt-1">
                            Identificador único desta máquina
                        </p>
                    </div>

                    <div>
                        <p className="text-white font-medium mb-2">Token JWT</p>
                        <textarea
                            value={useAuthStore.getState().token?.substring(0, 100) + '...'}
                            disabled
                            className="input w-full bg-dark-900 font-mono text-xs h-20 resize-none"
                        />
                        <p className="text-xs text-dark-500 mt-1">
                            Token de autenticação (expira em 24h)
                        </p>
                    </div>
                </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end">
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Configurações
                </button>
            </div>
        </div>
    );
}
