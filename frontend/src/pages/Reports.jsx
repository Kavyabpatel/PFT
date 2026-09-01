import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Download,
    Shield,
    PieChart,
    FileSpreadsheet,
    ArrowLeft
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import AddTransactionModal from '../components/AddTransactionModal';
import { Plus, Moon, Sun, Bell } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Reports = () => {
    const { user } = useAuth();
    const { formatAmount } = useCurrency();
    const { darkMode, toggleDarkMode } = useTheme();
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [fund, setFund] = useState({ targetAmount: 0, savedAmount: 0 });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [transRes, budgetRes, fundRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/budgets'),
                api.get('/emergency-fund')
            ]);
            setTransactions(transRes.data);
            setBudgets(budgetRes.data);
            setFund(fundRes.data);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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
            link.setAttribute('download', `Full-Financial-Report-${user?.name || 'User'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
        } finally {
            setExporting(false);
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const response = await api.get('/export/excel', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Financial-Report-${user?.name || 'User'}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading Excel:', error);
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
            link.setAttribute('download', `Complete-Transactions-${user?.name || 'User'}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading CSV:', error);
        }
    };

    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const savings = Math.max(0, income - expense);

    const categories = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    const pieData = {
        labels: Object.keys(categories),
        datasets: [{
            data: Object.values(categories),
            backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'],
            borderWidth: 0,
        }]
    };

    const barData = {
        labels: ['Income', 'Expense', 'Savings'],
        datasets: [{
            label: 'Amount',
            data: [income, expense, savings],
            backgroundColor: ['#10b981', '#ef4444', '#6366f1'],
            borderRadius: 8,
        }]
    };

    const fundProgress = Math.min(100, Math.round((fund.savedAmount / fund.targetAmount) * 100) || 0);
    const budgetUtilization = budgets.length > 0 ? budgets.reduce((acc, b) => {
        const spent = categories[b.category] || 0;
        return acc + (spent / b.budgetAmount);
    }, 0) / budgets.length : 0;

    const navigate = useNavigate();

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content" style={{ paddingTop: '32px' }}>

                <div className="flex-between" style={{ marginBottom: '32px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-main)',
                                    padding: '8px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Go Back"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Financial Reports</h1>
                        </div>
                        <p style={{ color: 'var(--text-muted)' }}>Analyzed breakdown of your economy.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                                padding: '0 20px',
                                height: '44px'
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
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            <FileSpreadsheet size={18} /> CSV
                        </button>
                        <button
                            onClick={handleDownloadExcel}
                            className="glass"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 15px',
                                borderRadius: '12px',
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            <FileSpreadsheet size={18} /> Excel
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
                                fontSize: '14px',
                                border: 'none'
                            }}
                        >
                            <Download size={18} /> {exporting ? 'Exporting...' : 'PDF Report'}
                        </button>
                    </div>
                </div>

                <div id="reports-export-area">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                        <div className="glass card glass-shadow">
                            <div className="flex-between" style={{ marginBottom: '16px' }}>
                                <div style={{ color: 'var(--income)' }}><TrendingUp size={24} /></div>
                                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--income)' }}>Total Income</span>
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{formatAmount(income)}</h3>
                        </div>

                        <div className="glass card glass-shadow">
                            <div className="flex-between" style={{ marginBottom: '16px' }}>
                                <div style={{ color: 'var(--expense)' }}><TrendingDown size={24} /></div>
                                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--expense)' }}>Total Expenses</span>
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{formatAmount(expense)}</h3>
                        </div>

                        <div className="glass card glass-shadow">
                            <div className="flex-between" style={{ marginBottom: '16px' }}>
                                <div style={{ color: 'var(--primary)' }}><PieChart size={24} /></div>
                                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>Net Savings</span>
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{formatAmount(savings)}</h3>
                        </div>

                        <div className="glass card glass-shadow">
                            <div className="flex-between" style={{ marginBottom: '16px' }}>
                                <div style={{ color: '#10b981' }}><Shield size={24} /></div>
                                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>EF Progress</span>
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{fundProgress}%</h3>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                        <div className="glass card glass-shadow" style={{ minHeight: '350px' }}>
                            <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>Spending by Category</h3>
                            <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                                {Object.keys(categories).length > 0 ? (
                                    <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'var(--text-muted)' } } } }} />
                                ) : (
                                    <p style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>No expenses recorded yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="glass card glass-shadow" style={{ minHeight: '350px' }}>
                            <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>Financial Comparison</h3>
                            <div style={{ height: '250px' }}>
                                <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'var(--glass-border)' }, ticks: { color: 'var(--text-muted)' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } } } }} />
                            </div>
                        </div>
                    </div>

                    <div className="glass card glass-shadow">
                        <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>Smart Insights Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Budget Discipline</p>
                                <div style={{ height: '10px', background: 'var(--glass-bg)', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
                                    <div style={{ width: `${Math.min(100, budgetUtilization * 100)}%`, height: '100%', background: budgetUtilization > 1 ? 'var(--expense)' : 'var(--income)' }}></div>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {budgetUtilization > 1 ? 'Over budget on several categories.' : 'You are maintaining your budget limits well.'}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Emergency Safety Net</p>
                                <div style={{ height: '10px', background: 'var(--glass-bg)', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
                                    <div style={{ width: `${fundProgress}%`, height: '100%', background: 'var(--primary)' }}></div>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {fundProgress === 100 ? 'Emergency fund fully established!' : `Saved ${formatAmount(fund.savedAmount)} towards goal.`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AddTransactionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchData}
            />
        </div>
    );
};

export default Reports;

