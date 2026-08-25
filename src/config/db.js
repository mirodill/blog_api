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
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      telegram_id VARCHAR(100),
      phone_number VARCHAR(30) UNIQUE,
      full_name VARCHAR(255),
      username VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password TEXT,
      role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'author', 'user')),
      avatar TEXT,
      bio TEXT,
      is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
      otp_code VARCHAR(10),
      otp_expires_at TIMESTAMPTZ,
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE');
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10)');
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ');
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      short_description TEXT,
      description TEXT NOT NULL,
      image TEXT,
      category VARCHAR(150),
      status VARCHAR(30) NOT NULL DEFAULT 'draft',
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      github_url TEXT,
      live_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS made_at VARCHAR(150),
      ADD COLUMN IF NOT EXISTS built_with TEXT[] NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS features TEXT[] NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS documentation_url TEXT,
      ADD COLUMN IF NOT EXISTS figma_url TEXT,
      ADD COLUMN IF NOT EXISTS youtube_url TEXT,
      ADD COLUMN IF NOT EXISTS start_date DATE,
      ADD COLUMN IF NOT EXISTS end_date DATE,
      ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL UNIQUE,
      slug VARCHAR(150) NOT NULL UNIQUE,
      description TEXT,
      icon VARCHAR(100),
      order_index INTEGER NOT NULL DEFAULT 0,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS icon VARCHAR(100),
      ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL UNIQUE,
      slug VARCHAR(150) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_reactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL,
      user_id UUID NOT NULL,
      reaction_type VARCHAR(10) NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (post_id, user_id)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_saves (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL,
      user_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (post_id, user_id)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL,
      ip_address VARCHAR(255),
      user_agent TEXT,
      viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

export default pool;