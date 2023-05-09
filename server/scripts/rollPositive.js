const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Open database connection
const db = new sqlite3.Database('image_metadata.db');

// Read positive.json file
const positiveData = fs.readFileSync('./positive.json', 'utf8');
const positiveValues = JSON.parse(positiveData);

// Define function to insert positive values into database
const insertPositiveValues = (values) => {
    const placeholders = values.map((value) => '(?)').join(',');
    const stmt = db.prepare(`INSERT INTO positive_values (value) VALUES ${placeholders}`);
    stmt.run(...values);
    stmt.finalize();
};

// Create positive table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS positive_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  value TEXT UNIQUE NOT NULL
)`);

// Insert positive values into database
insertPositiveValues(positiveValues);

// Close database connection
db.close();
