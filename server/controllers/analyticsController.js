const Booking = require("../models/Booking");
const Movie = require("../models/Movie");
const Show = require("../models/Show");
const AuditLog = require("../models/AuditLog");

exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateMatch = {};
    if (startDate && endDate) {
      dateMatch = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // Active confirmed bookings filter (exclude cancelled)
    const activeMatchStage = {
      ...dateMatch,
      status: { $ne: "CANCELLED" },
    };

    /* ---------------- MOVIE STATS (CONFIRMED ONLY) ---------------- */
    const movieStats = await Booking.aggregate([
      { $match: activeMatchStage },
      {
        $lookup: {
          from: "shows",
          localField: "showId",
          foreignField: "_id",
          as: "show",
        },
      },
      { $unwind: "$show" },
      {
        $lookup: {
          from: "movies",
          localField: "show.movieId",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      {
        $addFields: {
          bookedSeats: {
            $filter: {
              input: "$show.seats",
              as: "s",
              cond: { $in: ["$$s.seatNumber", "$seats"] },
            },
          },
        },
      },
      {
        $addFields: {
          ticketRevenue: { $sum: "$bookedSeats.price" },
        },
      },
      {
        $group: {
          _id: "$movie._id",
          title: { $first: "$movie.title" },
          poster: { $first: "$movie.poster" },
          ticketsSold: { $sum: { $size: "$seats" } },
          ticketRevenue: { $sum: "$ticketRevenue" },
        },
      },
    ]);

    /* ---------------- THEATRE STATS (CONFIRMED ONLY) ---------------- */
    const theatreStats = await Booking.aggregate([
      { $match: activeMatchStage },
      {
        $lookup: {
          from: "shows",
          localField: "showId",
          foreignField: "_id",
          as: "show",
        },
      },
      { $unwind: "$show" },
      {
        $lookup: {
          from: "movies",
          localField: "show.movieId",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      {
        $addFields: {
          bookedSeats: {
            $filter: {
              input: "$show.seats",
              as: "s",
              cond: { $in: ["$$s.seatNumber", "$seats"] },
            },
          },
        },
      },
      {
        $addFields: {
          seatRevenue: { $sum: "$bookedSeats.price" },
          snackRevenue: {
            $reduce: {
              input: "$snacks",
              initialValue: 0,
              in: {
                $add: ["$$value", { $multiply: ["$$this.price", "$$this.qty"] }],
              },
            },
          },
          parkingRevenue: {
            $ifNull: ["$parking.price", 0],
          },
        },
      },
      {
        $group: {
          _id: {
            theatre: "$show.theatre",
            movie: "$movie.title",
          },
          movieRevenue: { $sum: "$seatRevenue" },
          snackRevenue: { $sum: "$snackRevenue" },
          parkingRevenue: { $sum: "$parkingRevenue" },
        },
      },
      {
        $group: {
          _id: "$_id.theatre",
          movies: {
            $push: {
              title: "$_id.movie",
              revenue: "$movieRevenue",
            },
          },
          ticketRevenue: { $sum: "$movieRevenue" },
          snackRevenue: { $sum: "$snackRevenue" },
          parkingRevenue: { $sum: "$parkingRevenue" },
        },
      },
      {
        $addFields: {
          totalRevenue: {
            $add: ["$ticketRevenue", "$snackRevenue", "$parkingRevenue"],
          },
        },
      },
    ]);

    /* ---------------- SUMMARY & OCCUPANCY METRICS ---------------- */
    const totalMovies = await Movie.countDocuments();
    const totalShows = await Show.countDocuments();

    // Total confirmed tickets sold (excluding cancellations)
    const ticketCounts = await Booking.aggregate([
      { $match: activeMatchStage },
      { $group: { _id: null, totalSeats: { $sum: { $size: "$seats" } } } },
    ]);
    const totalTickets = ticketCounts[0]?.totalSeats || 0;

    // Total active confirmed revenue
    const totalRevenueResult = await Booking.aggregate([
      { $match: activeMatchStage },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Total cancellations & refunds
    const cancellationStats = await Booking.aggregate([
      {
        $match: {
          ...dateMatch,
          status: "CANCELLED",
        },
      },
      {
        $group: {
          _id: null,
          cancelledCount: { $sum: 1 },
          cancelledSeats: { $sum: { $size: "$seats" } },
          refundedTotal: { $sum: "$refundAmount" },
        },
      },
    ]);

    const totalCancellations = cancellationStats[0]?.cancelledCount || 0;
    const totalCancelledSeats = cancellationStats[0]?.cancelledSeats || 0;
    const totalRefunded = cancellationStats[0]?.refundedTotal || 0;

    // Calculate auditorium seat occupancy matching active shows
    const allShows = await Show.find({}, "seats");
    let totalAuditoriumCapacity = 0;
    let currentlyOccupiedSeats = 0;

    allShows.forEach((s) => {
      totalAuditoriumCapacity += s.seats.length;
      currentlyOccupiedSeats += s.seats.filter((seat) => seat.isBooked).length;
    });

    const occupancyRate = totalAuditoriumCapacity > 0
      ? ((currentlyOccupiedSeats / totalAuditoriumCapacity) * 100).toFixed(1)
      : "0.0";

    return res.json({
      movieStats,
      theatreStats,
      summary: {
        totalMovies,
        totalShows,
        totalTickets,
        totalBookings: await Booking.countDocuments(activeMatchStage),
        totalRevenue,
        totalCapacity: totalAuditoriumCapacity,
        occupiedSeats: currentlyOccupiedSeats,
        occupancyPercentage: parseFloat(occupancyRate),
        totalCancellations,
        totalCancelledSeats,
        totalRefundedAmount: totalRefunded,
        // Detailed Occupancy & Cancellation Report
        occupancy: {
          totalAuditoriumCapacity,
          currentlyOccupiedSeats,
          occupancyPercentage: `${occupancyRate}%`,
          totalConfirmedTickets: totalTickets,
          totalCancellations,
          totalCancelledSeats,
          totalRefundedAmount: totalRefunded,
        },
      },
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    return res.status(500).json({ message: "Analytics fetch failed", error: err.message });
  }
};

/* ---------------- AUDIT LOGS FOR MATERIAL BUSINESS ACTIONS ---------------- */
exports.getAuditLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit);
    return res.json({ auditLogs: logs, total: logs.length });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch audit trail", error: err.message });
  }
};
