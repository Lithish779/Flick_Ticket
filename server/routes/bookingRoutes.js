const router = require("express").Router();
const bookingController = require("../controllers/bookingController");

/* ── 1. VERIFY TICKET (QR Scan / Lookup by ID or Reference) ─── must be before /:id ─── */
router.get("/verify/:id", bookingController.verifyTicket);

/* ── 2. TEMPORARY SEAT HOLD WITH EXPIRY ── */
router.post("/hold", bookingController.holdSeats);

/* ── 3. RELEASE SEAT HOLD ── */
router.post("/release-hold", bookingController.releaseHold);

/* ── 4. CANCEL BOOKING & PROCESS SIMULATED REFUND ── */
router.post("/:id/cancel", bookingController.cancelBooking);

/* ── 5. CONFIRM SEAT BOOKING ── */
router.post("/", bookingController.bookSeats);

/* ── 6. USER BOOKING HISTORY ── */
router.get("/user/:userId", bookingController.getUserBookings);

/* ── 7. PARKING REVENUE ── */
router.get("/parking-revenue", bookingController.getParkingRevenue);

/* ── 8. MARK TICKET AS USED AT GATE ── */
router.put("/use/:id", bookingController.markAsUsed);

/* ── 9. GET SINGLE BOOKING BY ID OR REFERENCE ── */
router.get("/:id", bookingController.getBookingById);

module.exports = router;
