const router = require("express").Router();
const parkingController = require("../controllers/parkingController");
const authMiddleware = require("../middleware/authMiddleware");
const { adminAccess } = require("../middleware/adminMiddleware");

// Public
router.get("/all", parkingController.getAllParking);
router.get("/theatre/:theatre", parkingController.getParkingByTheatre);

// Admin RBAC Protected
router.post("/", authMiddleware, adminAccess, parkingController.addParking);
router.put("/:id", authMiddleware, adminAccess, parkingController.updateParking);
router.delete("/:id", authMiddleware, adminAccess, parkingController.deleteParking);

module.exports = router;
