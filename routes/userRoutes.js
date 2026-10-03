const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

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

// Get All Users
router.get(
    "/",
    roleMiddleware("Super Admin","Admin","Supplier","User"),
    userController.getUsers
);

// Get Single User
router.get(
    "/:id",
    roleMiddleware("Super Admin","Admin","Supplier","User"),
    userController.getUser
);

// Create User
router.post(
    "/",
    roleMiddleware("Super Admin"),
    userController.createUser
);



// Delete User
router.delete(
    "/:id",
    roleMiddleware("Super Admin","Admin"),
    userController.deleteUser
);

// Change User Status
router.patch(
    "/:id/status",
    roleMiddleware("Super Admin"),
    userController.changeStatus
);

module.exports = router;