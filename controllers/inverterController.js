const inverter = require("../models/Inverter");
const User = require("../models/User");
const dashboardService = require("../services/dashboardService");

exports.createInverter = async (req, res) => {
    try {

        const {
            inverterPointId,
            enabled,
            owner,
            model,
            location,
            telemetryInterval,
        } = req.body;

        const exist = await inverter.findOne({ inverterPointId });

        if (exist) {
            return res.status(400).json({
                success: false,
                message: "Inverter ID already exists."
            });
        }

        const inverterPoint = await inverter.create({

            inverterPointId,
online: false,
            enabled,
 owner,

            model,

            hw_version: "1.0.0",

            fw_version: "1.0.0",

            location,
 telemetryInterval,
            

            bootTime: new Date(),


           
        });

        res.status(201).json({
            success: true,
            message: "Charge Point created successfully.",
            data: inverterPoint
        });



        dashboardService.publish(
            "chargerUpdated",
            inverterPoint
        );
    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
