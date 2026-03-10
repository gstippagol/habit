import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import ActivityLog from '../models/ActivityLog.js';
import DemoRequest from '../models/DemoRequest.js';
import bcrypt from 'bcryptjs';
import { sendMail } from '../utils/mailer.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

export const loginDemoUser = async (req, res) => {
    try {
        const demoEmail = 'demo@habittracker.com';
        let user = await User.findOne({ email: demoEmail });

        if (!user) {
            const hashedPassword = await bcrypt.hash('demo123', 12);
            user = await User.create({
                username: 'Demo User',
                email: demoEmail,
                password: hashedPassword,
                role: 'demo'
            });
        }

        // Clear old demo data automatically
        await Habit.deleteMany({ user: user._id });
        await ActivityLog.deleteMany({ user: user._id });

        const token = generateToken(user._id);

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            token: token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const clearDemoData = async (req, res) => {
    try {
        if (req.user.role === 'demo') {
            await Habit.deleteMany({ user: req.user._id });
            await ActivityLog.deleteMany({ user: req.user._id });
            res.json({ message: "Demo data cleared successfully." });
        } else {
            res.status(403).json({ message: "Not a demo user." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const submitDemoRequest = async (req, res) => {
    const { name, email, age, dob, contactNumber, state } = req.body;
    try {
        const existingReq = await DemoRequest.findOne({ email });
        if (existingReq && existingReq.status === 'pending') {
            return res.status(400).json({ message: 'A request with this email is already pending.' });
        }

        const newReq = await DemoRequest.create({
            name, email, age, dob, contactNumber, state
        });

        // Notify Admin via Email
        try {
            await sendMail({
                to: 'teamhabit.tracker@gmail.com',
                subject: `New Admin Access Request: ${name}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #a855f7;">New Demo User Request</h2>
                        <p>A user has requested administrative access to <b>Habit Tracker</b>.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p><b>Name:</b> ${name}</p>
                        <p><b>Email:</b> ${email}</p>
                        <p><b>Age:</b> ${age}</p>
                        <p><b>DOB:</b> ${dob}</p>
                        <p><b>Contact:</b> +91 ${contactNumber}</p>
                        <p><b>State:</b> ${state}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p>Please review this request in the <a href="${process.env.FRONTEND_URL || 'https://pvthabit-tracker.netlify.app'}/admin">Admin Console</a>.</p>
                    </div>
                `
            });
        } catch (mailErr) {
            console.error("Failed to send admin notification email:", mailErr);
        }

        res.status(201).json({ message: 'Request submitted successfully!', request: newReq });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectDemoRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const request = await DemoRequest.findById(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = 'rejected';
        await request.save();

        res.json({ message: 'Request rejected', request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDemoRequests = async (req, res) => {
    try {
        const requests = await DemoRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const approveDemoRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const request = await DemoRequest.findById(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = 'approved';
        await request.save();

        res.json({ message: 'Request approved', request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
