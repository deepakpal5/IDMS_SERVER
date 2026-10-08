const WebSocket = require("ws");

const dashboardService = require("../services/dashboardService");
const invertermgr = require("../services/inverterManager");
const pendingRequestManager = require("../services/pendingRequestManager");
// const databaseService = require("../services/databaseService");
const invServ = require("../services/inverterService");
class DashboardServer {

    constructor() {

        this.wss = new WebSocket.Server({

            noServer: true

        });

        this.initialize();

    }

    initialize() {

        this.wss.on("connection", async (ws) => {

            await dashboardService.register(ws);




            ws.on("message", async (message) => {
                try{

                    const packet = JSON.parse(message);


                    

      

        const {

            inverterId,
            action,
           payload

        } = packet;

        console.log(`inverterId  ${inverterId}`);
        console.log(`action  ${action}`);
        console.log(`payload  ${payload}`);

        if (!inverterId &&  action === "SendSnapshot") {
           dashboardService.sendSnapshot(ws,payload);
            return;
        }






        if(action==="SET_INTERVAL"){
          await  invServ.updateInterval(inverterId,payload);
          return;
        }

        if (!invertermgr.isOnline(inverterId)) {


          

            ws.send(
                JSON.stringify({
                    event: "sendMessageEvent",
            error: "Offline",
            details: `${inverterId} is Offline`
                })
            );
            return;
        }


        const result = invertermgr.sendCall(

    inverterId,

    action,

    payload

);
// console.log("dash server 85");
if (!result.success) {

    ws.send(

        JSON.stringify({

            event: "sendMessageEvent",

            error: result.error,

            details: result.details || []

        })

    );

    return;

}







const timeout = setTimeout(() => {

    const request = pendingRequestManager.get(result.uniqueId);

    if (!request)
        return;

    console.log(

        `⌛ ${request.action} Timeout`

    );

    request.dashboardWs.send(

        JSON.stringify({
            event: "sendMessageEvent",

            error: 'TimeOut',
details: `No response received from Inverter id ${inverterId} within the expected time frame,Message ID: ${result.uniqueId}`
          


        })

    );

    pendingRequestManager.remove(

        result.uniqueId

    );

},15000);


pendingRequestManager.add(

    result.uniqueId,

    {

        dashboardWs: ws,

        inverterId,

        action,

        timeout,

        createdAt: new Date()

    }

);

ws.send(

    JSON.stringify({

       event: "sendMessageEvent",
            error: '',

            details: `  Message sent to inverter id ${inverterId}`


    })

);

                }
                catch (err) {

        console.error(err);

    }
});

            ws.on("close", () => {

                dashboardService.unregister( ws);

            });


        });

    }

    handleUpgrade(request, socket, head) {

        this.wss.handleUpgrade(

            request,

            socket,

            head,

            (ws) => {

                this.wss.emit(

                    "connection",

                    ws,

                    request

                );

            }

        );

    }

}

module.exports = DashboardServer;