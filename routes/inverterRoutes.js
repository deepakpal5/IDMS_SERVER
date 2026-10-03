const express = require("express");

const router = express.Router();

const inverterController = require("../controllers/inverterController");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

/*
|--------------------------------------------------------------------------
| All User APIs require authentication
|--------------------------------------------------------------------------
*/

router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| Admin Only APIs
|--------------------------------------------------------------------------
*/


// "Super Admin","Admin","Supplier","User"
// Create Inverter
router.post(
    "/",
    roleMiddleware("Super Admin"),
   inverterController.createInverter
);

// router.put("/:chargePointId", chargePointController.updateChargePoint);



module.exports = router;