import pool from '../config/db.js';

// 1. Profil ma'lumotlarini olish (Mavjud funksiya)
export const getMe = async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT id, full_name, username, role, phone_number, avatar FROM users WHERE id = $1",
            [req.user.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }

        res.json({
            success: true,
            data: user.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: "Server xatosi", error: error.message });
    }
};

// 2. Barcha foydalanuvchilarni olish (Admin uchun)
// getAllUsers funksiyasini shunga almashtiring
export const getAllUsers = async (req, res) => {
    const { search, role } = req.query;
    let query = "SELECT id, full_name, username, email, role, avatar, created_at FROM users WHERE 1=1";
    const values = [];

    if (search) {
        values.push(`%${search}%`);
        query += ` AND (full_name ILIKE $${values.length} OR username ILIKE $${values.length})`;
    }

    if (role) {
        values.push(role);
        query += ` AND role = $${values.length}`;
    }

    query += " ORDER BY created_at DESC";

    try {
        const result = await pool.query(query, values);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
export const getUserStats = async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE role = 'admin') AS admins,
                COUNT(*) FILTER (WHERE role = 'author') AS authors,
                COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS new_today
            FROM users
        `);
        res.json({ success: true, data: stats.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
// 3. Foydalanuvchini o'chirish (Admin uchun)
export const deleteUser = async (req, res) => {
    const { id } = req.params; // UUID formatida keladi
    try {
        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING id, full_name", 
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }

        res.json({
            success: true,
            message: `Foydalanuvchi (${result.rows[0].full_name}) o'chirildi`
        });
    } catch (error) {
        res.status(500).json({ message: "Server xatosi", error: error.message });
    }
};

// 4. Foydalanuvchi rolini yangilash (Admin uchun)
export const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body; // 'admin', 'author', 'user'

    // SQL'dagi CHECK cheklovini tekshirish (ixtiyoriy, DB o'zi ham tekshiradi)
    const allowedRoles = ['admin', 'author', 'user'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Noto'g'ri rol yuborildi" });
    }

    try {
        const result = await pool.query(
            "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, role",
            [role, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: "Server xatosi", error: error.message });
    }
};