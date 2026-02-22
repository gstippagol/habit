import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="header-nav" style={{
            background: '#0a0a0c',
            color: 'white',
            padding: '0.75rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e1e1e',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
            {/* Brand Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="logo-box" style={{
                    width: '45px',
                    height: '45px',
                    background: '#00ccff',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.4rem',
                    color: '#000',
                    boxShadow: '0 0 15px rgba(0,204,255,0.4)'
                }}>
                    HT
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="brand-text" style={{ fontWeight: '700', fontSize: '1.2rem', lineHeight: '1.1' }}>Habit Tracker</span>
                    <span className="mobile-hide" style={{ fontSize: '0.7rem', color: '#888', letterSpacing: '0.5px', marginTop: '2px' }}>
                        Focus • Build • Repeat
                    </span>
                </div>
            </div>

            {/* Actions Section (Logout on Mobile Row 1, or Desktop Right) */}
            <div className="nav-links-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, justifyContent: 'flex-end' }}>
                <span className="mobile-hide" style={{ color: '#88a0b0', fontSize: '0.9rem' }}>Hi, {user?.username || 'User'}</span>

                <div className="nav-links-wrapper" style={{ display: 'flex', gap: '0.5rem' }}>
                    <NavButton to="/dashboard" label="Dashboard" />
                    <NavButton to="/history" label="History" />
                    {user?.role === 'admin' && <NavButton to="/admin" label="Admin" />}
                </div>

                <button
                    onClick={logout}
                    className="logout-btn"
                    style={{
                        background: '#00ccff',
                        color: '#000',
                        border: 'none',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        marginLeft: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 5px 15px rgba(0,204,255,0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

const NavButton = ({ to, label }) => (
    <NavLink
        to={to}
        className="nav-link-btn"
        style={({ isActive }) => ({
            textDecoration: 'none',
            color: isActive ? '#fff' : '#888',
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: '600',
            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
        })}
        onMouseOver={(e) => {
            e.target.style.color = '#fff';
            e.target.style.background = 'rgba(255,255,255,0.05)';
        }}
        onMouseOut={(e) => {
            if (e.target.style.borderColor === 'transparent' || e.target.style.border === '1px solid transparent') {
                e.target.style.color = '#888';
                e.target.style.background = 'transparent';
            }
        }}
    >
        {label}
    </NavLink>
);

export default Navbar;
