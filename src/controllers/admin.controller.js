import pool from '../config/db.js';

// Barcha foydalanuvchilarni olish
// controllers/admin.controller.js ichida
export const getAllUsers = async (req, res) => {
    try {
        // created_at ustunini ham qo'shing
        const result = await pool.query("SELECT id, full_name, username, phone_number, role, is_blocked, created_at FROM users ORDER BY created_at DESC");
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
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
export const toggleBlockUser = async (req, res) => {
    const { id } = req.params;
    const { is_blocked } = req.body;

    try {
        const result = await pool.query(
            "UPDATE users SET is_blocked = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            [is_blocked, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }

        res.json({ 
            success: true, 
            message: is_blocked ? "Foydalanuvchi bloklandi" : "Blokdan chiqarildi",
            data: result.rows[0] 
        });
    } catch (error) {
        res.status(500).json({ message: "Serverda xatolik", error: error.message });
    }
};