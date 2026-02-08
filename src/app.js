import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import postRoutes from './routes/post.routes.js';
import categoryRoutes from './routes/category.routes.js';
import tagRoutes from './routes/tag.routes.js';
import reactionRoutes from './routes/reaction.routes.js';
import viewRoutes from './routes/view.routes.js';
import authRoutes from './routes/auth.routes.js'; // 1. Auth routes qo'shildi

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik papka
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes (Barchasiga / qo'shildi)
app.use('/api/auth', authRoutes);       // 2. Auth endpointi qo'shildi
app.use('/api/posts', postRoutes);      // 3. / qo'shildi
app.use('/api/categories', categoryRoutes); // 4. / qo'shildi
app.use('/api/tags', tagRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/views', viewRoutes);

export default app;