import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Smartphone, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { licenseService } from '@services/api';

export default function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [instanceId, setInstanceId] = useState('default-instance');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber) {
            toast.error('Digite seu número de WhatsApp');
            return;
        }

        setLoading(true);

        try {
            // Envia phoneNumber e instanceId para validação
            const response = await licenseService.validate(phoneNumber, instanceId);

            if (response.success) {
                login(response.token, {
                    phoneNumber,
                    plan: response.plan,
                    quota: response.quota,
                    plugins: response.plugins,
                });

                toast.success('Login realizado com sucesso!');
                navigate('/');
            } else {
                toast.error(response.error || 'Erro ao validar licença');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Erro ao fazer login';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo e Título */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-600/50">
                        <Smartphone className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Sistema Afiliados
                    </h1>
                    <p className="text-dark-400">
                        Plataforma Profissional de Escala
                    </p>
                </div>

                {/* Card de Login */}
                <div className="glass rounded-2xl p-8 shadow-2xl animate-slide-up">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Número do WhatsApp
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Smartphone className="h-5 w-5 text-dark-400" />
                                </div>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="5511999999999"
                                    className="input pl-10 w-full"
                                    disabled={loading}
                                />
                            </div>
                            <p className="mt-2 text-xs text-dark-400">
                                Digite apenas números (ex: 5511999999999)
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Validando...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Entrar
                                </>
                            )}
                        </button>
                    </form>

                    {/* Licenças de Teste */}
                    <div className="mt-6 pt-6 border-t border-dark-700">
                        <p className="text-xs text-dark-400 mb-3">
                            Licenças de teste disponíveis:
                        </p>
                        <div className="space-y-2">
                            {[
                                { number: '5511999999999', plan: 'Pro (Ilimitado)' },
                                { number: '5511888888888', plan: 'Growth (500 msgs)' },
                                { number: '5511777777777', plan: 'Basic (100 msgs)' },
                            ].map((license) => (
                                <button
                                    key={license.number}
                                    onClick={() => setPhoneNumber(license.number)}
                                    className="w-full text-left px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-sm"
                                    disabled={loading}
                                >
                                    <span className="text-primary-400 font-mono">
                                        {license.number}
                                    </span>
                                    <span className="text-dark-400 ml-2">- {license.plan}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-dark-500 text-sm mt-6">
                    Sistema Profissional v1.0.0
                </p>
            </div>
        </div>
    );
}
