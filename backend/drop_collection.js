const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const db = mongoose.connection.db;
        console.log("Connected to DB, dropping resources collection...");
        await db.collection('resources').drop();
        console.log("Successfully dropped resources collection.");
    } catch (err) {
        if (err.codeName === 'NamespaceNotFound') {
            console.log("Collection already dropped.");
        } else {
            console.log("Error dropping:", err);
        }
    }
}).finally(() => process.exit(0));
