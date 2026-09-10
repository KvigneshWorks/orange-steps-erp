import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import ToastContainer from './components/ToastContainer';
import axiosInstance from './services/axiosConfig';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }
        // A token merely being present in localStorage doesn't mean it's
        // still valid — verify it against the backend before granting
        // access to the Dashboard, instead of trusting stale/tampered
        // localStorage state.
        axiosInstance.get('auth/me')
            .then(() => setIsAuthenticated(true))
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#0E0B07',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '9.5px',
                color: '#5A4A3A',
                letterSpacing: '3px',
                textTransform: 'uppercase',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                        <rect width="42" height="42" rx="9" fill="#1E1408" />
                        <polygon points="21,4 36,12.5 36,29.5 21,38 6,29.5 6,12.5" stroke="#E8720C" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
                        <text x="21" y="23" textAnchor="middle" dominantBaseline="middle"
                            fontFamily="serif" fontSize="9.5" fontWeight="700" fill="#E8720C">T</text>
                    </svg>
                    <span>Loading…</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer />
            {!isAuthenticated
                ? <Auth onLoginSuccess={handleLoginSuccess} />
                : <Dashboard onLogout={handleLogout} />}
        </>
    );
}

export default App;
