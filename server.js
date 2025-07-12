// server.js - Brynk Labs Backend using PostgreSQL for smooth Render deployment

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection using DATABASE_URL from Render environment
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create 'heading' table if it does not exist
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS heading (
                id SERIAL PRIMARY KEY,
                text TEXT NOT NULL
            );
        `);
        console.log('✅ Connected to PostgreSQL and ensured table exists');
    } catch (err) {
        console.error('Error creating table:', err);
    }
})();

// GET API to fetch the latest heading
app.get('/api/heading', async (req, res) => {
    try {
        const result = await pool.query('SELECT text FROM heading ORDER BY id DESC LIMIT 1');
        res.json({ heading: result.rows[0] ? result.rows[0].text : 'Default heading not set yet.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST API to save a new heading
app.post('/api/heading', async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Heading text is required' });
    }
    try {
        const result = await pool.query('INSERT INTO heading (text) VALUES ($1) RETURNING id', [text]);
        res.json({
            success: true,
            message: 'Heading saved successfully',
            id: result.rows[0].id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error while inserting' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
