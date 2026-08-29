import React from 'react';
import { Bell, Search, Moon, Sun, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useState } from 'react';

const Navbar = () => {
    const { user } = useAuth();
    const { toggleSidebar } = useSidebar();
    const { darkMode, toggleDarkMode } = useTheme();
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className="navbar-glass">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <button
                    onClick={toggleSidebar}
                    className="mobile-menu-btn"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Menu size={24} />
                </button>
                <div style={{ position: 'relative', width: '300px' }} className="nav-search-container">
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="input-field"
                        style={{ paddingLeft: '40px', height: '42px' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button
                    onClick={toggleDarkMode}
                    style={{ background: 'var(--glass-bg)', border: 'none', width: '40px', height: '40px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ background: 'var(--glass-bg)', border: 'none', width: '40px', height: '40px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span style={{ 
                                position: 'absolute', 
                                top: '-5px', 
                                right: '-5px', 
                                background: 'var(--expense)', 
                                color: 'white', 
                                fontSize: '10px', 
                                fontWeight: 'bold', 
                                padding: '2px 6px', 
                                borderRadius: '10px',
                                border: '2px solid var(--bg-dark)'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown glass" style={{
                            position: 'absolute',
                            top: '50px',
                            right: '0',
                            width: '300px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            padding: '16px',
                            borderRadius: '16px',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <div className="flex-between" style={{ marginBottom: '12px' }}>
                                <h4 style={{ margin: 0 }}>Notifications</h4>
                                <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px' }}>Clear All</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {notifications.length === 0 ? (
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>No notifications</p>
                                ) : (
                                    notifications.map(n => (
                                        <div 
                                            key={n._id} 
                                            onClick={() => markAsRead(n._id)}
                                            style={{ 
                                                padding: '10px', 
                                                borderRadius: '8px', 
                                                background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                                                cursor: 'pointer',
                                                border: '1px solid var(--glass-border)'
                                            }}
                                        >
                                            <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-main)' }}>{n.message}</p>
                                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                {new Date(n.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ height: '30px', width: '1px', background: 'var(--glass-border)' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600' }}>{user?.name || 'User'}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pro Account</p>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <User size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
