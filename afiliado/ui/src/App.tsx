import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Plugins from './pages/Plugins';
import Settings from './pages/Settings';
import { User } from '../../shared/types';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Validar token com o Core
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return <div className="loading">Carregando...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />}
                />
                <Route
                    path="/dashboard"
                    element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/plugins"
                    element={user ? <Plugins user={user} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/settings"
                    element={user ? <Settings user={user} /> : <Navigate to="/login" />}
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
