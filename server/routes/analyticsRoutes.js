const router = require("express").Router();
const controller = require("../controllers/analyticsController");

router.get("/", controller.getAnalytics);
router.get("/audit-logs", controller.getAuditLogs);

module.exports = router;
