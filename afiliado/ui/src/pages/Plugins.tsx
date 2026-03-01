import { User, Plugin } from '../../../shared/types';
import './Plugins.css';

interface PluginsProps {
    user: User;
}

function Plugins({ user }: PluginsProps) {
    const availablePlugins: Plugin[] = [
        { id: 'analytics', name: 'Analytics Avançado', version: '1.0.0', enabled: false, requiresPlan: 'growth' },
        { id: 'templates', name: 'Templates Premium', version: '1.0.0', enabled: false, requiresPlan: 'base' },
        { id: 'automation', name: 'Automação', version: '1.0.0', enabled: false, requiresPlan: 'pro' },
    ];

    return (
        <div className="plugins">
            <h1>Plugins</h1>

            <div className="plugins-grid">
                {availablePlugins.map(plugin => (
                    <div key={plugin.id} className="plugin-card">
                        <h3>{plugin.name}</h3>
                        <p>Versão {plugin.version}</p>
                        <span className="plan-required">Requer: {plugin.requiresPlan}</span>
                        <button disabled={!user.activePlugins.includes(plugin.id)}>
                            {user.activePlugins.includes(plugin.id) ? 'Ativo' : 'Adquirir'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Plugins;
