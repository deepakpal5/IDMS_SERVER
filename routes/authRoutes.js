const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Login
router.post("/login", authController.login);

// Logout
router.post("/logout", authMiddleware, authController.logout);

// Logged-in User Profile
router.get("/profile", authMiddleware, authController.profile);

router.put(
    "/profile",
    authMiddleware,
    authController.updateProfile
);

// Change Password
router.put(
    "/change-password",
    authMiddleware,
    authController.changePassword
);
router.post(

    "/forgot-password",

    authController.forgotPassword

);

router.post(
    "/reset-password",
    authController.resetPassword
);
module.exports = router;