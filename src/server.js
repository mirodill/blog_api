import { httpServer } from './app.js';
import { initializeDatabase } from './config/db.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const PORT = process.env.PORT || 5000;

// Muhitni aniqlash (Render'da odatda RENDER_EXTERNAL_URL bo'ladi)
const SERVER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

initializeDatabase()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health-check URL: ${SERVER_URL}`);

      setInterval(() => {
        const pingUrl = `${SERVER_URL}/api/v1/auth/me`;
        axios.get(pingUrl)
          .then(() => console.log(`[${new Date().toLocaleTimeString()}] Self-ping success to: ${pingUrl}`))
          .catch((err) => console.log(`[${new Date().toLocaleTimeString()}] Self-ping error:`, err.message));
      }, 600000);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error.message);
    process.exitCode = 1;
  });