// index.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Added sqlite3 for database operations
const { createEntry, deleteEntry, modifyEntry, deleteOldEntries, updateEntry } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'database.sqlite'); // Define the path

const db = new sqlite3.Database(dbPath); // Initialize the database

app.use(express.json()); // Middleware for parsing JSON bodies
app.use(express.static(__dirname));
app.use('/game', express.static(path.join(__dirname, 'game')));

// Route to get entry by token
app.get('/entries/:token', (req, res) => {
    const token = req.params.token;
    db.get('SELECT * FROM entries WHERE token = ?', [token], (err, entry) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (!entry) {
            return res.json({ message: 'Token not found', content: 0 });
        }
        // Update last access time
        db.run('UPDATE entries SET last_access = CURRENT_TIMESTAMP WHERE token = ?', [token]);
        res.json(entry);
    });
});

app.get('/', (req, res) => {
    res.redirect('/game/index.html');
});

// Route to create an entry
app.post('/entries', (req, res) => {
    const { token, content } = req.body;
    db.get('SELECT * FROM entries WHERE token = ?', [token], (err, entry) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (entry) {
            // Token exists, update the content
            updateEntry(token, content, (err) => {
                if (err) {
                    return res.status(500).send(err.message);
                }
                res.status(200).json({ message: 'Score updated successfully' });
            });
        } else {
            // Token does not exist, create a new entry
            createEntry(token, content, (err, createdEntry) => {
                if (err) {
                    return res.status(500).send(err.message);
                }
                res.status(201).json(createdEntry);
            });
        }
    });
});

// Route to delete an entry by ID
app.delete('/entries/:id', (req, res) => {
    const id = req.params.id;
    deleteEntry(id, (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.sendStatus(204); // No content
    });
});

// Add this new functionality
const checkInterval = 24 * 60 * 60 * 1000; // Check every 24 hours
const accessCutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days

setInterval(() => {
    const cutoffDate = accessCutoffDate.toISOString();
    deleteOldEntries(cutoffDate, (err) => {
        if (err) {
            console.error('Error deleting old entries:', err);
        }
    });
}, checkInterval);

// Start the server
app.listen(PORT, '0.0.0.0', () => { // Ensure it's binding to 0.0.0.0
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});