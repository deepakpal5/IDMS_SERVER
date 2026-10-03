
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: [
            "Super Admin",
            "Admin",
            "Supplier",
            "User"
        ],
        default: "User"
    },
    lead: {
        type: String,
    },


    status: {
        type: String,
        enum: [
            "active",
            "blocked"
        ],
        default: "active"
    },


    phone: {
        type: String,
        default: ""
    },

    avatar: {
        type: String,
        default: ""
    },

    lastLogin: {
        type: Date,
        default: null
    },
    resetPasswordToken: {
    type: String,
    default: null
},

resetPasswordExpires: {
    type: Date,
    default: null
}

},
{
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model("User", UserSchema)
