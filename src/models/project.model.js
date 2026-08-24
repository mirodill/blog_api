import pool from '../config/db.js';

class Project {
  static async create({ title, slug, short_description, description, category, made_at, built_with, features, status, featured, published, order_index, start_date, end_date, documentation_url, figma_url, youtube_url, github_url, live_url }) {
    const query = `
      INSERT INTO projects
        (title, slug, short_description, description, category, made_at, built_with, features, status, featured, published, order_index, start_date, end_date, documentation_url, figma_url, youtube_url, github_url, live_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`;
    const { rows } = await pool.query(query, [
      title, slug, short_description, description, category, made_at, built_with || [], features || [], status, featured, published,
      order_index || 0, start_date, end_date, documentation_url, figma_url, youtube_url, github_url, live_url
    ]);
    return rows[0];
  }

  static async getAll(filters = {}) {
    const values = [];
    const conditions = [];

    if (filters.category) {
      values.push(filters.category);
      conditions.push(`category = $${values.length}`);
    }
    if (filters.status) {
      values.push(filters.status);
      conditions.push(`status = $${values.length}`);
    }
    if (filters.featured !== undefined) {
      values.push(filters.featured);
      conditions.push(`featured = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT *, EXTRACT(YEAR FROM created_at)::int AS year
       FROM projects ${where} ORDER BY created_at DESC`,
      values
    );
    return rows;
  }

  static async getById(id) {
    const { rows } = await pool.query(
      'SELECT *, EXTRACT(YEAR FROM created_at)::int AS year FROM projects WHERE id = $1',
      [id]
    );
    return rows[0];
  }

  static async getBySlug(slug) {
    const { rows } = await pool.query(
      'SELECT *, EXTRACT(YEAR FROM created_at)::int AS year FROM projects WHERE slug = $1',
      [slug]
    );
    return rows[0];
  }

  static async update(id, data) {
    const fields = [
      'title', 'slug', 'short_description', 'description', 'category', 'made_at', 'built_with', 'features', 'status', 'featured', 'published', 'order_index', 'start_date', 'end_date', 'documentation_url', 'figma_url', 'youtube_url', 'github_url', 'live_url'
    ];
    const values = fields.map((field) => data[field]);
    values.push(id);

    const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
    const { rows } = await pool.query(
      `UPDATE projects SET ${assignments.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length} RETURNING *`,
      values
    );
    return rows[0];
  }

  static async delete(id) {
    const { rows } = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [id]
    );
    return rows[0];
  }
}

export default Project;
