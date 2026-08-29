import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Receipt,
    PieChart,
    User,
    LogOut,
    Wallet,
    Calendar,
    Shield,
    RefreshCw,
    Activity,
    Users,
    Target,
    BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

import logo from '../assets/logo.svg';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const { isSidebarOpen, closeSidebar } = useSidebar();

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Summary', icon: <PieChart size={20} />, path: '/summary' },
        { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
        { name: 'Transactions', icon: <Receipt size={20} />, path: '/transactions' },
        { name: 'Budgets', icon: <Calendar size={20} />, path: '/budgets' },
        { name: 'Emergency Fund', icon: <Shield size={20} />, path: '/emergency-fund' },
        { name: 'Recurring', icon: <RefreshCw size={20} />, path: '/recurring' },
        { name: 'Split Expenses', icon: <Users size={20} />, path: '/split-expenses' },
        { name: 'Savings Goals', icon: <Target size={20} />, path: '/savings-goals' },
        { name: 'Reports', icon: <Activity size={20} />, path: '/reports' },
        { name: 'Profile', icon: <User size={20} />, path: '/profile' },
    ];

    return (
        <>
            <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={closeSidebar}></div>
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <div className="flex-between" style={{ marginBottom: '40px', padding: '0 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                            src={logo} 
                            alt="PFT Logo" 
                            style={{ 
                                width: '32px', 
                                height: '32px', 
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                            }} 
                        />
                        <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }} className="text-gradient">PFT</h2>
                    </div>
                    <button
                        onClick={closeSidebar}
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                        className="mobile-close-btn"
                    >
                        <Activity size={18} />
                    </button>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={closeSidebar}
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            style={{ transition: 'all 0.2s ease', position: 'relative' }}
                        >
                            {item.icon}
                            <span style={{ fontWeight: '600', fontSize: '15px' }}>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: 'var(--glass-bg)',
                    borderRadius: '20px',
                    marginBottom: '12px',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                    marginTop: '20px'
                }}>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                            {user?.name || 'User'}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Pro Account</p>
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                    }}>
                        <User size={20} />
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="nav-link"
                    style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.1)',
                        width: '100%',
                        cursor: 'pointer',
                        color: 'var(--expense)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; }}
                >
                    <LogOut size={20} />
                    <span style={{ fontWeight: '600' }}>Secure Logout</span>
                </button>
            </div>
        </>
    );
};

export default Sidebar;
