import express from 'express';
import authRoutes from './routes/auth.routes.js'; // Faylni import qilish
import postRoutes from './routes/post.routes.js';
import tagRoutes from './routes/tag.routes.js';
import categoryRoutes from './routes/category.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// API yo'nalishlarini belgilash
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/categories', categoryRoutes);

export default app;