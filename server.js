require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cron = require('node-cron');
const User = require('./models/User');
const Notification = require('./models/Notification');


mongoose.connect(process.env.MONGO_URI)
	.then(() => console.log('Connected to MongoDB'))
	.catch(err => {
		console.error('MongoDB connection error:', err.message);
		process.exit(1);
	});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: 'goodvibesonlysecret',
	resave: false,
	saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', (req, res) => {
	res.render('index');
});

app.get('/register', (req, res) => {
	res.render('register');
});

// Register user
app.post('/register', async (req, res) => {
	try {
		const { name, email, password } = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ name, email, password: hashedPassword });
		await user.save();
		req.session.userId = user._id;
		res.redirect('/user');
	} catch (err) {
		res.status(400).send('Registration failed: ' + err.message);
	}
});

app.get('/login', (req, res) => {
	res.render('login');
});

// Login user
app.post('/login', async (req, res) => {
		try {
				const { email, password } = req.body;
				const user = await User.findOne({ email });
				if (!user) return res.status(400).send('Invalid email or password');
				const match = await bcrypt.compare(password, user.password);
				if (!match) return res.status(400).send('Invalid email or password');
				req.session.userId = user._id;
				// Select a new random affirmation for this login
				const affirmations = await Notification.find({ type: 'affirmation', user: user._id });
				if (affirmations.length > 0) {
					req.session.randomAffirmationId = affirmations[Math.floor(Math.random() * affirmations.length)]._id;
				} else {
					req.session.randomAffirmationId = null;
				}
				res.redirect('/user');
		} catch (err) {
				res.status(400).send('Login failed: ' + err.message);
		}
});

// User profile page
app.get('/user', async (req, res) => {
	if (!req.session.userId) return res.redirect('/login');
	const user = await User.findById(req.session.userId);
	if (!user) return res.redirect('/login');
	const affirmations = await Notification.find({ type: 'affirmation', user: user._id });
		const notifications = await Notification.find({ type: { $ne: 'affirmation' }, user: user._id });
		// Remove notifications after viewing
		if (notifications.length > 0) {
			const idsToRemove = notifications.map(n => n._id);
			await Notification.deleteMany({ _id: { $in: idsToRemove }, user: user._id, type: { $ne: 'affirmation' } });
		}
		// Show the random affirmation selected at login
		let randomAffirmation = null;
		if (affirmations.length > 0 && req.session.randomAffirmationId) {
			randomAffirmation = affirmations.find(a => a._id.toString() === req.session.randomAffirmationId.toString());
		}
		res.render('user', { user, affirmations, notifications, randomAffirmation });
});

// Route to update notification times for logged-in user
app.post('/user/notification-times', async (req, res) => {
	if (!req.session.userId) return res.redirect('/login');
	let { notificationTimes } = req.body;
	if (!notificationTimes) notificationTimes = [];
	// Split and clean times
	const timesArr = notificationTimes.split(',').map(t => t.trim()).filter(Boolean);
	await User.findByIdAndUpdate(req.session.userId, { notificationTimes: timesArr });
	res.redirect('/user');
});

// Route to save a new affirmation for the logged-in user
app.post('/user/affirmations', async (req, res) => {
	if (!req.session.userId) return res.redirect('/login');
	const { message } = req.body;
	if (!message || !message.trim()) {
		return res.redirect('/user');
	}
	await Notification.create({
		type: 'affirmation',
		message,
		time: new Date(),
		user: req.session.userId
	});
	res.redirect('/user');
});

// Route to delete an affirmation for the logged-in user
app.post('/user/affirmations/delete/:id', async (req, res) => {
	if (!req.session.userId) return res.redirect('/login');
	const affirmationId = req.params.id;
	await Notification.deleteOne({ _id: affirmationId, user: req.session.userId, type: 'affirmation' });
	res.redirect('/user');
});

// Route to edit an affirmation for the logged-in user
app.post('/user/affirmations/edit/:id', async (req, res) => {
	if (!req.session.userId) return res.redirect('/login');
	const affirmationId = req.params.id;
	const { message } = req.body;
	await Notification.updateOne({ _id: affirmationId, user: req.session.userId, type: 'affirmation' }, { message });
	res.redirect('/user');
});

// Route to delete a notification for the logged-in user
app.post('/user/notifications/delete/:id', async (req, res) => {
	if (!req.session.userId) return res.redirect('/login');
	const notificationId = req.params.id;
	await Notification.deleteOne({ _id: notificationId, user: req.session.userId, type: { $ne: 'affirmation' } });
	res.redirect('/user');
});

// Route to edit a notification for the logged-in user
app.post('/user/notifications/edit/:id', async (req, res) => {
	if (!req.session.userId) return res.redirect('/login');
	const notificationId = req.params.id;
	const { message } = req.body;
	await Notification.updateOne({ _id: notificationId, user: req.session.userId, type: { $ne: 'affirmation' } }, { message });
	res.redirect('/user');
});

