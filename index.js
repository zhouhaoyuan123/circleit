const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(__dirname));

// Serve static files from the "public/game" directory under /game
app.use('/game', express.static(path.join(__dirname,'game')));

// Route for home
app.get('/', (req, res) => {
  res.redirect('/auth');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});