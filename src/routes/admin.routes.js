import express from 'express';
import { getAllUsers, deleteUser, getUserStats } from '../controllers/admin.controller.js';
// Nomi 'protect' va 'authorize' ekan, shunday import qilamiz
import { protect, authorize } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

// protect - tokenni tekshiradi
// authorize('admin') - faqat admin rolidagilarga ruxsat beradi
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/stats', protect, authorize('admin'), getUserStats);

export default router;