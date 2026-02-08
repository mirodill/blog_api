import pool from './src/config/db.js';
import bcrypt from 'bcrypt';

const createAdmin = async () => {
  try {
    const passwordHash = await bcrypt.hash('123456', 10); // plain password 123456
    const email = 'admin@mail.com';
    const username = 'Admin';

    const query = `
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, username, email, role
    `;

    const result = await pool.query(query, [username, email, passwordHash, 'admin']);

    if (result.rows.length > 0) {
      console.log('✅ Admin created:', result.rows[0]);
    } else {
      console.log('⚠️ Admin already exists');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin();
