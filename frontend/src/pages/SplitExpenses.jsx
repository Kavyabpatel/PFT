import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Users, UserPlus, Receipt, ArrowUpRight, ArrowDownLeft, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const SplitExpenses = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { formatAmount } = useCurrency();
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [balances, setBalances] = useState({});
    const [loading, setLoading] = useState(true);
    
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    
    const [newGroup, setNewGroup] = useState({ name: '', members: [] });
    const [newSplit, setNewSplit] = useState({ description: '', amount: '', participants: [] });

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/groups');
            setGroups(data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBalances = async (groupId) => {
        try {
            const { data } = await api.get(`/groups/${groupId}/balances`);
            setBalances(data);
        } catch (error) {
            console.error('Error fetching balances:', error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            fetchBalances(selectedGroup._id);
        }
    }, [selectedGroup]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await api.post('/groups', newGroup);
            fetchGroups();
            setShowGroupModal(false);
            setSuccessMsg('Group successfully created!');
            setTimeout(() => setSuccessMsg(''), 3000);
            setNewGroup({ name: '', members: [] });
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const handleAddSplit = async (e) => {
        e.preventDefault();
        try {
            const share = Number(newSplit.amount) / selectedGroup.members.length;
            const participants = selectedGroup.members.map(m => ({
                user: m._id,
                share: share.toFixed(2)
            }));

            await api.post(`/groups/${selectedGroup._id}/splits`, {
                ...newSplit,
                participants
            });
            
            fetchBalances(selectedGroup._id);
            setShowSplitModal(false);
            setSuccessMsg('Expense split efficiently!');
            setTimeout(() => setSuccessMsg(''), 3000);
            setNewSplit({ description: '', amount: '', participants: [] });
        } catch (error) {
            console.error('Error adding split:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content" style={{ paddingTop: '32px' }}>

                <div className="flex-between" style={{ marginBottom: '32px', animation: 'fadeIn 0.5s ease' }}>
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
                                Split Expenses
                            </h1>
                        </div>
                        <p style={{ color: 'var(--text-muted)' }}>Manage shared bills and effortlessly track group balances.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {successMsg && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--income)', fontSize: '14px', fontWeight: '600', animation: 'fadeIn 0.3s ease' }}>
                                <CheckCircle2 size={16} /> {successMsg}
                            </span>
                        )}
                        <button className="save-transaction-btn" style={{ margin: 0, padding: '12px 20px', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setShowGroupModal(true)}>
                            <UserPlus size={20} /> Create Group
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    {/* Groups Side List */}
                    <div className="glass card glass-shadow" style={{ width: '320px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Your Squads</h3>
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }}>
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                                    <Loader2 className="spin" size={24} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                                </div>
                            ) : groups.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No groups crafted yet.</p>
                            ) : (
                                groups.map(group => (
                                    <div 
                                        key={group._id} 
                                        onClick={() => setSelectedGroup(group)}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', 
                                            borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                            background: selectedGroup?._id === group._id ? 'var(--bg-dark)' : 'transparent',
                                            border: selectedGroup?._id === group._id ? '1px solid var(--glass-border)' : '1px solid transparent',
                                            boxShadow: selectedGroup?._id === group._id ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                                            marginBottom: '8px'
                                        }}
                                        onMouseEnter={(e) => { if(selectedGroup?._id !== group._id) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                                        onMouseLeave={(e) => { if(selectedGroup?._id !== group._id) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <div style={{ 
                                            width: '40px', height: '40px', borderRadius: '10px', 
                                            background: selectedGroup?._id === group._id ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(99, 102, 241, 0.1)', 
                                            color: selectedGroup?._id === group._id ? '#fff' : 'var(--primary)', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                        }}>
                                            <Users size={20} />
                                        </div>
                                        <span style={{ fontWeight: selectedGroup?._id === group._id ? '700' : '500', color: selectedGroup?._id === group._id ? 'var(--text-main)' : 'var(--text-muted)' }}>{group.name}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Group Details Area */}
                    <div className="glass card glass-shadow" style={{ flex: 1, minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        {selectedGroup ? (
                            <>
                                <div className="flex-between" style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ padding: '12px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                            <Users size={24} color="var(--primary)" />
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{selectedGroup.name}</h2>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{selectedGroup.members.length} Members</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowSplitModal(true)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                                    >
                                        <Receipt size={18} /> Add Split Expense
                                    </button>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-muted)' }}>Member Settlement Balances</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {selectedGroup.members.map(member => {
                                            const balance = balances[member._id] || 0;
                                            const isPositive = balance >= 0;
                                            
                                            // Handling UI edge case where balance is extremely close to 0 but float shows -0.0
                                            const cleanBalance = Math.abs(balance) < 0.01 ? 0 : balance;

                                            return (
                                                <div key={member._id} style={{ 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                                    padding: '16px 20px', borderRadius: '16px', background: 'var(--bg-dark)', 
                                                    border: '1px solid var(--glass-border)', transition: 'transform 0.2s' 
                                                }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800' }}>
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-main)' }}>
                                                            {member.name} {member._id === currentUser._id && <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>(You)</span>}
                                                        </span>
                                                    </div>
                                                    
                                                    {cleanBalance === 0 ? (
                                                        <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Settled Up</span>
                                                    ) : (
                                                        <div style={{ 
                                                            display: 'flex', alignItems: 'center', gap: '8px', 
                                                            color: isPositive ? 'var(--income)' : 'var(--expense)',
                                                            background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            padding: '8px 16px', borderRadius: '10px', fontWeight: '800'
                                                        }}>
                                                            {isPositive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                                            {formatAmount(Math.abs(cleanBalance))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.6 }}>
                                <Users size={64} style={{ marginBottom: '24px', opacity: 0.3 }} />
                                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Select an Operating Node</h3>
                                <p style={{ maxWidth: '300px' }}>Click on a group identity from the sidebar to view localized member balances or establish a new group.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showGroupModal && (
                <div className="modal-backdrop">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Draft New Group</h2>
                            <button className="modal-close" onClick={() => setShowGroupModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateGroup}>
                            <label className="modal-label">Operating Group Name</label>
                            <input 
                                className="modal-input-field"
                                type="text" 
                                value={newGroup.name}
                                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                                required 
                                placeholder="e.g. Miami Trip, Roommates"
                            />
                            {/* Further expansion would allow querying distinct user IDs via an API. For now logic sets Creator internally */}
                            <button type="submit" className="save-transaction-btn">Establish Group</button>
                        </form>
                    </div>
                </div>
            )}

            {showSplitModal && (
                <div className="modal-backdrop">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Inject Joint Ledger</h2>
                            <button className="modal-close" onClick={() => setShowSplitModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddSplit}>
                            <label className="modal-label">Transaction Context</label>
                            <input 
                                className="modal-input-field"
                                type="text" 
                                value={newSplit.description}
                                onChange={(e) => setNewSplit({...newSplit, description: e.target.value})}
                                required 
                                placeholder="e.g. Sushi Dinner, Hotel Booking"
                            />
                            
                            <label className="modal-label">Gross Amount</label>
                            <input 
                                className="modal-input-field"
                                type="number" 
                                value={newSplit.amount}
                                onChange={(e) => setNewSplit({...newSplit, amount: e.target.value})}
                                required 
                                min="0.01" step="0.01"
                            />
                            
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                This system will symmetrically split this ledger identically across all active group participants.
                            </p>
                            
                            <button type="submit" className="save-transaction-btn">Process Shared Ledger</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SplitExpenses;
