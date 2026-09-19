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
                background: '#231C14',
            }}>
                <img
                    src={import.meta.env.BASE_URL + 'favicon.png'}
                    alt="WhiteNode Software Solutions"
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        animation: 'wn-boot-pulse 1.4s ease-in-out infinite',
                    }}
                />
                <style>{`
                    @keyframes wn-boot-pulse {
                        0%, 100% { opacity: 0.55; transform: scale(0.94); }
                        50% { opacity: 1; transform: scale(1); }
                    }
                `}</style>
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
