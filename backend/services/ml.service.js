const User = require('../models/User');
const Interaction = require('../models/Interaction');
const Resource = require('../models/Resource');
const Course = require('../models/Course');
const { Cluster, Recommendation } = require('../models/MLModels');

// Generate a vocabulary array of all unique interests present in users' profiles
const buildInterestVocabulary = async () => {
    const users = await User.find({ role: 'learner' });
    const interestSet = new Set();
    users.forEach(u => {
        if (u.onboardingQuiz && Array.isArray(u.onboardingQuiz.interests)) {
            u.onboardingQuiz.interests.forEach(i => interestSet.add(i.toLowerCase().trim()));
        }
    });
    return Array.from(interestSet).sort();
};

// Extracts numerical features for a given user from their interaction history and quiz answers
const extractUserFeatures = async (userId, vocabulary = []) => {
    const user = await User.findById(userId);
    const interactions = await Interaction.find({ user: userId });

    // Default behavioral metrics
    let timeNorm = 0, freqNorm = 0, scoreNorm = 0, regularityNorm = 0.5;

    if (interactions.length > 0) {
        const totalTime = interactions.reduce((sum, int) => sum + int.timeSpentSeconds, 0);
        const avgTimeSpent = totalTime / interactions.length;

        const quizzes = interactions.filter(i => i.actionType.startsWith('quiz_'));
        const totalScore = quizzes.reduce((sum, q) => sum + q.score, 0);
        const avgScore = quizzes.length ? totalScore / quizzes.length : 0;

        timeNorm = Math.min(avgTimeSpent / 3600, 1);
        freqNorm = Math.min(interactions.length / 100, 1);
        scoreNorm = Math.min(avgScore / 100, 1);
    }

    // Default quiz metrics
    let diffNorm = 0.5;
    let paceNorm = 0.5;
    let interestVector = Array(vocabulary.length).fill(0);

    if (user && user.onboardingQuiz) {
        if (user.onboardingQuiz.preferredDifficulty === 'easy') diffNorm = 0;
        else if (user.onboardingQuiz.preferredDifficulty === 'hard') diffNorm = 1;

        if (user.onboardingQuiz.studyPace === 'slow') paceNorm = 0;
        else if (user.onboardingQuiz.studyPace === 'fast') paceNorm = 1;

        if (Array.isArray(user.onboardingQuiz.interests)) {
            user.onboardingQuiz.interests.forEach(interest => {
                const idx = vocabulary.indexOf(interest.toLowerCase().trim());
                if (idx !== -1) interestVector[idx] = 1;
            });
        }
    }

    return {
        timeNorm, freqNorm, scoreNorm, regularityNorm,
        diffNorm, paceNorm, interestVector, vocabulary
    };
};

const euclideanDist = (v1, v2) => {
    let sumSq = 0;
    // Core features
    sumSq += Math.pow(v1.timeNorm - v2.timeNorm, 2);
    sumSq += Math.pow(v1.freqNorm - v2.freqNorm, 2);
    sumSq += Math.pow(v1.scoreNorm - v2.scoreNorm, 2);
    sumSq += Math.pow(v1.regularityNorm - v2.regularityNorm, 2);
    sumSq += Math.pow(v1.diffNorm - v2.diffNorm, 2);
    sumSq += Math.pow(v1.paceNorm - v2.paceNorm, 2);

    // Euclidean distance for interest vectors (normalized slightly to avoid explosion)
    let interestSumSq = 0;
    if (v1.interestVector && v2.interestVector && v1.interestVector.length > 0) {
        for (let i = 0; i < v1.interestVector.length; i++) {
            interestSumSq += Math.pow(v1.interestVector[i] - v2.interestVector[i], 2);
        }
        sumSq += (interestSumSq / v1.interestVector.length);
    }

    return Math.sqrt(sumSq);
};

