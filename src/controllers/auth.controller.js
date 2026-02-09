import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// REGISTER funksiyasi (export so'zi borligiga e'tibor bering)
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Parolni heshlash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Bazaga yozish (RETURNING qismi user undefined bo'lmasligi uchun shart!)
    const query = `
      INSERT INTO users (username, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, username, email, role, created_at`;
    
    const { rows } = await pool.query(query, [username, email, hashedPassword]);
    const user = rows[0];

    // 3. Token yaratish
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Javob yuborish (Frontend aynan shu strukturani kutadi)
    res.status(201).json({
      success: true,
      token,
      user: user // Bu yerda barcha ma'lumotlar bor
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// LOGIN funksiyasi (export so'zi borligiga e'tibor bering)
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 1. Userni bazadan izlaymiz
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

        // 4. MUHIM: Bu yerga user obyektini qo'shamiz (Frontend shuni kutadi)
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
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMe = async (req, res) => {
    try {
        // req.user ma'lumotlari protect middleware'dan keladi
        const user = await User.findById(req.user.id); 
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};