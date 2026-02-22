import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { logoutUser, recordSessionPulse } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const sessionStart = useRef(Date.now());

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            sessionStart.current = Date.now();
        }
        setLoading(false);

        // Heartbeat pulse every 5 minutes if logged in
        const pulseInterval = setInterval(() => {
            const currentUser = localStorage.getItem('user');
            if (currentUser) {
                const duration = Math.round((Date.now() - sessionStart.current) / 60000);
                recordSessionPulse(duration).catch(() => { });
            }
        }, 300000);

        return () => clearInterval(pulseInterval);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        sessionStart.current = Date.now();
    };

    const logout = async () => {
        const duration = Math.round((Date.now() - sessionStart.current) / 60000);
        try {
            await logoutUser(duration);
        } catch (e) {
            console.warn("Logout not recorded on server");
        }
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
