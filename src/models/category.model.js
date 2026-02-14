import pool from '../config/db.js';

class Category {
  // 1. CREATE - Yangi kategoriya yaratish
  static async create(name, slug) {
    const query = `
      INSERT INTO categories (name, slug) 
      VALUES ($1, $2) 
      RETURNING *`;
    const { rows } = await pool.query(query, [name, slug]);
    return rows[0];
  }

  // 2. READ - Barcha kategoriyalarni olish
  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
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
  static async update(id, name, slug) {
    const query = `
      UPDATE categories 
      SET name = $1, slug = $2 
      WHERE id = $3 
      RETURNING *`;
    const { rows } = await pool.query(query, [name, slug, id]);
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