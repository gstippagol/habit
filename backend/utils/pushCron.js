import cron from 'node-cron';
import webpush from 'web-push';
import User from '../models/User.js';
import Habit from '../models/Habit.js';

// Setup VAPID details (Ideally these would be in .env)
const PUBLIC_VAPID_KEY = process.env.VAPID_PUBLIC_KEY || 'BHt4uYRRcMwdWTUnFNwvB5Z-U9siQiS8BQ-P9hNRbwWqErGACDeYEvPhYcSe98WKKpiuUbbDbRi33mEs8jix05k';
const PRIVATE_VAPID_KEY = process.env.VAPID_PRIVATE_KEY || '93N2tkEpZ8CduCwOdHguDJ8zz40ANNmYcqi6-h3QVXs';

webpush.setVapidDetails(
    'mailto:test@example.com',
    PUBLIC_VAPID_KEY,
    PRIVATE_VAPID_KEY
);

export const initPushCron = () => {
    // Run every minute to check if current time matches any user's reminderTime
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        const timeString = `${currentHour}:${currentMinute}`;

        try {
            // Find users who have push enabled, a valid subscription, and their reminderTime is right now
            const usersToNotify = await User.find({
                pushEnabled: true,
                pushSubscription: { $ne: null },
                reminderTime: timeString
            });

            if (usersToNotify.length === 0) return;

            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            for (const user of usersToNotify) {
                // Check if they actually have incomplete habits today
                const habits = await Habit.find({ user: user._id, isArchived: false, isDeleted: false });

                let incompleteCount = 0;
                for (const habit of habits) {
                    if (!habit.completedDates.includes(todayStr)) {
                        incompleteCount++;
                    }
                }

                if (incompleteCount > 0) {
                    const payload = JSON.stringify({
                        title: 'Habit Reminder ⏰',
                        body: `You still have ${incompleteCount} habit${incompleteCount > 1 ? 's' : ''} left for today! Don't break your streak!`,
                        icon: '/logo.svg',
                        data: {
                            url: process.env.FRONTEND_URL || 'https://pvthabit-tracker.netlify.app'
                        }
                    });

                    try {
                        await webpush.sendNotification(user.pushSubscription, payload);
                        console.log(`🔔 Sent push notification to ${user.username} for ${timeString}`);
                    } catch (pushErr) {
                        console.error(`❌ Failed to send push to ${user.username}:`, pushErr);
                        // If subscription is invalid (e.g. 410 Gone), disable it
                        if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                            user.pushEnabled = false;
                            user.pushSubscription = null;
                            await user.save();
                        }
                    }
                }
            }
        } catch (error) {
            console.error('❌ Push Cron Error:', error);
        }
    });

    console.log('✅ Cron Job Initialized: Minutely Push Notification Scan');
};
