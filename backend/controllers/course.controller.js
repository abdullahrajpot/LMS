const Course = require('../models/Course');
const User = require('../models/User');

exports.createCourse = async (req, res) => {
    const { title, description, details, duration } = req.body;
    try {
        const course = await Course.create({
            title,
            description,
            details,
            duration,
            instructor: req.user._id,
        });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isActive: true }).populate('instructor', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('enrolledLearners', 'name');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.enrollCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.enrolledLearners.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already enrolled' });
        }

        course.enrolledLearners.push(req.user._id);
        await course.save();

        res.json({ message: 'Enrollment successful', course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourseAnalytics = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId).populate('enrolledLearners', 'name email');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Must be instructor of the course or admin
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized for this course' });
        }

        const Interaction = require('../models/Interaction');
        const Resource = require('../models/Resource');

        const courseResources = await Resource.find({ course: courseId });
        const resourceIds = courseResources.map(r => r._id);

        const interactions = await Interaction.find({ resource: { $in: resourceIds } });

        const totalViews = interactions.filter(i => i.actionType === 'view').length;
        const totalQuizStarts = interactions.filter(i => i.actionType === 'quiz_start').length;
        const totalTimeSpentSeconds = interactions.reduce((sum, i) => sum + i.timeSpentSeconds, 0);

        // Aggregate per-student data
        const studentProgress = course.enrolledLearners.map(student => {
            const studentInteractions = interactions.filter(i => i.user.toString() === student._id.toString());
            const views = studentInteractions.filter(i => i.actionType === 'view').length;
            const quizzes = studentInteractions.filter(i => i.actionType === 'quiz_start').length;
            const completed = studentInteractions.filter(i => i.actionType === 'quiz_complete').length;

            // Calculate a rough "completion" percentage based on interactions vs total resources
            const progressScore = courseResources.length > 0
                ? Math.min(100, Math.round((new Set(studentInteractions.map(i => i.resource.toString())).size / courseResources.length) * 100))
                : 0;

            return {
                id: student._id,
                name: student.name,
                email: student.email,
                views,
                quizzes,
                completedTasks: completed,
                progress: progressScore
            };
        });

        res.json({
            enrolledCount: course.enrolledLearners.length,
            totalViews,
            totalQuizStarts,
            totalTimeSpentSeconds,
            totalResources: courseResources.length,
            studentProgress
        });
    } catch (error) {
        console.error("Error in getCourseAnalytics", error);
        res.status(500).json({ message: error.message });
    }
};
