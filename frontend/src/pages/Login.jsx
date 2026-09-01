import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Wallet, ShieldCheck, Hash, ArrowLeft, CheckCircle2 } from 'lucide-react';

const Login = () => {
    const [step, setStep] = useState(1); // 1: Email & Password, 2: 2FA 6-Digit OTP Code
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, verifyLoginOTP } = useAuth();
    const navigate = useNavigate();

    // Step 1: Submit Credentials & Trigger 2FA OTP
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setStatusMsg('');
        setLoading(true);

        try {
            const data = await login(email, password);
            if (data.requires2FA) {
                setStatusMsg(data.message || `6-digit 2FA verification code sent to ${email}`);
                setStep(2);
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify 6-Digit 2FA OTP Code & Complete Login
    const handleVerifyOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setStatusMsg('');

        if (otpCode.trim().length !== 6) {
            return setError('Please enter a valid 6-digit 2FA verification code.');
        }

        setLoading(true);

        try {
            await verifyLoginOTP(email, otpCode.trim());
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired 2FA verification code.');
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
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{
                        background: step === 1 
                            ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                            : 'linear-gradient(135deg, #10b981, #6366f1)',
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        margin: '0 auto 20px',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                    }}>
                        {step === 1 ? <Wallet size={32} /> : <ShieldCheck size={32} />}
                    </div>
                    <h2 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
                        {step === 1 ? 'Welcome Back' : '2FA Verification'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {step === 1 
                            ? 'Enter your credentials to access your dashboard'
                            : `We sent a 6-digit security code to ${email}. Enter code to login.`}
                    </p>
                </div>

                {statusMsg && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        fontSize: '13.5px',
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

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: 'var(--expense)',
                        padding: '12px',
                        borderRadius: '12px',
                        fontSize: '13.5px',
                        textAlign: 'center',
                        marginBottom: '24px'
                    }}>
                        {error}
                    </div>
                )}

                {/* STEP 1: EMAIL & PASSWORD FORM */}
                {step === 1 && (
                    <form onSubmit={handleLoginSubmit}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '10px', fontWeight: '600', color: 'var(--text-main)' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    className="input-field"
                                    style={{ paddingLeft: '48px', height: '48px' }}
                                    placeholder="kavya123@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <div className="flex-between" style={{ marginBottom: '10px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Password</label>
                                <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Forgot Password?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    className="input-field"
                                    style={{ paddingLeft: '48px', height: '48px' }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                            {loading ? 'Authenticating...' : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn size={20} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* STEP 2: 2FA 6-DIGIT OTP VERIFICATION FORM */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtpSubmit}>
                        <div style={{ marginBottom: '28px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '10px', fontWeight: '600', color: 'var(--text-main)' }}>6-Digit 2FA Login Code</label>
                            <div style={{ position: 'relative' }}>
                                <Hash size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    maxLength="6"
                                    className="input-field"
                                    style={{ paddingLeft: '48px', height: '48px', letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold' }}
                                    placeholder="123456"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    required
                                    autoFocus
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
                            {loading ? 'Verifying 2FA Code...' : (
                                <>
                                    <span>Verify & Access Dashboard</span>
                                    <ShieldCheck size={20} />
                                </>
                            )}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13.5px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                                <ArrowLeft size={16} /> Back to Login Credentials
                            </button>
                        </div>
                    </form>
                )}

                {step === 1 && (
                    <div style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>Create one for free</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
