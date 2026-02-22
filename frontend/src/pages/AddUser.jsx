import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import * as api from '../services/api';

const AddUser = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!username || !email || !password) {
            setMessage({ type: 'error', text: 'Please fill all fields' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.adminCreateUser({ username, email, password });
            setMessage({ type: 'success', text: `Success! Credentials sent to ${email}` });
            setUsername('');
            setEmail('');
            setPassword('');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create user' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />

            <main style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem'
            }}>
                <div className="animate-fade-in" style={{
                    background: 'rgba(13, 13, 15, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '2rem',
                    padding: '2.5rem 2rem',
                    width: '100%',
                    maxWidth: '400px',
                    boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
                    textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: 'rgba(168, 85, 247, 0.1)',
                            borderRadius: '0.8rem',
                            margin: '0 auto 1rem auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            color: '#a855f7',
                            border: '1px solid rgba(168, 85, 247, 0.2)'
                        }}>+</div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>Add New User</h1>
                        <p style={{ color: '#555', fontSize: '0.8rem', marginTop: '6px', fontWeight: '600' }}>ADMINISTRATIVE PRIVILEGES</p>
                    </div>

                    {message.text && (
                        <div style={{
                            padding: '0.8rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                            background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            color: message.type === 'error' ? '#ef4444' : '#22c55e',
                            border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleCreateUser} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#444', marginBottom: '6px', display: 'block', marginLeft: '4px' }}>USERNAME</label>
                            <input
                                type="text"
                                placeholder="e.g. johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.85rem',
                                    borderRadius: '12px',
                                    background: '#0a0a0c',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                                autoComplete="none"
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#444', marginBottom: '6px', display: 'block', marginLeft: '4px' }}>EMAIL ADDRESS</label>
                            <input
                                type="email"
                                placeholder="user@habit.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.85rem',
                                    borderRadius: '12px',
                                    background: '#0a0a0c',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                                autoComplete="none"
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#444', marginBottom: '6px', display: 'block', marginLeft: '4px' }}>TEMPORARY PASSWORD</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.85rem',
                                    borderRadius: '12px',
                                    background: '#0a0a0c',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                                color: '#000',
                                padding: '1rem',
                                borderRadius: '14px',
                                border: 'none',
                                fontWeight: '900',
                                fontSize: '0.95rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                marginTop: '0.5rem',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 15px 40px rgba(0, 114, 255, 0.2)'
                            }}
                            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {loading ? 'Sending Invite...' : 'Create & Mail Credentials'}
                        </button>

                        <Link to="/admin" style={{
                            textAlign: 'center',
                            color: '#555',
                            textDecoration: 'none',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            marginTop: '0.25rem'
                        }}>
                            ← Back to Admin Console
                        </Link>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddUser;
