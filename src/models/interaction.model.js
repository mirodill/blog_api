import pool from '../config/db.js';

export const InteractionModel = {
    // Reaksiya qismi
    findReaction: async (postId, userId) => {
        const { rows } = await pool.query(
            'SELECT * FROM post_reactions WHERE post_id = $1 AND user_id = $2',
            [postId, userId]
        );
        return rows[0];
    },
    
    deleteReaction: async (postId, userId) => {
        await pool.query('DELETE FROM post_reactions WHERE post_id = $1 AND user_id = $2', [postId, userId]);
    },

    updateReaction: async (postId, userId, type) => {
        const { rows } = await pool.query(
            'UPDATE post_reactions SET reaction_type = $1 WHERE post_id = $2 AND user_id = $3 RETURNING *',
            [type, postId, userId]
        );
        return rows[0];
    },

    createReaction: async (postId, userId, type) => {
        const { rows } = await pool.query(
            'INSERT INTO post_reactions (post_id, user_id, reaction_type) VALUES ($1, $2, $3) RETURNING *',
            [postId, userId, type]
        );
        return rows[0];
    },

    // Saqlash (Save) qismi
    findSave: async (postId, userId) => {
        const { rows } = await pool.query(
            'SELECT * FROM post_saves WHERE post_id = $1 AND user_id = $2',
            [postId, userId]
        );
        return rows[0];
    },

    toggleSave: async (postId, userId) => {
        const existing = await InteractionModel.findSave(postId, userId);
        if (existing) {
            await pool.query('DELETE FROM post_saves WHERE post_id = $1 AND user_id = $2', [postId, userId]);
            return { saved: false };
        } else {
            await pool.query('INSERT INTO post_saves (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
            return { saved: true };
        }
    }
};