import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            marginTop: '6rem',
            padding: '3rem 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.03)',
            background: 'rgba(5, 5, 5, 0.8)',
            backdropFilter: 'blur(10px)',
            color: '#444'
        }}>
            <div className="mobile-stack" style={{
                maxWidth: '1440px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '2rem',
                padding: '0 2rem'
            }}>
                {/* Brand & Motto */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{
                        fontSize: '0.85rem',
                        fontWeight: '900',
                        color: '#888',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }}>
                        © 2026 . All Rights Reserved.
                    </div>
                    <div style={{
                        fontSize: '0.8rem',
                        color: '#333',
                        fontWeight: '700',
                        letterSpacing: '0.5px'
                    }}>
                        Turning ideas into digital reality .
                    </div>
                </div>

                {/* Contact Email */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#555' }}>Reach me at:</span>
                    <a
                        href="mailto:gopalst2005@gmail.com"
                        style={{
                            color: '#00ccff',
                            textDecoration: 'none',
                            fontWeight: '900',
                            fontSize: '0.85rem',
                            transition: 'color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.color = '#fff'}
                        onMouseOut={(e) => e.target.style.color = '#00ccff'}
                    >
                        gopalst2005@gmail.com
                    </a>
                </div>

                {/* Social Icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <SocialIcon
                        href="https://www.instagram.com/_gopal_st_?igsh=MXVuNW8yMHdjanNwdQ=="
                        hoverColor="#E1306C"
                        icon={<InstagramIcon />}
                    />
                    <SocialIcon
                        hoverColor="#fff"
                        icon={<GitHubIcon />}
                    />
                    <SocialIcon
                        hoverColor="#0077B5"
                        icon={<LinkedInIcon />}
                    />
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ href, icon, hoverColor }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
            color: '#333',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
        onMouseOver={(e) => {
            e.currentTarget.style.color = hoverColor;
            e.currentTarget.style.transform = 'translateY(-3px)';
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.color = '#333';
            e.currentTarget.style.transform = 'translateY(0)';
        }}
    >
        {icon}
    </a>
);

const InstagramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const GitHubIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);

const LinkedInIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

export default Footer;
