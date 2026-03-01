import { useState } from 'react';
import { login } from '../services/api';
import { User } from '../../../shared/types';
import './Login.css';

interface LoginProps {
    onLogin: (user: User) => void;
}

function Login({ onLogin }: LoginProps) {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(phone);
            if (response.user) {
                onLogin(response.user);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Afiliado Pro</h1>
                <p className="subtitle">Sistema Profissional de Escala</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>WhatsApp</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+55 11 99999-9999"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error">{error}</div>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Validando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
