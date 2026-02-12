import pool from '../config/db.js';

class Post {
 static async trackUniqueView(postId, ipAddress) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // post_views jadvali hali ham kerak (unique IP larni tekshirish uchun)
      const checkQuery = `
        SELECT id FROM post_views 
        WHERE post_id = $1 AND ip_address = $2 
        AND created_at > NOW() - INTERVAL '24 hours'`;
      
      const { rows } = await client.query(checkQuery, [postId, ipAddress]);

      if (rows.length === 0) {
        await client.query(
          'INSERT INTO post_views (post_id, ip_address) VALUES ($1, $2)',
          [postId, ipAddress]
        );
        
        // ENDI UPDATE TO'G'RIDAN-TO'G'RI posts JADVALIGA QILINADI
        await client.query(
          'UPDATE posts SET views_count = views_count + 1 WHERE id = $1',
          [postId]
        );
        await client.query('COMMIT');
        return true;
      }
      
      await client.query('COMMIT');
      return false;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  // 1. CREATE
 // Post.create metodi ichidagi o'zgarish:
static async create({ author_id, title, slug, content, status, cover_image, categories, tags }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Postni yaratish
    const postRes = await client.query(
      `INSERT INTO posts (author_id, title, slug, content, status, cover_image) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [author_id, title, slug, content, status, cover_image]
    );
    const postId = postRes.rows[0].id;

    // 2. Kategoriyalarni bog'lash
    if (categories?.length) {
      for (const catId of categories) {
        await client.query('INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)', [postId, catId]);
      }
    }

    // 3. TEGLARNI ISHLASH (Find or Create Many)
    if (tags?.length) {
      // Teg nomlarini yuborib, ularning ID larini olamiz
      const Tag = (await import('./tag.model.js')).default; // Sirkulyar importni oldini olish
      const tagIds = await Tag.findOrCreateMany(tags);

      for (const tagId of tagIds) {
        await client.query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', 
          [postId, tagId]
        );
      }
    }

    await client.query('COMMIT');
    return postId;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

  // 2. READ (ALL)
static async getAll(filters = {}) {
    const { categoryId, tagId } = filters;
    let queryParams = [];
    let whereClauses = ['p.deleted_at IS NULL'];

    if (categoryId) {
      queryParams.push(categoryId);
      whereClauses.push(`pc.category_id = $${queryParams.length}`);
    }

    if (tagId) {
      queryParams.push(tagId);
      whereClauses.push(`pt.tag_id = $${queryParams.length}`);
    }

    // s.views_count olib tashlandi, o'rniga p.views_count ishlatiladi
    const query = `
      SELECT p.*, 
        json_agg(DISTINCT c.name) as categories, 
        json_agg(DISTINCT t.name) as tags,
        u.full_name as author_name, u.avatar as author_avatar
      FROM posts p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY p.id, u.full_name, u.avatar
      ORDER BY p.created_at DESC`;

    const { rows } = await pool.query(query, queryParams);
    return rows;
  }

static async getBySlug(slug) {
  const query = `
    SELECT p.*, 
      json_agg(DISTINCT c.name) as categories, 
      json_agg(DISTINCT t.name) as tags,
      u.full_name as author_name, 
      u.avatar as author_avatar
    FROM posts p
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.slug = $1 AND p.deleted_at IS NULL
    GROUP BY p.id, u.full_name, u.avatar`;
  
  const { rows } = await pool.query(query, [slug]);
  return rows[0];
}

static async getById(id) {
  const query = `
    SELECT p.*, 
      json_agg(DISTINCT c.name) as categories, 
      json_agg(DISTINCT t.name) as tags,
      u.full_name as author_name, 
      u.avatar as author_avatar
    FROM posts p
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.id = $1 AND p.deleted_at IS NULL
    GROUP BY p.id, u.full_name, u.avatar`;
  
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}
  // 3. UPDATE
  static async update(id, { title, content, status, cover_image, categories, tags }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE posts SET title = $1, content = $2, status = $3, cover_image = COALESCE($4, cover_image), updated_at = NOW() WHERE id = $5`,
        [title, content, status, cover_image, id]
      );

      if (categories) {
        await client.query('DELETE FROM post_categories WHERE post_id = $1', [id]);
        for (const catId of categories) {
          await client.query('INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)', [id, catId]);
        }
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally { client.release(); }
  }

  // 4. DELETE (Soft Delete)
  static async delete(id) {
    await pool.query('UPDATE posts SET deleted_at = NOW() WHERE id = $1', [id]);
  }
}
export default Post;