const express = require('express');
const router = express.Router();
const CourseContent = require('../models/CourseContent');

router.post('/content', async (req, res) => {
    try {
        const { department, section, contentType, subject } = req.body;

        // Build query based on department and section
        let query = {
            department: department,
            section: section
        };

        // Add optional filters if provided
        if (contentType) query.contentType = contentType;
        if (subject) query.subject = subject;

        // Fetch content matching the criteria
        const content = await CourseContent.find(query)
            .sort({ createdAt: -1 }) // Latest content first
            .populate('facultyId', 'name'); // Get faculty name

        res.json({ content });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ message: 'Error fetching content' });
    }
});

module.exports = router;