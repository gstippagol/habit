import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('error') === 'deactivated') {
            setError('SECURITY ALERT: This account has been deactivated by an administrator.');
        }
    }, [location]);

    const handleRealLogin = async (e) => {
        e.preventDefault();

        // Detect Device Info
        const userAgent = navigator.userAgent;
        let os = "Unknown OS";
        if (userAgent.indexOf("Win") !== -1) os = "Windows";
        if (userAgent.indexOf("Mac") !== -1) os = "MacOS";
        if (userAgent.indexOf("X11") !== -1) os = "UNIX";
        if (userAgent.indexOf("Linux") !== -1) os = "Linux";
        if (userAgent.indexOf("Android") !== -1) os = "Android";
        if (userAgent.indexOf("like Mac") !== -1) os = "iOS";

        const browser = navigator.vendor ? (navigator.userAgent.includes("Chrome") ? "Chrome" : "Safari") : (navigator.userAgent.includes("Firefox") ? "Firefox" : "Browser");

        try {
            const data = await loginUser({
                email,
                password,
                deviceInfo: { os, browser }
            });
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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

                <h1 style={{ marginBottom: '0.8rem', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' }}>Access Your Account</h1>
                <p style={{ marginBottom: '3rem', color: '#888', fontSize: '1rem', fontWeight: '500' }}>Build habits that last forever.</p>

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

                <form onSubmit={handleRealLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#555', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>EMAIL ADDRESS</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            onFocus={(e) => e.target.style.borderColor = '#00ccff'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#555', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>PASSWORD</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            onFocus={(e) => e.target.style.borderColor = '#00ccff'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                        />
                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                            <Link to="/forgot-password" style={{ color: '#00ccff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                    <button
                        type="submit"
                        style={{
                            padding: '1.2rem',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                            color: '#000',
                            fontWeight: '900',
                            fontSize: '1.05rem',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '1rem',
                            boxShadow: '0 15px 40px rgba(0, 114, 255, 0.2)'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Sign In to Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
