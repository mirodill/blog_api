import { Router } from 'express';
import { incrementView } from '../controllers/view.controller.js';

const router = Router();

router.post('/:postId', incrementView);

export default router;