const express = require('express');
const { logInteraction, getUserInteractions } = require('../controllers/interaction.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
    .post(protect, logInteraction)
    .get(protect, getUserInteractions);

module.exports = router;
