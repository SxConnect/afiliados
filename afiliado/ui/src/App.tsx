import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import LoginPage from '@pages/LoginPage';
import DashboardPage from '@pages/DashboardPage';
import PluginsPage from '@pages/PluginsPage';
import SettingsPage from '@pages/SettingsPage';
import Layout from '@components/Layout';

function App() {
    const { isAuthenticated } = useAuthStore();

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
                path="/"
                element={
                    isAuthenticated ? (
                        <Layout />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="plugins" element={<PluginsPage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
