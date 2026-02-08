// 1. JWT kutubxonasini albatta import qilish kerak!
import jwt from 'jsonwebtoken'; 
import pool from '../config/db.js';
import { jwtConfig } from '../config/jwt.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Token borligini tekshirish
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Mana shu joyda 'jwt' o'zgaruvchisi tepada import qilingan bo'lishi shart
    const decoded = jwt.verify(token, jwtConfig.secret);

    // 3. Bazadagi ustun nomini 'name' ga o'zgartirdik (sizda shunday edi)
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id=$1', 
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    // 4. Xatoni konsolda aniq ko'rish uchun
    console.error("Auth Error details:", err.message);
    
    res.status(401).json({ 
      message: 'Invalid or expired token',
      error: err.message // Bu qator xatoni frontendda ham ko'rsatadi (keyinroq o'chirib qo'yishingiz mumkin)
    });
  }
};