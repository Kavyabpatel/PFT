import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
    Search,
    Filter,
    Trash2,
    Receipt,
    Utensils,
    Home,
    Briefcase,
    ShoppingBag,
    Gamepad2,
    Bus,
    HeartPulse,
    Plus,
    Wallet,
    Moon,
    Sun,
    Bell,
    ArrowLeft,
    FileSpreadsheet
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AddTransactionModal from '../components/AddTransactionModal';
import CSVImportModal from '../components/CSVImportModal';

const Transactions = () => {
    const { darkMode, toggleDarkMode } = useTheme();
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

    const getTransactionIcon = (category) => {
        const iconStyle = {
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#6366f1',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        };

        let IconComponent = Wallet;
        const cat = category.toLowerCase();

        if (cat.includes('food')) { IconComponent = Utensils; iconStyle.color = '#ef4444'; iconStyle.background = 'rgba(239, 68, 68, 0.1)'; iconStyle.border = '1px solid rgba(239, 68, 68, 0.1)'; }
        else if (cat.includes('rent')) { IconComponent = Home; iconStyle.color = '#6366f1'; iconStyle.background = 'rgba(99, 102, 241, 0.1)'; }
        else if (cat.includes('salary') || cat.includes('income')) { IconComponent = Briefcase; iconStyle.color = '#10b981'; iconStyle.background = 'rgba(16, 185, 129, 0.1)'; iconStyle.border = '1px solid rgba(16, 185, 129, 0.1)'; }
        else if (cat.includes('shop')) { IconComponent = ShoppingBag; iconStyle.color = '#f59e0b'; iconStyle.background = 'rgba(245, 158, 11, 0.1)'; iconStyle.border = '1px solid rgba(245, 158, 11, 0.1)'; }
        else if (cat.includes('entert')) { IconComponent = Gamepad2; iconStyle.color = '#ec4899'; iconStyle.background = 'rgba(236, 72, 153, 0.1)'; iconStyle.border = '1px solid rgba(236, 72, 153, 0.1)'; }
        else if (cat.includes('trans')) { IconComponent = Bus; iconStyle.color = '#06b6d4'; iconStyle.background = 'rgba(6, 182, 212, 0.1)'; iconStyle.border = '1px solid rgba(6, 182, 212, 0.1)'; }
        else if (cat.includes('health')) { IconComponent = HeartPulse; iconStyle.color = '#14b8a6'; iconStyle.background = 'rgba(20, 184, 166, 0.1)'; iconStyle.border = '1px solid rgba(20, 184, 166, 0.1)'; }

        return (
            <div style={iconStyle} className="glass">
                <IconComponent size={24} />
            </div>
        );
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Food': return '#f87171';
            case 'Rent': return '#60a5fa';
            case 'Salary': return '#34d399';
            case 'Shopping': return '#fbbf24';
            case 'Entertainment': return '#a78bfa';
            case 'Transport': return '#fb7185';
            case 'Healthcare': return '#2dd4bf';
            default: return '#94a3b8';
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await api.delete(`/transactions/${id}`);
                setTransactions(transactions.filter(t => t._id !== id));
            } catch (error) {
                console.error('Error deleting transaction', error);
            }
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || t.type === filter;
        return matchesSearch && matchesFilter;
    });

    const navigate = useNavigate();

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="main-content" style={{ paddingTop: '32px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
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
                            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>Transactions History</h1>
                        </div>
                        <p style={{ color: 'var(--text-muted)' }}>Real-time monitoring of your financial activities.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button 
                            onClick={() => setIsCSVModalOpen(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '12px',
                                fontWeight: '600',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--glass-bg)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                padding: '0 18px',
                                height: '44px'
                            }}
                        >
                            <FileSpreadsheet size={18} color="var(--primary)" /> Import Bank CSV
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
                                padding: '0 20px',
                                height: '44px'
                            }}
                        >
                            <Plus size={18} /> Add Transaction
                        </button>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '32px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input-field"
                            style={{ paddingLeft: '48px', height: '48px' }}
                            placeholder="Search by title or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ position: 'relative', width: '200px' }}>
                        <Filter size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
                        <select
                            className="input-field"
                            style={{ paddingLeft: '48px', height: '48px', appearance: 'none' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all" style={{ background: 'var(--bg-dark)' }}>All Types</option>
                            <option value="income" style={{ background: 'var(--bg-dark)' }}>Income</option>
                            <option value="expense" style={{ background: 'var(--bg-dark)' }}>Expense</option>
                        </select>
                    </div>
                </div>

                <div className="glass card glass-shadow" style={{ minHeight: '400px', padding: '0' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Date</th>
                                    <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Transaction</th>
                                    <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Category</th>
                                    <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', textAlign: 'right' }}>Amount</th>
                                    <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map(t => (
                                    <tr key={t._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                            {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {getTransactionIcon(t.category)}
                                                <div style={{ fontWeight: '700', color: '#000' }}>{t.title}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                background: 'rgba(0,0,0,0.03)',
                                                fontSize: '12px',
                                                color: 'var(--text-muted)',
                                                fontWeight: '500'
                                            }}>{t.category}</span>
                                        </td>
                                        <td style={{
                                            padding: '16px 20px',
                                            fontWeight: '800',
                                            textAlign: 'right',
                                            color: t.type === 'income' ? 'var(--income)' : '#000',
                                            fontSize: '15px'
                                        }}>
                                            {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleDelete(t._id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: 'none',
                                                    color: 'var(--expense)',
                                                    cursor: 'pointer',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredTransactions.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                            <div style={{ marginBottom: '16px', opacity: 0.3 }}><Receipt size={48} /></div>
                            <p>No transactions match your filters.</p>
                        </div>
                    )}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                            <p>Loading history...</p>
                        </div>
                    )}
                </div>
            </main>

            <AddTransactionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchTransactions}
            />

            <CSVImportModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onSuccess={(count) => {
                    fetchTransactions();
                    alert(`Successfully imported ${count} transactions!`);
                }}
            />
        </div>
    );
};

export default Transactions;
