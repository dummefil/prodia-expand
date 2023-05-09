const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('image_metadata.db');

//initialize image table
db.run(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY,
    path TEXT NOT NULL,
    positive TEXT,
    negative TEXT,
    size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

//initialize positive_values table
db.run(`
  CREATE TABLE IF NOT EXISTS positive_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
