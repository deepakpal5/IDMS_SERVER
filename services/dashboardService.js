const mongoose = require("mongoose");
const Inverter = require("../models/Inverter");
const Telemetry = require("../models/Telemetry");
const bootInverter = require("../models/boot");
const Config = require("../models/Config");
const EventInverter = require("../models/event");
const User = require("../models/User");
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


       


        await this.sendConnected(ws);
        // await this.keepLatest500PerInverter(Telemetry);
        // await this.keepLatest500PerInverter(EventInverter);
        // await this.keepLatest500PerInverter(Config);
        // await this.keepLatest500PerInverter(bootInverter);

        // await this.sendSnapshot(ws);

    }

    //------------------------------------------------

    unregister(ws) {

        this.clients.delete(ws);

        console.log("📊 Dashboard Disconnected");

    }





async sendConnected(ws){
 ws.send(

    JSON.stringify({

        event: "connected",

        data: {}

    })

);
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

    async sendSnapshot(ws,user) {

let filter = {};

if (user.role === "Super Admin") {

    // See all inverters
    filter = {};

} else if (user.role === "Admin") {

    // See all inverters
    filter = {};

} else if (user.role === "Supplier") {



const users = await User.find({
        role: "User",
        lead: user.id
    })
            .select("-password")
            .sort({ createdAt: -1 });







    // Supplier + Supplier's Users
    const ownerIds = [
        new mongoose.Types.ObjectId(user.id),
        ...users.map(u => u._id)
    ];

 

    filter = {
        owner: {
            $in: ownerIds
        }
    };

} else if (user.role === "User") {

    filter = {
        owner: new mongoose.Types.ObjectId(user.id)
    };

}







const inverters = await Inverter
    .find(filter)
    .sort({ inverterPointId: 1 })
    .lean();




const inverterPointIds = inverters.map(
    inverter => inverter.inverterPointId
);
filter = {
         inverterPointId: {
            $in: inverterPointIds
        }
    };





const Boot = await bootInverter
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();


const configuration = await Config
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();







const telemetry = await Telemetry
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

const event = await EventInverter
    .find(filter)
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