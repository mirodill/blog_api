import pool from '../config/db.js';

// 1. Kategoriya yaratish
export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Nom majburiy" });

        const slug = name.toLowerCase().trim().replace(/[\s_-]+/g, '-');

        const query = `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *`;
        const result = await pool.query(query, [name, slug]);

        res.status(201).json({ success: true, category: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ message: "Bunday kategoriya mavjud" });
        res.status(500).json({ message: "Server xatosi", error: err.message });
    }
};

// 2. Barcha kategoriyalarni olish
export const getAllCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.status(200).json({ success: true, categories: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Kategoriyani o'chirish
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM categories WHERE id = $1::uuid RETURNING *', [id]);

        if (result.rowCount === 0) return res.status(404).json({ message: "Kategoriya topilmadi" });
        res.status(200).json({ success: true, message: "Kategoriya o'chirildi" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Ko'p kategoriyalarni bittada yaratish
export const createManyCategories = async (req, res) => {
    try {
        const { names } = req.body; // ["Texnika", "Sport", "Siyosat"...] ko'rinishida keladi

        if (!names || !Array.isArray(names)) {
            return res.status(400).json({ message: "Kategoriya nomlari massiv shaklida bo'lishi kerak" });
        }

        // Dinamik SQL so'rovini tayyorlash
        const values = [];
        const placeholders = names.map((name, index) => {
            const slug = name.toLowerCase().trim().replace(/[\s_-]+/g, '-');
            const offset = index * 2;
            values.push(name, slug);
            return `($${offset + 1}, $${offset + 2})`;
        }).join(', ');

        const query = `INSERT INTO categories (name, slug) VALUES ${placeholders} RETURNING *`;
        const result = await pool.query(query, values);

        res.status(201).json({ 
            success: true, 
            count: result.rowCount, 
            categories: result.rows 
        });
    } catch (err) {
        res.status(500).json({ message: "Server xatosi", error: err.message });
    }
};