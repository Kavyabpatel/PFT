import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
    BarChart3,
    Landmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

import logo from '../assets/logo.svg';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const { isSidebarOpen, closeSidebar } = useSidebar();
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Summary', icon: <PieChart size={20} />, path: '/summary' },
        { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
        { name: 'Net Worth', icon: <Landmark size={20} />, path: '/net-worth' },
        { name: 'Transactions', icon: <Receipt size={20} />, path: '/transactions' },
        { name: 'Budgets', icon: <Calendar size={20} />, path: '/budgets' },
        { name: 'Emergency Fund', icon: <Shield size={20} />, path: '/emergency-fund' },
        { name: 'Recurring', icon: <RefreshCw size={20} />, path: '/recurring' },
        { name: 'Split Expenses', icon: <Users size={20} />, path: '/split-expenses' },
        { name: 'Savings Goals', icon: <Target size={20} />, path: '/savings-goals' },
        { name: 'Reports', icon: <Activity size={20} />, path: '/reports' },
    ];

    return (
        <>
            <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={closeSidebar}></div>
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <div className="flex-between" style={{ marginBottom: '40px', padding: '0 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={logo} alt="PFT Tracker Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '20px', fontWeight: '800', tracking: '-0.5px' }} className="gradient-text">
                            PFT Tracker
                        </span>
                    </div>
                </div>

                <div className="sidebar-menu">
                    <p style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '16px',
                        paddingLeft: '12px'
                    }}>
                        Main Menu
                    </p>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="sidebar-footer" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: 'auto' }}>
                    <div
                        onClick={() => {
                            closeSidebar();
                            navigate('/profile');
                        }}
                        className="user-profile-card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: 'rgba(0,0,0,0.02)'
                        }}
                        title="Click to view User Profile"
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700'
                        }}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name || 'User Profile'}
                            </p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.email || 'View Account'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="menu-item logout-btn"
                        style={{
                            width: '100%',
                            border: 'none',
                            background: 'rgba(239, 68, 68, 0.08)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            justifyContent: 'flex-start',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
