const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const user = await User.findOne({ role: 'instructor' });
        if (!user) return console.log('no instructor');
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

        const res = await fetch('http://localhost:5000/api/resources', {
            method: 'POST',
            body: JSON.stringify({
                courseId: '69a2a05b52324a9bee393aad',
                title: 'Test Res',
                type: 'video',
                docUrl: '',
                videoUrl: '',
                contentUrl: ' '
            }),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const data = await res.json();
            console.log("API Error Payload:", data);
        } else {
            console.log("Success");
        }
    } catch (err) {
        console.log("Network Error:", err);
    }
}).finally(() => process.exit(0));
