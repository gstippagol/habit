import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import * as api from '../services/api';
import Footer from '../components/Footer';

const Bin = () => {
    const [deletedHabits, setDeletedHabits] = useState([]);
    const [notification, setNotification] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBinHabits();
    }, []);

    const loadBinHabits = async () => {
        try {
            const data = await api.fetchBinHabits();
            setDeletedHabits(data);
        } catch (err) {
            console.error("Failed to load bin items", err);
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 5000);
    };

    const handleRestore = async (id, title) => {
        try {
            await api.restoreHabit(id);
            setDeletedHabits(prev => prev.filter(h => h._id !== id));
            showNotification(`Restored "${title}" to Dashboard`);
        } catch (err) {
            console.error("Restore failed", err);
            alert("Connection Issue: Could not restore habit. Please refresh and try again.");
        }
    };

    const handlePermanentDelete = async (id, title) => {
        if (!window.confirm(`Permanently wipe "${title}" from the database? This cannot be undone.`)) return;
        try {
            await api.permanentDeleteHabit(id);
            setDeletedHabits(prev => prev.filter(h => h._id !== id));
            showNotification(`Permanently erased "${title}"`);
        } catch (err) {
            console.error("Purge failed", err);
            alert("Error: Could not permanently delete. Check your server status.");
        }
    };

    const getDaysRemaining = (deletedAt) => {
        const delDate = new Date(deletedAt);
        const expiryDate = new Date(delDate.getTime() + (30 * 24 * 60 * 60 * 1000));
        const now = new Date();
        const diff = expiryDate - now;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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
                        background: 'rgba(255, 77, 77, 0.02)',
                        padding: '1.5rem 2.5rem',
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(255, 77, 77, 0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
                    }}>
                        <div className="mobile-text-center">
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', margin: 0, letterSpacing: '-1.5px' }}>
                                Recycle <span style={{ color: '#ff4d4d' }}>Bin</span>
                            </h1>
                            <p style={{ color: '#554444', fontWeight: '700', marginTop: '6px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                TEMPORARY STORAGE • {deletedHabits.length} ITEMS PENDING PURGE
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
                        {deletedHabits.length === 0 && !loading ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '6rem 2rem',
                                background: '#0a0808',
                                borderRadius: '2rem',
                                border: '1px dashed rgba(255, 77, 77, 0.1)'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.2 }}>🗑️</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.8rem', color: '#443333' }}>Bin is Empty</h2>
                                <p style={{ maxWidth: '350px', margin: '0 auto', lineHeight: '1.6', color: '#554444', fontSize: '0.9rem' }}>Deleted habits are kept here for 30 days before being permanently erased.</p>
                            </div>
                        ) : (
                            deletedHabits.map(habit => {
                                const daysRemaining = getDaysRemaining(habit.deletedAt);
                                return (
                                    <div key={habit._id} className="mobile-stack" style={{
                                        background: 'rgba(15, 10, 10, 0.7)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 77, 77, 0.1)',
                                        borderRadius: '1.5rem',
                                        padding: '1.2rem 2rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                                    }}>
                                        <div className="mobile-text-center">
                                            <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#eee', letterSpacing: '-0.5px' }}>
                                                {habit.title}
                                            </span>
                                            <div style={{ fontSize: '0.7rem', color: '#ff4d4d', marginTop: '6px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                Wiping in {daysRemaining} Days
                                            </div>
                                        </div>

                                        <div className="mobile-stack" style={{ display: 'flex', gap: '0.8rem' }}>
                                            <button
                                                onClick={() => handleRestore(habit._id, habit.title)}
                                                className="mobile-full-width"
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    color: '#fff',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    padding: '0.8rem 1.8rem',
                                                    borderRadius: '12px',
                                                    fontWeight: '900',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#fff'; }}
                                            >
                                                Restore Habit
                                            </button>
                                            <button
                                                onClick={() => handlePermanentDelete(habit._id, habit.title)}
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
                                                Delete Permanent
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {notification && (
                        <div style={{
                            position: 'fixed',
                            bottom: '3rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#fff',
                            color: '#000',
                            padding: '1rem 3rem',
                            borderRadius: '50px',
                            fontWeight: '900',
                            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                            zIndex: 3000,
                            fontSize: '0.95rem'
                        }}>
                            🗑️ {notification}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Bin;
