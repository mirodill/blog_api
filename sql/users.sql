CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
);

CREATE INDEX IF NOT EXISTS users_otp_idx ON users (otp_code, otp_expires_at);
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at DESC);
