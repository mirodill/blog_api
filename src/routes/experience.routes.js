import express from 'express';
import { createExperience, deleteExperience, getExperiences, updateExperience } from '../controllers/experience.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getExperiences);
router.post('/', protect, authorize('admin'), createExperience);
router.put('/:id', protect, authorize('admin'), updateExperience);
router.delete('/:id', protect, authorize('admin'), deleteExperience);

export default router;
