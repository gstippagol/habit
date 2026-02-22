import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        // For demonstration, if no user is logged in, we'll just redirect to login
        // BUT since the user wants to "open dashboard", I'll mock a login or allow it if I want.
        // Let's stick to standard: if no user, redirect to login.
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
