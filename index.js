// index.js
const express = require('express');
const path = require('path');
const { createEntry, deleteEntry, modifyEntry } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware for parsing JSON bodies
app.use(express.static(__dirname));
app.use('/game', express.static(path.join(__dirname, 'game')));

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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});