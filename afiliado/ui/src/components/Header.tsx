import { useNavigate } from 'react-router-dom';
import { LogOut, User, Crown } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { toast } from 'react-hot-toast';

export default function Header() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logout realizado com sucesso');
        navigate('/login');
    };

    const getPlanColor = (plan: string) => {
        const colors: Record<string, string> = {
            free: 'text-gray-400',
            basic: 'text-blue-400',
            growth: 'text-purple-400',
            pro: 'text-yellow-400',
        };
        return colors[plan.toLowerCase()] || 'text-gray-400';
    };

    return (
        <header className="h-16 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-white">
                    Bem-vindo de volta!
                </h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Plano */}
                <div className="flex items-center gap-2 px-4 py-2 bg-dark-700 rounded-lg">
                    <Crown className={`w-4 h-4 ${getPlanColor(user?.plan || '')}`} />
                    <span className="text-sm font-medium text-white capitalize">
                        {user?.plan}
                    </span>
                </div>

                {/* Quota */}
                <div className="px-4 py-2 bg-dark-700 rounded-lg">
                    <div className="text-xs text-dark-400">Quota</div>
                    <div className="text-sm font-medium text-white">
                        {user?.quota.available.toLocaleString()} /{' '}
                        {user?.quota.total === 999999
                            ? '∞'
                            : user?.quota.total.toLocaleString()}
                    </div>
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-sm font-medium text-white">
                            {user?.phoneNumber}
                        </div>
                        <div className="text-xs text-dark-400">Usuário</div>
                    </div>

                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                        title="Sair"
                    >
                        <LogOut className="w-5 h-5 text-dark-400 hover:text-white" />
                    </button>
                </div>
            </div>
        </header>
    );
}
