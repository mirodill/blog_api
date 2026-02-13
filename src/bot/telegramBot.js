import TelegramBot from 'node-telegram-bot-api';
import pool from '../config/db.js';
import dotenv from 'dotenv';
import { app } from '../app.js'; // Socket obyektini olish uchun app ni import qilamiz

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Admin chat ID (O'zingizning Telegram ID raqamingizni yozing)
const ADMIN_CHAT_ID = '7426068368'; 

// 1. Start va Login buyruqlari
bot.onText(/\/start|\/login/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, `Assalomu alaykum, ${msg.from.first_name}! 👋 \n\nKirish uchun pastdagi tugmani bosing:`, {
        reply_markup: {
            keyboard: [
                [{ text: "📱 Telefon raqamni yuborish", request_contact: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

// 2. Kontakt yuborilganda OTP yaratish va Notification yuborish
bot.on('contact', async (msg) => {
    const chatId = msg.chat.id;
    const phone = msg.contact.phone_number.replace(/\D/g, ''); 
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expires = new Date(Date.now() + 1 * 60000);

    const telegramUsername = msg.from.username ? `@${msg.from.username}` : `user_${chatId}`;
    const fullName = `${msg.contact.first_name} ${msg.contact.last_name || ''}`.trim();

    try {
        // Yangi user ekanligini tekshirish
        const userExist = await pool.query("SELECT id FROM users WHERE phone_number = $1", [phone]);
        const isNewUser = userExist.rows.length === 0;

        let avatarUrl = null;
        try {
            const photos = await bot.getUserProfilePhotos(msg.from.id);
            if (photos.total_count > 0) {
                const fileId = photos.photos[0][0].file_id;
                const file = await bot.getFile(fileId);
                avatarUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
            }
        } catch (photoErr) {
            console.log("Avatar olishda xatolik:", photoErr.message);
        }

        const adminNumber = '998934211623'; 
        const role = (phone === adminNumber) ? 'admin' : 'user';

        // Bazaga saqlash
        await pool.query(`
            INSERT INTO users (telegram_id, phone_number, full_name, username, avatar, role, otp_code, otp_expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (phone_number) 
            DO UPDATE SET 
                otp_code = EXCLUDED.otp_code, 
                otp_expires_at = EXCLUDED.otp_expires_at, 
                telegram_id = EXCLUDED.telegram_id,
                role = CASE WHEN EXCLUDED.phone_number = $9 THEN 'admin' ELSE users.role END,
                username = EXCLUDED.username,
                avatar = COALESCE(EXCLUDED.avatar, users.avatar),
                updated_at = NOW()
        `, [chatId, phone, fullName, telegramUsername, avatarUrl, role, otp, expires, adminNumber]);

        // --- DASHBOARD VA TELEGRAM NOTIFICATION ---
        if (isNewUser) {
            // 1. Dashboardga Socket orqali yuborish
            const io = app.get('socketio');
            if (io) {
                io.emit('new_user_registered', {
                    full_name: fullName,
                    phone: phone,
                    username: telegramUsername,
                    time: new Date().toLocaleTimeString()
                });
            }

            // 2. Adminga Telegramdan xabar yuborish
            const adminMsg = `🔔 *Yangi foydalanuvchi!*\n\n👤 *Ism:* ${fullName}\n📞 *Tel:* +${phone}\n🔗 *Username:* ${telegramUsername}`;
            bot.sendMessage(ADMIN_CHAT_ID, adminMsg, { parse_mode: 'Markdown' });
        }

        // --- KODNI YUBORISH ---
        const codeCard = `🔒 Code:\n\`\`\`copy\n${otp}\n\`\`\``;
        const textCard = `🇺🇿 🔑 Yangi kod olish uchun /login ni bosing\n🇺🇸 🔑 To get a new code click /login`;

        await bot.sendMessage(chatId, codeCard, { parse_mode: 'MarkdownV2' });
        await bot.sendMessage(chatId, textCard);

    } catch (err) {
        console.error("Bot xatosi:", err);
        bot.sendMessage(chatId, "Xatolik yuz berdi.");
    }
});

console.log("🤖 Bot muvaffaqiyatli ishga tushdi...");

export default bot;