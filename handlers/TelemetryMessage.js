const InverterService = require("../services/inverterService");
const Inverter = require("../models/Inverter");

class TeleMetryNotification {

    async execute(context) {
        // console.log("BootNotification.execute() called with context:", context);

        const {

            IdmsPointId,

            payload,
uniqueId
        } = context;

        //------------------------------------------------
        // Update Charger Information
        //------------------------------------------------

        await InverterService.updateTelemetryInformation(

            IdmsPointId,

            payload,
uniqueId
        );
    
const inverter = await Inverter.findOne({
    inverterPointId: IdmsPointId
}).lean();

const nextInterval = inverter?.telemetryInterval || 30;
 



        return {

            

            next_interval: nextInterval

        };

    }

}

module.exports = new TeleMetryNotification();