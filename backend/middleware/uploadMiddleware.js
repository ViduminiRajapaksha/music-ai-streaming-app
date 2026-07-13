const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureUploadDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

// Configure storage for profile images
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/profiles/";
    ensureUploadDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for audio files
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/audio/";
    ensureUploadDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "audio-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for cover images
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/covers/";
    ensureUploadDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "cover-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// File filter for audio
const audioFilter = (req, file, cb) => {
  const allowedTypes = /mp3|wav|m4a|ogg|flac/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith("audio/");

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed (mp3, wav, m4a, ogg, flac)"));
  }
};

const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFilter
});

const audioUpload = multer({
  storage: audioStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: audioFilter
});

const coverUpload = multer({
  storage: coverStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: imageFilter
});

module.exports = {
  profileUpload,
  audioUpload,
  coverUpload
};
