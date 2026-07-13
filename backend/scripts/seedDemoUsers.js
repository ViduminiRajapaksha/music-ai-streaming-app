require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");

const demoUsers = [
    {
        username: "Demo Listener",
        email: "listener@melodymind.demo",
        password: "Listener123",
        role: "listener",
        artistStatus: "none",
        favoriteGenres: ["Pop", "R&B", "Sinhala"]
    },
    {
        username: "Demo Artist",
        email: "artist@melodymind.demo",
        password: "Artist123",
        role: "artist",
        artistStatus: "approved",
        favoriteGenres: ["Pop", "Acoustic", "Classical"]
    },
    {
        username: "Demo Admin",
        email: "admin@melodymind.demo",
        password: "Admin123",
        role: "admin",
        artistStatus: "none",
        favoriteGenres: ["Pop", "Rock", "EDM"]
    }
];

const seedDemoUsers = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is required to seed demo users.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    for (const demoUser of demoUsers) {
        const hashedPassword = await bcrypt.hash(demoUser.password, 10);
        await User.findOneAndUpdate(
            { email: demoUser.email },
            {
                $set: {
                    username: demoUser.username,
                    password: hashedPassword,
                    role: demoUser.role,
                    status: "active",
                    artistStatus: demoUser.artistStatus,
                    favoriteGenres: demoUser.favoriteGenres
                }
            },
            { upsert: true, runValidators: true }
        );
    }

    console.log("Demo users seeded successfully.");
};

seedDemoUsers()
    .catch((err) => {
        console.error(err.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
