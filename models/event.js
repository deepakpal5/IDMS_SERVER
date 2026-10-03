const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
{
        inverterPointId: {
            type: String,
            required: true,
             index: true
        },

        payload: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
           
        },

        MSG_ID: {
            type: Number,
            required: true,
             index: true
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

module.exports = mongoose.model("InverterEvent", EventSchema);