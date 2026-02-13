import { httpServer } from './app.js';
import dotenv from 'dotenv';
import axios from 'axios'; // npm install axios qiling

dotenv.config();
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Har 10 daqiqada o'ziga ping yuborish (Server o'chib qolmasligi uchun)
  setInterval(() => {
    axios.get(`https://blog-api-uzfl.onrender.com/api/v1/auth/me`) // O'zingizning Render URLingizni yozing
      .then(() => console.log('Self-ping success'))
      .catch((err) => console.log('Self-ping error:', err.message));
  }, 600000); // 10 daqiqa
});