const express = require('express');
const { triggerClustering, getClusters, getRecommendations } = require('../controllers/ml.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/cluster', protect, authorize('instructor'), triggerClustering);
router.get('/clusters', protect, authorize('instructor'), getClusters);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
