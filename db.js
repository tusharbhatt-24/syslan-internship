const Database = require('better-sqlite3');
const path = require('path');

// Open (or create) the SQLite database file
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Create the feedback table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    event TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comments TEXT DEFAULT '',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('✅ Database initialized — feedback table ready.');

module.exports = db;
