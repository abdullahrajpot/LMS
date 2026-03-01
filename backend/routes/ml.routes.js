const express = require('express');
const { triggerClustering, getClusters, getRecommendations } = require('../controllers/ml.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/cluster', protect, authorize('admin'), triggerClustering);
router.get('/clusters', protect, authorize('admin', 'instructor'), getClusters);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
