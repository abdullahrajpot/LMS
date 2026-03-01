const express = require('express');
const { updateOnboardingQuiz, getUserProfile } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/onboarding', protect, authorize('learner'), updateOnboardingQuiz);
router.get('/profile', protect, getUserProfile);

module.exports = router;

