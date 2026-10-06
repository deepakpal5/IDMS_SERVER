const WebSocket = require("ws");
const url = require("url");


// const databaseService = require("../services/databaseService");
const responseBuilder = require("../services/responseBuilder");
const messageProcessor = require("../services/messageProcessor");
const InverterService = require("../services/inverterService");
const pendingRequestManager = require("../services/pendingRequestManager");
const inverterManager = require("../services/inverterManager");
const schemaValidator = require("../services/schemaValidator");

class IdmsServer {

 

    constructor(server) {

    this.wss = new WebSocket.Server({
        noServer: true
    });


    this.initialize();

    this.startOfflineChecker();
}
    //-------------------------------------------------------

    initialize() {

        this.wss.on("connection",

            (ws, request) => {
                this.onConnection(ws, request);
            });

        console.log("IDMS WebSocket Server Started");

    }










// handleUpgrade(request, socket, head) {

//     this.wss.handleUpgrade(

//         request,

//         socket,

//         head,

//         (ws) => {

//             this.wss.emit(

//                 "connection",

//                 ws,

//                 request

//             );

//         }

//     );

// }





async handleUpgrade(request, socket, head) {
        try {
            const pathname = url.parse(request.url).pathname;
            const IdmsPointId = pathname.split("/").pop();

            console.log(`Incoming connection attempt: ${IdmsPointId}`);

            // 1. Check authorization BEFORE upgrade
            const inverter = await InverterService.isAllowed(IdmsPointId);
            
            if (!inverter) {
                console.log(`❌ Unauthorized Inverter (Rejected at Handshake) : ${IdmsPointId}`);
                
                // 2. Reject the HTTP request and destroy the socket
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            // 3. Store the ID in the request so onConnection doesn't have to parse it again
            request.IdmsPointId = IdmsPointId;

            // 4. Upgrade the connection to a WebSocket
            this.wss.handleUpgrade(request, socket, head, (ws) => {
                this.wss.emit("connection", ws, request);
            });

        } catch (error) {
            console.error("Error during WebSocket upgrade:", error);
            socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
            socket.destroy();
        }
    }



    //-------------------------------------------------------

    async onConnection(ws, request) {



const IdmsPointId = request.IdmsPointId;


inverterManager.register(IdmsPointId,ws);
await InverterService.setOnline(

    IdmsPointId

);
console.log(

    `✅ Authorized Charger  and Connected : ${IdmsPointId}`

);




        
        ws.on(

            "message",

            async (message) => {
                // console.log(

                //     `Received from ${IdmsPointId}: ${message}`
                // );

                await this.onMessage(

                    ws,

                    IdmsPointId,

                    message

                );

                inverterManager.updateLastSeen(

    IdmsPointId

);



            }

        );

       ws.on("close", async (code , reason) => {


        const reasonStr = reason ? reason.toString() : "No reason provided";
            
         console.log(`Disconnected : ${IdmsPointId} | Code: ${code} | Reason: ${reasonStr}`);
        const closeConnection = `${code}:${reasonStr}`;

    const inverter = inverterManager.getInverter(IdmsPointId);

    // This socket is no longer the active socket
    if (!inverter || inverter.ws !== ws) {

        console.log(
            `Ignoring close from old socket : ${IdmsPointId}`
        );

        return;
    }

    inverterManager.unregister(
        IdmsPointId,
       ws
    );

    await InverterService.setOffline(
        IdmsPointId,closeConnection
    );

});

        ws.on(

            "error",

            (err) => {

                console.log(err);

            }

        );

    }

    //-------------------------------------------------------

    async onMessage(
        ws,
        IdmsPointId,
        message
    ) {

        try {

            const frame = JSON.parse(message);

            
      if (!Array.isArray(frame)) {
console.log("Ignoring non array frame \r\n");

const errorFrame = responseBuilder.createCallError(
    "",
    "FormationViolation",
    "Frame must be array"
);


console.log(`Response [IDMS -> Inverter] :  ${JSON.stringify(errorFrame)}\r\n`);
                ws.send(
                    JSON.stringify(

                        errorFrame

                    )

                );

                return;

            }

            //----------------------------------

        const messageType = frame[0];



// ===============Response================

            if (messageType === "R") {
                console.log(`Response [Inverter -> IDMS] :  ${JSON.stringify(frame)}\r\n`);

    await this.onCallResult(

        ws,

        IdmsPointId,

        frame

    );

 

    return;

}


//=================Error=====================
if (messageType === "E") {

    await this.onCallError(

        ws,

        IdmsPointId,

        frame

    );

    return;

}
// ======================RestCall===========================
if (messageType !== "A") {

                console.log(

                    "Ignoring non CALL"

                );

                return;

            }

        
            //----------------------------------
            const uniqueId = frame[1];
            const action = frame[2];
            const payload = frame[3];
            console.log(`Request  [Inverter -> IDMS] :  ${JSON.stringify(frame)}`);
         const validation = schemaValidator.validateRequest(action,payload);
           if (!validation.valid) {
                const errorFrame = responseBuilder.createCallError(uniqueId,
                            "FormationViolation",
                            "Schema Validation Failed",
                            validation.errors
                        );
                        console.log(`Response [CMS -> Charger] : ${JSON.stringify(errorFrame)}\r\n`);
                ws.send(
                    JSON.stringify(
                        errorFrame

                    )

                );

                return;

            }

           const responseFrame = await messageProcessor.process({action,uniqueId,payload,IdmsPointId});   
           


const responseAction = responseFrame[2];
const responsePayload = responseFrame[3];

const  responseValidation = schemaValidator.validateResponse(responseAction, responsePayload);

 if (!responseValidation.valid) {
const errorFrame = responseBuilder.createCallError(uniqueId,
                            "FormationViolation",
                            "Schema Validation Failed",
                            responseValidation.errors
                        );

console.log(`Response Failed Frame : ${IdmsPointId} : ${JSON.stringify(errorFrame)}\r\n`);
                ws.send(
                    JSON.stringify(
                       errorFrame

                    )

                );

                return;

            }
    
           console.log(`Response [IDMS -> Inverter] : ${JSON.stringify(responseFrame)}\r\n`);



 ws.send(JSON.stringify(responseFrame));






// After successful BootNotification response
if (responseAction === "BootMessageResponse") {
    const action = "GetConfig";
    const result = inverterManager.sendCall(IdmsPointId,action);
// console.log("dash server 85");
const timeout = setTimeout(() => {
    const request = pendingRequestManager.get(result.uniqueId);
    if (!request)
        return;
    console.log(
        `⌛ ${request.action} Timeout`

    );
    pendingRequestManager.remove(
        result.uniqueId
    );
},5000);
pendingRequestManager.add(
    result.uniqueId,
    {
        dashboardWs: ws,
        IdmsPointId,
        action,
        timeout,
        createdAt: new Date()
    }

);
}












        }

        catch (error) {

            console.log(error);

        }
    
    }

async generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

   async onCallResult(ws, IdmsPointId, frame) {

    const uniqueId = frame[1];
    const ReceivedAction = frame[2];
    const payload = frame[3];

    // console.log(

    //     `CALL RESULT : ${IdmsPointId} : ${uniqueId}`

    // );

    //-----------------------------------------

    const request = pendingRequestManager.get(uniqueId);

    if (!request) {

        console.log(

            "Pending request not found."

        );

        return;

    }

//  console.log( `request : ${request} `);

    //-----------------------------------------
const action = request.action;
//  console.log( `action : ${action} `);
//   console.log( `ReceivedAction : ${ReceivedAction} `);

const testAction = action+"Response";
if( testAction != ReceivedAction) return;

 const responseValidation = schemaValidator.validateResponse(ReceivedAction, payload);
    pendingRequestManager.remove(uniqueId);
// console.log( `responseValidation : ${responseValidation} `);

if (responseValidation.valid) {
    await messageProcessor.process({action,uniqueId,payload,IdmsPointId});

    
}

}

   








async onCallError(ws, chargePointId, frame) {

    const uniqueId = frame[1];

    const errorCode = frame[2];

    const errorDescription = frame[3];

    const errorDetails = frame[4];

    // console.log(

    //     `CALL ERROR : ${chargePointId} : ${uniqueId}`

    // );

    //-----------------------------------------

    const request = pendingRequestManager.get(uniqueId);

    if (!request) {

        console.log(

            "Pending request not found."

        );

        return;

    }

    //-----------------------------------------


    //-----------------------------------------

    pendingRequestManager.remove(uniqueId);
 

} 




//-------------------------------------------------------
// Offline Checker
//-------------------------------------------------------

startOfflineChecker() {

    setInterval(async () => {

        const now = Date.now();

        for (const [IdmsPointId, inverter] of inverterManager.inverters) {

            const diff = now - inverter.lastSeen;
            const interval = inverter.telemetryInterval;
            // console.log(`Last Seen for ${IdmsPointId}: ${diff / 1000} seconds ago`);

            if (diff >  3*interval * 1000) {

                console.log(`⚠ ${IdmsPointId} Offline Due to time out`);

                await InverterService.setOffline(IdmsPointId);

                if (inverter.ws.readyState === WebSocket.OPEN  || inverter.ws.readyState === WebSocket.CONNECTING) {inverter.ws.terminate();}

          

            }

        }

    }, 30000);

}
}

module.exports = IdmsServer;