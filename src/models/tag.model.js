import pool from '../config/db.js';

class Tag {
  // Yangi tag yaratish
  static async create(name, slug) {
    const query = 'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING *';
    const { rows } = await pool.query(query, [name, slug]);
    return rows[0];
  }

  // Barcha taglarni olish
  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM tags ORDER BY name ASC');
    return rows;
  }
}

export default Tag;