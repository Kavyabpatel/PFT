import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Plus, Trash2, PieChart, Loader2, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const BudgetPlanner = () => {
    const { formatAmount } = useCurrency();
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        category: '',
        budgetAmount: '',
        month: new Date().toISOString().slice(0, 7)
    });
    const [successMessage, setSuccessMessage] = useState('');

    const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Rent', 'Other'];

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/budgets');
            setBudgets(data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budgets', formData);
            setSuccessMessage('Budget saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            setFormData({ ...formData, category: '', budgetAmount: '' });
            fetchBudgets();
        } catch (error) {
            console.error('Error setting budget:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/budgets/${id}`);
            fetchBudgets();
        } catch (error) {
            console.error('Error deleting budget:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <Navbar />
                
                <div style={{ marginBottom: '32px', animation: 'fadeIn 0.5s ease' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Budget Planner
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Proactively set limits to keep your spending in check.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                    {/* Add Budget Form */}
                    <div className="glass card glass-shadow" style={{ animation: 'slideUp 0.4s ease' }}>
                        <div className="flex-between" style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Plan Budget</h3>
                            {successMessage && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--income)', fontSize: '14px', fontWeight: '600' }}>
                                    <CheckCircle2 size={16} /> {successMessage}
                                </span>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Category</label>
                                <select 
                                    className="input-field" 
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="" disabled>Select a Category...</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Budget Amount</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="number" 
                                        className="input-field" 
                                        placeholder="0.00"
                                        value={formData.budgetAmount}
                                        onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Applicable Month</label>
                                <input 
                                    type="month" 
                                    className="input-field"
                                    value={formData.month}
                                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="save-transaction-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
                                <Plus size={20} /> Create Budget
                            </button>
                        </form>
                    </div>

                    {/* Budget List */}
                    <div className="glass card glass-shadow" style={{ animation: 'slideUp 0.5s ease', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>Active Allocations</h3>
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: 'var(--primary)' }}>
                                <Loader2 size={40} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                                <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontWeight: '500' }}>Loading your budgets...</p>
                                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : budgets.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '50%', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
                                    <PieChart size={64} style={{ opacity: 0.4, color: 'var(--primary)' }} />
                                </div>
                                <h4 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>No Active Budgets</h4>
                                <p style={{ maxWidth: '250px', lineHeight: '1.5' }}>You haven't set any budgets for this month. Start planning above.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
                                {budgets.map((budget, idx) => (
                                    <div key={budget._id} className="flex-between" style={{ 
                                        padding: '16px 20px', 
                                        borderRadius: '16px', 
                                        background: 'var(--bg-dark)', 
                                        border: '1px solid var(--glass-border)',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                        animation: `fadeIn 0.3s ease ${idx * 0.1}s forwards`,
                                        opacity: 0,
                                        cursor: 'default'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <PieChart size={24} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '16px' }}>{budget.category}</p>
                                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '500' }}>
                                                    {budget.month.split('-')[1]}/{budget.month.split('-')[0]}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '16px' }}>{formatAmount(budget.budgetAmount)}</span>
                                            <button onClick={() => handleDelete(budget._id)} style={{ 
                                                background: 'rgba(239, 68, 68, 0.1)', 
                                                border: 'none', 
                                                color: '#ef4444', 
                                                cursor: 'pointer', 
                                                padding: '10px',
                                                borderRadius: '10px',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.transform = 'scale(1)'; }}
                                            title="Delete Budget">
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

export default BudgetPlanner;
