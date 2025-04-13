const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Faculty = require('../models/Faculty');
const CourseContent = require('../models/CourseContent');
const Attendance = require('../models/attendance');

// Faculty Signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, department, sections, subjects } = req.body;

        const existingFaculty = await Faculty.findOne({ email });
        if (existingFaculty) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const faculty = new Faculty({
            email,
            password: hashedPassword,
            name,
            department,
            sections,
            subjects
        });

        await faculty.save();
        res.status(201).json({ 
            message: 'Faculty registered successfully',
            faculty: {
                email: faculty.email,
                name: faculty.name,
                department: faculty.department,
                sections: faculty.sections,
                subjects: faculty.subjects
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add Course Content
router.post('/content', async (req, res) => {
    try {
        const content = new CourseContent(req.body);
        await content.save();
        res.status(201).json({ message: 'Content added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// ... existing code ...

// Faculty Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find faculty by email
        const faculty = await Faculty.findOne({ email });
        if (!faculty) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, faculty.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Send faculty data (excluding password)
        res.json({
            faculty: {
                email: faculty.email,
                name: faculty.name,
                department: faculty.department,
                sections: faculty.sections,
                subjects: faculty.subjects
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ... rest of existing code ...

// Mark Attendance
router.post('/attendance', async (req, res) => {
    try {
        const attendance = new Attendance(req.body);
        await attendance.save();
        res.status(201).json({ message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Department Sections
router.get('/sections/:department', async (req, res) => {
    try {
        const sections = await Faculty.distinct('sections', { 
            department: req.params.department 
        });
        res.json(sections);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;