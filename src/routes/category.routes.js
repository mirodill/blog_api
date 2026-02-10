import express from 'express';
import { 
  addCategory, 
  getAllCategories, 
  updateCategory, 
  deleteCategory 
} from '../controllers/category.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', protect, authorize('admin'), addCategory);

// Yangi qo'shilgan endpointlar:
router.put('/:id', protect, authorize('admin'), updateCategory);    // Tahrirlash
router.delete('/:id', protect, authorize('admin'), deleteCategory); // O'chirish

export default router;