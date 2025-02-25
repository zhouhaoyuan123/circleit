// index.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Added sqlite3 for database operations
const { createEntry, deleteEntry, modifyEntry, deleteOldEntries } = require('./database');

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
            // Token not found, delete the cookie
            res.clearCookie('game_token'); // Ensure you set the path and domain as necessary
            return res.json({ message: 'Token not found. Cookie cleared.', content: 0 });
        }

        res.json(entry);
    });
});

app.get('/', (req, res) => {
    res.redirect('/game/index.html');
});

// Route to create an entry
app.post('/entries', (req, res) => {
    const { token, content } = req.body;
    createEntry(token, content, (err, entry) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.status(201).json(entry);
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