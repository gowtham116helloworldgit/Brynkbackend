

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// 3️⃣ Setup SQLite DB
const db = new sqlite3.Database('./heading.db', (err) => {
  if (err) console.error('Error opening database', err);
  else console.log('✅ Connected to SQLite database');
});

// Create table if not exists
const initQuery = `CREATE TABLE IF NOT EXISTS heading (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT
)`;
db.run(initQuery);

// 4️⃣ GET API to fetch heading
app.get('/api/heading', (req, res) => {
  db.get('SELECT text FROM heading ORDER BY id DESC LIMIT 1', [], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ heading: row ? row.text : "Default heading not set yet." });
    }
  });
});

// 5️⃣ POST API to save heading
app.post('/api/heading', (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Heading text is required' });
  }

  const insertQuery = 'INSERT INTO heading (text) VALUES (?)';
  db.run(insertQuery, [text], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error while inserting' });
    } else {
      res.json({ success: true, message: 'Heading updated successfully', id: this.lastID });
    }
  });
});

// 6️⃣ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

