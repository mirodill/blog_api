import express from 'express';
import { addCategory, getAllCategories } from '../controllers/category.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllCategories); // Hamma ko'ra oladi
router.post('/', protect, authorize('admin'), addCategory); // Faqat admin qo'sha oladi

export default router;