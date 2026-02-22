import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & Reset
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.forgotPassword(email);
            setStep(2);
            setMessage('OTP sent to your email. Please check your inbox.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.resetPassword({ email, otp, newPassword });
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed. Check your OTP and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mobile-padding-sm" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at top left, #111, #050505)',
            padding: '2rem'
        }}>
            <div className="animate-fade-in mobile-padding-sm" style={{
                padding: '3.5rem 3rem',
                background: 'rgba(13, 13, 15, 0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: '2.5rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
                textAlign: 'center',
                width: '100%',
                maxWidth: '460px'
            }}>
                <div style={{
                    width: '70px',
                    height: '70px',
                    background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                    borderRadius: '1.2rem',
                    margin: '0 auto 2rem auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    color: '#000',
                    fontWeight: '900',
                    boxShadow: '0 10px 30px rgba(0, 204, 255, 0.3)'
                }}>HT</div>

                <h1 style={{ marginBottom: '0.8rem', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' }}>
                    {step === 1 ? 'Recovery' : 'Reset Access'}
                </h1>
                <p style={{ marginBottom: '3rem', color: '#888', fontSize: '1rem', fontWeight: '500' }}>
                    {step === 1 ? 'Enter your email to receive a secure code.' : 'Enter the code and set your new password.'}
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '1rem',
                        borderRadius: '14px',
                        marginBottom: '2rem',
                        fontSize: '0.9rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                {message && (
                    <div style={{
                        background: 'rgba(0, 204, 255, 0.1)',
                        color: '#00ccff',
                        padding: '1rem',
                        borderRadius: '14px',
                        marginBottom: '2rem',
                        fontSize: '0.9rem',
                        border: '1px solid rgba(0, 204, 255, 0.2)'
                    }}>
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#555', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>REGISTERED EMAIL</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1.1rem',
                                    borderRadius: '14px',
                                    background: '#0a0a0c',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '1.2rem',
                                borderRadius: '16px',
                                background: loading ? '#222' : 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                                color: loading ? '#555' : '#000',
                                fontWeight: '900',
                                fontSize: '1.05rem',
                                border: 'none',
                                cursor: loading ? 'default' : 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            {loading ? 'Sending...' : 'Send Recovery Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#555', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>SECURE CODE (OTP)</label>
                            <input
                                type="text"
                                placeholder="6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1.1rem',
                                    borderRadius: '14px',
                                    background: '#0a0a0c',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    textAlign: 'center',
                                    letterSpacing: '5px',
                                    fontWeight: '900'
                                }}
                            />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#555', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>NEW PASSWORD</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1.1rem',
                                    borderRadius: '14px',
                                    background: '#0a0a0c',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '1.2rem',
                                borderRadius: '16px',
                                background: loading ? '#222' : 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                                color: loading ? '#555' : '#000',
                                fontWeight: '900',
                                fontSize: '1.05rem',
                                border: 'none',
                                cursor: loading ? 'default' : 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            {loading ? 'Processing...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '2.5rem' }}>
                    <Link to="/login" style={{ color: '#00ccff', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}>
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
