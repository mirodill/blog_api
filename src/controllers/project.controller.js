import slugify from 'slugify';
import Project from '../models/project.model.js';

const parseBoolean = (value) => value === true || value === 'true';
const parseList = (value) => Array.isArray(value) ? value.filter(Boolean) : typeof value === 'string' ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
const PROJECT_STATUSES = ['planning', 'in_progress', 'completed', 'archived'];
const parseBuiltWith = (value) => {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

export const createProject = async (req, res) => {
  try {
    const { title, short_description, description, category, made_at, built_with, features, status, github_url, live_url, documentation_url, figma_url, youtube_url, start_date, end_date, order_index } = req.body;
    if (!title?.trim() || !short_description?.trim() || !category?.trim()) {
      return res.status(400).json({ success: false, message: 'Title, short description va category majburiy' });
    }
    if (status && !PROJECT_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status planning, in_progress, completed yoki archived bo‘lishi kerak' });
    }

    const project = await Project.create({
      title,
      slug: `${slugify(title, { lower: true, strict: true })}-${Date.now()}`,
      short_description: short_description || null,
      description,
      category: category || null,
      made_at: made_at || null,
      built_with: parseBuiltWith(built_with),
      status: status || 'draft',
      featured: parseBoolean(req.body.featured),
      published: parseBoolean(req.body.published),
      features: parseList(features),
      documentation_url: documentation_url || null,
      figma_url: figma_url || null,
      youtube_url: youtube_url || null,
      start_date: start_date || null,
      end_date: end_date || null,
      order_index: Number(order_index) || 0,
      github_url: github_url || null,
      live_url: live_url || null
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.getAll(req.query);
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.getById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project topilmadi' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.getBySlug(req.params.slug);
    if (!project) return res.status(404).json({ success: false, message: 'Project topilmadi' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const current = await Project.getById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: 'Project topilmadi' });

    const title = req.body.title || current.title;
    if (req.body.status && !PROJECT_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Status noto‘g‘ri' });
    }
    const project = await Project.update(req.params.id, {
      title,
      slug: req.body.title ? `${slugify(title, { lower: true, strict: true })}-${Date.now()}` : current.slug,
      short_description: req.body.short_description ?? current.short_description,
      description: req.body.description ?? current.description,
      category: req.body.category ?? current.category,
      made_at: req.body.made_at ?? current.made_at,
      built_with: req.body.built_with ?? current.built_with ?? [],
      status: req.body.status ?? current.status,
      featured: req.body.featured === undefined ? current.featured : parseBoolean(req.body.featured),
      published: req.body.published === undefined ? current.published : parseBoolean(req.body.published),
      features: req.body.features === undefined ? current.features : parseList(req.body.features),
      documentation_url: req.body.documentation_url ?? current.documentation_url,
      figma_url: req.body.figma_url ?? current.figma_url,
      youtube_url: req.body.youtube_url ?? current.youtube_url,
      start_date: req.body.start_date ?? current.start_date,
      end_date: req.body.end_date ?? current.end_date,
      order_index: req.body.order_index === undefined ? current.order_index : Number(req.body.order_index) || 0,
      github_url: req.body.github_url ?? current.github_url,
      live_url: req.body.live_url ?? current.live_url
    });

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const deleted = await Project.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Project topilmadi' });
    res.json({ success: true, message: "Project o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
