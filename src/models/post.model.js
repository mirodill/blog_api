import pool from '../config/db.js';

class Post {
  static async trackUniqueView(postId, ipAddress) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Oxirgi 24 soat ichida shu IP-dan ushbu post ko'rilganmi?
      const checkQuery = `
        SELECT id FROM post_views 
        WHERE post_id = $1 AND ip_address = $2 
        AND created_at > NOW() - INTERVAL '24 hours'`;
      
      const { rows } = await client.query(checkQuery, [postId, ipAddress]);

      if (rows.length === 0) {
        // Yangi ko'rish: post_views ga IP-ni yozamiz
        await client.query(
          'INSERT INTO post_views (post_id, ip_address) VALUES ($1, $2)',
          [postId, ipAddress]
        );
        // post_stats jadvalidagi views_count ni +1 qilamiz
        await client.query(
          'UPDATE post_stats SET views_count = views_count + 1 WHERE post_id = $1',
          [postId]
        );
        await client.query('COMMIT');
        return true;
      }
      
      await client.query('COMMIT');
      return false; // Allaqachon ko'rilgan
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  // 1. CREATE
  static async create({ author_id, title, slug, content, status, cover_image, categories, tags }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const postRes = await client.query(
        `INSERT INTO posts (author_id, title, slug, content, status, cover_image) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [author_id, title, slug, content, status, cover_image]
      );
      const postId = postRes.rows[0].id;

      if (categories?.length) {
        for (const catId of categories) {
          await client.query('INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)', [postId, catId]);
        }
      }
      if (tags?.length) {
        for (const tagId of tags) {
          await client.query('INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)', [postId, tagId]);
        }
      }
      await client.query('COMMIT');
      return postId;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally { client.release(); }
  }

  // 2. READ (ALL)
  static async getAll(filters = {}) {
  const { categoryId, tagId } = filters;
  let queryParams = [];
  let whereClauses = ['p.deleted_at IS NULL'];

  // Agar kategoriya bo'yicha filter bo'lsa
  if (categoryId) {
    queryParams.push(categoryId);
    whereClauses.push(`pc.category_id = $${queryParams.length}`);
  }

  // Agar tag bo'yicha filter bo'lsa
  if (tagId) {
    queryParams.push(tagId);
    whereClauses.push(`pt.tag_id = $${queryParams.length}`);
  }

  const query = `
    SELECT p.*, 
      json_agg(DISTINCT c.name) as categories, 
      json_agg(DISTINCT t.name) as tags,
      s.views_count, s.likes_count
    FROM posts p
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    LEFT JOIN post_stats s ON p.id = s.post_id
    WHERE ${whereClauses.join(' AND ')}
    GROUP BY p.id, s.views_count, s.likes_count
    ORDER BY p.created_at DESC`;

  const { rows } = await pool.query(query, queryParams);
  return rows;
}
static async getById(id) {
    const query = `
      SELECT p.*, 
        json_agg(DISTINCT c.name) as categories, 
        json_agg(DISTINCT t.name) as tags,
        s.views_count, s.likes_count
      FROM posts p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      LEFT JOIN post_stats s ON p.id = s.post_id
      WHERE p.id = $1 AND p.deleted_at IS NULL
      GROUP BY p.id, s.views_count, s.likes_count`;
    
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