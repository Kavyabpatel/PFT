import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Shield, Target, Plus, TrendingUp } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const EmergencyFundTracker = () => {
    const { formatAmount } = useCurrency();
    const [fund, setFund] = useState({ targetAmount: 0, savedAmount: 0 });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ targetAmount: 0, savedAmount: 0 });

    useEffect(() => {
        fetchFund();
    }, []);

    const fetchFund = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/emergency-fund');
            setFund(data);
            setFormData({ targetAmount: data.targetAmount, savedAmount: data.savedAmount });
        } catch (error) {
            console.error('Error fetching fund:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/emergency-fund', formData);
            setFund(data);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating fund:', error);
        }
    };

    const progress = Math.min(100, Math.round((fund.savedAmount / fund.targetAmount) * 100) || 0);

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <Navbar />
                
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>Emergency Fund</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Build a safety net for unexpected expenses.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Summary Card */}
                        <div className="glass card glass-shadow" style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Shield size={40} />
                            </div>
                            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>{progress}% Funded</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>You have saved {formatAmount(fund.savedAmount)} of your {formatAmount(fund.targetAmount)} goal.</p>
                            
                            <div style={{ width: '100%', height: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden', marginBottom: '32px' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '8px', transition: 'width 1s ease-in-out' }}></div>
                            </div>

                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ width: '100%' }}>
                                    Update Fund Goals
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        {isEditing ? (
                            <div className="glass card glass-shadow">
                                <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>Manage Fund</h3>
                                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Target Amount</label>
                                        <div style={{ position: 'relative' }}>
                                            <Target size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input 
                                                type="number" 
                                                className="input-field" 
                                                style={{ paddingLeft: '40px' }}
                                                value={formData.targetAmount}
                                                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Already Saved</label>
                                        <div style={{ position: 'relative' }}>
                                            <TrendingUp size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input 
                                                type="number" 
                                                className="input-field" 
                                                style={{ paddingLeft: '40px' }}
                                                value={formData.savedAmount}
                                                onChange={(e) => setFormData({ ...formData, savedAmount: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Changes</button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="glass" style={{ flex: 1, border: '1px solid var(--glass-border)', background: 'none' }}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="glass card glass-shadow">
                                <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '700' }}>Why an Emergency Fund?</h3>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', listStyle: 'none', padding: 0 }}>
                                    {[
                                        "Covers unexpected medical bills",
                                        "Safety net during job loss",
                                        "Handles urgent home repairs",
                                        "Reduces financial stress"
                                    ].map((text, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EmergencyFundTracker;
