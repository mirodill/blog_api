import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import pool from '../config/db.js'; // MUHIM: pool-ni albatta import qilish kerak!

// REGISTER funksiyasi
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Foydalanuvchi allaqachon mavjudligini tekshirish (ixtiyoriy lekin tavsiya etiladi)
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Username yoki Email band!" });
    }

    // 2. Parolni heshlash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Bazaga yozish
    const query = `
      INSERT INTO users (username, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, username, email, role, created_at`;
    
    const { rows } = await pool.query(query, [username, email, hashedPassword]);
    const user = rows[0];

    // 4. Token yaratish
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 5. Javob yuborish
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// LOGIN funksiyasi
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 1. Userni bazadan izlaymiz (User modeli orqali)
    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(401).json({ success: false, message: "Username yoki parol xato" });
    }

    // 2. Parolni tekshiramiz
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Username yoki parol xato" });
    }

    // 3. Token yaratamiz
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // 4. Javob yuborish
    res.json({ 
      success: true, 
      token, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      } 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ME funksiyasi
export const getMe = async (req, res) => {
  try {
    // req.user ma'lumotlari protect middleware-dan keladi
    const user = await User.findById(req.user.id); 
    if (!user) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { username, full_name, bio, avatar } = req.body; // full_name qo'shildi

    const updatedUser = await User.update(req.user.id, { 
      username, 
      full_name, // modelga ketdi
      bio, 
      avatar 
    });

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};