import express from 'express';
import { protect, adminAuth } from '../middleware/authMiddleware.js';
import { submitDemoRequest, getDemoRequests, approveDemoRequest, rejectDemoRequest, loginDemoUser, clearDemoData } from '../controllers/demoController.js';

const router = express.Router();

// Demo Authentication
router.post('/login', loginDemoUser);
router.post('/clear', protect, clearDemoData);

// Demo Admin Requests
router.post('/request-admin', protect, submitDemoRequest);
router.get('/requests', protect, adminAuth, getDemoRequests);
router.put('/requests/:id/approve', protect, adminAuth, approveDemoRequest);
router.put('/requests/:id/reject', protect, adminAuth, rejectDemoRequest);

export default router;
