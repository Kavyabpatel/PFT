import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import Charts from '../components/Charts';
import HealthScoreCard from '../components/HealthScoreCard';
import BudgetAlerts from '../components/BudgetAlerts';
import EmergencyFundProgress from '../components/EmergencyFundProgress';
import SmartTips from '../components/SmartTips';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useSidebar } from '../context/SidebarContext';
import AddTransactionModal from '../components/AddTransactionModal';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    Plus,
    Download,
    Moon,
    Sun,
    Bell,
    Utensils,
    Home,
    Briefcase,
    ShoppingBag,
    Gamepad2,
    Bus,
    HeartPulse,
    FileSpreadsheet,
    Search,
    Menu,
    Target,
    Plane,
    Car,
    Shield,
    Heart,
    Book,
    Tv,
    Compass,
    ArrowRight
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { formatAmount, symbol } = useCurrency();
    const { darkMode, toggleDarkMode } = useTheme();
    const { toggleSidebar } = useSidebar();
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [emergencyFund, setEmergencyFund] = useState({ targetAmount: 0, savedAmount: 0 });
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [stats, setStats] = useState({
        balance: 0,
        income: 0,
        expense: 0,
        savings: 0,
        healthScore: 0,
        alerts: []
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const availablePages = [
        { title: 'Dashboard & Financial Summary', path: '/dashboard', keywords: ['summary', 'dashboard', 'overview', 'home', 'balance'] },
        { title: 'Transactions History', path: '/transactions', keywords: ['transactions', 'txn', 'history', 'income', 'expense', 'salary', 'food', 'rent', 'shopping'] },
        { title: 'Savings Goals', path: '/savings', keywords: ['savings', 'goal', 'target', 'dubai', 'trip', 'car', 'travel'] },
        { title: 'Analytics & Insights', path: '/analytics', keywords: ['analytics', 'chart', 'graph', 'insights', 'trend'] },
        { title: 'Net Worth Tracker', path: '/net-worth', keywords: ['net worth', 'asset', 'liability', 'wealth'] },
        { title: 'Financial Reports', path: '/reports', keywords: ['reports', 'statement', 'pdf', 'csv', 'audit'] }
    ];

    const getTransactionIcon = (category) => {
        const iconStyle = {
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#6366f1',
        };

        let IconComponent = Wallet;
        const cat = category.toLowerCase();

        if (cat.includes('food')) { IconComponent = Utensils; iconStyle.color = '#ef4444'; iconStyle.background = 'rgba(239, 68, 68, 0.1)'; }
        else if (cat.includes('rent')) { IconComponent = Home; iconStyle.color = '#6366f1'; iconStyle.background = 'rgba(99, 102, 241, 0.1)'; }
        else if (cat.includes('salary') || cat.includes('income')) { IconComponent = Briefcase; iconStyle.color = '#10b981'; iconStyle.background = 'rgba(16, 185, 129, 0.1)'; }
        else if (cat.includes('shop')) { IconComponent = ShoppingBag; iconStyle.color = '#f59e0b'; iconStyle.background = 'rgba(245, 158, 11, 0.1)'; }
        else if (cat.includes('entert')) { IconComponent = Gamepad2; iconStyle.color = '#ec4899'; iconStyle.background = 'rgba(236, 72, 153, 0.1)'; }
        else if (cat.includes('trans')) { IconComponent = Bus; iconStyle.color = '#06b6d4'; iconStyle.background = 'rgba(6, 182, 212, 0.1)'; }
        else if (cat.includes('health')) { IconComponent = HeartPulse; iconStyle.color = '#14b8a6'; iconStyle.background = 'rgba(20, 184, 166, 0.1)'; }

        return (
            <div style={iconStyle}>
                <IconComponent size={20} />
            </div>
        );
    };

    const getSavingsGoalIcon = (goal) => {
        const name = (goal.goalName || '').toLowerCase();
        const category = (goal.category || '').toLowerCase();

        let IconComp = Target;
        let color = '#6366f1';
        let bg = 'rgba(99, 102, 241, 0.12)';

        if (name.includes('dubai') || name.includes('trip') || name.includes('travel') || name.includes('flight') || category.includes('travel')) {
            IconComp = Plane; color = '#06b6d4'; bg = 'rgba(6, 182, 212, 0.15)';
        } else if (name.includes('car') || name.includes('vehicle') || name.includes('bike') || category.includes('vehicle')) {
            IconComp = Car; color = '#f59e0b'; bg = 'rgba(245, 158, 11, 0.15)';
        } else if (name.includes('home') || name.includes('house') || name.includes('flat') || category.includes('home')) {
            IconComp = Home; color = '#10b981'; bg = 'rgba(16, 185, 129, 0.15)';
        } else if (name.includes('health') || name.includes('medical') || category.includes('health')) {
            IconComp = Heart; color = '#ef4444'; bg = 'rgba(239, 68, 68, 0.15)';
        } else if (name.includes('emergency') || category.includes('emergency')) {
            IconComp = Shield; color = '#8b5cf6'; bg = 'rgba(139, 92, 246, 0.15)';
        } else if (name.includes('gadget') || name.includes('laptop') || name.includes('phone') || category.includes('gadgets')) {
            IconComp = Tv; color = '#ec4899'; bg = 'rgba(236, 72, 153, 0.15)';
        } else if (name.includes('study') || name.includes('education') || category.includes('education')) {
            IconComp = Book; color = '#3b82f6'; bg = 'rgba(59, 130, 246, 0.15)';
        }

        return (
            <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: bg,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <IconComp size={18} />
            </div>
        );
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Process recurring transactions first
            await api.post('/recurring/process');

            const [transRes, budgetRes, fundRes, savingsRes, profileRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/budgets'),
                api.get('/emergency-fund'),
                api.get('/savings'),
                api.get('/auth/profile')
            ]);

            setTransactions(transRes.data);
            setBudgets(budgetRes.data);
            setEmergencyFund(fundRes.data);
            setSavingsGoals(savingsRes.data);
            setProfile(profileRes.data);

            const data = transRes.data;
            const userBudgets = budgetRes.data;
            const userFund = fundRes.data;
            const userSavings = savingsRes.data;

            const income = data
                .filter(t => t.type && t.type.toLowerCase() === 'income')
                .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

            const expense = data
                .filter(t => t.type && t.type.toLowerCase() === 'expense')
                .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

            // Calculate Budget Alerts
            const currentMonth = new Date().toISOString().slice(0, 7);
            const monthAlerts = [];
            userBudgets.filter(b => b.month === currentMonth).forEach(budget => {
                const spent = data
                    .filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(currentMonth))
                    .reduce((acc, t) => acc + t.amount, 0);
                
                if (spent > budget.budgetAmount) {
                    monthAlerts.push({
                        category: budget.category,
                        overAmount: spent - budget.budgetAmount
                    });
                }
            });

            // Calculate Financial Health Score (Dynamic logic)
            // 1. Savings Rate (40%)
            const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
            const savingsScore = Math.min(40, (Math.max(0, savingsRate) / 20) * 40);

            // 2. Budget Discipline (30%)
            const budgetDiscipline = userBudgets.length > 0 ? (1 - (monthAlerts.length / userBudgets.length)) * 30 : 20;

            // 3. Emergency Fund Progress (30%)
            const fundScore = userFund.targetAmount > 0 ? Math.min(30, (userFund.savedAmount / userFund.targetAmount) * 30) : 15;

            const healthScore = Math.round(savingsScore + budgetDiscipline + fundScore);

            setStats({
                balance: income - expense,
                income,
                expense,
                savings: income - expense,
                healthScore,
                alerts: monthAlerts
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleDownloadPDF = async () => {
        try {
            setExporting(true);
            const response = await api.get('/export/pdf', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Financial-Report-${user?.name || 'User'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
        } finally {
            setExporting(false);
        }
    };

    const handleDownloadCSV = async () => {
        try {
            const response = await api.get('/export/csv', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Transactions-Report-${user?.name || 'User'}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading CSV:', error);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <Sidebar />
                <main className="main-content">
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                        <div className="text-gradient" style={{ fontSize: '24px', fontWeight: '800' }}>Loading your financial overview...</div>
                    </div>
                </main>
            </div>
        );
    }

    const queryLower = searchQuery.toLowerCase().trim();

    const filteredTransactions = transactions.filter(t => 
        (t.title || '').toLowerCase().includes(queryLower) ||
        (t.category || '').toLowerCase().includes(queryLower) ||
        (t.type || '').toLowerCase().includes(queryLower)
    );

    const filteredSavingsGoals = savingsGoals.filter(g =>
        (g.goalName || '').toLowerCase().includes(queryLower) ||
        (g.category || '').toLowerCase().includes(queryLower)
    );

    const matchingPages = queryLower.length > 0 ? availablePages.filter(p =>
        p.title.toLowerCase().includes(queryLower) ||
        p.keywords.some(k => k.includes(queryLower))
    ) : [];

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="main-content" style={{ paddingTop: '32px' }}>
                <div 
                    className="glass glass-shadow"
                    style={{ 
                        padding: '24px 32px', 
                        borderRadius: '24px', 
                        marginBottom: '32px', 
                        border: '1px solid var(--glass-border)',
                        position: 'relative',
                        zIndex: 100
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        {/* Left Side: Greeting & Subtitle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                                onClick={toggleSidebar}
                                className="mobile-menu-btn"
                                style={{
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    display: 'none',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Menu size={20} />
                            </button>
                            <div>
                                <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                                    Welcome back, <span className="text-gradient">{user?.name || 'User'}</span>! 👋
                                </h1>
                                <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '14px' }}>Here's your smart financial summary in {symbol}.</p>
                            </div>
                        </div>

                        {/* Right Side: ALL in one single horizontal line (Search, Dark Mode, Bell, Add Txn, PDF Report) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            {/* Search Box with Dynamic Spotlight Navigation & Filtering */}
                            <div style={{ position: 'relative', width: '220px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search goals, summary..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input-field"
                                    style={{
                                        paddingLeft: '40px',
                                        height: '42px',
                                        borderRadius: '12px',
                                        background: 'rgba(0, 0, 0, 0.03)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'var(--text-main)',
                                        fontSize: '14px'
                                    }}
                                />

                                {/* Interactive Spotlight Dropdown Overlay */}
                                {queryLower.length > 0 && (
                                    <div className="glass" style={{
                                        position: 'absolute',
                                        top: '48px',
                                        left: 0,
                                        width: '320px',
                                        maxHeight: '420px',
                                        overflowY: 'auto',
                                        zIndex: 10000,
                                        padding: '16px',
                                        borderRadius: '20px',
                                        background: 'var(--sidebar-bg)',
                                        backdropFilter: 'blur(25px)',
                                        border: '1px solid var(--glass-border)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                                    }}>
                                        {/* 1. Page Navigation Links */}
                                        {matchingPages.length > 0 && (
                                            <div style={{ marginBottom: '16px' }}>
                                                <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>Pages & Navigation</div>
                                                {matchingPages.map(page => (
                                                    <div
                                                        key={page.path}
                                                        onClick={() => { navigate(page.path); setSearchQuery(''); }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '10px 12px',
                                                            borderRadius: '10px',
                                                            background: 'rgba(99, 102, 241, 0.08)',
                                                            cursor: 'pointer',
                                                            marginBottom: '6px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-main)' }}>{page.title}</span>
                                                        <ArrowRight size={16} style={{ color: 'var(--primary)' }} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* 2. Savings Goals Matches */}
                                        {filteredSavingsGoals.length > 0 && (
                                            <div style={{ marginBottom: '16px' }}>
                                                <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>Savings Goals</div>
                                                {filteredSavingsGoals.slice(0, 3).map(goal => {
                                                    const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
                                                    return (
                                                        <div
                                                            key={goal._id}
                                                            onClick={() => { navigate('/savings'); setSearchQuery(''); }}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                padding: '8px 10px',
                                                                borderRadius: '10px',
                                                                cursor: 'pointer',
                                                                marginBottom: '4px',
                                                                background: 'rgba(255,255,255,0.03)',
                                                                border: '1px solid var(--glass-border)'
                                                            }}
                                                        >
                                                            {getSavingsGoalIcon(goal)}
                                                            <div style={{ flex: 1 }}>
                                                                <div className="flex-between" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                                                                    <span>{goal.goalName}</span>
                                                                    <span style={{ color: 'var(--primary)' }}>{pct}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* 3. Transaction Matches */}
                                        {filteredTransactions.length > 0 && (
                                            <div>
                                                <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>Transactions</div>
                                                {filteredTransactions.slice(0, 4).map(t => (
                                                    <div
                                                        key={t._id}
                                                        onClick={() => { navigate('/transactions'); setSearchQuery(''); }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '8px 10px',
                                                            borderRadius: '10px',
                                                            cursor: 'pointer',
                                                            marginBottom: '4px',
                                                            background: 'rgba(255,255,255,0.03)',
                                                            border: '1px solid var(--glass-border)'
                                                        }}
                                                    >
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{t.title}</p>
                                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.category}</span>
                                                        </div>
                                                        <span style={{ fontSize: '13px', fontWeight: '800', color: t.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                                                            {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {matchingPages.length === 0 && filteredSavingsGoals.length === 0 && filteredTransactions.length === 0 && (
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', margin: '12px 0' }}>
                                                No results for "{searchQuery}"
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Night / Light Mode Toggle */}
                            <button 
                                onClick={toggleDarkMode}
                                style={{
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {/* Notification Bell & Dropdown */}
                            <div style={{ position: 'relative' }}>
                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    style={{
                                        background: 'var(--glass-bg)',
                                        border: '1px solid var(--glass-border)',
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '12px',
                                        color: 'var(--text-main)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        transition: 'all 0.2s ease'
                                    }}
                                    title="Notifications"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span style={{ 
                                            position: 'absolute', 
                                            top: '-4px', 
                                            right: '-4px', 
                                            background: 'var(--expense)', 
                                            color: 'white', 
                                            fontSize: '10px', 
                                            fontWeight: 'bold', 
                                            padding: '2px 6px', 
                                            borderRadius: '10px'
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="notification-dropdown glass" style={{
                                        position: 'absolute',
                                        top: '52px',
                                        right: '0',
                                        width: '320px',
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        zIndex: 9999,
                                        padding: '20px',
                                        borderRadius: '20px',
                                        background: 'var(--sidebar-bg)',
                                        backdropFilter: 'blur(25px)',
                                        WebkitBackdropFilter: 'blur(25px)',
                                        border: '1px solid var(--glass-border)',
                                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                                    }}>
                                        <div className="flex-between" style={{ marginBottom: '12px' }}>
                                            <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Notifications</h4>
                                            <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Clear All</button>
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

                            {/* Add Transaction Button */}
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="btn-primary" 
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer',
                                    height: '42px',
                                    padding: '0 18px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Plus size={18} /> Add Transaction
                            </button>

                            {/* PDF Report Download Button */}
                            <button
                                onClick={handleDownloadPDF}
                                className="btn-primary"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer',
                                    height: '42px',
                                    padding: '0 18px',
                                    whiteSpace: 'nowrap',
                                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                                }}
                            >
                                <Download size={18} /> PDF Report
                            </button>
                        </div>
                    </div>
                </div>

                <BudgetAlerts alerts={stats.alerts} />

                <div id="dashboard-export-area">
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
                        <DashboardCard
                            title="Total Balance"
                            amount={formatAmount(stats.balance)}
                            icon={<DollarSign size={24} />}
                            color="#6366f1"
                            isFormatted={true}
                        />
                        <DashboardCard
                            title="Total Income"
                            amount={formatAmount(stats.income)}
                            icon={<TrendingUp size={24} />}
                            color="#10b981"
                            isFormatted={true}
                        />
                        <DashboardCard
                            title="Total Expenses"
                            amount={formatAmount(stats.expense)}
                            icon={<TrendingDown size={24} />}
                            color="#ef4444"
                            type="expense"
                            isFormatted={true}
                        />
                        <DashboardCard
                            title="Net Savings"
                            amount={formatAmount(stats.savings)}
                            icon={<Wallet size={24} />}
                            color="#ec4899"
                            isFormatted={true}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
                        <HealthScoreCard score={stats.healthScore} />

                        {/* Savings Goals Card with Logos & Interactive Filtering */}
                        <div className="glass card" style={{ flex: 1, minWidth: '300px' }}>
                            <div className="flex-between" style={{ marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>Savings Goals</h3>
                                <a href="/savings" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}>View All</a>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {filteredSavingsGoals.length > 0 ? filteredSavingsGoals.slice(0, 4).map(goal => {
                                    const progressPct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
                                    return (
                                        <div key={goal._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {getSavingsGoalIcon(goal)}
                                            <div style={{ flex: 1 }}>
                                                <div className="flex-between" style={{ fontSize: '13.5px', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{goal.goalName}</span>
                                                    <span style={{ fontWeight: '800', color: progressPct === 100 ? 'var(--income)' : 'var(--primary)' }}>{progressPct}%</span>
                                                </div>
                                                <div style={{ height: '6px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ 
                                                        height: '100%', 
                                                        width: `${progressPct}%`, 
                                                        background: progressPct === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #a855f7)',
                                                        borderRadius: '3px',
                                                        transition: 'width 0.6s ease'
                                                    }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>No matching savings goals.</p>}
                            </div>
                        </div>

                        <SmartTips transactions={transactions} savingsRate={stats.income > 0 ? (stats.savings / stats.income) * 100 : 0} />
                    </div>

                    <Charts transactions={transactions} />

                    <div className="glass card glass-shadow" style={{ minWidth: '100%', border: 'none' }}>
                        <div className="flex-between" style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>Recent Transactions</h3>
                            <a href="/transactions" style={{
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}>
                                View All
                            </a>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {filteredTransactions.length > 0 ? filteredTransactions.slice(0, 5).map(t => (
                                        <tr key={t._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '16px 0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    {getTransactionIcon(t.category)}
                                                    <div>
                                                        <p style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '15px', marginBottom: '2px' }}>{t.title}</p>
                                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                                                {`${new Date(t.date).getDate()} ${new Date(t.date).toLocaleString('en-US', { month: 'short' })}`}
                                            </td>
                                            <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '800', color: t.type === 'income' ? 'var(--income)' : 'var(--text-main)', fontSize: '16px' }}>
                                                {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                                No transactions match your search query "{searchQuery}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <AddTransactionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchDashboardData}
            />
        </div>
    );
};

export default Dashboard;
