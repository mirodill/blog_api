import express from 'express';
import { 
  getAllUsers, 
  deleteUser, 
  getUserStats, 
  toggleBlockUser 
} from '../controllers/admin.controller.js';

// Middleware'larni to'g'ri import qilish
import { protect, authorize } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

// Barcha yo'llarni bir xil mantiqda (protect va authorize) yozamiz
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/stats', protect, authorize('admin'), getUserStats);

// MANA SHU YERDA adminMiddleware O'RNIGA authorize('admin') ISHLATING:
router.patch('/users/:id/block', protect, authorize('admin'), toggleBlockUser);

export default router;