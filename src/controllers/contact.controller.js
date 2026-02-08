import pool from '../config/db.js';

export const sendMessage = async (req, res) => {
    try {
        const { name, telegram_username, message } = req.body;

        // Foydalanuvchining IP manzilini aniqlash
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!name || !message) {
            return res.status(400).json({ 
                success: false, 
                message: "Ism va xabar maydoni to'ldirilishi shart" 
            });
        }

        const query = `
            INSERT INTO contact_messages (name, telegram_username, message, ip_address)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        
        const values = [name, telegram_username || 'Kiritilmagan', message, ipAddress];
        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: "Xabar muvaffaqiyatli saqlandi",
            data: result.rows[0]
        });
    } catch (err) {
        console.error('CONTACT_ERROR:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};