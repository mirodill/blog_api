import pool from '../config/db.js';

// Barcha foydalanuvchilarni olish
export const getAllUsers = async (req, res) => {
    try {
        const users = await pool.query(
            "SELECT id, telegram_id, full_name, phone_number, username, role, created_at FROM users ORDER BY created_at DESC"
        );
        res.json(users.rows);
    } catch (err) {
        res.status(500).json({ error: "Ro'yxatni olishda xatolik" });
    }
};

// Foydalanuvchini o'chirish
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
        }
        
        res.json({ message: "Foydalanuvchi muvaffaqiyatli o'chirildi" });
    } catch (err) {
        res.status(500).json({ error: "O'chirishda xatolik yuz berdi" });
    }
};
export const getUserStats = async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE) as today_count,
                (SELECT COUNT(*) FROM users WHERE created_at >= date_trunc('month', CURRENT_DATE)) as month_count,
                (SELECT COUNT(*) FROM users) as total_count
        `;
        const stats = await pool.query(statsQuery);
        res.status(200).json(stats.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};