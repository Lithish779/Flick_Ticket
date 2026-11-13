const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "SEAT_HOLD",
        "HOLD_RELEASED",
        "HOLD_EXPIRED",
        "BOOKING_CONFIRMED",
        "BOOKING_CANCELLED",
        "TICKET_VALIDATED",
        "SHOW_CREATED",
        "SHOW_UPDATED",
        "SHOW_DELETED",
        "MOVIE_CREATED",
        "MOVIE_DELETED",
      ],
      index: true,
    },

    entityType: {
      type: String,
      required: true,
      enum: ["Booking", "Show", "Movie", "Ticket", "User"],
      index: true,
    },

    entityId: {
      type: String,
      required: true,
      index: true,
    },

    performedBy: {
      type: String,
      default: "System",
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

