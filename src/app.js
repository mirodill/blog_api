import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth.routes.js'; 
import postRoutes from './routes/post.routes.js';
import tagRoutes from './routes/tag.routes.js';
import categoryRoutes from './routes/category.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Ruxsat berilgan manzillar ro'yxati
const allowedOrigins = [
  'http://localhost:5173',          // Mahalliy test uchun
  'https://mirodill.github.io'      // GitHub Pages uchun
];

// 2. CORS sozlamasi
app.use(cors({
  origin: function (origin, callback) {
    // Brauzerdan bo'lmagan so'rovlar (Postman kabi) yoki ro'yxatdagi manzillarga ruxsat berish
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS xatosi: Ushbu manzilga ruxsat berilmagan!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true 
}));

app.use(express.json());

// 3. Static papka (Rasmlar uchun)
// Agar uploads papkasi loyihaning ildiz (root) papkasida bo'lsa:
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 4. API yo'nalishlari
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/categories', categoryRoutes);

export default app;