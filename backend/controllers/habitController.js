import Habit from '../models/Habit.js';
import ActivityLog from '../models/ActivityLog.js';

export const getHabits = async (req, res) => {
    try {
        // Return all habits, frontend handles filtering by isArchived
        const habits = await Habit.find({ user: req.user._id });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createHabit = async (req, res) => {
    const { title, target, frequencyType, specificDays, weeklyQuota } = req.body;
    try {
        const newHabit = new Habit({
            title,
            target,
            frequencyType: frequencyType || 'daily',
            specificDays: specificDays || [],
            weeklyQuota: weeklyQuota || 0,
            user: req.user._id
        });
        await newHabit.save();

        // Record Activity
        await ActivityLog.create({
            user: req.user._id,
            type: 'habit_create',
            details: `Created new habit: ${title}`
        });

        res.status(201).json(newHabit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const toggleHabitDate = async (req, res) => {
    const { id } = req.params;
    const { date } = req.body; // YYYY-MM-DD
    try {
        const habit = await Habit.findOne({ _id: id, user: req.user._id });
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        const dateIndex = habit.completedDates.indexOf(date);
        let action = '';
        if (dateIndex > -1) {
            habit.completedDates.splice(dateIndex, 1);
            action = 'unmarked';
        } else {
            habit.completedDates.push(date);
            action = 'marked';
        }

        habit.streak = habit.completedDates.length;

        // Calculate Streak exclusively within the current month
        const now = new Date();
        const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentMonthCompletions = habit.completedDates.filter(d => d.startsWith(currentMonthPrefix));
        habit.streak = currentMonthCompletions.length;

        await habit.save();

        // Record Activity
        await ActivityLog.create({
            user: req.user._id,
            type: 'habit_toggle',
            details: `User ${action} ${habit.title} for ${date}`
        });

        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteHabit = async (req, res) => {
    try {
        // Soft delete: set isDeleted to true and record timestamp
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        // Record Activity
        await ActivityLog.create({
            user: req.user._id,
            type: 'habit_delete_soft',
            details: `Moved habit to bin: ${habit.title}`
        });

        res.json({ message: 'Habit moved to bin', habit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const restoreHabit = async (req, res) => {
    try {
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isDeleted: false, deletedAt: null, isArchived: false },
            { new: true }
        );
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        await ActivityLog.create({
            user: req.user._id,
            type: 'habit_restore',
            details: `Restored habit from bin: ${habit.title}`
        });

        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBinHabits = async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user._id, isDeleted: true });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const permanentDeleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!habit) return res.status(404).json({ message: 'Habit not found' });
        res.json({ message: 'Habit permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const archiveHabit = async (req, res) => {
    const { isArchived } = req.body;
    try {
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isArchived: isArchived !== undefined ? isArchived : true },
            { new: true }
        );
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        // Record Activity
        await ActivityLog.create({
            user: req.user._id,
            type: 'habit_archive',
            details: `${isArchived ? 'Archived' : 'Restored'} habit: ${habit.title}`
        });

        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateHabit = async (req, res) => {
    const { title, target, frequencyType, specificDays, weeklyQuota } = req.body;
    try {
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { title, target, frequencyType, specificDays, weeklyQuota },
            { new: true }
        );
        if (!habit) return res.status(404).json({ message: 'Habit not found' });
        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add or update a note for a specific date
// @route   POST /api/habits/:id/note
// @access  Private
export const addHabitNote = async (req, res) => {
    try {
        const { date, note } = req.body;
        const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        if (!habit.notes) {
            habit.notes = new Map();
        }

        if (note && note.trim()) {
            habit.notes.set(date, note.trim());
        } else {
            habit.notes.delete(date);
        }

        await habit.save();
        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
