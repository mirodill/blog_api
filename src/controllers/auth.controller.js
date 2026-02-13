// 1. Importlarni ESM formatiga o'tkazamiz
import pool from '../config/db.js'; 
import jwt from 'jsonwebtoken';

// 1. OTP orqali kirishda tekshirish
export const verifyOtp = async (req, res) => {
    const { code } = req.body;

    try {
        // 1. Kodni tekshirish
        const result = await pool.query(
            `SELECT * FROM users WHERE otp_code = $1 AND otp_expires_at > NOW()`,
            [code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Kod noto'g'ri yoki muddati o'tgan" });
        }

        const user = result.rows[0];

        // 2. Bloklanganligini tekshirish
        if (user.is_blocked) {
            return res.status(403).json({ error: "Hisobingiz bloklangan!" });
        }

        // 3. Bazaga yozish: OTPni o'chirish va oxirgi kirish vaqtini yangilash
        await pool.query(
            `UPDATE users SET otp_code = NULL, otp_expires_at = NULL, last_login = NOW() WHERE id = $1`,
            [user.id]
        );

        // 4. DASHBOARDGA NOTIFICATION YUBORISH (Socket.io)
        const io = req.app.get('socketio');
        if (io) {
            io.emit('user_login_success', {
                id: user.id,
                full_name: user.full_name,
                phone: user.phone_number,
                time: new Date()
            });
        }

        // 5. Token yaratish
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
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server xatosi" });
    }
};

// 2. Email/Parol orqali kirishda tekshirish
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user) return res.status(401).json({ message: "Email yoki parol xato" });

        // --- BLOKLANGANLIKNI TEKSHIRISH ---
        if (user.is_blocked) {
            return res.status(403).json({ 
                message: "Hisobingiz bloklangan! Iltimos, admin bilan bog'laning." 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Email yoki parol xato" });

        await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ message: "Server xatosi" });
    }
};

// 3. Profilni olishda tekshirish (Real-vaqtda haydash uchun)
export const getMe = async (req, res) => {
    try {
        const userResult = await pool.query(
            "SELECT id, full_name, username, role, avatar, is_blocked FROM users WHERE id = $1",
            [req.user.id]
        );
        
        if (userResult.rows.length === 0) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

        const user = userResult.rows[0];

        // --- AGAR ADMIN HOZIR BLOKLAGAN BO'LSA ---
        if (user.is_blocked) {
            return res.status(403).json({ 
                success: false,
                message: "Hisobingiz bloklandi. Tizimdan chiqarildingiz!",
                logout: true // Frontend buni ko'rib tokenni o'chirishi uchun
            });
        }

        res.json({
            success: true,
            user: user
        });
    } catch (err) {
        res.status(500).json({ error: "Server xatosi" });
    }
};