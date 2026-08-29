import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Plus, Trash2, RefreshCw, Calendar } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const RecurringTransactions = () => {
    const { formatAmount } = useCurrency();
    const [recurring, setRecurring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        type: 'expense',
        frequency: 'monthly'
    });

    const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Rent', 'Salary', 'Other'];

    useEffect(() => {
        fetchRecurring();
    }, []);

    const fetchRecurring = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/recurring');
            setRecurring(data);
        } catch (error) {
            console.error('Error fetching recurring transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/recurring', formData);
            setFormData({ ...formData, title: '', amount: '', category: '' });
            fetchRecurring();
        } catch (error) {
            console.error('Error creating recurring transaction:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/recurring/${id}`);
            fetchRecurring();
        } catch (error) {
            console.error('Error deleting recurring transaction:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <Navbar />
                
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>Recurring Transactions</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Automate your regular income and expenses.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                    {/* Add Recurring Form */}
                    <div className="glass card glass-shadow">
                        <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>Add Recurring</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Title</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="e.g. Netflix Subscription"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Amount</label>
                                    <input 
                                        type="number" 
                                        className="input-field" 
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Type</label>
                                    <select 
                                        className="input-field" 
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Category</label>
                                <select 
                                    className="input-field" 
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Frequency</label>
                                <select 
                                    className="input-field" 
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                                <RefreshCw size={18} /> Set Recurring
                            </button>
                        </form>
                    </div>

                    {/* Recurring List */}
                    <div className="glass card glass-shadow">
                        <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>Active Recurring</h3>
                        {loading ? (
                            <p>Loading...</p>
                        ) : recurring.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <Calendar size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <p>No recurring transactions found.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {recurring.map(item => (
                                    <div key={item._id} className="flex-between" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--glass-border)' }}>
                                        <div>
                                            <p style={{ fontWeight: '700', color: 'var(--text-main)' }}>{item.title}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.category} • {item.frequency}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{ fontWeight: '800', color: item.type === 'income' ? 'var(--income)' : 'var(--text-main)' }}>
                                                {item.type === 'income' ? '+' : '-'}{formatAmount(item.amount)}
                                            </span>
                                            <button onClick={() => handleDelete(item._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RecurringTransactions;
