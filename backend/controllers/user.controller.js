const User = require('../models/User');

// Update onboarding quiz answers for the current learner
exports.updateOnboardingQuiz = async (req, res) => {
    const { interests, preferredDifficulty, studyPace } = req.body;

    try {
        if (req.user.role !== 'learner') {
            return res.status(403).json({ message: 'Only learners can complete onboarding quiz' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.onboardingQuiz = {
            completed: true,
            interests: Array.isArray(interests) ? interests : [],
            preferredDifficulty: preferredDifficulty || 'medium',
            studyPace: studyPace || 'balanced'
        };

        await user.save();

        res.json({
            message: 'Onboarding quiz saved',
            onboardingQuiz: user.onboardingQuiz
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
