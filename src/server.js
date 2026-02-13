import { httpServer } from './app.js'; // 'app' emas, 'httpServer' ni import qiling
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// BU YERDA: 'app.listen' emas, 'httpServer.listen' bo'lishi shart!
httpServer.listen(PORT, () => {
  console.log(`🚀 Server va Socket http://localhost:${PORT} da ishladi`);
});