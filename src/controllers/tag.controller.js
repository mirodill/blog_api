import Tag from '../models/tag.model.js';
import slugify from 'slugify';

export const addTag = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Tag nomi kiritilmadi" });
    }

    // Slugi uchun: "#NodeJS" -> "nodejs"
    const slug = slugify(name, { lower: true, strict: true });

    const newTag = await Tag.create(name, slug);

    res.status(201).json({
      success: true,
      data: newTag
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: "Bunday tag allaqachon mavjud" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.getAll();
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};