const mongoose = require("mongoose");
const Inverter = require("../models/Inverter");
async function connectDB() {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");
        //  await setAllInvertersOffline();

    }
    catch(err){

        console.log(err);

        process.exit(1);

    }

}


async function setAllInvertersOffline() {
    try {
        const result = await Inverter.updateMany(
            {},
            {
                $set: {
                    online: false
                }
            }
        );

        console.log(
            `Server startup: ${result.modifiedCount} inverters set to OFFLINE`
        );

    } catch (error) {
        console.error(
            "Failed to set inverters offline:",
            error
        );
    }
}


module.exports = connectDB;