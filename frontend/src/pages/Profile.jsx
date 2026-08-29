import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import api from '../services/api';
import {
    User,
    Mail,
    Calendar,
    Shield,
    DollarSign,
    Globe,
    Save,
    X
} from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { currency, setCurrency } = useCurrency();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [stats, setStats] = useState({
        totalTransactions: 0,
        memberSince: 'Mar 2026',
    });
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        monthlyIncome: 0,
        preferredCurrency: currency
    });

    useEffect(() => {
        const fetchProfileAndStats = async () => {
            try {
                setLoading(true);
                const [profileRes, transRes] = await Promise.all([
                    api.get('/auth/profile'),
                    api.get('/transactions')
                ]);
                
                const profile = profileRes.data;
                setFormData({
                    name: profile.name,
                    email: profile.email,
                    monthlyIncome: profile.monthlyIncome,
                    preferredCurrency: profile.preferredCurrency
                });
                setCurrency(profile.preferredCurrency);
                
                setStats({
                    totalTransactions: transRes.data.length,
                    memberSince: new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
                });
            } catch (error) {
                console.error('Error fetching data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileAndStats();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/auth/profile', formData);
            setCurrency(data.preferredCurrency);
            updateUser(data);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <Navbar />

                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>User Profile</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your account settings and financial preferences.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                    <div className="glass card glass-shadow">
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                color: 'white'
                            }}>
                                <User size={48} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{formData.name}</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Premium Member</p>
                        </div>

                        {!isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div style={{ color: 'var(--primary)' }}><Mail size={20} /></div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address</p>
                                        <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formData.email}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div style={{ color: 'var(--secondary)' }}><DollarSign size={20} /></div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Monthly Income</p>
                                        <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{currency} {formData.monthlyIncome.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div style={{ color: '#10b981' }}><Globe size={20} /></div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Preferred Currency</p>
                                        <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formData.preferredCurrency}</p>
                                    </div>
                                </div>

                                <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ marginTop: '10px' }}>Edit Profile</button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Name</label>
                                    <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email</label>
                                    <input className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Monthly Income</label>
                                    <input type="number" className="input-field" value={formData.monthlyIncome} onChange={e => setFormData({...formData, monthlyIncome: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Preferred Currency</label>
                                    <select className="input-field" value={formData.preferredCurrency} onChange={e => setFormData({...formData, preferredCurrency: e.target.value})}>
                                        <option value="INR">INR ₹</option>
                                        <option value="USD">USD $</option>
                                        <option value="EUR">EUR €</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Save size={18} /> Save
                                    </button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="glass" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid var(--glass-border)' }}>
                                        <X size={18} /> Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="glass card glass-shadow">
                        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: 'var(--text-main)' }}>Account Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ background: 'var(--glass-bg)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Activites</p>
                                <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{stats.totalTransactions}</p>
                            </div>
                            <div style={{ background: 'var(--glass-bg)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Member Since</p>
                                <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>{stats.memberSince}</p>
                            </div>
                        </div>

                        <div className="flex-between" style={{ padding: '16px', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div color="#10b981"><Shield size={20} /></div>
                                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>Security Score</span>
                            </div>
                            <span style={{ fontWeight: '800', color: '#10b981' }}>98%</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;

