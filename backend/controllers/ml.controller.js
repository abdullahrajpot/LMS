const mlService = require('../services/ml.service');
const { Cluster, Recommendation } = require('../models/MLModels');

exports.triggerClustering = async (req, res) => {
    try {
        const result = await mlService.runKMeansClustering();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getClusters = async (req, res) => {
    try {
        const clusters = await Cluster.find();
        res.json(clusters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRecommendations = async (req, res) => {
    try {
        // Re-generate on demand for PoC
        await mlService.generateRecommendations(req.user._id);

        const recommendations = await Recommendation.find({ user: req.user._id })
            .populate('resource');

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
