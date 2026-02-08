import { Router } from 'express';
import { toggleReaction, getReactionsCount } from '../controllers/reaction.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/:postId', authMiddleware, toggleReaction);
router.get('/:postId', getReactionsCount);

export default router;