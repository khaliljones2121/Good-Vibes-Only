const express = require('express');
const app = express();

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/your-db-name', { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('Connected to MongoDB'))
	.catch((err) => console.error('MongoDB connection error:', err));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Basic route
app.get('/', (req, res) => {
	res.render('index');
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
