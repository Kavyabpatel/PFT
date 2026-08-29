import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { PlusCircle, ArrowLeft, Save } from 'lucide-react';

const AddTransaction = () => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const categories = ['Food', 'Rent', 'Salary', 'Shopping', 'Entertainment', 'Transport', 'Healthcare', 'Others'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/transactions', formData);
            navigate('/transactions');
        } catch (error) {
            console.error('Error adding transaction', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="main-content">
                <Navbar />

                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Add Transaction</h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Keep track of your income and expenses flawlessly.</p>
                </div>

                <div className="glass card glass-shadow" style={{ maxWidth: '800px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Transaction Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="input-field"
                                    style={{ height: '48px' }}
                                    placeholder="e.g. Monthly Salary"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Amount ($)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    className="input-field"
                                    style={{ height: '48px' }}
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Category</label>
                                <select
                                    name="category"
                                    className="input-field"
                                    value={formData.category}
                                    onChange={handleChange}
                                    style={{ height: '48px', appearance: 'none' }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} style={{ background: 'var(--bg-dark)' }}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Transaction Type</label>
                                <select
                                    name="type"
                                    className="input-field"
                                    value={formData.type}
                                    onChange={handleChange}
                                    style={{ height: '48px', appearance: 'none' }}
                                >
                                    <option value="expense" style={{ background: 'var(--bg-dark)' }}>Expense</option>
                                    <option value="income" style={{ background: 'var(--bg-dark)' }}>Income</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Date</label>
                            <input
                                type="date"
                                name="date"
                                className="input-field"
                                style={{ height: '48px' }}
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Notes (Optional)</label>
                            <textarea
                                name="notes"
                                className="input-field"
                                placeholder="Add some details about this transaction..."
                                style={{ height: '120px', resize: 'none', padding: '16px' }}
                                value={formData.notes}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                style={{
                                    padding: '14px 28px',
                                    background: 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-main)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >Cancel</button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{
                                    padding: '14px 40px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                {loading ? 'Saving...' : (
                                    <>
                                        <Save size={18} />
                                        <span>Save Transaction</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddTransaction;
