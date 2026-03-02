import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    title: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completedDates: { type: [String], default: [] }, // Store dates as YYYY-MM-DD strings
    streak: { type: Number, default: 0 },
    target: { type: Number, default: 10 },

    // Frequency fields
    frequencyType: {
        type: String,
        enum: ['daily', 'specific_days', 'weekly_quota'],
        default: 'daily'
    },
    specificDays: {
        type: [Number], // 0 (Sun) to 6 (Sat)
        default: []
    },
    weeklyQuota: {
        type: Number,
        default: 0
    },

    notes: {
        type: Map,
        of: String,
        default: {}
    },

    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
