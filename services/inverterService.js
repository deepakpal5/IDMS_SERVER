const Inverter = require("../models/Inverter");
const inverterBoot = require("../models/boot");
const inverterTelemetry = require("../models/Telemetry");
const inverterEvent = require("../models/event");
const inverterConfig = require("../models/Config");
const dashboardService = require("./dashboardService");



class InverterService {

    //------------------------------------------------
    // Find by Inverter Point ID
    //------------------------------------------------

    async findByChargePointId(inverterPointId) {

        return await inverter.findOne({
            inverterPointId
        });

    }

    //------------------------------------------------
    // Is charger allowed?
    //------------------------------------------------

    async isAllowed(inverterPointId) {

        return await Inverter.findOne({

            inverterPointId,

            enabled: true

        });

    }

    //------------------------------------------------
    // Create Charger (Admin API)
    //------------------------------------------------

    async create(data) {

        return await Inverter.create(data);

    }




async updateConfigInformation(inverterPointId, payload, uniqueId) {


    // console.log("78====================");
const inverter = await inverterConfig.create({
        inverterPointId: inverterPointId,
        payload: payload,
        MSG_ID: uniqueId
    });
dashboardService.publish("ConfigurationUpdated", inverter); 

await Inverter.findOneAndUpdate(

        {inverterPointId },

        {
           

             $set: {
            configurations: payload,
            online: true,
        }
        },
        {
            returnDocument: "after"
        }

    );

   
}

async updateTelemetryInformation(inverterPointId, payload, uniqueId) {

    const inverter = await inverterTelemetry.create({
        inverterPointId: inverterPointId,
        payload: payload,
        MSG_ID: uniqueId
    });
dashboardService.publish("telemetryUpdated", inverter); 
await Inverter.findOneAndUpdate(
        {inverterPointId },
        {
             $set: {
            online: true,
        }
        },
        {
            returnDocument: "after"
        }

    );
}
async updateEventInformation(inverterPointId, payload, uniqueId) {

    const inverter = await inverterEvent.create({
        inverterPointId: inverterPointId,
        payload: payload,
        MSG_ID: uniqueId
    });
dashboardService.publish("EventUpdated", inverter); 
await Inverter.findOneAndUpdate(
        {inverterPointId },
        {
             $set: {
            online: true,
        }
        },
        {
            returnDocument: "after"
        }

    );
}
async updateBootInformation(inverterPointId, payload, uniqueId) {

    const inverter = await inverterBoot.create({
        inverterPointId: inverterPointId,
        payload: payload,
        MSG_ID: uniqueId
    });
dashboardService.publish("bootUpdated", inverter);
    

 const inverterNew = await Inverter.findOneAndUpdate(

        {inverterPointId },

        {
            
            $set: {
                model: payload.device_model,
                fw_version: payload.fw_version,
                hw_version: payload.hw_version,
                online: true,
                bootTime: new Date()
            }
        },
        {
            returnDocument: "after"
        }

    ).lean();

    dashboardService.publish("inverterUpdated", inverterNew);



}

async updateInterval(inverterPointId, payload){

// console.log("inter : ",payload["interval"]);


await Inverter.findOneAndUpdate(
        {inverterPointId },
        {
             $set: {
            telemetryInterval: payload["interval"],
        }
        },
        {
            returnDocument: "after"
        }

    );



}
 








    //------------------------------------------------
    // Update Heartbeat
    //------------------------------------------------



    //------------------------------------------------
    // Update Connector Status
    //------------------------------------------------

    //------------------------------------------------
    // Set Online
    //------------------------------------------------

    async setOnline(inverterPointId) {

    await Inverter.updateOne(
        { inverterPointId },
        {
            online: true,
            lastSeen: new Date()
        }
    );

    const inverter = await Inverter.findOne({
        inverterPointId
    }).lean();

    dashboardService.publish("inverterUpdated", inverter);

    return inverter;
}

    //------------------------------------------------
    // Set Offline
    //------------------------------------------------

   async setOffline(inverterPointId, closeConnection) {

    await Inverter.updateOne(
        { inverterPointId },
        {
            online: false,
            lastReason: closeConnection,
        }
    );

    const inverter = await Inverter.findOne({
        inverterPointId
    }).lean();

    dashboardService.publish("inverterUpdated", inverter);

    return inverter;
}

    //------------------------------------------------
    // List Inverters
    //------------------------------------------------

    async getAll() {

        return await Inverter.find();

    }

    //------------------------------------------------
    // Delete Inverter
    //------------------------------------------------

    async delete(inverterPointId) {

        return await Inverter.deleteOne({
            inverterPointId
        });

    }

}

module.exports = new InverterService();