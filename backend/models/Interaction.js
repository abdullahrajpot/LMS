const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseResource', required: true },
    actionType: { type: String, enum: ['view', 'quiz_start', 'quiz_complete', 'download', 'post'], required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    score: { type: Number, default: 0 }
}, { timestamps: true });

interactionSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);
