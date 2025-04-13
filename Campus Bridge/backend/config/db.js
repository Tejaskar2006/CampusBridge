const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://CampusBridge:teja2006om@cluster0.9unba7w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected to test database');
    } catch (err) {
        console.error('MongoDB Connection Error Details:', err);
        process.exit(1);
    }
};

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

module.exports = connectDB;