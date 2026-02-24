import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import { initReminderCron } from "./utils/reminderCron.js";
import { initMonthlyReportCron } from "./utils/reportCron.js";

const app = express();

// Middlewares
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'https://pvthabit-tracker.netlify.app',
            'https://pvthabit-tracker.netlify.app/',
            'http://localhost:5173'
        ].filter(Boolean);

        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin + '/')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.url}`);
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && Object.keys(req.body).length > 0) {
        // Log a sanitized version of the body (hide passwords)
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.password) sanitizedBody.password = '********';
        console.log(`   Body:`, JSON.stringify(sanitizedBody, null, 2));
    }
    next();
});

// Routes
const mountRoutes = (base) => {
    app.use(`${base}/auth`, authRoutes);
    app.use(`${base}/habits`, habitRoutes);
};

mountRoutes("/api");
mountRoutes(""); // Also mount on root to handle cases where /api prefix is missing

// Root & Health Check
app.get("/", (req, res) => res.send("🚀 Habit Tracker API is running..."));
app.get("/api", (req, res) => res.json({ message: "Welcome to Habit Tracker API", version: "1.0.0" }));

// 404 Handler - MUST be after all routes
app.use((req, res) => {
    console.warn(`404 - ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: "Not Found",
        message: `The requested path ${req.originalUrl} does not exist on this server.`,
        suggestedRoutes: ["/api/auth/login", "/api/habits"]
    });
});

const PORT = process.env.PORT || 5000;

// Connect to DB then start server
connectDB()
    .then(() => {
        initReminderCron();
        initMonthlyReportCron();
        app.listen(PORT, () => {
            console.log(`🚀 Backend running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('🚨 FATAL: Could not connect to database. Server will not start.');
        console.error('   Error:', err.message);
        process.exit(1);
    });