import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Activity,
    MessageSquare,
    Users,
    TrendingUp,
    Smartphone,
    QrCode,
    Send,
    Loader2,
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { whatsappService, metricsService } from '@services/api';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [instanceId, setInstanceId] = useState('afiliado-main');
    const [instanceStatus, setInstanceStatus] = useState<string>('');
    const [qrCode, setQrCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [systemMetrics, setSystemMetrics] = useState<any>(null);

    // Mensagem de teste
    const [testNumber, setTestNumber] = useState('');
    const [testMessage, setTestMessage] = useState('Olá! Mensagem de teste do Sistema Afiliados.');

    useEffect(() => {
        loadSystemMetrics();
        checkInstanceStatus();
    }, []);

    const loadSystemMetrics = async () => {
        try {
            const data = await metricsService.getSystem();
            setSystemMetrics(data.metrics);
        } catch (error) {
            console.error('Error loading metrics:', error);
        }
    };

    const checkInstanceStatus = async () => {
        try {
            const data = await whatsappService.getStatus(instanceId);
            if (data.success) {
                setInstanceStatus(data.status);
            }
        } catch (error) {
            setInstanceStatus('NOT_FOUND');
        }
    };

    const handleCreateInstance = async () => {
        setLoading(true);
        try {
            const data = await whatsappService.createInstance(instanceId);
            if (data.success) {
                toast.success('Instância criada com sucesso!');
                await loadQRCode();
            } else {
                toast.error(data.error || 'Erro ao criar instância');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao criar instância');
        } finally {
            setLoading(false);
        }
    };

    const loadQRCode = async () => {
        setLoading(true);
        try {
            const data = await whatsappService.getQRCode(instanceId);
            if (data.success) {
                setQrCode(data.qrImage);
                setInstanceStatus('QR_READY');
            } else {
                toast.error(data.error || 'Erro ao obter QR Code');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao obter QR Code');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!testNumber || !testMessage) {
            toast.error('Preencha todos os campos');
            return;
        }

        const jid = testNumber.includes('@') ? testNumber : `${testNumber}@s.whatsapp.net`;

        setLoading(true);
        try {
            const data = await whatsappService.sendText(instanceId, jid, testMessage);
            if (data.success) {
                toast.success('Mensagem enviada com sucesso!');
                setTestNumber('');
            } else {
                toast.error(data.error || 'Erro ao enviar mensagem');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao enviar mensagem');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            name: 'Quota Disponível',
            value: user?.quota.available.toLocaleString() || '0',
            icon: Activity,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
        },
        {
            name: 'Quota Usada',
            value: user?.quota.used.toLocaleString() || '0',
            icon: MessageSquare,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
        },
        {
            name: 'Plano Atual',
            value: user?.plan.toUpperCase() || 'FREE',
            icon: TrendingUp,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
        },
        {
            name: 'Plugins Ativos',
            value: user?.plugins.length || 0,
            icon: Users,
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-dark-400">
                    Visão geral do seu sistema de afiliados
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-dark-400 text-sm mb-1">{stat.name}</p>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                            <div className={`${stat.bg} p-3 rounded-lg`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* WhatsApp Instance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conexão WhatsApp */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <Smartphone className="w-6 h-6 text-primary-400" />
                        <h2 className="text-xl font-semibold text-white">
                            Conexão WhatsApp
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-dark-400 mb-2">
                                ID da Instância
                            </label>
                            <input
                                type="text"
                                value={instanceId}
                                onChange={(e) => setInstanceId(e.target.value)}
                                className="input w-full"
                                placeholder="minha-instancia"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div
                                className={`w-3 h-3 rounded-full ${instanceStatus === 'CONNECTED'
                                        ? 'bg-green-400'
                                        : instanceStatus === 'QR_READY'
                                            ? 'bg-yellow-400'
                                            : 'bg-red-400'
                                    }`}
                            />
                            <span className="text-sm text-dark-400">
                                Status: {instanceStatus || 'Desconectado'}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleCreateInstance}
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                    'Criar Instância'
                                )}
                            </button>
                            <button
                                onClick={loadQRCode}
                                disabled={loading}
                                className="btn-secondary"
                            >
                                <QrCode className="w-4 h-4" />
                            </button>
                        </div>

                        {qrCode && (
                            <div className="mt-4 p-4 bg-white rounded-lg">
                                <img src={qrCode} alt="QR Code" className="w-full" />
                                <p className="text-center text-dark-600 text-sm mt-2">
                                    Escaneie com WhatsApp
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enviar Mensagem de Teste */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <Send className="w-6 h-6 text-primary-400" />
                        <h2 className="text-xl font-semibold text-white">
                            Enviar Mensagem
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-dark-400 mb-2">
                                Número de Destino
                            </label>
                            <input
                                type="text"
                                value={testNumber}
                                onChange={(e) => setTestNumber(e.target.value)}
                                className="input w-full"
                                placeholder="5511999999999"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-dark-400 mb-2">
                                Mensagem
                            </label>
                            <textarea
                                value={testMessage}
                                onChange={(e) => setTestMessage(e.target.value)}
                                className="input w-full h-32 resize-none"
                                placeholder="Digite sua mensagem..."
                            />
                        </div>

                        <button
                            onClick={handleSendMessage}
                            disabled={loading || instanceStatus !== 'CONNECTED'}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                                'Enviar Mensagem'
                            )}
                        </button>

                        {instanceStatus !== 'CONNECTED' && (
                            <p className="text-xs text-yellow-400 text-center">
                                Conecte uma instância primeiro
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* System Metrics */}
            {systemMetrics && (
                <div className="card">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Métricas do Sistema
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-dark-400 text-sm">Memória (RSS)</p>
                            <p className="text-white font-semibold">
                                {systemMetrics.memory.rss} MB
                            </p>
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Heap Usado</p>
                            <p className="text-white font-semibold">
                                {systemMetrics.memory.heapUsed} MB
                            </p>
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Uptime</p>
                            <p className="text-white font-semibold">
                                {Math.floor(systemMetrics.uptime / 60)} min
                            </p>
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Plataforma</p>
                            <p className="text-white font-semibold">
                                {systemMetrics.platform}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
