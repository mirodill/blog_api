import pool from '../config/db.js';

class Category {
  // Yangi kategoriya yaratish
  static async create(name, slug) {
    const query = `
      INSERT INTO categories (name, slug) 
      VALUES ($1, $2) 
      RETURNING *`;
    const { rows } = await pool.query(query, [name, slug]);
    return rows[0];
  }

  // Barcha kategoriyalarni olish (Postmanda tekshirish uchun)
  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  }
}

export default Category;