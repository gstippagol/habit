import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import { sendMail } from './mailer.js';
import cron from 'node-cron';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const generateMonthlyReports = async () => {
    console.log('--- 📊 Starting Monthly Report Generation ---');

    try {
        const users = await User.find({ isActive: true });
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const monthName = monthNames[month];

        // Date range for the month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const mPre = `${year}-${String(month + 1).padStart(2, '0')}`;

        for (const user of users) {
            try {
                const habits = await Habit.find({ user: user._id });

                // Filter habits that existed this month or have completions
                const activeHabits = habits.filter(h => {
                    if (h.isDeleted && new Date(h.deletedAt) < new Date(year, month, 1)) return false;
                    const createDate = new Date(h.createdAt);
                    const periodEnd = new Date(year, month + 1, 0, 23, 59, 59);
                    const hasCompletions = (h.completedDates || []).some(d => d.startsWith(mPre));
                    return (createDate <= periodEnd) || hasCompletions;
                });

                if (activeHabits.length === 0) continue;

                // 1. Create PDF
                const doc = new jsPDF('l', 'mm', 'a4');

                // Header
                doc.setFontSize(22);
                doc.setTextColor(0, 204, 255);
                doc.text('HABIT TRACKER - MONTHLY LEDGER', 14, 20);
                doc.setFontSize(12);
                doc.setTextColor(100);
                doc.text(`User: ${user.username} | Period: ${monthName} ${year}`, 14, 28);

                // Table Data
                const headers = [['Date', ...activeHabits.map(h => h.title)]];
                const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                const tableData = dayNumbers.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    return [
                        String(day).padStart(2, '0'),
                        ...activeHabits.map(h => {
                            const createDateOnly = new Date(h.createdAt).toISOString().split('T')[0];
                            if (dateStr < createDateOnly) return '-';
                            return (h.completedDates || []).includes(dateStr) ? 'YES' : 'NO';
                        })
                    ];
                });

                // Totals
                const totalsRow = ['TOTAL', ...activeHabits.map(h => {
                    const count = (h.completedDates || []).filter(d => d.startsWith(mPre)).length;
                    const pct = Math.round((count / daysInMonth) * 100);
                    return `${count}/${daysInMonth} (${pct}%)`;
                })];
                tableData.push(totalsRow);

                // Generate Table
                doc.autoTable({
                    head: headers,
                    body: tableData,
                    startY: 35,
                    theme: 'grid',
                    headStyles: { fillColor: [10, 10, 12], textColor: [0, 204, 255], fontSize: 8, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 7, textColor: [50, 50, 50] },
                    didParseCell: (data) => {
                        if (data.row.index === dayNumbers.length) {
                            data.cell.styles.fillColor = [230, 247, 255];
                        }
                    }
                });

                // Convert PDF to Buffer for attachment
                const pdfBase64 = doc.output('datauristring').split(',')[1];
                const pdfBuffer = Buffer.from(pdfBase64, 'base64');

                // 2. Send Email
                const emailHtml = `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #050505; color: #fff; border-radius: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #00ccff; font-size: 2.5rem; margin-bottom: 5px;">Monthly Review</h1>
                            <p style="color: #666; letter-spacing: 2px; text-transform: uppercase; font-size: 0.8rem;">${monthName} ${year} • PERFORMANCE REPORT</p>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 30px; border-radius: 15px; margin-bottom: 30px;">
                            <p style="font-size: 1.1rem; line-height: 1.6;">Hi <strong>${user.username}</strong>,</p>
                            <p style="color: #bbb; line-height: 1.6;">
                                Congratulations on finishing another month of discipline! Attached to this email, you will find your 
                                <strong>Interactive Monthly Ledger</strong> and <strong>Progress History</strong>. 
                            </p>
                            <p style="color: #bbb; line-height: 1.6;">
                                Reviewing your past data is the best way to identify patterns and strengthen your consistency for the upcoming month.
                            </p>
                        </div>

                        <div style="text-align: center; color: #444; font-size: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                            This is an automated monthly summary from your Habit Tracker. <br>
                            Keep pushing. Discipline Over Motivation.
                        </div>
                    </div>
                `;

                await sendMail({
                    to: user.email,
                    subject: `📊 Your Monthly Habit Report: ${monthName} ${year}`,
                    html: emailHtml,
                    attachments: [
                        {
                            filename: `Habit_Report_${monthName}_${year}.pdf`,
                            content: pdfBuffer
                        }
                    ]
                });

                console.log(`📤 Report sent to ${user.username}`);

            } catch (err) {
                console.error(`❌ Failed to process report for ${user.username}:`, err);
            }
        }

    } catch (error) {
        console.error('❌ Global Monthly Report Error:', error);
    }
};

export const initMonthlyReportCron = () => {
    // Run at 11:59 PM on the last day of the month
    // Cron: 59 23 28-31 * *
    // Then check if tomorrow is the 1st
    cron.schedule('59 23 28-31 * *', () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (tomorrow.getDate() === 1) {
            generateMonthlyReports();
        }
    });

    console.log('✅ Cron Job Initialized: Monthly Report Dispatch @ Month End 11:59 PM');
};
