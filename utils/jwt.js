const jwt = require("jsonwebtoken");

/**
 * Generate JWT Token
 */
function generateToken(user) {

    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES || "7d"
        }
    );

}

/**
 * Verify JWT Token
 */
function verifyToken(token) {

    return jwt.verify(token, process.env.JWT_SECRET);

}

module.exports = {
    generateToken,
    verifyToken
};