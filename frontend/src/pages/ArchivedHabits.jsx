import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import * as api from '../services/api';
import Footer from '../components/Footer';

const ArchivedHabits = () => {
    const [archivedHabits, setArchivedHabits] = useState([]);
    const [notification, setNotification] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadArchivedHabits();
    }, []);

    const loadArchivedHabits = async () => {
        try {
            const data = await api.fetchHabits();
            setArchivedHabits(data.filter(h => h.isArchived));
        } catch (err) {
            console.error("Failed to load archives", err);
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 3000);
    };

    const handleRestore = async (id, title) => {
        try {
            await api.archiveHabit(id, false);
            setArchivedHabits(prev => prev.filter(h => h._id !== id));
            showNotification(`Restored "${title}" to Dashboard`);
        } catch (err) {
            console.error("Restore failed", err);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Permanently delete "${title}"?`)) return;
        try {
            await api.deleteHabit(id);
            setArchivedHabits(prev => prev.filter(h => h._id !== id));
            showNotification(`Deleted "${title}" permanently`);
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />

            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 2rem' }}>
                <div className="animate-fade-in">
                    <div className="mobile-stack" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2.5rem',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '1.5rem 2.5rem',
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                    }}>
                        <div className="mobile-text-center">
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', margin: 0, letterSpacing: '-1.5px' }}>
                                Archive <span style={{ color: '#00ccff' }}>Vault</span>
                            </h1>
                            <p style={{ color: '#555', fontWeight: '700', marginTop: '6px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                DEPOSITED ACHIEVEMENTS • {archivedHabits.length} ITEMS
                            </p>
                        </div>

                        <Link to="/dashboard" className="mobile-full-width" style={{
                            color: '#fff',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: '800',
                            padding: '0.8rem 1.5rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            textAlign: 'center'
                        }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gap: '1.2rem' }}>
                        {archivedHabits.length === 0 && !loading ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '6rem 2rem',
                                background: '#0a0a0c',
                                borderRadius: '2rem',
                                border: '1px dashed rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1.5rem', filter: 'grayscale(1)', opacity: 0.2 }}>📂</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.8rem', color: '#444' }}>Vault Empty</h2>
                                <p style={{ maxWidth: '350px', margin: '0 auto', lineHeight: '1.6', color: '#333', fontSize: '0.9rem' }}>No habits have been archived yet. Keep building, then deposit them here when finished.</p>
                            </div>
                        ) : (
                            archivedHabits.map(habit => (
                                <div key={habit._id} className="mobile-stack" style={{
                                    background: 'rgba(13, 13, 15, 0.7)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '1.5rem',
                                    padding: '1.2rem 2rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}>
                                    <div className="mobile-text-center">
                                        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>
                                            {habit.title}
                                        </span>
                                        <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '6px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            Final Streak: {habit.streak || 0}
                                        </div>
                                    </div>

                                    <div className="mobile-stack" style={{ display: 'flex', gap: '0.8rem' }}>
                                        <button
                                            onClick={() => handleRestore(habit._id, habit.title)}
                                            className="mobile-full-width"
                                            style={{
                                                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                                                color: '#000',
                                                border: 'none',
                                                padding: '0.8rem 1.8rem',
                                                borderRadius: '12px',
                                                fontWeight: '900',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                boxShadow: '0 10px 25px rgba(0, 210, 255, 0.1)'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            Restore to Active
                                        </button>
                                        <button
                                            onClick={() => handleDelete(habit._id, habit.title)}
                                            className="mobile-full-width"
                                            style={{
                                                background: 'rgba(255, 77, 77, 0.05)',
                                                color: '#ff4d4d',
                                                border: '1px solid rgba(255, 77, 77, 0.2)',
                                                padding: '0.8rem 1.4rem',
                                                borderRadius: '12px',
                                                fontWeight: '700',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.background = '#ff4d4d'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 77, 77, 0.05)'; e.currentTarget.style.color = '#ff4d4d'; }}
                                        >
                                            Purge
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notification && (
                        <div style={{
                            position: 'fixed',
                            bottom: '3rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                            color: '#000',
                            padding: '1rem 3rem',
                            borderRadius: '50px',
                            fontWeight: '900',
                            boxShadow: '0 15px 40px rgba(0, 114, 255, 0.4)',
                            zIndex: 3000,
                            fontSize: '0.95rem'
                        }}>
                            ✨ {notification}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ArchivedHabits;
