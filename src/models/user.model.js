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


static async update(id, { username, full_name, bio, avatar }) {
  const query = `
    UPDATE users 
    SET username = $1, full_name = $2, bio = $3, avatar = $4, updated_at = NOW()
    WHERE id = $5 
    RETURNING id, username, full_name, email, role, bio, avatar`;
  
  const { rows } = await pool.query(query, [username, full_name, bio, avatar, id]);
  return rows[0];
}
static async findById(id) {
  // Profilni yuklaganda full_name ham kelsin
  const query = `SELECT id, username, full_name, email, role, bio, avatar FROM users WHERE id = $1`;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}
}

export default User;