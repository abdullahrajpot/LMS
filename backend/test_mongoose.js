require('dotenv').config();
const mongoose = require('mongoose');
const Resource = require('./models/Resource');
const Course = require('./models/Course');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        try {
            const course = await Course.findOne({});
            if (!course) return console.log('No course found');

            console.log("Creating resource for course:", course._id);
            const resource = await Resource.create({
                course: course._id,
                title: 'Test',
                description: 'Test',
                type: 'video',
                docUrl: '',
                videoUrl: '',
            });
            console.log("Success:", resource);
        } catch (err) {
            console.error("Mongoose Error:", err);
        }
    }).finally(() => process.exit(0));
