const router = require("express").Router();
const snackController = require("../controllers/snackController");
const authMiddleware = require("../middleware/authMiddleware");
const { adminAccess } = require("../middleware/adminMiddleware");

// Public
router.get("/all", snackController.getAllSnacks);
router.get("/theatre/:theatre", snackController.getSnacksByTheatre);

// Admin RBAC Protected
router.post("/", authMiddleware, adminAccess, snackController.addSnack);
router.put("/:id", authMiddleware, adminAccess, snackController.updateSnack);
router.delete("/:id", authMiddleware, adminAccess, snackController.deleteSnack);

module.exports = router;
