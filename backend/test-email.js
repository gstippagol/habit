import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function test() {
    console.log('Testing with User:', process.env.EMAIL_USER);
    try {
        await transporter.verify();
        console.log('✅ Connection verified');

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // send to self
            subject: 'Test Email from Habit Tracker',
            text: 'This is a test email to verify the service is working.'
        });
        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ Error occurred:', error);
    }
}

test();
