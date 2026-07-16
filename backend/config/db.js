const mongoose = require("mongoose");
const Favorite = require("../models/Favorite");

const repairFavoriteIndexes = async () => {
    const indexes = await Favorite.collection.indexes();
    const staleUserIdIndex = indexes.find((index) => (
        index.unique === true &&
        Object.keys(index.key).length === 1 &&
        index.key.userId === 1
    ));

    if (staleUserIdIndex) {
        await Favorite.collection.dropIndex(staleUserIdIndex.name);
        console.log(`Dropped stale favorites index: ${staleUserIdIndex.name}`);
    }

    await Favorite.collection.createIndex(
        { userId: 1, youtubeId: 1 },
        { unique: true, name: "userId_1_youtubeId_1" }
    );
};

/**
 * Connect to MongoDB using the URI from environment variables.
 * Exits the process if the connection fails.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        await repairFavoriteIndexes();
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
