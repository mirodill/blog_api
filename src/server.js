import { httpServer } from './app.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const PORT = process.env.PORT || 5000;

// Muhitni aniqlash (Render'da odatda RENDER_EXTERNAL_URL bo'ladi)
const SERVER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health-check URL: ${SERVER_URL}`);
  
  // Har 10 daqiqada o'ziga ping yuborish (Server "uyqu"ga ketmasligi uchun)
  setInterval(() => {
    // API yo'nalishini dinamik aniqlaymiz
    const pingUrl = `${SERVER_URL}/api/v1/auth/me`;
    
    axios.get(pingUrl)
      .then(() => console.log(`[${new Date().toLocaleTimeString()}] Self-ping success to: ${pingUrl}`))
      .catch((err) => console.log(`[${new Date().toLocaleTimeString()}] Self-ping error:`, err.message));
  }, 600000); // 10 daqiqa (600,000 ms)
});