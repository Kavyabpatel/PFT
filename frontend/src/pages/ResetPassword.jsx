import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Lock, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMsg('');
        setErrorMsg('');

        if (password !== confirmPassword) {
            return setErrorMsg('Passwords do not match.');
        }

        if (password.length < 6) {
            return setErrorMsg('Password must be at least 6 characters.');
        }

        setLoading(true);

        try {
            const response = await api.put(`/auth/reset-password/${resetToken}`, { password });
            setStatusMsg(response.data.message || 'Password reset successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Invalid or expired reset token. Please request a new link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass card glass-shadow" style={{ width: '100%', maxWidth: '440px', padding: '48px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #10b981, #6366f1)',
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        margin: '0 auto 20px',
                        boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>Set New Password</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Choose a strong new password for your account</p>
                </div>

                {statusMsg && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                        padding: '14px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        textAlign: 'center',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'center'
                    }}>
                        <CheckCircle2 size={18} />
                        <span>{statusMsg}</span>
                    </div>
                )}

                {errorMsg && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: 'var(--expense)',
                        padding: '12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        textAlign: 'center',
                        marginBottom: '24px'
                    }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '10px', fontWeight: '600', color: 'var(--text-main)' }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input-field"
                                style={{ paddingLeft: '48px', paddingRight: '48px', height: '48px' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '14px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '10px', fontWeight: '600', color: 'var(--text-main)' }}>Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input-field"
                                style={{ paddingLeft: '48px', height: '48px' }}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '16px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Updating Password...' : 'Update Password'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
