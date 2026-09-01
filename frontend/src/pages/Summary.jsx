import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    PieChart,
    Wallet,
    Target,
    ArrowLeft,
    Utensils,
    Home,
    Briefcase,
    ShoppingBag,
    Gamepad2,
    Bus,
    HeartPulse,
    Receipt
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const Summary = () => {
    const navigate = useNavigate();
    const { formatAmount } = useCurrency();
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

    const getCategoryIcon = (category) => {
        const cat = (category || '').toLowerCase();
        if (cat.includes('food') || cat.includes('din') || cat.includes('eat') || cat.includes('rest')) {
            return <Utensils size={18} color="#f59e0b" />;
        }
        if (cat.includes('shop') || cat.includes('store') || cat.includes('buy')) {
            return <ShoppingBag size={18} color="#ec4899" />;
        }
        if (cat.includes('rent') || cat.includes('home') || cat.includes('house')) {
            return <Home size={18} color="#6366f1" />;
        }
        if (cat.includes('sal') || cat.includes('job') || cat.includes('work') || cat.includes('earn')) {
            return <Briefcase size={18} color="#10b981" />;
        }
        if (cat.includes('ent') || cat.includes('game') || cat.includes('fun') || cat.includes('mov')) {
            return <Gamepad2 size={18} color="#8b5cf6" />;
        }
        if (cat.includes('trans') || cat.includes('bus') || cat.includes('cab') || cat.includes('fuel')) {
            return <Bus size={18} color="#06b6d4" />;
        }
        if (cat.includes('health') || cat.includes('med') || cat.includes('doc')) {
            return <HeartPulse size={18} color="#ef4444" />;
        }
        return <Receipt size={18} color="#64748b" />;
    };

    const income = transactions
        .filter(t => t.type && t.type.toLowerCase() === 'income')
        .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const expense = transactions
        .filter(t => t.type && t.type.toLowerCase() === 'expense')
        .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const savings = income - expense;
    const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

    const categories = transactions
        .filter(t => t.type && t.type.toLowerCase() === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + (Number(t.amount) || 0);
            return acc;
        }, {});

    const topCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (loading) return <div style={{ color: 'var(--text-main)', padding: '100px', textAlign: 'center' }}>Loading Summary...</div>;

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content" style={{ paddingTop: '32px' }}>

                <div style={{ marginBottom: '32px' }}>
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
                        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Financial Summary</h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>A comprehensive breakdown of your financial health.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div className="glass card glass-shadow" style={{ border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                <Activity size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>Overall Health</h3>
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
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>Savings Rate</h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Monthly Average</p>
                            </div>
                        </div>
                        <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>{savingsRate}%</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Target: 20%</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                    {/* Spending Breakdown Card */}
                    <div className="glass card glass-shadow" style={{ border: 'none' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: 'var(--text-main)' }}>Spending Breakdown</h3>
                        
                        {topCategories.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No expenses recorded yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {topCategories.map(([cat, amt]) => (
                                    <div key={cat}>
                                        <div className="flex-between" style={{ marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(99, 102, 241, 0.08)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {getCategoryIcon(cat)}
                                                </div>
                                                <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '15px' }}>{cat}</span>
                                            </div>
                                            <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '15px' }}>{formatAmount(amt)}</span>
                                        </div>
                                        <div style={{ height: '8px', width: '100%', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${expense > 0 ? (amt / expense * 100) : 0}%`,
                                                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                                borderRadius: '4px'
                                            }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Monthly Flow Card */}
                    <div className="glass card glass-shadow" style={{ border: 'none' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: 'var(--text-main)' }}>Monthly Flow</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="flex-between" style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <TrendingUp color="var(--income)" />
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Total Income</span>
                                </div>
                                <span style={{ fontWeight: '800', color: 'var(--income)', fontSize: '18px' }}>+{formatAmount(income)}</span>
                            </div>
                            <div className="flex-between" style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <TrendingDown color="var(--expense)" />
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Total Expenses</span>
                                </div>
                                <span style={{ fontWeight: '800', color: 'var(--expense)', fontSize: '18px' }}>-{formatAmount(expense)}</span>
                            </div>
                            <div className="flex-between" style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Wallet color="var(--primary)" />
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Net Balance</span>
                                </div>
                                <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '18px' }}>{formatAmount(savings)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Summary;