// Calculate average centroid given a group of clustered items
const calculateCentroid = (clusterItems, vocabSize) => {
    const newCentroid = {
        timeNorm: 0, freqNorm: 0, scoreNorm: 0,
        regularityNorm: 0, diffNorm: 0, paceNorm: 0,
        interestVector: Array(vocabSize).fill(0)
    };

    const size = clusterItems.length;
    if (size === 0) return newCentroid;

    for (const item of clusterItems) {
        newCentroid.timeNorm += item.features.timeNorm;
        newCentroid.freqNorm += item.features.freqNorm;
        newCentroid.scoreNorm += item.features.scoreNorm;
        newCentroid.regularityNorm += item.features.regularityNorm;
        newCentroid.diffNorm += item.features.diffNorm;
        newCentroid.paceNorm += item.features.paceNorm;

        if (item.features.interestVector) {
            for (let j = 0; j < vocabSize; j++) {
                newCentroid.interestVector[j] += item.features.interestVector[j];
            }
        }
    }

    newCentroid.timeNorm /= size;
    newCentroid.freqNorm /= size;
    newCentroid.scoreNorm /= size;
    newCentroid.regularityNorm /= size;
    newCentroid.diffNorm /= size;
    newCentroid.paceNorm /= size;

    for (let j = 0; j < vocabSize; j++) {
        newCentroid.interestVector[j] /= size;
    }

    return newCentroid;
};

// K-Means Clustering for AI Course Recommendations
exports.runKMeansClustering = async () => {
    const users = await User.find({ role: 'learner' });
    const K = Math.min(3, users.length); // Use up to 3 clusters

    if (users.length === 0) return { message: 'No users found.' };
    if (users.length < 2) return { message: 'Not enough users to form meaningful clusters.' };

    const vocabulary = await buildInterestVocabulary();
    const userFeaturesMap = new Map();

    for (const user of users) {
        const features = await extractUserFeatures(user._id, vocabulary);
        userFeaturesMap.set(user._id.toString(), features);
    }

    // Initialize Random Centroids
    let centroids = [];
    for (let i = 0; i < K; i++) {
        // Deep copy the random init vector
        centroids.push(JSON.parse(JSON.stringify(userFeaturesMap.get(users[i]._id.toString()))));
    }

    let changed = true;
    let iterations = 0;
    let clusters = [];

    // Assignment and Update Step
    while (changed && iterations < 15) {
        changed = false;
        clusters = Array.from({ length: K }, () => []);

        // Assignment
        for (const [userId, features] of userFeaturesMap.entries()) {
            let minDist = Infinity;
            let closestIndex = 0;
            for (let i = 0; i < K; i++) {
                const dist = euclideanDist(features, centroids[i]);
                if (dist < minDist) {
                    minDist = dist;
                    closestIndex = i;
                }
            }
            clusters[closestIndex].push({ userId, features });
        }

        // Update
        for (let i = 0; i < K; i++) {
            if (clusters[i].length === 0) continue;

            const newCentroid = calculateCentroid(clusters[i], vocabulary.length);

            // Using dummy property vocabulary to be kept around
            newCentroid.vocabulary = vocabulary;

            // Stop condition
            if (euclideanDist(centroids[i], newCentroid) > 0.001) {
                changed = true;
                centroids[i] = newCentroid;
            }
        }
        iterations++;
    }

    // Save clusters natively to User to map users to their Cluster efficiently
    await Cluster.deleteMany({});

    for (let i = 0; i < K; i++) {
        // Extract top 3 defining interests for this cluster name
        let topInterests = [];
        if (centroids[i].interestVector && vocabulary.length > 0) {
            const ranked = centroids[i].interestVector
                .map((val, idx) => ({ val, word: vocabulary[idx] }))
                .sort((a, b) => b.val - a.val)
                .slice(0, 3)
                .map(v => v.word);

            topInterests = ranked;
        }

        const clusterRecord = await Cluster.create({
            clusterId: i + 1,
            clusterName: topInterests.length > 0 ? `Cluster: ${topInterests.join(', ')}` : `Cluster ${i + 1}`,
            centroidVector: centroids[i],
            size: clusters[i].length
        });

        // Save the reverse mapping onto the user for fast lookups
        for (const item of clusters[i]) {
            await User.findByIdAndUpdate(item.userId, { $set: { "mlCluster": clusterRecord._id } });
        }
    }

    return { message: `Clustering complete after ${iterations} iterations`, groups: K, vocabularySize: vocabulary.length };
};

