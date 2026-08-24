import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const initializeDatabase = async () => {
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS experiences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization VARCHAR(255) NOT NULL,
      position VARCHAR(255) NOT NULL,
      duration VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      work_type VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query('ALTER TABLE experiences ADD COLUMN IF NOT EXISTS start_date DATE');
  await pool.query('ALTER TABLE experiences ADD COLUMN IF NOT EXISTS end_date DATE');
  await pool.query('ALTER TABLE experiences ADD COLUMN IF NOT EXISTS is_current BOOLEAN NOT NULL DEFAULT FALSE');
  await pool.query('ALTER TABLE experiences ADD COLUMN IF NOT EXISTS location VARCHAR(255)');
  await pool.query("ALTER TABLE experiences ADD COLUMN IF NOT EXISTS responsibilities TEXT[] NOT NULL DEFAULT '{}'");
  await pool.query("ALTER TABLE experiences ADD COLUMN IF NOT EXISTS technologies TEXT[] NOT NULL DEFAULT '{}'");
  await pool.query('ALTER TABLE experiences ADD COLUMN IF NOT EXISTS organization_url TEXT');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      telegram_username VARCHAR(255),
      message TEXT NOT NULL,
      ip_address VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

export default pool;