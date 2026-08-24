CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
);

CREATE INDEX IF NOT EXISTS projects_category_idx ON projects (category);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects (status);
CREATE INDEX IF NOT EXISTS projects_featured_idx ON projects (featured);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS made_at VARCHAR(150);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS built_with TEXT[] NOT NULL DEFAULT '{}';
