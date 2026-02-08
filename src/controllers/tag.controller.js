import pool from '../config/db.js';

// 1. Tag yaratish (yoki massiv bo'lsa ko'p yaratish)
export const createTags = async (req, res) => {
    try {
        const { names } = req.body; // ["NodeJS", "Backend"]
        if (!names || !Array.isArray(names)) {
            return res.status(400).json({ message: "Taglar massiv ko'rinishida bo'lishi kerak" });
        }

        const values = [];
        const placeholders = names.map((name, index) => {
            const slug = name.toLowerCase().trim().replace(/[\s_-]+/g, '-');
            values.push(name, slug);
            return `($${index * 2 + 1}, $${index * 2 + 2})`;
        }).join(', ');

        const query = `
            INSERT INTO tags (name, slug) 
            VALUES ${placeholders} 
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
            RETURNING *`;
        
        const result = await pool.query(query, values);
        res.status(201).json({ success: true, tags: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Barcha taglarni olish
export const getAllTags = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tags ORDER BY name ASC');
        res.status(200).json({ success: true, tags: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};