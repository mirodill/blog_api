import cors from 'cors';
import express from 'express';
import { createServer } from 'http'; // HTTP server uchun
import { Server } from 'socket.io';  // Socket.io uchun
import path from 'path';
import { fileURLToPath } from 'url';

// Route-lar
import authRoutes from './routes/auth.routes.js'; 
import postRoutes from './routes/post.routes.js';
import tagRoutes from './routes/tag.routes.js';
import categoryRoutes from './routes/category.routes.js';
import adminRoutes from './routes/admin.routes.js';
import './bot/telegramBot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. HTTP server va Socket.io ni sozlash
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://mirodill.github.io'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// io obyektini app-ga biriktiramiz (botda ishlatish uchun)
app.set('socketio', io); 

io.on('connection', (socket) => {
  console.log('Dashboard ulandi:', socket.id);
});

// 2. Ruxsat berilgan manzillar ro'yxati (CORS uchun)
const allowedOrigins = [
  'http://localhost:5173',
  'https://mirodill.github.io'
];

// 3. CORS sozlamasi
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS xatosi: Ushbu manzilga ruxsat berilmagan!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true 
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 4. Static papka (Rasmlar uchun)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 5. API yo'nalishlari
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/admin', adminRoutes);

// httpServer va io ni eksport qilamiz
export { app, httpServer, io };