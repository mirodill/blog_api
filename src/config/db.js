import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Neon uchun bu juda muhim
  }
});

pool.on('connect', () => {
  console.log("🐘 Neon PostgreSQL-ga muvaffaqiyatli ulandi!");
});

export default pool;