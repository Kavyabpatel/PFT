import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    PieChart,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Target
} from 'lucide-react';

const Summary = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const { data } = await api.get('/transactions');
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching transactions', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;

    const categories = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    const topCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    if (loading) return <div style={{ color: '#000', padding: '100px', textAlign: 'center' }}>Loading Summary...</div>;

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <Navbar />

                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#000' }}>Financial Summary</h1>
                    <p style={{ color: 'var(--text-muted)' }}>A comprehensive breakdown of your financial health.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div className="glass card glass-shadow" style={{ border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                <Activity size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#000' }}>Overall Health</h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Based on your activity</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--income)', fontWeight: '700', fontSize: '14px' }}>Excellent</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Score: 85/100</span>
                        </div>
                    </div>

                    <div className="glass card glass-shadow" style={{ border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
                                <Target size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#000' }}>Savings Rate</h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Monthly Average</p>
                            </div>
                        </div>
                        <p style={{ fontSize: '28px', fontWeight: '800', color: '#000' }}>{savingsRate}%</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Target: 20%</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
                    <div className="glass card glass-shadow" style={{ border: 'none' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: '#000' }}>Spending Breakdown</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {topCategories.map(([cat, amt]) => (
                                <div key={cat}>
                                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                                        <span style={{ fontWeight: '600', color: '#000' }}>{cat}</span>
                                        <span style={{ fontWeight: '700', color: '#000' }}>${amt.toLocaleString()}</span>
                                    </div>
                                    <div style={{ height: '8px', width: '100%', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(amt / expense * 100)}%`,
                                            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                            borderRadius: '4px'
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass card glass-shadow" style={{ border: 'none' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: '#000' }}>Monthly Flow</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="flex-between" style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <TrendingUp color="var(--income)" />
                                    <span style={{ fontWeight: '600', color: '#000' }}>Total Income</span>
                                </div>
                                <span style={{ fontWeight: '800', color: 'var(--income)', fontSize: '18px' }}>+${income.toLocaleString()}</span>
                            </div>
                            <div className="flex-between" style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <TrendingDown color="var(--expense)" />
                                    <span style={{ fontWeight: '600', color: '#000' }}>Total Expenses</span>
                                </div>
                                <span style={{ fontWeight: '800', color: 'var(--expense)', fontSize: '18px' }}>-${expense.toLocaleString()}</span>
                            </div>
                            <div className="flex-between" style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.1)', marginTop: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Wallet color="var(--primary)" />
                                    <span style={{ fontWeight: '600', color: '#000' }}>Net Balance</span>
                                </div>
                                <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '18px' }}>${balance.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Summary;
