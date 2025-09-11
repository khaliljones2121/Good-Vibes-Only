# Good Vibes Only

A web app to help users receive daily affirmations and notifications for positive mental health.

## Features
- User registration and login
- User profile page
- Add, edit, and delete affirmations
- View and manage notifications
- Customizable notification times and affirmation frequency
- Scheduled notifications (3-4 times a day)
- User settings page
- EJS templating and MongoDB backend

## Planning Materials
-[Deployed Websites]
https://good-vibes-only-c6c90154e690.herokuapp.com/ 

-[trello]
https://trello.com/invite/b/68c053d0371264deb4098685/ATTIaf83e814f15fbb3490900eccc91f5b33F75D9D06/good-vibe-only

### Prerequisites
- Node.js
- MongoDB (local or Atlas)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/khaliljones2121/Good-Vibes-Only.git
   cd Good-Vibes-Only
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ```
4. Start the server:
   ```sh
   npm start
   ```

## Usage
- Register and log in to create your profile.
- Add, edit, or delete affirmations.
- Set your notification times and affirmation frequency in the settings page.
- Receive scheduled notifications throughout the day.

## Folder Structure
- `server.js` - Main application file
- `models/` - Mongoose schemas (User, Notification, Post)
- `views/` - EJS templates

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Author
- Khalil Jones

---
Built with Node.js, Express, MongoDB, and EJS.