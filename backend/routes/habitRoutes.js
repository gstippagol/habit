import express from 'express';
import { getHabits, createHabit, toggleHabitDate, deleteHabit, archiveHabit, updateHabit, getBinHabits, restoreHabit, permanentDeleteHabit } from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getHabits);
router.get('/bin', getBinHabits);
router.post('/', createHabit);
router.patch('/:id/toggle', toggleHabitDate);
router.patch('/:id/archive', archiveHabit);
router.post('/:id/restore', restoreHabit);
router.put('/:id', updateHabit);
router.delete('/:id/permanent', permanentDeleteHabit);
router.delete('/:id', deleteHabit);

export default router;
