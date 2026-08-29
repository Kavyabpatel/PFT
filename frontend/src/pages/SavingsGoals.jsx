import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Target, TrendingUp, Plus, Heart, Shield, Plane, Book, Tv, Home, Car, MoreHorizontal, Loader2, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const SavingsGoals = () => {
    const { formatAmount } = useCurrency();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [newGoal, setNewGoal] = useState({
        goalName: '',
        targetAmount: '',
        category: 'Other'
    });

    const categories = [
        { name: 'Emergency', icon: <Shield size={22} /> },
        { name: 'Health', icon: <Heart size={22} /> },
        { name: 'Travel', icon: <Plane size={22} /> },
        { name: 'Education', icon: <Book size={22} /> },
        { name: 'Gadgets', icon: <Tv size={22} /> },
        { name: 'Home', icon: <Home size={22} /> },
        { name: 'Vehicle', icon: <Car size={22} /> },
        { name: 'Other', icon: <MoreHorizontal size={22} /> }
    ];

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/savings');
            setGoals(data);
        } catch (error) {
            console.error('Error fetching goals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        try {
            await api.post('/savings', newGoal);
            fetchGoals();
            setShowModal(false);
            setSuccessMsg('Goal successfully created!');
            setTimeout(() => setSuccessMsg(''), 3000);
            setNewGoal({ goalName: '', targetAmount: '', category: 'Other' });
        } catch (error) {
            console.error('Error adding goal:', error);
        }
    };

    const handleUpdateProgress = async (id, amount) => {
        try {
            await api.put(`/savings/${id}`, { amount: Number(amount) });
            fetchGoals();
            setSuccessMsg('Progress updated brilliantly!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <Navbar />
                
                <div className="flex-between" style={{ marginBottom: '32px', animation: 'fadeIn 0.5s ease' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Savings Goals
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Track your dreams and financial milestones</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {successMsg && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--income)', fontSize: '14px', fontWeight: '600', animation: 'fadeIn 0.3s ease' }}>
                                <CheckCircle2 size={16} /> {successMsg}
                            </span>
                        )}
                        <button className="save-transaction-btn" style={{ margin: 0, padding: '12px 20px', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setShowModal(true)}>
                            <Plus size={20} /> New Goal
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', color: 'var(--primary)', animation: 'fadeIn 0.5s ease' }}>
                        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '16px' }}>Loading your aspirations...</p>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : goals.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center', animation: 'slideUp 0.5s ease' }}>
                        <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '50%', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
                            <Target size={64} style={{ opacity: 0.4, color: 'var(--primary)' }} />
                        </div>
                        <h4 style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '8px', fontWeight: '700' }}>No Goals Set Yet</h4>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '300px', lineHeight: '1.6' }}>Start turning your dreams into reality by setting up your first savings target.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {goals.map((goal, idx) => {
                            const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                            const categoryData = categories.find(c => c.name === goal.category) || categories[7];
                            const isCompleted = progress === 100;

                            return (
                                <div key={goal._id} className="glass card glass-shadow" style={{ 
                                    animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.1}s both`,
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    display: 'flex', flexDirection: 'column'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div className="flex-between" style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '12px',
                                                background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                                color: isCompleted ? 'var(--income)' : 'var(--primary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {categoryData.icon}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '2px' }}>{goal.goalName}</h3>
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', background: 'var(--bg-dark)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                                                    {goal.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginBottom: '20px', flex: 1 }}>
                                        <div className="flex-between" style={{ marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                                                {formatAmount(goal.savedAmount)} <span style={{ color: 'var(--text-muted)' }}>/ {formatAmount(goal.targetAmount)}</span>
                                            </span>
                                            <span style={{ fontSize: '14px', fontWeight: '800', color: isCompleted ? 'var(--income)' : 'var(--primary)' }}>
                                                {progress.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                width: `${progress}%`, 
                                                height: '100%', 
                                                background: isCompleted ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #a855f7)',
                                                borderRadius: '4px',
                                                transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                                            }}></div>
                                        </div>
                                    </div>

                                    <div style={{ paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                                        {isCompleted ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--income)', padding: '8px 0', fontWeight: '700' }}>
                                                <Target size={18} /> Goal Reached!
                                            </div>
                                        ) : (
                                            <button 
                                                style={{ width: '100%', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '10px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                                                onClick={() => {
                                                    const amount = prompt(`Enter amount to add for '${goal.goalName}':`);
                                                    if (amount && !isNaN(amount) && Number(amount) > 0) {
                                                        const newTotal = Number(amount) + goal.savedAmount;
                                                        handleUpdateProgress(goal._id, newTotal);
                                                    }
                                                }}
                                            >
                                                Add Savings
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Create Set Target</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddGoal}>
                            <label className="modal-label">Goal Title</label>
                            <input 
                                className="modal-input-field"
                                type="text" 
                                value={newGoal.goalName}
                                onChange={(e) => setNewGoal({...newGoal, goalName: e.target.value})}
                                required 
                                placeholder="e.g. Dream House Downpayment"
                            />

                            <label className="modal-label">Target Milestore Amount</label>
                            <input 
                                className="modal-input-field"
                                type="number" 
                                value={newGoal.targetAmount}
                                onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                                required 
                                min="1"
                            />

                            <label className="modal-label">Aspiration Category</label>
                            <select 
                                className="modal-input-field"
                                value={newGoal.category}
                                onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                                style={{ cursor: 'pointer' }}
                            >
                                {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>

                            <button type="submit" className="save-transaction-btn">Initialize Target</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavingsGoals;
