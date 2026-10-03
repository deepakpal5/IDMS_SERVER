const responseBuilder = require("./responseBuilder");
const schemaValidator = require("./schemaValidator");
const WebSocket = require("ws");
class InverterManager {

    constructor() {

        // inverterId -> WebSocket
        this.inverters = new Map();

    }

    //---------------------------------------------------
    // Register Inverter
    //---------------------------------------------------

    register(inverterId, ws) {
const existing = this.inverters.get(inverterId);


  if (existing && existing.ws !== ws) {

        console.log(
            `⚠️ Replacing existing connection: ${inverterId}`
        );

        try {
            existing.ws.close(
                1000,
                "New connection established"
            );
        } catch (err) {
            console.error(err);
        }
    }




        this.inverters.set(inverterId, {
            ws,

    connectedAt: new Date(),

    lastSeen: new Date(),

    status: "Online"

        });

       

    }

    //---------------------------------------------------
    // Remove Inverter
    //---------------------------------------------------

    unregister(inverterId,ws) {

        

        // console.log(`❌ Inverter Disconnected : ${inverterId}`);

        const inverter = this.inverters.get(inverterId);
        console.log(
        `❌ unregister(${inverterId})`,
        inverter
            ? {
                connectedAt: inverter.connectedAt,
                lastSeen: inverter.lastSeen,
                status: inverter.status
            }
            : "NOT FOUND"
    );



    // Ignore close event from an old connection
    if (inverter.ws !== ws) {
        console.log(
            `⚠️ Ignoring stale disconnect for ${inverterId}`
        );

        return;
    }

    this.inverters.delete(inverterId);

    console.log(
        `❌ inverter Disconnected : ${inverterId}`
    );
    console.log(
        `Remaining chargers:`,
        [...this.inverters.keys()]
    );

    }




    // ---------------------------------------------------
    // Disconnect Inverter
    // ---------------------------------------------------

    disconnect(inverterId, code = 1008, reason = "Disconnected") {

    const inverter = this.inverters.get(inverterId);

    if (!inverter)
        return;

    inverter.ws.close(code, reason);

}


//---------------------------------------------------
    // Is Online
    //---------------------------------------------------

    isOnline(inverterId) {

        // return this.inverters.has(inverterId);
// console.log("inverterId :", inverterId );

          const id = String(inverterId).trim();

    const inverter = this.inverters.get(id);

    if (!inverter) {

        console.log("❌ Inverter NOT FOUND:", id);

        console.log(
            "Registered inverters:",
            [...this.inverters.keys()]
        );

        return false;
    }

    // console.log("🔍 Inverter found:", id);

    // console.log("WebSocket state:", {
    //     readyState: inverter.ws.readyState,
    //     OPEN: WebSocket.OPEN,
    //     status: inverter.status,
    //     lastSeen: inverter.lastSeen
    // });

    return inverter.ws.readyState === WebSocket.OPEN;

    }

    //---------------------------------------------------
    // Update Last Seen
    //---------------------------------------------------

    updateLastSeen(inverterId) {

        const inverter = this.inverters.get(inverterId);

        if (!inverter)
            return;

        inverter.lastSeen = new Date();

    }



    //---------------------------------------------------
    // Get WebSocket
    //---------------------------------------------------

    getSocket(inverterId) {

        const inverter = this.inverters.get(inverterId);

        if (!inverter)
            return null;

        return inverter.ws;

    }
    
 

    //---------------------------------------------------
    // Get Inverter Info
    //---------------------------------------------------

    getInverter(inverterId) {

        return this.inverters.get(inverterId);

    }


    //---------------------------------------------------
    // Get All Inverters
    //---------------------------------------------------

    getAllInverters() {

        return [...this.inverters.keys()];

    }

    
    //---------------------------------------------------
    // Send OCPP CALL
    //---------------------------------------------------

    sendCall(inverterId, action, payload = {}) {

    const inverter = this.inverters.get(inverterId);

    if (!inverter) {
        return {
            success: false,
            error: "InverterOffline"
        };
    }

     const validation = schemaValidator.validateRequest(action,payload);

if (!validation.valid) {

        console.error(

            `Invalid ${action} Request`,

            validation.errors

        );

        return {

            success: false,

            error: "FormationViolation",

            details: validation.errors

        };

    }

      const result = responseBuilder.createCall(

    action,

    payload

);

    try {

        inverter.ws.send(
            JSON.stringify(result.frame)
        );

        console.log(
            `Request [IDMS -> Inverter] : ${JSON.stringify(result.frame)}`
        );

        return {
            success: true,

    uniqueId: result.uniqueId,

    frame: result.frame
        };

    } catch (error) {

        console.error(
            `Failed to send request to ${inverterId}:`,
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}

    //---------------------------------------------------
    // Send Raw Frame
    //---------------------------------------------------

    sendFrame(inverterId, frame) {

        const inverter = this.inverters.get(inverterId);

        if (!inverter)
            return false;

        inverter.ws.send(
            JSON.stringify(frame)
        );

        return true;

    }

       

    


    //---------------------------------------------------
    // Broadcast
    //---------------------------------------------------

    broadcast(frame) {

        this.inverters.forEach(inverter => {

            inverter.ws.send(
                JSON.stringify(frame)
            );

        });

    }

    //---------------------------------------------------
    // Total Inverters
    //---------------------------------------------------

    totalOnline() {

        return this.inverters.size;

    }


    

}

module.exports = new InverterManager();