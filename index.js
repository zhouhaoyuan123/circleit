// index.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Added sqlite3 for database operations
const { createEntry, deleteEntry, modifyEntry } = require('./database');

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
    db.get('SELECT * FROM entries WHERE token = ? ORDER BY content DESC LIMIT 1', [token], (err, entry) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(entry || { content: 0 });
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

// Route to modify an entry
app.put('/entries/:id', (req, res) => {
    const id = req.params.id;
    const { token, content } = req.body;
    modifyEntry(id, token, content, (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.sendStatus(200); // OK
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => { // Ensure it's binding to 0.0.0.0
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});