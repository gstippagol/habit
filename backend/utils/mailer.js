import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Mailer Error:', error.message);
    } else {
        console.log('✅ Mailer is ready to send emails');
    }
});

export const sendMail = async ({ to, subject, html, attachments = [] }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Logging email instead.');
        console.log(`-----------------------------------`);
        console.log(`TO: ${to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log(`ATTACHMENTS: ${attachments.length} files`);
        console.log(`HTML Body Snippet: ${html.substring(0, 100)}...`);
        console.log(`-----------------------------------`);
        return;
    }

    const mailOptions = {
        from: `"Habit Tracker App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    } catch (error) {
        console.error(`❌ MAIL_DELIVERY_ERROR to ${to}:`, error);
        if (error.code === 'EAUTH') {
            console.error('   👉 Tip: This is an Authentication Error. Double-check your EMAIL_USER and EMAIL_PASS (App Password) in Render Dashboard.');
        }
        throw error;
    }
};
