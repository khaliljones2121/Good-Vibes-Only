const express = require('express');
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Basic route
app.get('/', (req, res) => {
	res.send('Good Vibes Only!');
});

// Test route
app.get('/test', (req, res) => {
	res.send('Server is running properly!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
