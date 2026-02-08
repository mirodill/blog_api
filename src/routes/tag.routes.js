import { Router } from 'express';
import { createTags, getAllTags } from '../controllers/tag.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getAllTags);
router.post('/', authMiddleware, createTags);

export default router;