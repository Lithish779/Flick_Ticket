const mongoose = require("mongoose");

/* ---------- Seat Schema ---------- */

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    enum: ["Balcony", "First Class", "Second Class"],
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  isBooked: {
    type: Boolean,
    default: false,
  },

  // 🔒 Temporary Seat Lock / Hold Mechanism
  lockedUntil: {
    type: Date,
    default: null,
  },

  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

/* ---------- Show Schema ---------- */

const showSchema = new mongoose.Schema(
  {
    /* Movie Reference */
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    /* Theatre Name & Screen */
    theatre: {
      type: String,
      required: true,
    },

    screen: {
      type: String,
      default: "Audi 1 - Laser IMAX",
    },

    /* Show Date + Time */
    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    /* Ticket Pricing */
    balconyPrice: {
      type: Number,
      required: true,
    },

    firstClassPrice: {
      type: Number,
      required: true,
    },

    secondClassPrice: {
      type: Number,
      required: true,
    },

    /* Seat List */
    seats: [seatSchema],
  },
  { timestamps: true }
);

// Compound indexes for optimal queries and concurrency lookups
showSchema.index({ movieId: 1, date: 1, theatre: 1 });
showSchema.index({ "seats.seatNumber": 1, "seats.isBooked": 1 });

module.exports = mongoose.model("Show", showSchema);
