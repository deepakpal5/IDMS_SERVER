const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const { hashPassword } = require("../utils/password");

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const existing = await User.findOne({
            email: "supplier@idms.com"
        });

        if (existing) {
            console.log("Admin already exists.");
            process.exit(0);
        }

        const admin = new User({
            name: "User D",
            email: "userd@idms.com",
            password: await hashPassword("Userd@123"),
            role: "User",
            status: "active",
            lead : "6a86b44d3f9ba848df25fe21"
        });

        await admin.save();

        console.log("User created successfully.");
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedAdmin();