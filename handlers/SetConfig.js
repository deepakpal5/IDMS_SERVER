const InverterService = require("../services/inverterService");

class BootNotification {

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

        await InverterService.updateConfigInformation(

            IdmsPointId,

            payload,
uniqueId
        );




    
       return {
             status: "Accepted",

        };

    }

}

module.exports = new BootNotification();