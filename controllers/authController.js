const User = require("../models/User");

const { comparePassword, hashPassword } = require("../utils/password");

const { generateToken } = require("../utils/jwt");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Validate Input
        if (!email || !password) {

            return res.status(400).json({

                success: false,
                message: "Email and Password are required."

            });

        }

        // Find User
        const user = await User.findOne({

            email: email.toLowerCase()

        });

        if (!user) {

            return res.status(401).json({

                success: false,
                message: "Invalid email or password."

            });

        }

        // Check Account Status
        if (user.status === "blocked") {

            return res.status(403).json({

                success: false,
                message: "Your account has been blocked."

            });

        }

        // Verify Password
        const match = await comparePassword(

            password,

            user.password

        );

        if (!match) {

            return res.status(401).json({

                success: false,
                message: "Invalid email or password."

            });

        }

        // Update Last Login
        user.lastLogin = new Date();

        await user.save();

        // Generate JWT
        const token = generateToken(user);

        // Response
        res.json({

            success: true,

            message: "Login successful.",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role,
                phone: user.phone,

                avatar: user.avatar,

                status: user.status

            }

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Internal Server Error."

        });

    }

};

exports.forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        const user = await User.findOne({

            email: email.toLowerCase()

        });

        if (!user) {

            return res.json({

                success: true,

                message:
                    "If the account exists, a reset link has been sent."

            });

        }

        const token = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = token;

        user.resetPasswordExpires =

            Date.now() + 15 * 60 * 1000;

        await user.save();

        const url =

            `${process.env.FRONTEND_URL}/reset-password/${token}`;

        await sendEmail(

            user.email,

            "Reset Your Password",

            `
            <h2>EmbedTechnolozix CMS</h2>

            <p>Click the link below to reset your password.</p>

            <a href="${url}">

                Reset Password

            </a>

            <p>This link expires in 15 minutes.</p>
            `
        );

        res.json({

            success: true,

            message:
                "If the account exists, a reset link has been sent."

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: "Internal Server Error."

        });

    }

};

/**
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {

    try {

        const {

            token,
            password

        } = req.body;

        if (!token || !password) {

            return res.status(400).json({

                success: false,

                message: "Token and password are required."

            });

        }

        if (password.length < 8) {

            return res.status(400).json({

                success: false,

                message: "Password must be at least 8 characters."

            });

        }

        const user = await User.findOne({

            resetPasswordToken: token,

            resetPasswordExpires: {

                $gt: new Date()

            }

        });

        if (!user) {

            return res.status(400).json({

                success: false,

                message: "Invalid or expired reset token."

            });

        }

        // Hash new password
        user.password = await hashPassword(password);

        // Clear reset token
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.json({

            success: true,

            message: "Password reset successfully."

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Internal Server Error."

        });

    }

};
/**
 * GET /api/auth/profile
 */
exports.profile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)

            .select("-password");

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        res.json({

            success: true,

            user

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: "Internal Server Error."

        });

    }

};


/**
 * PUT /api/auth/change-password
 */
exports.changePassword = async (req, res) => {

    try {

        const {

            oldPassword,

            newPassword

        } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        const valid = await comparePassword(

            oldPassword,

            user.password

        );

        if (!valid) {

            return res.status(400).json({

                success: false,

                message: "Old password is incorrect."

            });

        }

        user.password = await hashPassword(newPassword);

        await user.save();

        res.json({

            success: true,

            message: "Password changed successfully."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: "Internal Server Error."

        });

    }

};


/**
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {

    res.json({

        success: true,

        message: "Logout successful."

    });

};

/**
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {

    try {

        const {

            name,
            phone

        } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User not found."

            });

        }

        // Update only allowed fields
        if (name !== undefined)
            user.name = name.trim();

        if (phone !== undefined)
            user.phone = phone.trim();

        await user.save();

        res.json({

            success: true,

            message: "Profile updated successfully.",

            user: {

                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
                status: user.status

            }

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Internal Server Error."

        });

    }

};