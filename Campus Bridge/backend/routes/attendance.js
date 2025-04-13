const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Attendance = require('../models/attendance');

// Get students by department and section
router.get('/students/:department/:section', async (req, res) => {
    try {
        const { department, section } = req.params;
        const students = await Student.find({ department, section });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add attendance for multiple students
router.post('/mark', async (req, res) => {
    try {
        const { date, department, section, attendanceData } = req.body;
        const facultyId = req.user._id; // Assuming you have authentication middleware

        // Create attendance records
        const attendanceRecords = attendanceData.map(record => ({
            studentId: record.studentId,
            facultyId,
            date,
            status: record.status,
            department,
            section
        }));

        await Attendance.insertMany(attendanceRecords);
        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get attendance records
router.get('/records/:department/:section/:date', async (req, res) => {
    try {
        const { department, section, date } = req.params;
        const records = await Attendance.find({
            department,
            section,
            date: new Date(date)
        }).populate('studentId', 'name email');

        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get attendance statistics
router.get('/stats/:department/:section/:studentId', async (req, res) => {
    try {
        const { department, section, studentId } = req.params;
        const stats = await Attendance.aggregate([
            {
                $match: {
                    department,
                    section,
                    studentId: mongoose.Types.ObjectId(studentId)
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;