// Route to add multiple affirmations for the logged-in user
app.post('/user/affirmations/add-many', async (req, res) => {
	if (!req.session.userId) return res.redirect('/login');
	const defaultAffirmations = [
		'You are capable of amazing things.',
		'Every day is a fresh start.',
		'You are stronger than you think.',
		'Your potential is limitless.',
		'You are worthy of love and respect.',
		'You can achieve your goals.',
		'Positivity is a choice you make.',
		'You are enough just as you are.',
		'Your mind is powerful and your thoughts shape your reality.',
		'You bring value to the world.'
	];
	const affirmationsToAdd = defaultAffirmations.map(msg => ({
		type: 'affirmation',
		message: msg,
		time: new Date(),
		user: req.session.userId
	}));
	await Notification.insertMany(affirmationsToAdd);
	res.redirect('/user');
});

// All affirmations page
app.get('/affirmations', async (req, res) => {
	try {
		const affirmations = await Notification.find({ type: 'affirmation' }).populate('user');
		res.render('all-affirmations', { affirmations });
	} catch (err) {
		res.status(500).send('Error loading affirmations');
	}
});

// Personalized affirmations for logged-in user
app.get('/my-affirmations', async (req, res) => {
	if (!req.session.userId) return res.redirect('/login');
	try {
		const affirmations = await Notification.find({ type: 'affirmation', user: req.session.userId }).populate('user');
		res.render('all-affirmations', { affirmations });
	} catch (err) {
		res.status(500).send('Error loading affirmations');
	}
});

app.get('/affirmations/today', async (req, res) => {
	try {
		const start = new Date();
		start.setHours(0,0,0,0);
		const end = new Date();
		end.setHours(23,59,59,999);
		const affirmations = await Notification.find({
			type: 'affirmation',
			time: { $gte: start, $lte: end }
		}).populate('user');
		res.render('today', { affirmations });
	} catch (err) {
		res.status(500).send('Error loading today\'s affirmations');
	}
});

app.get('/notifications/view', async (req, res) => {
	try {
		const notifications = await Notification.find().populate('user');
		res.render('notifications', { notifications });
	} catch (err) {
		res.status(500).send('Error loading notifications');
	}
});

// Logout
app.get('/logout', (req, res) => {
	req.session.destroy(() => {
		res.redirect('/');
app.get('/settings', async (req, res) => {
	if (!req.session.userId) return res.redirect('/login');
	const user = await User.findById(req.session.userId);
	res.render('settings', { user });
});

app.post('/settings', async (req, res) => {
	if (!req.session.userId) return res.redirect('/login');
	let { notificationTimes, affirmationFrequency } = req.body;
	if (!notificationTimes) notificationTimes = [];
	const timesArr = notificationTimes.split(',').map(t => t.trim()).filter(Boolean);
	affirmationFrequency = parseInt(affirmationFrequency) || 4;
	await User.findByIdAndUpdate(req.session.userId, {
		notificationTimes: timesArr,
		affirmationFrequency
	});
	res.redirect('/settings');
});
	});
});

// Create a new user
app.post('/users', async (req, res) => {
	try {
		const user = new User(req.body);
		await user.save();
		res.status(201).json(user);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

app.get('/users', async (req, res) => {
	try {
		const users = await User.find();
		res.render('users', { users });
	} catch (err) {
		res.status(500).send('Error loading users');
	}
});

// Create a new notification
app.post('/notifications', async (req, res) => {
	try {
		const notification = new Notification(req.body);
		await notification.save();
		res.status(201).json(notification);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

app.get('/notifications', async (req, res) => {
	try {
		const notifications = await Notification.find().populate('user');
		res.json(notifications);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get('/test', (req, res) => {
	res.send('Server is running properly!');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});


const scheduleUserNotifications = () => {
	// Clear previous schedules if needed (not implemented here for simplicity)
	const defaultTimes = ["09:00", "13:00", "17:00", "21:00"];
	defaultTimes.forEach(timeStr => {
		const [hour, minute] = timeStr.split(":");
		cron.schedule(`${minute} ${hour} * * *`, async () => {
			try {
				const users = await User.find();
				for (const user of users) {
					const times = user.notificationTimes && user.notificationTimes.length > 0 ? user.notificationTimes : defaultTimes;
					if (times.includes(timeStr)) {
						const notification = new Notification({
							type: 'affirmation',
							message: 'Take a deep breath and have a great day!',
							time: new Date(),
							user: user._id
						});
						await notification.save();
						console.log(`Notification sent to ${user.name} at ${timeStr}`);
					}
				}
			} catch (err) {
				console.error('Error sending scheduled notifications:', err);
			}
		});
	});
};

// Schedule notifications for default times (will check user preferences)
scheduleUserNotifications();
