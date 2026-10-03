const roleMiddleware = (...roles) => {

    return (req, res, next) => {

        // Authentication middleware should run first
        if (!req.user) {

            return res.status(401).json({

                success: false,
                message: "Unauthorized."

            });

        }

        // Check if user's role is allowed
        if (!roles.includes(req.user.role)) {

            return res.status(403).json({

                success: false,
                message: "You do not have permission to perform this action."

            });

        }

        next();

    };

};

module.exports = roleMiddleware;