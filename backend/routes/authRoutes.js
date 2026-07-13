const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");
const { profileUpload } = require("../middleware/uploadMiddleware");
const {
    registerRules,
    loginRules,
    updateProfileRules,
    changePasswordRules
} = require("../validators/authValidator");
const {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    uploadProfileImage
} = require("../controllers/authController");

router.post("/register", authLimiter, validate(registerRules), register);
router.post("/login", authLimiter, validate(loginRules), login);
router.post("/logout", authMiddleware, logout);

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, validate(updateProfileRules), updateProfile);
router.post("/profile/image", authMiddleware, profileUpload.single("profileImage"), uploadProfileImage);
router.put("/change-password", authMiddleware, validate(changePasswordRules), changePassword);
router.delete("/delete-account", authMiddleware, deleteAccount);

module.exports = router;
