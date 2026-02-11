import Post from '../models/post.model.js';
import slugify from 'slugify';

// POST yaratish
export const createPost = async (req, res) => {
  try {
    // Diqqat: cover_image endi to'g'ridan-to'g'ri req.body ichidan keladi
    let { title, content, status, categories, tags, cover_image } = req.body;
    
    // 1. Slug yaratish
    const slug = `${slugify(title, { lower: true, strict: true })}-${Date.now()}`;

    // 2. Kategoriyalar va Teglarni massivga o'tkazish
    // Frontenddan JSON string bo'lib kelsa, obyektga o'giramiz
    const categoryIds = typeof categories === 'string' ? JSON.parse(categories) : categories;
    const tagIds = typeof tags === 'string' ? JSON.parse(tags) : tags;

    // 3. Model orqali bazaga saqlash
    const postId = await Post.create({
      author_id: req.user.id, 
      title, 
      slug, 
      content, 
      status, 
      cover_image, // Frontend'dan kelgan "data:image...base64" kodi
      categories: categoryIds, 
      tags: tagIds
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
    let updateData = { ...req.body };
    
    // Agar yangi cover_image kelsa, u req.body ichida bo'ladi
    // Multer (req.file) ishlatilmaydi, shuning uchun qo'shimcha o'girish shart emas

    if (updateData.categories) {
      updateData.categories = typeof updateData.categories === 'string' 
        ? JSON.parse(updateData.categories) 
        : updateData.categories;
    }

    if (updateData.tags) {
      updateData.tags = typeof updateData.tags === 'string' 
        ? JSON.parse(updateData.tags) 
        : updateData.tags;
    }
    
    await Post.update(id, updateData);
    res.json({ success: true, message: "Post yangilandi" });
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
