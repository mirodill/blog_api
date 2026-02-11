import express from 'express';
import { 
  createPost, 
  getPosts, 
  getPostById, 
  getPostBySlug, 
  updatePost, 
  deletePost 
} from '../controllers/post.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/posts
 * @desc    Barcha postlarni olish (Filtrlar bilan: category, tag)
 */
/**
 * @route   POST /api/posts
 * @desc    Yangi post yaratish (Base64 rasm bilan)
 */
router.route('/')
  .get(getPosts)
  .post(protect, upload.single('cover_image'), createPost);

/**
 * @route   GET /api/posts/slug/:slug
 * @desc    Postni slug orqali olish va ko'rishlar sonini oshirish
 */
router.get('/slug/:slug', getPostBySlug);

/**
 * @route   GET /api/posts/:id
 * @desc    Postni UUID orqali olish
 */
/**
 * @route   PUT /api/posts/:id
 * @desc    Postni tahrirlash (Rasm yangilanishi mumkin)
 */
/**
 * @route   DELETE /api/posts/:id
 * @desc    Postni o'chirish
 */
router.route('/:id')
  .get(getPostById)
  .put(protect, upload.single('cover_image'), updatePost)
  .delete(protect, deletePost);

export default router;