import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Puzzle,
    Settings,
    Smartphone
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Plugins', href: '/plugins', icon: Puzzle },
    { name: 'Configurações', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    return (
        <div className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-dark-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg">Afiliados</h1>
                        <p className="text-dark-400 text-xs">Sistema Pro</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        end={item.href === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary-600 text-white'
                                : 'text-dark-400 hover:bg-dark-700 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-dark-700">
                <div className="text-xs text-dark-500 text-center">
                    v1.0.0 - Sistema Profissional
                </div>
            </div>
        </div>
    );
}
