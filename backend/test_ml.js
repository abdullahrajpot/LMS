const mongoose = require('mongoose');
require('dotenv').config();
const { runKMeansClustering, generateRecommendations } = require('./services/ml.service');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        console.log("Triggering K-Means Clustering...");
        const result = await runKMeansClustering();
        console.log("Clustering Result:", result);

        const user = await User.findOne({ role: 'learner' });
        if (user) {
            console.log(`Generating recommendations for user: ${user.name}`);
            const recs = await generateRecommendations(user._id);
            console.log(`Generated ${recs.length} recommendations:`);
            recs.forEach(r => console.log(`- Course ID: ${r.courseId}, Score: ${r.simScore}`));
        } else {
            console.log("No learner found to test recommendations.");
        }
    } catch (err) {
        console.error("Clustering Error:", err);
    }
}).finally(() => process.exit(0));
