import express from 'express';
import { getVapidKey, subscribe, unsubscribe, getPushSettings } from '../controllers/pushController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/vapidPublicKey', getVapidKey);
router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);
router.get('/settings', protect, getPushSettings);

export default router;
