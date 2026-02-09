import express from 'express';
import { addTag, getAllTags } from '../controllers/tag.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllTags);
// Odatda taglarni ham Admin yoki Author qo'shishi mumkin
router.post('/', protect, authorize('admin', 'author'), addTag);

export default router;