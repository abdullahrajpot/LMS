const express = require('express');
const { createCourse, getCourses, getCourseById, enrollCourse, getCourseAnalytics } = require('../controllers/course.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
    .get(protect, getCourses)
    .post(protect, authorize('instructor', 'admin'), createCourse);

router.route('/:id')
    .get(protect, getCourseById);

router.route('/:id/enroll')
    .post(protect, authorize('learner'), enrollCourse);

router.route('/:id/analytics')
    .get(protect, authorize('instructor', 'admin'), getCourseAnalytics);

module.exports = router;
