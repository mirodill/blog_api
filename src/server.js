import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Security imports
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

// Route imports
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import categoryRoutes from './routes/category.routes.js';
import tagRoutes from './routes/tag.routes.js';
import reactionRoutes from './routes/reaction.routes.js';
import viewRoutes from './routes/view.routes.js';
import contactRoutes from './routes/contact.routes.js';

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ESM __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. Security Middlewares ---
app.use(helmet()); // HTTP headers protection
app.use(cors({ origin: '*' }));  // Enable CORS
app.use(hpp());    // Prevent parameter pollution

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please try again later." }
});
app.use('/api/', limiter);

// --- 2. Standard Middlewares ---
app.use(express.json({ limit: '10kb' })); // Body parser with payload limit
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 3. API Routes ---
const API_PREFIX = '/api';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/posts`, postRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/tags`, tagRoutes);
app.use(`${API_PREFIX}/reactions`, reactionRoutes);
app.use(`${API_PREFIX}/views`, viewRoutes);
app.use('/api/contact', contactRoutes);

// --- 4. Error Handling (Optional but recommended) ---
// Global 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Sahifa topilmadi"
    });
});
// --- 5. Server Start ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;