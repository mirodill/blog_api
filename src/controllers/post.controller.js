import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';

// 1. Yangi post yaratish (Siz yuborgan kod)
export const createPost = async (req, res) => {
    try {
        const { title, description, content, status, category_id, tagIds } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title va content majburiy' });
        }

        const image = req.file ? req.file.filename : null;
        const author_id = req.user?.id;

        if (!author_id) {
            return res.status(401).json({ message: "Muallif aniqlanmadi" });
        }

        const slug = title.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // 2. Postni yaratish (NOW() bazaning joriy vaqtini oladi)
        const query = `
            INSERT INTO posts 
            (title, slug, description, content, image, status, author_id, category_id, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) 
            RETURNING *;
        `;

        const values = [title, slug, description || '', content, image, status || 'draft', author_id, category_id || null];
        const result = await pool.query(query, values);
        
        const newPost = result.rows[0];

        // 3. TAGLARNI BOG'LASH
        if (tagIds) {
            let tagsArray = [];
            if (typeof tagIds === 'string') {
                try {
                    tagsArray = JSON.parse(tagIds);
                } catch (e) {
                    tagsArray = []; // Format xato bo'lsa bo'sh qoldiramiz
                }
            } else {
                tagsArray = tagIds;
            }

            if (Array.isArray(tagsArray) && tagsArray.length > 0) {
                const tagValues = [];
                const tagPlaceholders = tagsArray.map((tagId, index) => {
                    tagValues.push(newPost.id, tagId);
                    return `($${index * 2 + 1}, $${index * 2 + 2})`;
                }).join(', ');

                const tagQuery = `INSERT INTO post_tags (post_id, tag_id) VALUES ${tagPlaceholders}`;
                await pool.query(tagQuery, tagValues);
            }
        }

        // 4. Vaqtni chiroyli formatlash (Ixtiyoriy, frontend uchun qulaylik)
        const formattedPost = {
            ...newPost,
            created_at_formatted: new Date(newPost.created_at).toLocaleString('uz-UZ')
        };

        // To'liq natijani qaytarish
        res.status(201).json({ 
            success: true, 
            post: formattedPost,
            tagsAdded: !!(tagIds && tagIds.length > 0)
        });

    } catch (err) {
        console.error('CREATE ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 2. Barcha postlarni olish (Kategoriya va muallif nomi bilan)
export const getAllPosts = async (req, res) => {
    try {
        const { search, category, sort } = req.query; // category bu yerda endi "Texnologiya" kabi matn

        let query = `
            SELECT 
                p.*, 
                c.name as category_name,
                (SELECT COUNT(*) FROM post_views v WHERE v.post_id = p.id) as views_count,
                (SELECT COUNT(*) FROM post_reactions r WHERE r.post_id = p.id AND r.reaction_type = 'like') as likes_count
            FROM posts p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;

        const queryParams = [];

        // 1. Kategoriya nomi bo'yicha filtr (UUID emas, NOMI bo'yicha)
        if (category) {
            queryParams.push(category);
            // ILIKE ishlatamizki, "texnologiya" deb yozsa ham "Texnologiya"ni topsin
            query += ` AND c.name ILIKE $${queryParams.length}`;
        }

        // 2. Qidiruv (Sarlavha bo'yicha)
        if (search) {
            queryParams.push(`%${search}%`);
            query += ` AND p.title ILIKE $${queryParams.length}`;
        }

        // 3. Saralash
        if (sort === 'popular') {
            query += ` ORDER BY views_count DESC`;
        } else {
            query += ` ORDER BY p.created_at DESC`;
        }

        const result = await pool.query(query, queryParams);

        const posts = result.rows.map(post => ({
            ...post,
            views_count: parseInt(post.views_count) || 0,
            likes_count: parseInt(post.likes_count) || 0
        }));

        res.status(200).json({
            success: true,
            results: posts.length,
            posts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Bitta postni slug orqali olish
export const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params; // Bu yerda slug yoki id kelishi mumkin

        // UUID formatini tekshirish uchun Regex
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);

        const query = `
            SELECT p.*, u.username as author_name, c.name as category_name 
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE ${isUUID ? 'p.id = $1::uuid' : 'p.slug = $1'};
        `;

        const result = await pool.query(query, [slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Post topilmadi' });
        }

        res.status(200).json({
            success: true,
            post: result.rows[0]
        });
    } catch (err) {
        console.error('GET ONE ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 4. Postni o'chirish (Rasm fayli bilan birga)
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const author_id = req.user.id; // Faqat o'z postini o'chira olishi uchun

        // Avval postni va rasmini topamiz
        const postCheck = await pool.query('SELECT image, author_id FROM posts WHERE id = $1', [id]);

        if (postCheck.rows.length === 0) return res.status(404).json({ message: 'Post topilmadi' });
        
        // Tekshiruv: Faqat muallif o'chira oladi (yoki admin)
        if (postCheck.rows[0].author_id !== author_id) {
            return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
        }

        // Rasmni o'chirish
        const imageName = postCheck.rows[0].image;
        if (imageName) {
            const imagePath = path.join('uploads', imageName);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await pool.query('DELETE FROM posts WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: "Post va rasm o'chirildi" });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


export const updatePost = async (req, res) => {
    try {
        // 1. IDni olish va trim qilish (bo'shliqlardan tozalash)
        let { id } = req.params;
        id = id?.trim(); 

        const { title, description, content, status, category_id } = req.body;
        const author_id = req.user.id; // AuthMiddleware'dan kelayotgan UUID

        // 2. Postni bazadan qidirish (UUID kastingi bilan)
        // Agar bazada id UUID bo'lsa, ::uuid qo'shish xatolikni oldini oladi
        const postCheck = await pool.query('SELECT * FROM posts WHERE id = $1::uuid', [id]);
        
        if (postCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Post topilmadi. ID noto‘g‘ri yuborilgan bo‘lishi mumkin.' });
        }

        const existingPost = postCheck.rows[0];

        // 3. Mualliflikni tekshirish (UUIDlar string sifatida solishtiriladi)
        if (String(existingPost.author_id) !== String(author_id)) {
            return res.status(403).json({ message: "Sizda tahrirlash huquqi yo'q" });
        }

        let imageName = existingPost.image;

        // 4. Rasm bilan ishlash
        if (req.file) {
            if (imageName) {
                const oldImagePath = path.join('uploads', imageName);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imageName = req.file.filename;
        }

        // 5. Slug yaratish (title o'zgargan bo'lsa yangilanadi)
        const newSlug = title ? title.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '') : existingPost.slug;

        // 6. Bazada yangilash
        const updateQuery = `
            UPDATE posts 
            SET title = $1, slug = $2, description = $3, content = $4, image = $5, status = $6, category_id = $7, updated_at = NOW()
            WHERE id = $8::uuid RETURNING *;
        `;

        const values = [
            title || existingPost.title,
            newSlug,
            description || existingPost.description,
            content || existingPost.content,
            imageName,
            status || existingPost.status,
            (category_id && category_id !== '') ? category_id : existingPost.category_id,
            id
        ];

        const result = await pool.query(updateQuery, values);
        
        res.status(200).json({ 
            success: true, 
            message: "Post muvaffaqiyatli yangilandi",
            post: result.rows[0] 
        });

    } catch (err) {
        console.error('UPDATE ERROR:', err);
        // UUID noto'g'ri formatda bo'lsa (masalan 123 deb yuborilsa) Postgres xato beradi
        if (err.code === '22P02') {
            return res.status(400).json({ message: "Yuborilgan ID UUID formatida emas" });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getRelatedPosts = async (req, res) => {
    try {
        const { postId } = req.params;

        // 1. Avval joriy postning kategoriya ID-sini aniqlaymiz
        const postResult = await pool.query('SELECT category_id FROM posts WHERE id = $1', [postId]);
        
        if (postResult.rows.length === 0) {
            return res.status(404).json({ message: "Post topilmadi" });
        }

        const categoryId = postResult.rows[0].category_id;

        // 2. Bir xil kategoriyadagi boshqa postlarni olamiz
        const relatedQuery = `
            SELECT 
                p.id, p.title, p.slug, p.image, p.created_at,
                c.name as category_name,
                (SELECT COUNT(*) FROM post_views v WHERE v.post_id = p.id) as views_count
            FROM posts p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = $1 AND p.id != $2 AND p.status = 'published'
            ORDER BY p.created_at DESC
            LIMIT 4;
        `;

        const relatedPosts = await pool.query(relatedQuery, [categoryId, postId]);

        res.status(200).json({
            success: true,
            posts: relatedPosts.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};