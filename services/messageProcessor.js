const fs = require("fs");
const path = require("path");

const responseBuilder = require("./responseBuilder");

class MessageProcessor {

    constructor() {

        this.handlers = {};

        this.loadHandlers();

    }

    //-------------------------------------------------
    // Load all handlers automatically
    //-------------------------------------------------

    loadHandlers() {

        const handlersPath = path.join(__dirname, "../handlers");

        const files = fs.readdirSync(handlersPath);

        files.forEach(file => {

            if (!file.endsWith(".js"))
                return;

            const handlerName = path.basename(file, ".js");

            this.handlers[handlerName] =
                require(path.join(handlersPath, file));

            console.log(`Loaded Handler : ${handlerName}`);

        });

    }

    //-------------------------------------------------
    // Process OCPP Message
    //-------------------------------------------------

    async process(context) {

    // console.log(
    //     "MessageProcessor.process() called with context:",
    //     context
    // );
const {action,uniqueId} = context;
    try {

        
        const handler = this.handlers[action];

         if (!handler) {

                return responseBuilder.createCallError(

                    uniqueId,

                    "NotImplemented",

                    `${action} is not implemented`

                );

            }
        // Exe
        // cute handler
        const responsePayload = await handler.execute(context);

return responseBuilder.createCallResult(uniqueId,responsePayload,action);




       
    }
    catch (error) {

         console.error(error);

            return responseBuilder.createCallError(

                uniqueId,

                "InternalError",

                error.message

            );
    }
}

}

module.exports = new MessageProcessor();