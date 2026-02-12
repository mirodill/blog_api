import pool from '../config/db.js';

class Tag {
  // Bitta tag yaratish (mavjud bo'lsa xato bermaydi)
  static async create(name, slug) {
    const query = `
      INSERT INTO tags (name, slug) 
      VALUES ($1, $2) 
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
      RETURNING *`;
    const { rows } = await pool.query(query, [name, slug]);
    return rows[0];
  }

  // KO'P TAGLARNI TEKSHIRISH VA YARATISH (Muhim qism)
  static async findOrCreateMany(tagNames) {
    if (!tagNames || tagNames.length === 0) return [];
    
    const tagIds = [];
    for (const name of tagNames) {
      const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
      // ON CONFLICT: Agar tag nomi bazada bo'lsa, uni shunchaki qaytaradi (yaratmaydi)
      const query = `
        INSERT INTO tags (name, slug) 
        VALUES ($1, $2) 
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
        RETURNING id`;
      const { rows } = await pool.query(query, [name, slug]);
      tagIds.push(rows[0].id);
    }
    return tagIds;
  }

  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM tags ORDER BY name ASC');
    return rows;
  }
}

export default Tag;