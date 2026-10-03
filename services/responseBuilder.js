const { v4: uuidv4 } = require("uuid");
const ErrorCode = require("../utils/errorCodes");
class ResponseBuilder {

    /**
     * Create OCPP CALL Message
     * [2, uniqueId, action, payload]
     */
   createCall(action, payload = {}) {

    const uniqueId = uuidv4();

    return {

        uniqueId,

        frame: [

            "A",

            uniqueId,

            action,

            payload

        ]

    };

}

    /**
     * Create CALLRESULT
     * [3, uniqueId, payload]
     */
    createCallResult(uniqueId, payload = {}, action) {

        return [
            "R",
            uniqueId,
            action+"Response",
            payload
        ];

    }

    /**
     * Create CALLERROR
     * [4, uniqueId, errorCode, errorDescription, errorDetails]
     */
    createCallError(
        uniqueId,
        errorCode = "InternalError",
        errorDescription = "Unknown Error",
        errorDetails = {}
    ) {

        return [
            4,
            uniqueId,
            errorCode,
            errorDescription,
            errorDetails
        ];

    }

}

module.exports = new ResponseBuilder();