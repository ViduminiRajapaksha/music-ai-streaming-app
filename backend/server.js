require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/rateLimiter");

const authRoutes = require("./routes/authRoutes");
const musicRoutes = require("./routes/musicRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const aiRoutes = require("./routes/aiRoutes");
const userRoutes = require("./routes/userRoutes");
const songRoutes = require("./routes/songRoutes");
const albumRoutes = require("./routes/albumRoutes");
const podcastRoutes = require("./routes/podcastRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const followRoutes = require("./routes/followRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: (process.env.CORS_ORIGIN || "*").split(","),
    credentials: true
  }
});

// Make io accessible globally
app.set("io", io);

// Connect to MongoDB
connectDB();

/*
|--------------------------------------------------------------------------
| Security & Core Middleware
|--------------------------------------------------------------------------
*/
app.use(helmet());

app.use(
    cors({
        origin: function (origin, callback) {
            const allowedOrigins = (process.env.CORS_ORIGIN || "*").split(",");
            if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use("/uploads", express.static("uploads"));

// Log all incoming requests
app.use((req, res, next) => {
    if (String(process.env.DEBUG_REQUESTS).toLowerCase() === "true") {
        console.log(`${req.method} ${req.originalUrl}`);
    }
    next();
});

app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/podcasts", podcastRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/admin", adminRoutes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Music AI Streaming API is running",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            music: "/api/music",
            favorites: "/api/favorites",
            playlists: "/api/playlists",
            ai: "/api/ai",
            users: "/api/users",
            songs: "/api/songs",
            albums: "/api/albums",
            podcasts: "/api/podcasts",
            library: "/api/library",
            downloads: "/api/downloads",
            follow: "/api/follow",
            admin: "/api/admin"
        }
    });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

/*
|--------------------------------------------------------------------------
| Centralized Error Handler
|--------------------------------------------------------------------------
*/
app.use(errorMiddleware);

/*
|--------------------------------------------------------------------------
| Socket.IO Connection Handling
|--------------------------------------------------------------------------
*/
io.on("connection", (socket) => {
  if (String(process.env.DEBUG_SOCKET).toLowerCase() === "true") {
    console.log(`User connected: ${socket.id}`);
  }

  // Join user's personal room
  socket.on("join_user", (userId) => {
    socket.join(`user_${userId}`);
    if (String(process.env.DEBUG_SOCKET).toLowerCase() === "true") {
      console.log(`User ${userId} joined their room`);
    }
  });

  // Real-time playlist updates
  socket.on("playlist_update", (data) => {
    socket.to(`user_${data.userId}`).emit("playlist_updated", data);
  });

  // Real-time listening activity
  socket.on("now_playing", (data) => {
    socket.to(`user_${data.userId}`).emit("friend_now_playing", data);
  });

  // Real-time chat messages
  socket.on("send_message", (data) => {
    io.to(`user_${data.recipientId}`).emit("new_message", data);
  });

  socket.on("disconnect", () => {
    if (String(process.env.DEBUG_SOCKET).toLowerCase() === "true") {
      console.log(`User disconnected: ${socket.id}`);
    }
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

module.exports = app;
