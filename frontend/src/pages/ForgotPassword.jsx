import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, Lock, ShieldCheck, Eye, EyeOff, Hash } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // Step 1: Send OTP, Step 2: Verify OTP & Reset Password
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Request 6-digit verification code
    const handleSendCode = async (e) => {
        e.preventDefault();
        setStatusMsg('');
        setErrorMsg('');
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setStatusMsg(response.data.message || '6-digit verification code sent to your email address.');
            setStep(2);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Failed to send verification code. Please check your email.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP & Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setStatusMsg('');
        setErrorMsg('');

        if (otpCode.trim().length !== 6) {
            return setErrorMsg('Please enter a valid 6-digit verification code.');
        }

        if (newPassword !== confirmPassword) {
            return setErrorMsg('New passwords do not match.');
        }

        if (newPassword.length < 6) {
            return setErrorMsg('Password must be at least 6 characters.');
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/reset-password', {
                email,
                otpCode: otpCode.trim(),
                password: newPassword
            });

            setStatusMsg(response.data.message || 'Password updated successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Invalid or expired verification code. Please check your code.');
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
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
                        {step === 1 ? <KeyRound size={30} /> : <ShieldCheck size={32} />}
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
                        {step === 1 ? 'Forgot Password?' : 'Enter 6-Digit Code'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {step === 1 
                            ? "Enter your registered email address to receive a 6-digit verification code."
                            : `We sent a 6-digit code to ${email}. Enter code & set your new password.`}
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
                        marginBottom: '20px',
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
                        fontSize: '13.5px',
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}>
                        {errorMsg}
                    </div>
                )}

                {/* STEP 1: REQUEST 6-DIGIT CODE */}
                {step === 1 && (
                    <form onSubmit={handleSendCode}>
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
                            {loading ? 'Sending Code...' : 'Send Verification Code'}
                        </button>
                    </form>
                )}

                {/* STEP 2: VERIFY OTP CODE & SET NEW PASSWORD */}
                {step === 2 && (
                    <form onSubmit={handleResetPassword}>
                        {/* 6-Digit OTP Code Field */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)' }}>6-Digit Verification Code</label>
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
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)' }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field"
                                    style={{ paddingLeft: '48px', paddingRight: '48px', height: '48px' }}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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

                        {/* Confirm New Password */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)' }}>Confirm New Password</label>
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
                            {loading ? 'Verifying...' : 'Verify Code & Set Password'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                            >
                                Change Email / Resend Code
                            </button>
                        </div>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '28px' }}>
                    <Link to="/login" style={{
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
