import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

import ServerLoader from '../components/ServerLoader';

function AppContent() {
    const { user } = useAuth();

    return user ? <Dashboard /> : <Login />;
}

export default function App() {
    return (
        <ServerLoader>

            <ThemeProvider>
                <AuthProvider>
                    <div className="size-full">
                        <AppContent />
                    </div>
                </AuthProvider>
            </ThemeProvider>

        </ServerLoader>
    );
}