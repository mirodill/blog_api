import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// REGISTER funksiyasi (export so'zi borligiga e'tibor bering)
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Parolni hash qilish
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// LOGIN funksiyasi (export so'zi borligiga e'tibor bering)
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findByUsername(username);

        if (!user) return res.status(401).json({ message: "Username yoki parol xato" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Username yoki parol xato" });

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ success: true, token });
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