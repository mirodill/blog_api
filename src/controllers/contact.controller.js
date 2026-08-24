import pool from '../config/db.js';

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

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

        const botToken = process.env.BOT_TOKEN;
        const adminChatId = process.env.ADMIN_CHAT_ID || '7426068368';

        if (!botToken) {
            throw new Error('Telegram bot configuration is missing.');
        }

        const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: adminChatId,
                parse_mode: 'HTML',
                text: [
                    '<b>Yangi xabar portfolio saytdan!</b>',
                    '',
                    `<b>Ism:</b> ${escapeHtml(name)}`,
                    `<b>Username:</b> ${escapeHtml(telegram_username || 'Kiritilmagan')}`,
                    `<b>Xabar:</b> ${escapeHtml(message)}`,
                ].join('\n'),
            }),
        });

        const telegramResult = await telegramResponse.json().catch(() => ({}));
        if (!telegramResponse.ok || !telegramResult.ok) {
            throw new Error(telegramResult.description || 'Telegram xabarni qabul qilmadi.');
        }

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