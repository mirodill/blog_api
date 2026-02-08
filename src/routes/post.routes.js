import { Router } from 'express';
import { 
    createPost, 
    getAllPosts, 
    getPostBySlug, 
    updatePost,  // Qo'shildi
    deletePost, // Qo'shildi
    getRelatedPosts
} from '../controllers/post.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// --- Ommaviy yo'llar (Public) ---
router.get('/', getAllPosts);
router.get('/:slug', getPostBySlug);

// --- Himoyalangan yo'llar (Private) ---
// Post yaratish
router.post('/', authMiddleware, upload.single('image'), createPost);

// Postni yangilash (ID bo'yicha)
router.put('/:id', authMiddleware, upload.single('image'), updatePost);

// Postni o'chirish (ID bo'yicha)
router.delete('/:id', authMiddleware, deletePost);
router.get('/:postId/related', getRelatedPosts);

export default router;