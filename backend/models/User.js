const mongoose = require("mongoose");

const trackSnapshotSchema = new mongoose.Schema(
    {
        youtubeId: { type: String, required: true },
        title: { type: String, required: true },
        artist: { type: String, default: "" },
        album: { type: String, default: "" },
        image: { type: String, default: "" },
        previewUrl: { type: String, default: "" },
        durationMs: { type: Number, default: 0 }
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username cannot exceed 30 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false
        },
        role: {
            type: String,
            default: "listener",
            enum: ["listener", "artist", "admin"]
        },
        status: {
            type: String,
            default: "active",
            enum: ["active", "suspended"]
        },
        artistStatus: {
            type: String,
            default: "none",
            enum: ["none", "pending", "approved", "suspended"]
        },
        suspendedAt: {
            type: Date
        },
        suspendedReason: {
            type: String,
            default: ""
        },
        profileImage: {
            type: String,
            default: ""
        },
        country: {
            type: String,
            default: ""
        },
        subscription: {
            type: String,
            default: "free",
            enum: ["free", "premium"]
        },
        preferredLanguage: {
            type: String,
            default: "en",
            enum: ["en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh", "ar", "hi"]
        },
        favoriteGenres: {
            type: [String],
            default: []
        },
        recentlyPlayed: {
            type: [trackSnapshotSchema],
            default: []
        }
    },
    { timestamps: true }
);

// Remove password from JSON responses
userSchema.methods.toJSON = function toJSON() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model("User", userSchema);
