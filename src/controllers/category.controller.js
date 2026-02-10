import Category from '../models/category.model.js';
import slugify from 'slugify';

// 1. CREATE
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Nom kiritish shart" });

    const slug = slugify(name, { lower: true, strict: true });
    const newCategory = await Category.create(name, slug);

    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ success: false, message: "Bunday kategoriya bor" });
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET ALL
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. UPDATE (Qo'shildi)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Nom kiritish shart" });

    const slug = slugify(name, { lower: true, strict: true });
    const updated = await Category.update(id, name, slug);

    if (!updated) return res.status(404).json({ success: false, message: "Kategoriya topilmadi" });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. DELETE (Qo'shildi)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.delete(id);

    if (!deleted) return res.status(404).json({ success: false, message: "Kategoriya topilmadi" });

    res.status(200).json({ success: true, message: "Kategoriya o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};