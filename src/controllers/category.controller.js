import Category from '../models/category.model.js';
import slugify from 'slugify';

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Kategoriya nomi kiritilmadi" });
    }

    // Nomidan slug yasash (masalan: "Dasturlash Yangiliklari" -> "dasturlash-yangiliklari")
    const slug = slugify(name, { lower: true, strict: true });

    const newCategory = await Category.create(name, slug);

    res.status(201).json({
      success: true,
      data: newCategory
    });
  } catch (error) {
    // Agar bir xil nomli kategoriya qo'shilsa (Unique constraint)
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: "Bunday kategoriya allaqachon mavjud" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};