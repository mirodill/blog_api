import express from 'express';
import { 
  createPost, 
  getPosts, 
  getPostById, 
  getPostBySlug, // Agar slug funksiyasini qo'shgan bo'lsangiz
  updatePost, 
  deletePost 
} from '../controllers/post.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// 1. "/" bilan tugaydigan yo'llar
router.route('/')
  .get(getPosts)
  .post(protect, upload.single('cover_image'), createPost);

// 2. "/:id" bilan tugaydigan yo'llar (Barchasini bitta joyga yig'dik)
router.get('/slug/:slug', getPostBySlug);
router.route('/:id')
  .get(getPostById) // Bitta postni UUID orqali olish
  .put(protect, upload.single('cover_image'), updatePost)
  .delete(protect, deletePost);

export default router;