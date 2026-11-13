const Show = require("../models/Show");
const Booking = require("../models/Booking");
const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");

// Helper to generate unique reference like CB-2026-X89F2A
const generateBookingReference = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomCode = "";
  for (let i = 0; i < 6; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CB-2026-${randomCode}`;
};

// Helper: Clear expired holds for a show
const clearExpiredHolds = (show) => {
  const now = new Date();
  let modified = false;

  show.seats.forEach((seat) => {
    if (!seat.isBooked && seat.lockedUntil && new Date(seat.lockedUntil) <= now) {
      seat.lockedUntil = null;
      seat.lockedBy = null;
      modified = true;
    }
  });

  return modified;
};

/* ---------------- 1. TEMPORARY SEAT HOLD WITH EXPIRY (5 MINS) ---------------- */
exports.holdSeats = async (req, res) => {
  try {
    const { showId, seats, userId, holdMinutes = 5 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(showId)) {
      return res.status(400).json({ message: "Invalid show ID" });
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "No seats selected" });
    }

    const now = new Date();
    const expiryTime = new Date(Date.now() + holdMinutes * 60 * 1000);
    const userObjId = userId && mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;

    // Atomic hold condition: seats must not be booked, and must not have an active hold by someone else
    const seatConditions = seats.map((seatNum) => ({
      $elemMatch: {
        seatNumber: seatNum,
        isBooked: false,
        $or: [
          { lockedUntil: null },
          { lockedUntil: { $lte: now } },
          ...(userObjId ? [{ lockedBy: userObjId }] : []),
          { lockedBy: null },
        ],
      },
    }));

    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        seats: { $all: seatConditions },
      },
      {
        $set: {
          "seats.$[elem].lockedUntil": expiryTime,
          "seats.$[elem].lockedBy": userObjId,
        },
      },
      {
        arrayFilters: [{ "elem.seatNumber": { $in: seats } }],
        new: true,
      }
    );

    if (!updatedShow) {
      return res.status(409).json({
        message: "Some seats are already booked or held by another customer.",
        conflictedSeats: seats,
      });
    }

    // Audit log
    await AuditLog.create({
      action: "SEAT_HOLD",
      entityType: "Show",
      entityId: showId,
      performedBy: userId || "Customer",
      details: {
        seats,
        holdMinutes,
        expiresAt: expiryTime,
      },
      ipAddress: req.ip || "127.0.0.1",
    }).catch((err) => console.error("Audit log error:", err));

    return res.json({
      success: true,
      message: `Seats held for ${holdMinutes} minutes. Complete checkout before release.`,
      holdExpiresAt: expiryTime,
      seats,
    });
  } catch (err) {
    console.error("Hold Seats Error:", err);
    return res.status(500).json({ message: "Failed to hold seats", error: err.message });
  }
};

/* ---------------- 2. RELEASE SEAT HOLD ---------------- */
exports.releaseHold = async (req, res) => {
  try {
    const { showId, seats, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(showId)) {
      return res.status(400).json({ message: "Invalid show ID" });
    }

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: "Show not found" });

    let releasedCount = 0;
    show.seats.forEach((seat) => {
      if (
        seats.includes(seat.seatNumber) &&
        !seat.isBooked &&
        (!userId || !seat.lockedBy || seat.lockedBy.toString() === userId.toString())
      ) {
        seat.lockedUntil = null;
        seat.lockedBy = null;
        releasedCount++;
      }
    });

    await show.save();

    await AuditLog.create({
      action: "HOLD_RELEASED",
      entityType: "Show",
      entityId: showId,
      performedBy: userId || "Customer",
      details: { seats, releasedCount },
      ipAddress: req.ip || "127.0.0.1",
    }).catch(() => {});

    return res.json({ success: true, message: "Seat holds released successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to release holds", error: err.message });
  }
};

/* ---------------- 3. CONFIRM BOOKING (ATOMIC CONCURRENCY GUARD) ---------------- */
exports.bookSeats = async (req, res) => {
  try {
    const {
      showId,
      seats,
      userId,
      snacks = [],
      parking = null,
      idempotencyKey,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(showId)) {
      return res.status(400).json({ message: "Invalid show ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "No seats selected" });
    }

    // Optional Idempotency check: if client sent idempotency key that already created a booking
    if (idempotencyKey) {
      const existing = await Booking.findOne({ validationToken: idempotencyKey });
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    const now = new Date();
    const userObjId = new mongoose.Types.ObjectId(userId);

    // Atomic seat booking condition:
    // Every seat requested must have isBooked: false, and either no lock, an expired lock, or held by current user
    const seatConditions = seats.map((seatNum) => ({
      $elemMatch: {
        seatNumber: seatNum,
        isBooked: false,
        $or: [
          { lockedUntil: null },
          { lockedUntil: { $lte: now } },
          { lockedBy: userObjId },
          { lockedBy: null },
        ],
      },
    }));

    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        seats: { $all: seatConditions },
      },
      {
        $set: {
          "seats.$[elem].isBooked": true,
          "seats.$[elem].lockedUntil": null,
          "seats.$[elem].lockedBy": null,
        },
      },
      {
        arrayFilters: [{ "elem.seatNumber": { $in: seats } }],
        new: true,
      }
    );

    if (!updatedShow) {
      return res.status(409).json({
        message: "Seats conflict: Some seats were confirmed or locked by another customer.",
        conflictedSeats: seats,
      });
    }

    // Calculate seat total from updatedShow
    let totalPrice = 0;
    updatedShow.seats.forEach((seat) => {
      if (seats.includes(seat.seatNumber)) {
        totalPrice += seat.price;
      }
    });

    // Snack calculations
    let snacksTotal = 0;
    snacks.forEach((snack) => {
      if (snack.qty > 0 && snack.price > 0) {
        snacksTotal += snack.price * snack.qty;
      }
    });

    const parkingPrice = parking?.price || 0;
    totalPrice += snacksTotal + parkingPrice;

    // Create unique reference
    let bookingReference = generateBookingReference();
    while (await Booking.findOne({ bookingReference })) {
      bookingReference = generateBookingReference();
    }

    const booking = await Booking.create({
      bookingReference,
      showId,
      seats,
      userId,
      snacks,
      parking,
      totalPrice,
      paymentStatus: "Success",
      used: false,
      status: "CONFIRMED",
      validationToken: idempotencyKey || "TOK-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: "showId",
        populate: { path: "movieId" },
      })
      .populate("userId");

    // Write to audit trail
    await AuditLog.create({
      action: "BOOKING_CONFIRMED",
      entityType: "Booking",
      entityId: booking._id.toString(),
      performedBy: userId.toString(),
      details: {
        bookingReference,
        seats,
        totalPrice,
        theatre: updatedShow.theatre,
      },
      ipAddress: req.ip || "127.0.0.1",
    }).catch(() => {});

    return res.status(201).json(populatedBooking);
  } catch (err) {
    console.error("Booking Error:", err);
    return res.status(500).json({
      message: "Booking failed",
      error: err.message,
    });
  }
};

/* ---------------- 4. CANCEL BOOKING & PROCESS SIMULATED REFUND ---------------- */
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "Customer requested cancellation" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id).populate("showId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ message: "Booking is already cancelled and refunded." });
    }

    if (booking.used) {
      return res.status(400).json({ message: "Cannot cancel a ticket that has already been admitted at the theatre gate." });
    }

    // Release seats back to the Show
    const show = await Show.findById(booking.showId._id || booking.showId);
    if (show) {
      show.seats.forEach((seat) => {
        if (booking.seats.includes(seat.seatNumber)) {
          seat.isBooked = false;
          seat.lockedUntil = null;
          seat.lockedBy = null;
        }
      });
      await show.save();
    }

    // Update booking status and refund details
    const refundId = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    if (!booking.bookingReference) {
      booking.bookingReference = generateBookingReference();
    }
    if (!booking.validationToken) {
      booking.validationToken = "TOK-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    }
    booking.status = "CANCELLED";
    booking.paymentStatus = "Refunded";
    booking.refundStatus = "PROCESSED";
    booking.refundAmount = booking.totalPrice;
    booking.refundId = refundId;
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;

    await booking.save();

    // Audit log
    await AuditLog.create({
      action: "BOOKING_CANCELLED",
      entityType: "Booking",
      entityId: booking._id.toString(),
      performedBy: req.user?.id || booking.userId.toString(),
      details: {
        bookingReference: booking.bookingReference,
        releasedSeats: booking.seats,
        refundAmount: booking.totalPrice,
        refundId,
        reason,
      },
      ipAddress: req.ip || "127.0.0.1",
    }).catch(() => {});

    return res.json({
      success: true,
      message: "Booking successfully cancelled. Simulated full refund has been credited.",
      bookingReference: booking.bookingReference,
      refundAmount: booking.totalPrice,
      refundId,
      booking,
    });
  } catch (err) {
    console.error("Cancellation Error:", err);
    return res.status(500).json({ message: "Failed to cancel booking", error: err.message });
  }
};

/* ---------------- 5. VERIFY TICKET (QR SCANNER) ---------------- */
exports.verifyTicket = async (req, res) => {
  try {
    const { id } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { bookingReference: id };
    }

    const booking = await Booking.findOne(query)
      .populate({ path: "showId", populate: { path: "movieId" } })
      .populate("userId");

    if (!booking) {
      return res.status(404).json({ message: "Invalid ticket reference: Not found in database" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        message: "⛔ TICKET CANCELLED - Full refund was already processed. Entry denied.",
        booking,
        status: "CANCELLED",
      });
    }

    if (booking.used) {
      return res.status(400).json({
        message: "⛔ TICKET ALREADY USED - Ticket has already been validated and admitted at gate.",
        booking,
        status: "ALREADY_USED",
      });
    }

    return res.json({
      message: "✅ TICKET VALID - Ready for admission.",
      booking,
      status: "VALID",
    });
  } catch (err) {
    console.error("Ticket verify error:", err);
    return res.status(500).json({ message: "Ticket verification failed", error: err.message });
  }
};

/* ---------------- 6. MARK TICKET AS USED ---------------- */
exports.markAsUsed = async (req, res) => {
  try {
    const { id } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { bookingReference: id };
    }

    const booking = await Booking.findOne(query);
    if (!booking) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ message: "Cannot admit cancelled ticket." });
    }

    if (booking.used) {
      return res.status(400).json({ message: "Ticket already used" });
    }

    booking.used = true;
    booking.status = "USED";
    await booking.save();

    await AuditLog.create({
      action: "TICKET_VALIDATED",
      entityType: "Ticket",
      entityId: booking._id.toString(),
      performedBy: req.user?.name || "Gate Staff",
      details: {
        bookingReference: booking.bookingReference,
        seats: booking.seats,
      },
      ipAddress: req.ip || "127.0.0.1",
    }).catch(() => {});

    return res.json({
      success: true,
      message: "Gate turnstile unlocked. Ticket marked as admitted.",
      booking,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to mark ticket", error: err.message });
  }
};

/* ---------------- 7. USER BOOKINGS ---------------- */
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const bookings = await Booking.find({ userId })
      .populate({
        path: "showId",
        populate: { path: "movieId" },
      })
      .populate("userId")
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: "Booking fetch failed", error: err.message });
  }
};

/* ---------------- 8. GET BOOKING BY ID OR REFERENCE ---------------- */
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { bookingReference: id };
    }

    const booking = await Booking.findOne(query)
      .populate({
        path: "showId",
        populate: { path: "movieId" },
      })
      .populate("userId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json(booking);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching booking", error: err.message });
  }
};

/* ---------------- 9. PARKING REVENUE ---------------- */
exports.getParkingRevenue = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: { $ne: "CANCELLED" } });

    const revenue = {};
    bookings.forEach((b) => {
      if (!b.parking) return;
      const theatre = b.parking.theatre || "Main";
      if (!revenue[theatre]) revenue[theatre] = 0;
      revenue[theatre] += b.parking.price || 0;
    });

    return res.json(revenue);
  } catch (err) {
    return res.status(500).json({ message: "Failed to calculate parking revenue", error: err.message });
  }
};
