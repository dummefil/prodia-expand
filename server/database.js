const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./image_metadata.db');

db.run(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY,
    path TEXT NOT NULL,
    history_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY,
    prompt TEXT,
    negativePrompt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cfgScale INTEGER,
    steps INTEGER,
    seed INTEGER,
    model TEXT
)`);

db.run(`
  CREATE TABLE IF NOT EXISTS positive_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
