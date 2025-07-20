const mongoose = require('mongoose');
require('dotenv').config();

// Define the MongoDB connection URL
const mongoURL = process.env.MONGODB_URL_LOCAL 
// const mongoURL = process.env.MONGODB_URL;

// Connect to MongoDB
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

//Get the default connection
//Mongoose maintain a default connection object representing the MongoDB connection to the database
const db = mongoose.connection;

//Define the event listeners for the connection
db.on('connected', () => {
    console.log('Connected to MongoDB');
});
db.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});
db.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

// Export the connection object
module.exports = db;
