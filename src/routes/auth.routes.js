import express from 'express';
import { verifyOtp, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/verify', verifyOtp);
router.get('/me', protect, getMe);

export default router; // <--- Shuni unutgan bo'lsangiz, app.js xato beradi