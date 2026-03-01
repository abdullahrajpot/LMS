const Interaction = require('../models/Interaction');

exports.logInteraction = async (req, res) => {
    const { resourceId, actionType, timeSpentSeconds, score } = req.body;

    try {
        const interaction = await Interaction.create({
            user: req.user._id,
            resource: resourceId,
            actionType,
            timeSpentSeconds: timeSpentSeconds || 0,
            score: score || 0
        });

        res.status(201).json(interaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserInteractions = async (req, res) => {
    try {
        const interactions = await Interaction.find({ user: req.user._id })
            .populate('resource', 'title type')
            .sort('-createdAt');
        res.json(interactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
