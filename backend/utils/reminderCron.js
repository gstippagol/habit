import cron from 'node-cron';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendMail } from './mailer.js';

/**
 * Initializes the reminder cron job.
 * Scans for users who are inactive (no habit marks for 2 days) or have no habits.
 * Sends motivational emails based on discipline.
 */
export const initReminderCron = () => {
    // Run every day at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
        console.log('--- 🛡️ Running Inactivity Scan ---');
        try {
            const users = await User.find({ isActive: true });
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (const user of users) {
                // Find all active habits for this user
                const habits = await Habit.find({ user: user._id, isArchived: false, isDeleted: false });

                // --- CASE 1: USER HAS NO HABITS ---
                if (habits.length === 0) {
                    // Check if they were created at least 24 hours ago
                    const oneDayAgo = new Date();
                    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

                    if (user.createdAt > oneDayAgo) continue;
                    if (user.lastReminderSent) continue; // Only send the "Starter" nudge once

                    console.log(`📡 Sending 'Starter' nudge to: ${user.username}`);

                    const starterEmailHtml = `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #050505; color: #ffffff; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid rgba(0, 204, 255, 0.1);">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <div style="display: inline-block; padding: 15px; background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%); border-radius: 12px; color: #000; font-weight: 900; font-size: 1.5rem;">HT</div>
                            </div>
                            <h1 style="color: #00ccff; text-align: center; font-size: 1.8rem; margin-bottom: 10px;">The First Step is Always the Hardest</h1>
                            <p style="text-align: center; color: #888; font-size: 1.1rem; font-style: italic;">"A journey of a thousand miles begins with a single step."</p>
                            
                            <div style="background: rgba(255,255,255,0.03); padding: 25px; border-radius: 15px; margin: 30px 0; border: 1px solid rgba(255,255,255,0.05);">
                                <p style="line-height: 1.6; font-size: 1rem;">Hi <strong>${user.username}</strong>,</p>
                                <p style="line-height: 1.6;">You joined <strong>Habit Tracker</strong> to build a better version of yourself, but your dashboard is still empty.</p>
                                <p style="line-height: 1.6; color: #00ccff; font-weight: bold;">Discipline is the bridge between goals and accomplishment.</p>
                            </div>

                            <p style="font-weight: bold; color: #ccc; margin-bottom: 10px;">Start tonight:</p>
                            <ul style="color: #888; line-height: 1.8;">
                                <li>✨ Create just ONE habit. Keep it simple.</li>
                                <li>💧 Example: "Drink 2L Water" or "Read 5 Pages".</li>
                                <li>🧠 Action breeds confidence. Start now.</li>
                            </ul>

                            <div style="text-align: center; margin-top: 40px;">
                                <a href="${process.env.FRONTEND_URL || 'https://pvthabit-tracker.netlify.app'}" 
                                   style="background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%); color: #000; padding: 15px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; display: inline-block; letter-spacing: 1px;">
                                   CREATE MY FIRST HABIT ➔
                                </a>
                            </div>
                            
                            <p style="color: #444; font-size: 0.8rem; margin-top: 40px; text-align: center;">
                                Stay Disciplined. <br>
                                <strong>The Habit Tracker Team</strong>
                            </p>
                        </div>
                    `;

                    await sendMail({
                        to: user.email,
                        subject: "Your journey starts today... 🚀",
                        html: starterEmailHtml
                    });

                    // Record nudge in ActivityLog
                    await ActivityLog.create({
                        user: user._id,
                        type: 'email_nudge',
                        details: 'Starter Motivation: Sent to user with 0 habits'
                    }).catch(err => console.error('Activity Log Error (Starter):', err.message));

                    user.lastReminderSent = new Date();
                    await user.save();
                    continue;
                }

                // --- CASE 2: USER HAS HABITS BUT IS INACTIVE ---

                // Avoid spam: Only send every 3 days
                if (user.lastReminderSent) {
                    const lastReminderDate = new Date(user.lastReminderSent);
                    const diffTime = Math.abs(today - lastReminderDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays < 3) continue;
                }

                let isInactive = true;
                const twoDaysAgo = new Date();
                twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                twoDaysAgo.setHours(0, 0, 0, 0);

                // Check for ANY recent marks across all habits
                for (const habit of habits) {
                    const recentMarks = (habit.completedDates || []).filter(dateStr => {
                        const markDate = new Date(dateStr);
                        return markDate >= twoDaysAgo;
                    });

                    if (recentMarks.length > 0) {
                        isInactive = false;
                        break;
                    }
                }

                if (isInactive) {
                    console.log(`📡 Sending 'Discipline' nudge to: ${user.username}`);

                    const emailHtml = `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #050505; color: #ffffff; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid rgba(0, 204, 255, 0.1);">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <div style="display: inline-block; padding: 15px; background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%); border-radius: 12px; color: #000; font-weight: 900; font-size: 1.5rem;">HT</div>
                            </div>
                            <h1 style="color: #00ccff; text-align: center; font-size: 1.8rem; margin-bottom: 10px;">Discipline is Choice</h1>
                            <p style="text-align: center; color: #888; font-size: 1.1rem; font-style: italic;">"Motivation gets you started; discipline keeps you going."</p>
                            
                            <div style="background: rgba(255,255,255,0.03); padding: 25px; border-radius: 15px; margin: 30px 0; border: 1px solid rgba(255,255,255,0.05);">
                                <p style="line-height: 1.6; font-size: 1rem;">Hi <strong>${user.username}</strong>,</p>
                                <p style="line-height: 1.6;">You haven't logged any progress for <strong>2 days</strong>. Streaks are easy to break but hard to build.</p>
                                <p style="line-height: 1.6; color: #00ccff; font-weight: bold;">"We are what we repeatedly do. Excellence, then, is not an act, but a habit."</p>
                            </div>

                            <p style="font-weight: bold; color: #ccc; margin-bottom: 10px;">Reclaim your focus:</p>
                            <ul style="color: #888; line-height: 1.8;">
                                <li>🔥 Don't let your current streaks expire.</li>
                                <li>💪 It takes 1% better every day to reach your peak.</li>
                                <li>⛓️ Success is built on the days you don't feel like it.</li>
                            </ul>

                            <div style="text-align: center; margin-top: 40px;">
                                <a href="${process.env.FRONTEND_URL || 'https://pvthabit-tracker.netlify.app'}" 
                                   style="background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%); color: #000; padding: 15px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; display: inline-block; letter-spacing: 1px;">
                                   RESUME MY PROGRESS ➔
                                </a>
                            </div>
                            
                            <p style="color: #444; font-size: 0.8rem; margin-top: 40px; text-align: center;">
                                Discipline > Motivation. <br>
                                <strong>The Habit Tracker Team</strong>
                            </p>
                        </div>
                    `;

                    await sendMail({
                        to: user.email,
                        subject: "Discipline equals freedom... ⛓️",
                        html: emailHtml
                    });

                    // Record nudge in ActivityLog
                    await ActivityLog.create({
                        user: user._id,
                        type: 'email_nudge',
                        details: 'Discipline Nudge: Sent to inactive user (2 days no marks)'
                    }).catch(err => console.error('Activity Log Error (Discipline):', err.message));

                    // Update last reminder sent date
                    user.lastReminderSent = new Date();
                    await user.save();
                }
            }
        } catch (error) {
            console.error('❌ Inactivity Job Error:', error);
        }
    });

    console.log('✅ Cron Job Initialized: Daily Inactivity Scan @ 10:00 AM');
};
