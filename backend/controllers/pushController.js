import webpush from 'web-push';
import User from '../models/User.js';

// Setup VAPID details (Ideally these would be in .env)
const PUBLIC_VAPID_KEY = process.env.VAPID_PUBLIC_KEY || 'BHt4uYRRcMwdWTUnFNwvB5Z-U9siQiS8BQ-P9hNRbwWqErGACDeYEvPhYcSe98WKKpiuUbbDbRi33mEs8jix05k';
const PRIVATE_VAPID_KEY = process.env.VAPID_PRIVATE_KEY || '93N2tkEpZ8CduCwOdHguDJ8zz40ANNmYcqi6-h3QVXs';

// Setup web-push
webpush.setVapidDetails(
    'mailto:test@example.com',
    PUBLIC_VAPID_KEY,
    PRIVATE_VAPID_KEY
);

export const getVapidKey = (req, res) => {
    res.status(200).json({ publicKey: PUBLIC_VAPID_KEY });
};

export const subscribe = async (req, res) => {
    try {
        const { subscription, reminderTime } = req.body;

        await User.findByIdAndUpdate(req.user._id, {
            pushSubscription: subscription,
            reminderTime: reminderTime || '20:00',
            pushEnabled: true
        });

        // Send a test notification immediately to confirm
        const payload = JSON.stringify({
            title: 'Notifications Enabled!',
            body: `You will now receive habit reminders at ${reminderTime || '20:00'} daily.`,
            icon: '/icon-192.png'
        });

        webpush.sendNotification(subscription, payload).catch(err => console.error("Web Push Error:", err));

        res.status(200).json({ message: "Subscribed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Subscription failed", error });
    }
};

export const unsubscribe = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            pushSubscription: null,
            pushEnabled: false
        });
        res.status(200).json({ message: "Unsubscribed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unsubscribe failed", error });
    }
};

export const getPushSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            pushEnabled: user.pushEnabled,
            reminderTime: user.reminderTime
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch settings", error });
    }
};
