const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        try {
            const user = await User.findOne({ role: 'instructor' });
            if (!user) return console.log('No instructor found');

            const course = await Course.findOne({ instructor: user._id });
            if (!course) return console.log('No course found for instructor');

            // We don't have a direct token generator here without login, so we'll 
            // mock a generic HTTP request to trigger the exact crash locally.
            // It's probably easier to just review the Controller closely again. 

        } catch (err) {
            console.error("Mongoose Error:", err);
        }
    }).finally(() => process.exit(0));
