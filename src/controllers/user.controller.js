// src/controllers/user.controller.js
import pool from '../config/db.js';

export const getMe = async (req, res) => {
    try {
        // req.user.id protect middlware'dan keladi
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