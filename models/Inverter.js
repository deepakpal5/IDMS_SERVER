const mongoose = require("mongoose");


const configurationSchema = new mongoose.Schema({
    Battery_Type: {
        type: String,
        default: "Li-ion",
        required: true
    },
    Grid_Charging: {
        type: Boolean,
        required: true
    },
    UPS_Mode: {
        type: Boolean,
        default: false,
         required: true

    },
    Solar_Mode: {
        type: Boolean,
        required: true,
        default: false
    },
    Battery_Connect: {
        type: Boolean,
        default: false,
         required: true

    }
});

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    longitude: {
        type: String,
        required: true
    },
    latitude: {
type: String,
        required: true
    },
  
});
const InverterSchema = new mongoose.Schema({

    inverterPointId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
      online: {
        type: Boolean,
        default: false
    },
    lastReason:{
        type: String,
        default: ""
    },
    enabled: {
        type: Boolean,
        default: true
    },
    owner : String,
    model: String,
    hw_version: String,
    fw_version: String,
    // lastTelemetry: Date,
    location: {
    type: [locationSchema],
    default: []
},
telemetryInterval: {
    type: Number,
    default: 300
},


 configurations: {
    type: [configurationSchema],
    default: []
},
bootTime: Date,

}, {

    timestamps: true,

    versionKey: false

});

module.exports = mongoose.model(
    "Inverters",
    InverterSchema
);