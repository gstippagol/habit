import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["user", "admin", "demo"],
            default: "user"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        resetPasswordOTP: String,
        resetPasswordExpires: Date,
        lastReminderSent: Date,
        pushSubscription: {
            type: Object,
            default: null
        },
        reminderTime: {
            type: String,
            default: "20:00" // Default 8 PM
        },
        pushEnabled: {
            type: Boolean,
            default: false
        },
        activeDesktopToken: {
            type: String,
            default: null
        },
        activeMobileToken: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
