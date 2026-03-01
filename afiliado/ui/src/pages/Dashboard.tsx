import { useEffect, useState } from 'react';
import { User, QuotaStatus } from '../../../shared/types';
import { getQuota } from '../services/api';
import './Dashboard.css';

interface DashboardProps {
    user: User;
}

function Dashboard({ user }: DashboardProps) {
    const [quota, setQuota] = useState<QuotaStatus | null>(null);

    useEffect(() => {
        loadQuota();
    }, []);

    const loadQuota = async () => {
        try {
            const data = await getQuota();
            setQuota(data);
        } catch (err) {
            console.error('Erro ao carregar quota:', err);
        }
    };

    const quotaPercentage = quota ? (quota.used / quota.limit) * 100 : 0;

    return (
        <div className="dashboard">
            <header>
                <h1>Dashboard</h1>
                <div className="user-info">
                    <span>{user.phone}</span>
                    <span className="plan-badge">{user.plan.toUpperCase()}</span>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Quota de Vídeos</h3>
                    <div className="quota-bar">
                        <div
                            className="quota-fill"
                            style={{ width: `${quotaPercentage}%` }}
                        />
                    </div>
                    <p>{quota?.used || 0} / {quota?.limit || 0} vídeos</p>
                </div>

                <div className="stat-card">
                    <h3>Plugins Ativos</h3>
                    <p className="big-number">{user.activePlugins.length}</p>
                </div>

                <div className="stat-card">
                    <h3>Status</h3>
                    <p className="status-active">Ativo</p>
                </div>
            </div>

            <div className="actions">
                <button className="primary-btn">Criar Vídeo</button>
                <button className="secondary-btn">Ver Métricas</button>
            </div>
        </div>
    );
}

export default Dashboard;
