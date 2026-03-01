import { useState } from 'react';
import { User } from '../../../shared/types';
import './Settings.css';

interface SettingsProps {
    user: User;
}

function Settings({ user }: SettingsProps) {
    const [groqKey, setGroqKey] = useState('');
    const [openaiKey, setOpenaiKey] = useState('');

    const handleSave = () => {
        localStorage.setItem('groqKey', groqKey);
        localStorage.setItem('openaiKey', openaiKey);
        alert('Configurações salvas!');
    };

    return (
        <div className="settings">
            <h1>Configurações</h1>

            <div className="settings-section">
                <h2>APIs de LLM</h2>

                <div className="form-group">
                    <label>Groq API Key</label>
                    <input
                        type="password"
                        value={groqKey}
                        onChange={(e) => setGroqKey(e.target.value)}
                        placeholder="gsk_..."
                    />
                </div>

                <div className="form-group">
                    <label>OpenAI API Key</label>
                    <input
                        type="password"
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        placeholder="sk-..."
                    />
                </div>

                <button onClick={handleSave}>Salvar</button>
            </div>

            <div className="settings-section">
                <h2>Informações da Conta</h2>
                <p>Telefone: {user.phone}</p>
                <p>Plano: {user.plan}</p>
                <p>ID: {user.id}</p>
            </div>
        </div>
    );
}

export default Settings;
