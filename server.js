// server.js - Brynk Labs Assignment Backend using better-sqlite3

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Setup SQLite using better-sqlite3
const db = new Database('./heading.db');
db.prepare(`
    CREATE TABLE IF NOT EXISTS heading (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT
    )
`).run();
console.log('✅ Connected to SQLite database');

// GET API to fetch the latest heading
app.get('/api/heading', (req, res) => {
    try {
        const row = db.prepare('SELECT text FROM heading ORDER BY id DESC LIMIT 1').get();
        res.json({ heading: row ? row.text : 'Default heading not set yet.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST API to save a new heading
app.post('/api/heading', (req, res) => {
    const { text } = req.body;

    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Heading text is required' });
    }

    try {
        const stmt = db.prepare('INSERT INTO heading (text) VALUES (?)');
        const info = stmt.run(text);
        res.json({
            success: true,
            message: 'Heading saved successfully',
            id: info.lastInsertRowid
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error while inserting' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
