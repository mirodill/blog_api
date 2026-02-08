import pool from '../config/db.js';

export const toggleReaction = async (req, res) => {
    try {
        const { postId } = req.params;
        const { type } = req.body; // 'like' yoki 'dislike'
        const userId = req.user.id;

        if (!['like', 'dislike'].includes(type)) {
            return res.status(400).json({ message: "Reaksiya turi xato" });
        }

        // 1. Avval mavjud reaksiyani tekshiramiz
        const checkQuery = `SELECT * FROM post_reactions WHERE post_id = $1 AND user_id = $2`;
        const existing = await pool.query(checkQuery, [postId, userId]);

        if (existing.rows.length > 0) {
            const currentReaction = existing.rows[0].reaction_type;

            if (currentReaction === type) {
                // Agar bosilgan narsa yana bosilsa - reaksiyani o'chiramiz (Toggle)
                await pool.query(`DELETE FROM post_reactions WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
                return res.status(200).json({ success: true, message: "Reaksiya olib tashlandi" });
            } else {
                // Agar like bosilgan bo'lsa-yu, endi dislike bosilsa - yangilaymiz
                const updateQuery = `UPDATE post_reactions SET reaction_type = $1 WHERE post_id = $2 AND user_id = $3 RETURNING *`;
                const updated = await pool.query(updateQuery, [type, postId, userId]);
                return res.status(200).json({ success: true, reaction: updated.rows[0] });
            }
        }

        // 2. Agar reaksiya umuman yo'q bo'lsa - yangi qo'shamiz
        const insertQuery = `INSERT INTO post_reactions (post_id, user_id, reaction_type) VALUES ($1, $2, $3) RETURNING *`;
        const result = await pool.query(insertQuery, [postId, userId, type]);

        res.status(201).json({ success: true, reaction: result.rows[0] });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Postdagi likelar sonini olish
export const getReactionsCount = async (req, res) => {
    try {
        const { postId } = req.params;
        const query = `
            SELECT 
                COUNT(*) FILTER (WHERE reaction_type = 'like') as likes,
                COUNT(*) FILTER (WHERE reaction_type = 'dislike') as dislikes
            FROM post_reactions WHERE post_id = $1
        `;
        const result = await pool.query(query, [postId]);
        res.status(200).json({ success: true, reactions: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};