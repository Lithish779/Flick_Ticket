const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // Unique human-readable ticket reference code (e.g., CB-2026-A4F921)
    bookingReference: {
      type: String,
      unique: true,
      default: () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `CB-2026-${code}`;
      },
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
      index: true,
    },

    seats: [String],

    snacks: [
      {
        name: String,
        price: Number,
        qty: Number,
      },
    ],

    parking: {
      type: {
        type: String,
      },
      price: Number,
      theatre: String,
    },

    totalPrice: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Success", "Failed", "Pending", "Refunded"],
      default: "Success",
    },

    // ── Ticket Lifecycle & Verification ──────────────────────────
    used: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED", "USED", "COMPLETED"],
      default: "CONFIRMED",
      index: true,
    },

    // ── Cancellation & Simulated Refund ──────────────────────────
    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    refundStatus: {
      type: String,
      enum: ["NONE", "PENDING", "PROCESSED"],
      default: "NONE",
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundId: {
      type: String,
      default: null,
    },

    // Secure validation token for QR verification
    validationToken: {
      type: String,
      default: () => "TOK-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
  },
  { timestamps: true }
);

// Indexes for fast lookup and user booking history queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ showId: 1, status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
