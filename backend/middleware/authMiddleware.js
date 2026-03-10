import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (req.user.isActive === false) {
                return res.status(403).json({ message: 'Account Deactivated: Access is restricted by administrator.' });
            }

            if (req.user.role !== 'demo' && req.user.activeDesktopToken !== token && req.user.activeMobileToken !== token) {
                return res.status(401).json({ message: 'Session expired. You have logged in from another device.' });
            }

            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const adminAuth = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Restricted Action. Only Administrators can perform this action.' });
    }
};
