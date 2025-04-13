const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        const {
            email,
            password,
            dateOfBirth,
            college,
            branch,
            section,
            role
        } = req.body;

        // Validate required fields
        if (!email || !password || !dateOfBirth || !college || !branch || !section || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword,
            dateOfBirth: new Date(dateOfBirth),
            college,
            branch,
            section,
            role
        });

        const savedUser = await newUser.save();

        // Create user response without password
        const userResponse = {
            _id: savedUser._id,
            email: savedUser.email,
            dateOfBirth: savedUser.dateOfBirth,
            college: savedUser.college,
            branch: savedUser.branch,
            section: savedUser.section,
            role: savedUser.role
        };

        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Signup error details:', error);
        res.status(500).json({
            message: 'Server error during registration',
            error: error.message
        });
    }
});

// Login Route
// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create user response without password
        const userResponse = {
            _id: user._id,
            email: user.email,
            role: user.role,
            college: user.college,
            branch: user.branch,
            section: user.section
        };

        // Add dashboard URL based on role
        const dashboardUrl = user.role === 'student'
            ? '/student_portal/dashboard.html'
            : '/faculty_portal/dashboard.html';

        res.status(200).json({
            message: 'Login successful',
            user: userResponse,
            dashboardUrl: dashboardUrl
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;