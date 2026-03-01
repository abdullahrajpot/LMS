const mongoose = require('mongoose');

const clusterSchema = new mongoose.Schema({
    clusterId: { type: Number, required: true, unique: true },
    clusterName: { type: String, required: true },
    centroidVector: { type: Object, required: true }, // Store feature weights
    size: { type: Number, default: 0 }
});

const Cluster = mongoose.model('Cluster', clusterSchema);

const recommendationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseResource' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    similarityScore: { type: Number, required: true },
    rankPosition: { type: Number, required: true },
    clicked: { type: Boolean, default: false },
    viewedAt: { type: Date }
}, { timestamps: true });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = { Cluster, Recommendation };
