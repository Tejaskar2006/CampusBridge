const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const compilerRouter=require('./routes/compiler');
const chatRouter=require('./routes/chat');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await connectDB();
        
        // Routes
        app.use('/api', require('./routes/auth'));
        app.use('/api/faculty', require('./routes/faculty'));
        app.use('/api',compilerRouter)
        app.use('/api',chatRouter)

// ... rest of the code ...

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();