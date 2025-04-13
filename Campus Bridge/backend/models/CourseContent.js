const mongoose = require('mongoose');

const courseContentSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: String,
    fileUrl: String,
    contentType: {
        type: String,
        enum: ['file', 'quiz', 'assignment'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CourseContent', courseContentSchema);