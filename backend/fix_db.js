const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const db = mongoose.connection.db;
        console.log("Connected to DB, checking Resource collection...");
        // sometimes mongoose's schema changes don't drop indexes that were created as "unique" or "required" (though required is usually schema-level)
        // Let's check for validation rules on the collection
        const colInfo = await db.command({ listCollections: 1, filter: { name: 'resources' } });
        console.log("Collection Info:", JSON.stringify(colInfo.cursor.firstBatch, null, 2));

        // If 'validator' exists, let's remove it
        await db.command({ collMod: 'resources', validator: {} });
        console.log("Cleared any MongoDB-level validation rules for resources.");

    } catch (err) {
        console.log("Error:", err);
    }
}).finally(() => process.exit(0));
