import pool from '../config/db.js';

export const incrementView = async (req, res) => {
    try {
        const { postId } = req.params;
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // 1. Oxirgi 24 soat ichida ushbu IP va qurilmadan view bo'lganmi?
        // (Agar xohlasangiz '24 hours' ni '1 hour' yoki '1 minute' ga o'zgartirishingiz mumkin)
        const checkView = await pool.query(
    `SELECT id FROM post_views 
     WHERE post_id = $1 AND ip_address = $2 AND user_agent = $3 
     AND viewed_at > NOW() - INTERVAL '10 seconds'`, // 24 soat o'rniga 10 sekund
    [postId, ip, userAgent]
);

        if (checkView.rows.length === 0) {
            // 2. Agar yangi qurilma bo'lsa yoki vaqt o'tgan bo'lsa - bazaga yozamiz
            await pool.query(
                `INSERT INTO post_views (post_id, ip_address, user_agent) VALUES ($1, $2, $3)`,
                [postId, ip, userAgent]
            );
        }

        // 3. Umumiy ko'rishlar sonini qaytarish
        const countResult = await pool.query(
            'SELECT COUNT(*) as total_views FROM post_views WHERE post_id = $1',
            [postId]
        );

        res.status(200).json({
            success: true,
            views: countResult.rows[0].total_views
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};