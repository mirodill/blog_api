import Post from '../models/post.model.js';
import slugify from 'slugify';

// POST yaratish
export const createPost = async (req, res) => {
  try {
    let { title, content, status, categories, tags, cover_image } = req.body;
    const slug = `${slugify(title, { lower: true, strict: true })}-${Date.now()}`;

    // Frontenddan massiv kelayotganiga ishonch hosil qilish
    const categoryIds = Array.isArray(categories) ? categories : [];
    const tagNames = Array.isArray(tags) ? tags : [];

    const postId = await Post.create({
      author_id: req.user.id, 
      title, 
      slug, 
      content, 
      status, 
      cover_image, 
      categories: categoryIds, 
      tags: tagNames
    });

    res.status(201).json({ success: true, postId });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST yangilash
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, content, status, categories, tags, cover_image } = req.body;

    // 1. Yangi slug yaratish (Title o'zgargan bo'lsa)
    const newSlug = slugify(title, { lower: true, strict: true });

    // Frontenddan JSON string bo'lib kelsa massivga o'girish
    const categoryIds = typeof categories === 'string' ? JSON.parse(categories) : categories;
    const tagArray = typeof tags === 'string' ? JSON.parse(tags) : tags;

    // 2. Bazada slugni ham yangilash
    await Post.update(id, {
      title,
      slug: newSlug, // SHU YERDA SLUGNI HAM YANGILASH KERAK
      content,
      status,
      cover_image,
      categories: categoryIds,
      tags: tagArray 
    });

    // 3. Frontendga yangi slugni qaytarish (muhim!)
    res.json({ 
      success: true, 
      message: "Post va teglar yangilandi",
      newSlug: newSlug // Frontend yangi URLga o'tishi uchun kerak
    });
  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Qolgan funksiyalar (getPosts, getPostBySlug va hokazo) o'zgarishsiz qoladi ---
export const getPosts = async (req, res) => {
  try {
    const { category, tag } = req.query;
    const posts = await Post.getAll({ categoryId: category, tagId: tag });
    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.getById(id); // Modelda getById funksiyasi borligiga ishonch hosil qiling

    if (!post) {
      return res.status(404).json({ success: false, message: "Post topilmadi" });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error("GetPostById Error:", error);
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
