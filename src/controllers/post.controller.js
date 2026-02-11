import Post from '../models/post.model.js';
import slugify from 'slugify';

// POST yaratish
export const createPost = async (req, res) => {
  try {
    let { title, content, status, categories, tags } = req.body;
    
    // 1. Slug yaratish (Unique bo'lishi uchun timestamp qo'shildi)
    const slug = `${slugify(title, { lower: true })}-${Date.now()}`;

    // 2. Rasmni Base64 ga o'girish (Agar rasm yuklangan bo'lsa)
    let cover_image = null;
    if (req.file) {
      const base64String = req.file.buffer.toString('base64');
      cover_image = `data:${req.file.mimetype};base64,${base64String}`;
    }

    // 3. Kategoriyalar va Teglarni massivga o'tkazish
    const categoryIds = typeof categories === 'string' ? JSON.parse(categories) : categories;
    const tagIds = typeof tags === 'string' ? JSON.parse(tags) : tags;

    // 4. Model orqali bazaga saqlash
    const postId = await Post.create({
      author_id: req.user.id, 
      title, 
      slug, 
      content, 
      status, 
      cover_image, // <--- Endi bazaga rasmning to'liq kodi ketadi
      categories: categoryIds, 
      tags: tagIds
    });

    res.status(201).json({ success: true, postId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST yangilash
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };
    
    // Agar yangi rasm yuklangan bo'lsa, uni Base64 qilib yangilaymiz
    if (req.file) {
      const base64String = req.file.buffer.toString('base64');
      updateData.cover_image = `data:${req.file.mimetype};base64,${base64String}`;
    }

    if (updateData.categories) {
      updateData.categories = typeof updateData.categories === 'string' 
        ? JSON.parse(updateData.categories) 
        : updateData.categories;
    }
    
    await Post.update(id, updateData);
    res.json({ success: true, message: "Post yangilandi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Barcha postlarni olish
export const getPosts = async (req, res) => {
  try {
    const { category, tag } = req.query;
    const posts = await Post.getAll({ categoryId: category, tagId: tag });
    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Slug orqali olish (Blog sahifasi uchun)
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Post.getBySlug(slug);
    if (!post) return res.status(404).json({ success: false, message: "Post topilmadi" });

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    await Post.trackUniqueView(post.id, ipAddress);

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ID orqali olish (Admin panel uchun)
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    await Post.trackUniqueView(id, ipAddress);

    const post = await Post.getById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post topilmadi" });

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Postni o'chirish
export const deletePost = async (req, res) => {
  try {
    await Post.delete(req.params.id);
    res.json({ success: true, message: "Post o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};