exports.generateRecommendations = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return [];

    // Find the user's assigned K-Means cluster
    // Fallback: If no cluster assigned, give generic popular courses
    let similarUsers = [];
    if (user.mlCluster) {
        // AI Clustered Approach: Find all other users in this same exact AI-derived group
        similarUsers = await User.find({ mlCluster: user.mlCluster, _id: { $ne: user._id } }).select('_id');
    }

    let recommendedCourseIds = [];

    if (similarUsers.length > 0) {
        // Find which courses the users in this cluster found valuable/interacted with
        const similarUserIds = similarUsers.map(u => u._id);
        const interactions = await Interaction.find({ user: { $in: similarUserIds } }).populate('resource');

        const courseFrequencyMap = {};
        interactions.forEach(int => {
            if (int.resource && int.resource.course) {
                const cid = int.resource.course.toString();
                // We weight by score or time spent
                courseFrequencyMap[cid] = (courseFrequencyMap[cid] || 0) + (int.score > 0 ? int.score : 1);
            }
        });

        // Add explicit enrollments from the similar users
        const allCourses = await Course.find();
        for (const course of allCourses) {
            let matchedEnrollees = 0;
            for (const enrollee of course.enrolledLearners) {
                if (similarUserIds.some(sid => sid.toString() === enrollee.toString())) {
                    matchedEnrollees++;
                }
            }
            if (matchedEnrollees > 0) {
                const cid = course._id.toString();
                // Strong weight for actual enrollments by cluster peers
                courseFrequencyMap[cid] = (courseFrequencyMap[cid] || 0) + (matchedEnrollees * 10);
            }
        }

        recommendedCourseIds = Object.entries(courseFrequencyMap)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
    } else {
        // Cold Start / No specific cluster: Recommend by direct Quiz interests or most popular
        const allCourses = await Course.find();
        const scoredCourses = allCourses.map(course => {
            let score = course.enrolledLearners.length; // Popularity bias

            if (user.onboardingQuiz && user.onboardingQuiz.interests) {
                const interests = user.onboardingQuiz.interests.map(i => i.toLowerCase().trim());
                if (course.tags) {
                    const match = course.tags.filter(tag => interests.includes(tag.toLowerCase().trim()));
                    score += (match.length * 15);
                }
            }
            return { _id: course._id.toString(), score };
        });

        recommendedCourseIds = scoredCourses.sort((a, b) => b.score - a.score).map(c => c._id);
    }

    // Ensure the courses aren't ones the user is already strictly taking/completed
    const coursesToReturn = [];
    for (const cid of recommendedCourseIds) {
        const course = await Course.findById(cid).populate('instructor', 'name');
        if (course && !course.enrolledLearners.some(id => id.toString() === user._id.toString())) {
            // Keep simScore mock for frontend compatibility
            coursesToReturn.push({ resource: course, courseId: cid, simScore: 0.95 });
        }
        if (coursesToReturn.length >= 6) break;
    }

    await Recommendation.deleteMany({ user: userId });
    for (let i = 0; i < coursesToReturn.length; i++) {
        await Recommendation.create({
            user: userId,
            course: coursesToReturn[i].courseId,
            similarityScore: coursesToReturn[i].simScore,
            rankPosition: i + 1
        });
    }

    return coursesToReturn;
};
