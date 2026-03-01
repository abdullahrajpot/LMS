const express = require('express');
const { createResource, getResourcesByCourse } = require('../controllers/resource.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
    .post(protect, authorize('instructor', 'admin'), createResource);

router.route('/course/:courseId')
    .get(protect, getResourcesByCourse);

module.exports = router;
