import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Yangi foydalanuvchi (yoki admin) yaratish
 * @access  Public
 */
router.get('/me', protect, getMe);
router.put('/update', protect, updateProfile);
router.post('/register', register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Username va Password orqali kirish
 * @access  Public
 */
router.post('/login', login);

export default router;