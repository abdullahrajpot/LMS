const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['video', 'document', 'quiz', 'assignment', 'forum', 'external_link'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }],
    docUrl: { type: String },
    videoUrl: { type: String },
    durationMinutes: { type: Number, default: 0 },
    accessCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('CourseResource', resourceSchema);
