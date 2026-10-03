const mongoose = require("mongoose");

const TelemetrySchema = new mongoose.Schema(
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

module.exports = mongoose.model("InverterTelemetry", TelemetrySchema);