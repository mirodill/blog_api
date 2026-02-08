import { Router } from 'express';
import { 
    createCategory, 
    getAllCategories, 
    deleteCategory, 
    createManyCategories // <--- Import qilingani tekshiring
} from '../controllers/category.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getAllCategories); // Hamma uchun
router.post('/', authMiddleware, createCategory); // Faqat login qilganlar
router.delete('/:id', authMiddleware, deleteCategory); // Faqat login qilganlar
router.post('/bulk', authMiddleware, createManyCategories);

export default router;