import Post from '../models/post.model.js';
import slugify from 'slugify';

export const createPost = async (req, res) => {
  try {
    let { title, content, status, categories, tags } = req.body;
    const slug = `${slugify(title, { lower: true })}-${Date.now()}`;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : null;

    // Stringdan Arrayga o'tkazish (Postman uchun)
    const categoryIds = typeof categories === 'string' ? JSON.parse(categories) : categories;
    const tagIds = typeof tags === 'string' ? JSON.parse(tags) : tags;

    const postId = await Post.create({
      author_id: req.user.id, title, slug, content, status, cover_image,
      categories: categoryIds, tags: tagIds
    });

    res.status(201).json({ success: true, postId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { category, tag } = req.query; // URL'dan ?category=1&tag=2 ni oladi

    const posts = await Post.getAll({
      categoryId: category,
      tagId: tag
    });

    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    // IP manzilni olish (Proxy va Localhost hisobga olingan)
    const ipAddress = req.headers['x-forwarded-for'] || 
                      req.socket.remoteAddress || 
                      req.ip;

    // Ko'rishni hisobga olish mantiqi
    await Post.trackUniqueView(id, ipAddress);

    // Postni ma'lumotlarini olish
    const post = await Post.getById(id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: "Post topilmadi" 
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error("View tracking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    let { categories, tags } = req.body;
    
    if (categories) categories = typeof categories === 'string' ? JSON.parse(categories) : categories;
    
    await Post.update(id, { ...req.body, categories });
    res.json({ success: true, message: "Post yangilandi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    await Post.delete(req.params.id);
    res.json({ success: true, message: "Post o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};