const InverterService = require("../services/inverterService");

class InverterEvent {

    async execute(context) {

        const {
            IdmsPointId,
            payload,
            uniqueId
        } = context;

        //------------------------------------------------
        // Update Charger Information
        //------------------------------------------------

        await InverterService.updateEventInformation(

            IdmsPointId,

            payload,
uniqueId
        );
    

 

        return {
             status: "Accepted",

        };

    }

}

module.exports = new InverterEvent();