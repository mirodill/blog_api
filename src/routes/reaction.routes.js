import { Router } from 'express';
import { toggleReaction, getReactionsCount } from '../controllers/reaction.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/:postId', protect, toggleReaction);
router.get('/:postId', getReactionsCount);

export default router;