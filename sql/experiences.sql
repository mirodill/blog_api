CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization VARCHAR(255) NOT NULL,
  organization_url TEXT,
  position VARCHAR(255) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT NOT NULL,
  work_type VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  technologies TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
