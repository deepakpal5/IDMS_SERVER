const User = require("../models/User");
const inverter = require("../models/Inverter");
const { hashPassword } = require("../utils/password");
const dashboardService = require("../services/dashboardService");
/**
 * GET /api/users
 * Get All Users
 */
exports.getUsers = async (req, res) => {
   
    try {

       




    let filter = {};

    if (req.user.role === "Super Admin") {

        // See everyone
        filter = {};

    } else if (req.user.role === "Admin") {

        // See only own suppliers
         filter = {
        role: { $ne: "Super Admin" }
    };

    }

    else if (req.user.role === "Supplier") {

        // Supplier can only see himself
      filter = {
                $or: [
                    {
                        _id: req.user.id
                    },
                    {
                        lead: req.user.id
                    }
                ]
            };

    }
    else if (req.user.role === "User") {

        // Supplier can only see himself
        filter = {
            role:"User",
            _id: req.user.id.toString()
        };

    }









 const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({

            success: true,

            count: users.length,

            data: users

        });





    }

    catch (error) {
console.error("getUsers ERROR:", error);
    console.error("Stack:", error.stack);
        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/**
 * GET /api/users/:id
 * Get User By ID
 */
exports.getUser = async (req, res) => {

    try {

        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        res.json({

            success: true,

            data: user

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/**
 * POST /api/users
 * Create User
 */
exports.createUser = async (req, res) => {

    try {

        const {

            name,
            email,
            password,
            role,
            phone

        } = req.body;

        const exist = await User.findOne({

            email: email.toLowerCase()

        });

        if (exist) {

            return res.status(400).json({

                success: false,

                message: "Email already exists."

            });

        }

        const user = await User.create({

            name,

            email: email.toLowerCase(),

            password: await hashPassword(password),

            role,


            phone

        });

        res.status(201).json({

            success: true,

            message: "User created successfully.",

            data: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};





/**
 * DELETE /api/users/:id
 * Delete User
 */
exports.deleteUser = async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }


// Get all chargers first
const Inverter = await inverter.find({
    owner: user._id
}).lean();

// Get their IDs
const inverterPointIds = Inverter.map(cp => cp.inverterPointId);


// Delete charge points
await inverter.deleteMany({
    owner: user._id
});

// Notify dashboard that each charger was removed
Inverter.forEach(inverterPoint => {
    dashboardService.publish("chargerDeleted", {
        inverterPointId: inverterPoint.inverterPointId
    });
});


  // await user.deleteOne();
        res.json({

            success: true,

            message: "User and associated data removed successfully."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/**
 * PATCH /api/users/:id/status
 * Update User Status
 */
exports.changeStatus = async (req, res) => {

    try {

        const {

            status

        } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        user.status = status;

        // user.active = status === "active";

        await user.save();

// console.log(`User ${user.email} status changed to ${status}. Active: ${user.active}`);
        



if (status === "blocked") {

           await inverter.updateMany(
                { owner: user._id },
                {
                    $set: {
                        enabled: false
                    }
                }
            );

        }

        // If user becomes active again, enable all associated charge points
        if (status === "active") {

         await inverter.updateMany(
                { owner: user._id },
                {
                    $set: {
                        enabled: true
                    }
                }
            );
        }


        const chargers = await inverter.find({
    owner: user._id
}).lean();
Inverter.forEach(inverterPoint => {
    dashboardService.publish(
        "chargerUpdated",
        inverterPoint
    );
});
        


        res.json({

            success: true,

            message: "User status updated."

        });

    }

    catch (error) {
console.error("Error updating user status:", error);
        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};