import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  getProjectBySlug,
  updateProject,
  deleteProject
} from '../controllers/project.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(protect, authorize('admin'), createProject);

router.get('/slug/:slug', getProjectBySlug);

router.route('/:id')
  .get(getProjectById)
  .put(protect, authorize('admin'), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

export default router;
