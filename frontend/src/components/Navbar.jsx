import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const UserBadge = ({ isMobile = false }) => {
        const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '5px 16px 5px 6px',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(15px)',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                minWidth: 'fit-content'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontWeight: '900',
                    fontSize: '0.95rem',
                }}>
                    {initial}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                        letterSpacing: '-0.2px'
                    }}>
                        {user?.username || 'GUEST'}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <nav className="header-nav" style={{
            background: '#0a0a0c',
            color: 'white',
            padding: '0.6rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e1e1e',
            position: 'sticky',
            top: 0,
            zIndex: 4000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
            {/* Brand Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="logo-box" style={{
                    width: '36px',
                    height: '36px',
                    background: '#00ccff',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'Bold',
                    fontSize: '1.1rem',
                    color: '#000',
                }}>
                    HT
                </div>
                <span className="brand-text" style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>Habit Tracker</span>
            </div>

            {/* Desktop Navigation */}
            <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <NavButton to="/dashboard" label="Dashboard" />
                    <NavButton to="/history" label="History" />

                    {/* Compact "More" Dropdown for Desktop */}
                    <div
                        onMouseEnter={() => setIsMoreOpen(true)}
                        onMouseLeave={() => setIsMoreOpen(false)}
                        style={{ position: 'relative' }}
                    >
                        <button style={{
                            background: 'transparent',
                            color: '#888',
                            border: 'none',
                            padding: '0.6rem 1rem',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            Archive ▾
                        </button>
                        {isMoreOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                background: '#121214',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '0.5rem',
                                minWidth: '140px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px'
                            }}>
                                <DropdownItem to="/archived" label="Vault" />
                                <DropdownItem to="/bin" label="Recycle Bin" />
                            </div>
                        )}
                    </div>

                    {user?.role === 'admin' && <NavButton to="/admin" label="Admin" />}
                </div>

                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />

                <UserBadge />

                <button
                    onClick={logout}
                    style={{
                        background: 'rgba(255, 77, 77, 0.1)',
                        color: '#ff4d4d',
                        border: '1px solid rgba(255, 77, 77, 0.2)',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: '0.2s',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#ff4d4d'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)'; e.currentTarget.style.color = '#ff4d4d'; }}
                >
                    Logout
                </button>
            </div>

            {/* Mobile Header elements */}
            <div className="mobile-only-header" style={{ display: 'none', alignItems: 'center', gap: '10px' }}>
                <UserBadge isMobile={true} />
                <button
                    className="mobile-menu-toggle"
                    onClick={toggleMenu}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="mobile-menu-overlay" style={{
                    position: 'fixed',
                    top: '56px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(5, 5, 5, 0.98)',
                    backdropFilter: 'blur(15px)',
                    zIndex: 3999,
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    <div style={{ color: '#555', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', paddingLeft: '10px' }}>Navigation</div>
                    <MobileNavLink to="/dashboard" label="Dashboard" icon="📊" onClick={toggleMenu} />
                    <MobileNavLink to="/history" label="History" icon="📈" onClick={toggleMenu} />
                    <MobileNavLink to="/archived" label="Archive Vault" icon="📂" onClick={toggleMenu} />
                    <MobileNavLink to="/bin" label="Recycle Bin" icon="🗑️" onClick={toggleMenu} />
                    {user?.role === 'admin' && <MobileNavLink to="/admin" label="Admin Control" icon="⚙️" onClick={toggleMenu} />}

                    <button
                        onClick={logout}
                        style={{
                            marginTop: 'auto',
                            background: '#ff4d4d',
                            border: 'none',
                            color: '#fff',
                            padding: '1.2rem',
                            borderRadius: '16px',
                            fontWeight: '900',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                        }}
                    >
                        Logout Session
                    </button>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .nav-links-desktop { display: none !important; }
                    .mobile-only-header { display: flex !important; }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </nav>
    );
};

const NavButton = ({ to, label }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            textDecoration: 'none',
            color: isActive ? '#fff' : '#888',
            padding: '0.6rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: '600',
            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
        })}
    >
        {label}
    </NavLink>
);

const DropdownItem = ({ to, label }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            textDecoration: 'none',
            color: isActive ? '#00ccff' : '#888',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: '700',
            background: isActive ? 'rgba(0,204,255,0.05)' : 'transparent',
            transition: '0.2s',
        })}
    >
        {label}
    </NavLink>
);

const MobileNavLink = ({ to, label, icon, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        style={({ isActive }) => ({
            textDecoration: 'none',
            color: isActive ? '#00ccff' : '#fff',
            background: isActive ? 'rgba(0, 204, 255, 0.05)' : 'rgba(255,255,255,0.02)',
            padding: '1rem',
            borderRadius: '14px',
            fontSize: '1rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            border: isActive ? '1px solid rgba(0, 204, 255, 0.2)' : '1px solid rgba(255,255,255,0.05)',
            transition: '0.2s'
        })}
    >
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        {label}
    </NavLink>
);

export default Navbar;
