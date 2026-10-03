const Inverter = require("../models/Inverter");
const Telemetry = require("../models/Telemetry");
const bootInverter = require("../models/boot");
const Config = require("../models/Config");
const EventInverter = require("../models/event");

class DashboardService {

    constructor() {

        this.clients = new Set();

    }

    //------------------------------------------------
    // Register Dashboard
    //------------------------------------------------

    async register(ws) {

        this.clients.add(ws);

        console.log("📊 Dashboard Connected");
        await this.keepLatest500PerInverter(Telemetry);
        await this.keepLatest500PerInverter(EventInverter);
        await this.keepLatest500PerInverter(Config);
        await this.keepLatest500PerInverter(bootInverter);

        await this.sendSnapshot(ws);

    }

    //------------------------------------------------

    unregister(ws) {

        this.clients.delete(ws);

        console.log("📊 Dashboard Disconnected");

    }













async  keepLatest500PerInverter(Model) {
    const inverterIds = await Model.distinct("inverterPointId");

    for (const inverterPointId of inverterIds) {

        const oldRecords = await Model
            .find({ inverterPointId })
            .sort({ createdAt: -1 })
            .skip(500)
            .select({ _id: 1 })
            .lean();

        if (oldRecords.length > 0) {
            await Model.deleteMany({
                _id: {
                    $in: oldRecords.map(doc => doc._id)
                }
            });

            console.log(
                `${Model.modelName}: deleted ${oldRecords.length} old records for ${inverterPointId}`
            );
        }
    }
}
    
    //------------------------------------------------

    async sendSnapshot(ws) {














const Boot = await bootInverter
    .find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();


const configuration = await Config
    .find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();


const inverters = await Inverter
    .find({})
    .sort({ inverterPointId: 1 })
    .lean();




const telemetry = await Telemetry
    .find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

const event = await EventInverter
    .find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

ws.send(

    JSON.stringify({

        event: "snapshot",

        data: {
Boot,
configuration,
            inverters,
            telemetry,
            event

        }

    })

);

    
    }



















    

    
    //------------------------------------------------

    publish(event, data) {

        const packet = JSON.stringify({

            event,

            data

        });

        this.clients.forEach(client => {

            if (client.readyState === 1) {

                client.send(packet);

            }

        });

    }

}

module.exports = new DashboardService();