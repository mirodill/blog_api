// 1. Importlarni ESM formatiga o'tkazamiz
import pool from '../config/db.js'; 
import jwt from 'jsonwebtoken';

// 2. OTP kodini tekshirish va Login qilish
// "exports.verifyOtp" emas, "export const verifyOtp" ishlatamiz
export const verifyOtp = async (req, res) => {
    const { code } = req.body; // Faqat kod keladi

    try {
        // Bazadan kod bo'yicha foydalanuvchini topish
        const result = await pool.query(
            `SELECT * FROM users WHERE otp_code = $1 AND otp_expires_at > NOW()`,
            [code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Kod noto'g'ri yoki muddati o'tgan" });
        }

        const user = result.rows[0];

        // Kod ishlatilgandan keyin uni bazada tozalash (xavfsizlik uchun)
        await pool.query(
            `UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = $1`,
            [user.id]
        );

        // JWT Token yaratish
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Muvaffaqiyatli kirish",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                phone: user.phone_number,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server xatosi" });
    }
};

// 3. Foydalanuvchi profilini olish
export const getMe = async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT id, full_name, username, role, avatar FROM users WHERE id = $1",
            [req.user.id] // Bu ID authMiddleware (protect) orqali keladi
        );
        
        if (user.rows.length === 0) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

        res.json({
            success: true,
            user: user.rows[0] // Ism, username va avatar shu yerda qaytadi
        });
    } catch (err) {
        res.status(500).json({ error: "Server xatosi" });
    }
};