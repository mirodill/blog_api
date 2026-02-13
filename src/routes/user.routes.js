import express from 'express';
import { 
    getMe, 
    getAllUsers, 
    deleteUser, 
    updateUserRole 
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 1. Har qanday tizimga kirgan foydalanuvchi o'z profilini ko'ra oladi
router.get('/me', protect, getMe);

// 2. Faqat 'admin' barcha foydalanuvchilarni ko'ra oladi
router.get('/', protect, authorize('admin'), getAllUsers);

// 3. Foydalanuvchini o'chirish faqat 'admin'ga ruxsat
router.delete('/:id', protect, authorize('admin'), deleteUser);

// 4. Rolni o'zgartirish faqat 'admin'ga ruxsat
router.patch('/:id/role', protect, authorize('admin'), updateUserRole);

// Misol uchun: Agar kelajakda authorlar ko'ra oladigan yo'l bo'lsa:
// router.get('/stats', protect, authorize('admin', 'author'), getStats);

export default router;