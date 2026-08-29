import React, { useState, useEffect } from 'react';
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
    FileSpreadsheet
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const { formatAmount, symbol } = useCurrency();
    const { darkMode, toggleDarkMode } = useTheme();
    const { unreadCount } = useNotifications();
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
                .filter(t => t.type === 'income')
                .reduce((acc, t) => acc + t.amount, 0);

            const expense = data
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);

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
            const fundProgress = userFund.targetAmount > 0 ? (userFund.savedAmount / userFund.targetAmount) * 30 : 15;

            const healthScore = Math.round(savingsScore + budgetDiscipline + fundProgress);

            setStats({
                income,
                expense,
                balance: income - expense,
                savings: Math.max(0, income - expense),
                healthScore,
                alerts: monthAlerts
            });
        } catch (error) {
            console.error('Error fetching data:', error);
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

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="main-content">
                <Navbar />

                <div className="flex-between" style={{ marginBottom: '32px', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
                            Welcome back, <span className="text-gradient">{user?.name || 'User'}</span>! 👋
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Here's your smart financial summary in {symbol}.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button 
                            className="header-icon-btn" 
                            onClick={toggleDarkMode}
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button className="header-icon-btn" title="Notifications" style={{ position: 'relative' }}>
                            <Bell size={20} />
                            {unreadCount > 0 && <span className="notification-dot" style={{ display: 'block' }}></span>}
                        </button>

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
                                height: '44px',
                                padding: '0 20px'
                            }}
                        >
                            <Plus size={18} /> Add Transaction
                        </button>
                        <button
                            onClick={handleDownloadCSV}
                            className="glass"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 15px',
                                borderRadius: '12px',
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            <FileSpreadsheet size={18} /> CSV
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={exporting}
                            className="btn-primary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 15px',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                                border: 'none'
                            }}
                        >
                            <Download size={18} /> {exporting ? 'Exporting...' : 'PDF Report'}
                        </button>
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
                        <div className="glass card" style={{ flex: 1, minWidth: '300px' }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '700' }}>Savings Goals</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {savingsGoals.length > 0 ? savingsGoals.slice(0, 3).map(goal => (
                                    <div key={goal._id}>
                                        <div className="flex-between" style={{ fontSize: '13px', marginBottom: '4px' }}>
                                            <span>{goal.goalName}</span>
                                            <span style={{ fontWeight: '600' }}>{Math.round((goal.savedAmount / goal.targetAmount) * 100)}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                height: '100%', 
                                                width: `${Math.min(100, (goal.savedAmount / goal.targetAmount) * 100)}%`, 
                                                background: 'var(--primary)' 
                                            }}></div>
                                        </div>
                                    </div>
                                )) : <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No savings goals set.</p>}
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
                                    {transactions.slice(0, 5).map(t => (
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
                                    ))}
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
