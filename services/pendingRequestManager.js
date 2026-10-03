class PendingRequestManager {

    constructor() {

        this.requests = new Map();

    }

    //---------------------------------------------------

    add(uniqueId, request) {

        // console.log(`trying ot update ${uniqueId} and ${request}`)
        this.requests.set(uniqueId, request);

    }

    //---------------------------------------------------

    get(uniqueId) {

        // console.log(`uniqid is : ${uniqueId}`)
        // console.log(this.requests);
        return this.requests.get(uniqueId);

    }

    //---------------------------------------------------

    remove(uniqueId) {

        // console.log(`remove id : ${uniqueId}`)

        const request = this.requests.get(uniqueId);

        if (!request)
            return;

        if (request.timeout)

            clearTimeout(request.timeout);

        this.requests.delete(uniqueId);

    }

    //---------------------------------------------------

    has(uniqueId) {

        return this.requests.has(uniqueId);

    }

    //---------------------------------------------------

    total() {

        return this.requests.size;

    }

}

module.exports = new PendingRequestManager();