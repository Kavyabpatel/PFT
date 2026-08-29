import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes';
import './styles/main.css';

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <CurrencyProvider>
                        <NotificationProvider>
                            <AppRoutes />
                        </NotificationProvider>
                    </CurrencyProvider>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
