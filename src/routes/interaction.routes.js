import express from 'express';
import { handleReaction, handleSave } from '../controllers/interaction.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/react/:postId', protect, handleReaction);
router.post('/save/:postId', protect, handleSave);

export default router;