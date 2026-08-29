import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Loader2
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Analytics = () => {
    const { user } = useAuth();
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

    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const savings = Math.max(0, income - expense);

    // Grouping by category for Pie Chart
    const categories = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    // Grouping by date for Line Chart
    const dailyData = {};
    transactions.forEach(t => {
        const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dailyData[date]) dailyData[date] = { income: 0, expense: 0 };
        if (t.type === 'income') dailyData[date].income += t.amount;
        else dailyData[date].expense += t.amount;
    });

    const sortedDates = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));

    const pieData = {
        labels: Object.keys(categories),
        datasets: [{
            data: Object.values(categories),
            backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'],
            borderWidth: 0,
            hoverOffset: 10,
        }]
    };

    const lineData = {
        labels: sortedDates.slice(-10), // Last 10 days
        datasets: [
            {
                label: 'Income',
                data: sortedDates.slice(-10).map(date => dailyData[date].income),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Expense',
                data: sortedDates.slice(-10).map(date => dailyData[date].expense),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const barData = {
        labels: ['Inflow / Outflow Analysis'],
        datasets: [
            {
                label: 'Income',
                data: [income],
                backgroundColor: '#10b981',
                borderRadius: 8,
                barPercentage: 0.6,
            },
            {
                label: 'Expense',
                data: [expense],
                backgroundColor: '#ef4444',
                borderRadius: 8,
                barPercentage: 0.6,
            },
            {
                label: 'Savings',
                data: [savings],
                backgroundColor: '#6366f1',
                borderRadius: 8,
                barPercentage: 0.6,
            }
        ]
    };

    const insights = [];
    if (income > 0) {
        const savingsRate = (savings / income) * 100;
        if (savingsRate > 20) insights.push("🔥 Excellent! Your savings rate is above 20%. You're building wealth highly efficiently.");
        else insights.push("💡 Try to aim for a 20% savings rate. Reducing non-essential expenses could boost your future security.");
    }
    
    if (expense > income) insights.push("⚠️ Warning: Your expenses exceeded your income this period. Consider reviewing your top spending categories.");
    
    const topCategory = Object.keys(categories).sort((a,b) => categories[b] - categories[a])[0];
    if (topCategory) insights.push(`📊 Your top spending category is '${topCategory}'. Look for minor ways to optimize costs here.`);

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: 'var(--text-muted)',
                    font: { family: "'Outfit', sans-serif", size: 13 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { family: "'Outfit', sans-serif", size: 14 },
                bodyFont: { family: "'Outfit', sans-serif", size: 14 },
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
                ticks: { color: 'var(--text-muted)', font: { family: "'Outfit', sans-serif" } }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: 'var(--text-muted)', font: { family: "'Outfit', sans-serif" } }
            }
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <Navbar />

                <div style={{ marginBottom: '32px', animation: 'fadeIn 0.5s ease' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Deep Analytics
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Visualize your financial trends, performance, and key insights.</p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', color: 'var(--primary)', animation: 'fadeIn 0.5s ease' }}>
                        <Loader2 size={48} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '16px' }}>Crunching your financial data...</p>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <div style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                            <div className="glass card glass-shadow" style={{ borderLeft: '4px solid var(--income)', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Inflow</p>
                                        <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>{formatAmount(income)}</h3>
                                    </div>
                                    <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '14px', color: 'var(--income)' }}>
                                        <TrendingUp size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="glass card glass-shadow" style={{ borderLeft: '4px solid var(--expense)', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Outflow</p>
                                        <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>{formatAmount(expense)}</h3>
                                    </div>
                                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '14px', color: 'var(--expense)' }}>
                                        <TrendingDown size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="glass card glass-shadow" style={{ borderLeft: '4px solid var(--primary)', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Savings</p>
                                        <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>{formatAmount(savings)}</h3>
                                    </div>
                                    <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '14px', color: 'var(--primary)' }}>
                                        <Activity size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            <div className="glass card glass-shadow" style={{ minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>Income vs Expense</h3>
                                <div style={{ flex: 1, minHeight: 0 }}>
                                    <Bar data={barData} options={chartOptions} />
                                </div>
                            </div>

                            <div className="glass card glass-shadow" style={{ minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>Spending Timeline</h3>
                                <div style={{ flex: 1, minHeight: 0 }}>
                                    <Line data={lineData} options={chartOptions} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '32px' }}>
                            <div className="glass card glass-shadow" style={{ minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>Category Breakdown</h3>
                                <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {Object.keys(categories).length > 0 ? (
                                        <Pie data={pieData} options={{ ...chartOptions, maintainAspectRatio: false, plugins: { ...chartOptions.plugins, legend: { position: 'right', labels: { color: 'var(--text-muted)', font: { family: "'Outfit', sans-serif", size: 12 }, padding: 20 } } } }} />
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            <BarChart3 size={48} style={{ opacity: 0.2, marginBottom: '16px', color: 'var(--text-muted)' }} />
                                            <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>No expense data to analyze yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="glass card glass-shadow">
                                <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>Smart Insights</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {insights.length > 0 ? insights.map((insight, i) => (
                                        <div key={i} style={{ 
                                            padding: '16px', 
                                            borderRadius: '16px', 
                                            background: i % 2 === 0 ? 'rgba(99, 102, 241, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                                            borderLeft: `5px solid ${i % 2 === 0 ? 'var(--primary)' : 'var(--income)'}`,
                                            animation: `fadeIn 0.4s ease ${i * 0.15}s both`
                                        }}>
                                            <p style={{ margin: 0, fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-main)', fontWeight: '500' }}>{insight}</p>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '24px', background: 'rgba(0,0,0,0.02)', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                                            <Activity size={24} />
                                            <p style={{ fontWeight: '500' }}>Add more transactions to generate AI driven insights.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Analytics;
