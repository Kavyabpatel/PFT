import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
    const { darkMode } = useTheme();

    return (
        <div 
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                color: darkMode ? '#f8fafc' : '#0f172a',
                textAlign: 'center',
                transition: 'all 0.3s ease'
            }}
        >
            <div 
                style={{
                    maxWidth: '480px',
                    width: '100%',
                    padding: '2.5rem',
                    borderRadius: '16px',
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    boxShadow: darkMode ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.05)',
                    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                }}
            >
                <div 
                    style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 1.5rem',
                        borderRadius: '50%',
                        backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6366f1'
                    }}
                >
                    <FileQuestion size={40} />
                </div>

                <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '0 0 0.5rem', color: '#6366f1' }}>
                    404
                </h1>

                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    Page Not Found
                </h2>

                <p style={{ color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
                    Oops! The financial destination you are looking for doesn't exist or has been moved.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            backgroundColor: '#6366f1',
                            color: '#ffffff',
                            fontWeight: '600',
                            textDecoration: 'none',
                            transition: 'background-color 0.2s ease'
                        }}
                    >
                        <Home size={18} />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
