// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the SQLite database (creates it if it doesn't exist)
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create the table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL,
        content INTEGER NOT NULL,
        last_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Track last access date
    )`);
});

// Function to create an entry
function createEntry(token, content, callback) {
    const stmt = db.prepare(`INSERT INTO entries (token, content) VALUES (?, ?)`);
    stmt.run(token, content, function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { id: this.lastID, token, content });
        }
    });
    stmt.finalize();
}

// Function to delete an entry by ID
function deleteEntry(id, callback) {
    db.run(`DELETE FROM entries WHERE id = ?`, id, function(err) {
        callback(err);
    });
}

// Function to modify an entry
function modifyEntry(id, token, content, callback) {
    const stmt = db.prepare(`UPDATE entries SET token = ?, content = ? WHERE id = ?`);
    stmt.run(token, content, id, function(err) {
        callback(err);
    });
    stmt.finalize();
}

// Function to delete old entries based on last access date
function deleteOldEntries(date, callback) {
    const stmt = db.prepare(`DELETE FROM entries WHERE last_access < ?`);
    stmt.run(date, function(err) {
        callback(err);
    });
    stmt.finalize();
}

// Export the functions for use in other files
module.exports = {
    createEntry,
    deleteEntry,
    modifyEntry,
    deleteOldEntries
};