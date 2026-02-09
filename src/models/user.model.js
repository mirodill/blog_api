import pool from '../config/db.js';

class User {
  // Ro'yxatdan o'tkazish
  static async create({ username, email, password }) {
    const query = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3) RETURNING id, username, email, role`;
    const { rows } = await pool.query(query, [username, email, password]);
    return rows[0];
  }

  // Username orqali qidirish (Email o'rniga)
  static async findByUsername(username) {
    const query = `SELECT * FROM users WHERE username = $1`;
    const { rows } = await pool.query(query, [username]);
    return rows[0];
  }

  static async findById(id) {
    const query = `SELECT id, username, email, role, avatar, bio, created_at FROM users WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
}
}

export default User;