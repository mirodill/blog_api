import pool from '../config/db.js';

class Category {
  // 1. CREATE - Yangi kategoriya yaratish
  static async create(name, slug, details = {}) {
    const query = `
      INSERT INTO categories (name, slug, description, icon, order_index, published)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const { rows } = await pool.query(query, [name, slug, details.description || null, details.icon || null, Number(details.order_index) || 0, details.published !== false]);
    return rows[0];
  }

  // 2. READ - Barcha kategoriyalarni olish
  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY order_index ASC, created_at DESC');
    return rows;
  }

  // 2a. READ - Bitta kategoriyani ID bo'yicha olish
  static async getById(id) {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
static async getBySlug(slug) {
  const result = await pool.query('SELECT * FROM categories WHERE slug = $1', [slug]);
  return result.rows[0];
}
  // 3. UPDATE - Kategoriyani tahrirlash
  static async update(id, name, slug, details = {}) {
    const query = `
      UPDATE categories
      SET name = $1, slug = $2, description = $3, icon = $4, order_index = $5, published = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *`;
    const { rows } = await pool.query(query, [name, slug, details.description || null, details.icon || null, Number(details.order_index) || 0, details.published !== false, id]);
    return rows[0];
  }

  // 4. DELETE - Kategoriyani o'chirish
  static async delete(id) {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

export default Category;