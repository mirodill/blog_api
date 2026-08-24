import pool from '../config/db.js';

class Experience {
  static async create({ organization, organization_url, position, duration, description, work_type, start_date, end_date, is_current, location, responsibilities, technologies }) {
    const { rows } = await pool.query(
      `INSERT INTO experiences (organization, organization_url, position, duration, description, work_type, start_date, end_date, is_current, location, responsibilities, technologies)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [organization, organization_url || null, position, duration, description, work_type, start_date || null, end_date || null, is_current === true, location || null, responsibilities || [], technologies || []]
    );
    return rows[0];
  }

  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM experiences ORDER BY created_at DESC');
    return rows;
  }

  static async getById(id) {
    const { rows } = await pool.query('SELECT * FROM experiences WHERE id = $1', [id]);
    return rows[0];
  }

  static async update(id, data) {
    const { rows } = await pool.query(
      `UPDATE experiences
        SET organization = $1, organization_url = $2, position = $3, duration = $4, description = $5, work_type = $6, start_date = $7, end_date = $8, is_current = $9, location = $10, responsibilities = $11, technologies = $12, updated_at = NOW()
        WHERE id = $13 RETURNING *`,
          [data.organization, data.organization_url || null, data.position, data.duration, data.description, data.work_type, data.start_date || null, data.end_date || null, data.is_current === true, data.location || null, data.responsibilities || [], data.technologies || [], id]
    );
    return rows[0];
  }

  static async delete(id) {
    const { rows } = await pool.query('DELETE FROM experiences WHERE id = $1 RETURNING id', [id]);
    return rows[0];
  }
}

export default Experience;
