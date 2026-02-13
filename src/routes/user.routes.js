// src/routes/user.routes.js
import express from 'express';
import { getMe } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Foydalanuvchi o'z profilini ko'rishi uchun
router.get('/me', protect, getMe);

export default router;