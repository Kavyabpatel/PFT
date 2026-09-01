import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
    Landmark,
    TrendingUp,
    TrendingDown,
    Plus,
    Trash2,
    ArrowLeft,
    Shield,
    DollarSign,
    PieChart,
    Building2,
    Coins,
    Briefcase,
    CreditCard,
    CheckCircle2
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const NetWorthTracker = () => {
    const navigate = useNavigate();
    const { formatAmount } = useCurrency();
    const [assets, setAssets] = useState([]);
    const [summary, setSummary] = useState({ totalAssets: 0, totalLiabilities: 0, netWorth: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        type: 'stocks',
        currentValue: '',
        initialInvestment: '',
        institution: '',
        notes: ''
    });

    const assetTypes = [
        { id: 'stocks', label: 'Stocks & Equities', icon: <TrendingUp size={16} /> },
        { id: 'mutual_funds', label: 'Mutual Funds', icon: <Briefcase size={16} /> },
        { id: 'crypto', label: 'Crypto', icon: <Coins size={16} /> },
        { id: 'gold', label: 'Gold & Precious Metals', icon: <Landmark size={16} /> },
        { id: 'fixed_deposit', label: 'Fixed Deposits & Savings', icon: <DollarSign size={16} /> },
        { id: 'real_estate', label: 'Real Estate', icon: <Building2 size={16} /> },
        { id: 'cash_savings', label: 'Cash Reserve', icon: <Shield size={16} /> },
        { id: 'loan_liability', label: 'Loan / Liability (Debt)', icon: <CreditCard size={16} /> }
    ];

    const [errorMsg, setErrorMsg] = useState('');

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/assets');
            setAssets(response.data.assets || []);
            setSummary(response.data.summary || { totalAssets: 0, totalLiabilities: 0, netWorth: 0 });
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            await api.post('/assets', formData);
            setSuccessMsg('Item successfully added!');
            setShowModal(false);
            setErrorMsg('');
            setFormData({
                name: '',
                type: 'stocks',
                currentValue: '',
                initialInvestment: '',
                institution: '',
                notes: ''
            });
            fetchAssets();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error('Error adding asset:', error);
            setErrorMsg(error.response?.data?.message || 'Failed to add asset. Please check server connection or inputs.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this asset item?')) {
            try {
                await api.delete(`/assets/${id}`);
                fetchAssets();
            } catch (error) {
                console.error('Error deleting asset:', error);
            }
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'stocks': return <TrendingUp size={18} color="#6366f1" />;
            case 'mutual_funds': return <Briefcase size={18} color="#10b981" />;
            case 'crypto': return <Coins size={18} color="#f59e0b" />;
            case 'gold': return <Landmark size={18} color="#eab308" />;
            case 'fixed_deposit': return <DollarSign size={18} color="#06b6d4" />;
            case 'real_estate': return <Building2 size={18} color="#8b5cf6" />;
            case 'cash_savings': return <Shield size={18} color="#14b8a6" />;
            case 'loan_liability': return <CreditCard size={18} color="#ef4444" />;
            default: return <Landmark size={18} color="#6366f1" />;
        }
    };

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
                            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: 'var(--text-main)', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Asset & Net Worth Tracker
                            </h1>
                        </div>
                        <p style={{ color: 'var(--text-muted)' }}>Track your total portfolio assets, investments, and liabilities.</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {successMsg && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--income)', fontSize: '14px', fontWeight: '600' }}>
                                <CheckCircle2 size={16} /> {successMsg}
                            </span>
                        )}
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', height: '44px', padding: '0 20px' }}
                        >
                            <Plus size={18} /> Add Asset / Loan
                        </button>
                    </div>
                </div>

                {/* Net Worth Overview Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div className="glass card glass-shadow" style={{ border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Total Assets</span>
                            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>
                            {formatAmount(summary.totalAssets)}
                        </h2>
                    </div>

                    <div className="glass card glass-shadow" style={{ border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Total Liabilities (Loans)</span>
                            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                <TrendingDown size={20} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#ef4444' }}>
                            {formatAmount(summary.totalLiabilities)}
                        </h2>
                    </div>

                    <div className="glass card glass-shadow" style={{ border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Total Net Worth</span>
                            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                <Landmark size={20} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '32px', fontWeight: '800', color: summary.netWorth >= 0 ? '#6366f1' : '#ef4444' }}>
                            {formatAmount(summary.netWorth)}
                        </h2>
                    </div>
                </div>

                {/* Portfolio Items Ledger Table */}
                <div className="glass card glass-shadow" style={{ border: 'none' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-main)' }}>Your Portfolio Items</h3>

                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading asset portfolio...</p>
                    ) : assets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Landmark size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                            <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>No assets or loans added yet.</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Click "Add Asset / Loan" to start tracking your total Net Worth.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>NAME</th>
                                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>TYPE</th>
                                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>INSTITUTION</th>
                                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'right' }}>VALUE</th>
                                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map(item => (
                                        <tr key={item._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)' }}>
                                                        {getIconForType(item.type)}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: '700', margin: 0, color: 'var(--text-main)', fontSize: '15px' }}>{item.name}</p>
                                                        {item.notes && <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{item.notes}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '13px', textTransform: 'capitalize', color: 'var(--text-main)', fontWeight: '600' }}>
                                                {item.type.replace('_', ' ')}
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                {item.institution || '—'}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: '800', fontSize: '16px', color: item.type === 'loan_liability' ? '#ef4444' : '#10b981' }}>
                                                {item.type === 'loan_liability' ? '-' : '+'}{formatAmount(item.currentValue)}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                                    title="Delete Item"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add Asset Modal */}
                {showModal && (
                    <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                        <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h2>Add Asset or Loan</h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                                {errorMsg && (
                                    <div style={{
                                        background: 'rgba(239, 68, 68, 0.12)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        color: '#ef4444',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        fontSize: '13px',
                                        fontWeight: '500'
                                    }}>
                                        {errorMsg}
                                    </div>
                                )}
                                <div>
                                    <label className="modal-label">Name / Description</label>
                                    <input
                                        type="text"
                                        className="modal-input-field"
                                        placeholder="e.g. HDFC Nifty 50 Index Fund"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="modal-label">Asset / Loan Category</label>
                                    <select
                                        className="modal-input-field"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        {assetTypes.map(t => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="modal-label">Current Value (₹)</label>
                                    <input
                                        type="number"
                                        className="modal-input-field"
                                        placeholder="0.00"
                                        value={formData.currentValue}
                                        onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="modal-label">Institution / Platform (Optional)</label>
                                    <input
                                        type="text"
                                        className="modal-input-field"
                                        placeholder="e.g. Zerodha, Groww, SBI"
                                        value={formData.institution}
                                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="save-transaction-btn" style={{ marginTop: '12px' }}>
                                    Save Portfolio Item
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default NetWorthTracker;
