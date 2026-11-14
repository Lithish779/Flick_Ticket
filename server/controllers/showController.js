const Show = require("../models/Show");
const Parking = require("../models/Parking");
const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");
const { SEED_MOVIES } = require("../services/movieSeeder");

/* ---------- Seat Generator ---------- */
const generateSeats = (balconyPrice, firstPrice, secondPrice) => {
  const seats = [];

  // BALCONY (A–D)
  ["A", "B", "C", "D"].forEach((row) => {
    for (let i = 1; i <= 10; i++) {
      seats.push({
        seatNumber: `${row}${i}`,
        category: "Balcony",
        price: Number(balconyPrice),
        isBooked: false,
        lockedUntil: null,
        lockedBy: null,
      });
    }
  });

  // FIRST CLASS (E–H)
  ["E", "F", "G", "H"].forEach((row) => {
    for (let i = 1; i <= 12; i++) {
      seats.push({
        seatNumber: `${row}${i}`,
        category: "First Class",
        price: Number(firstPrice),
        isBooked: false,
        lockedUntil: null,
        lockedBy: null,
      });
    }
  });

  // SECOND CLASS (I–L)
  ["I", "J", "K", "L"].forEach((row) => {
    for (let i = 1; i <= 12; i++) {
      seats.push({
        seatNumber: `${row}${i}`,
        category: "Second Class",
        price: Number(secondPrice),
        isBooked: false,
        lockedUntil: null,
        lockedBy: null,
      });
    }
  });

  return seats;
};

// Fallback shows for high-availability cloud deployments
const buildFallbackShows = (movieId) => {
  const targetId = movieId || "000000000000000000000001";
  const movieObj = SEED_MOVIES[0];
  const theatres = [
    { name: "PVR Directors Cut - Ambience Mall", time: "11:30 AM", screen: "Audi 1 - IMAX Laser" },
    { name: "INOX Megaplex - Phoenix Mall", time: "03:15 PM", screen: "Audi 2 - Dolby Atmos" },
    { name: "Cinépolis VIP - DLF Avenue", time: "07:45 PM", screen: "Audi 3 - 4DX Dynamic" },
    { name: "Miraj Cinemas - Grand Venice", time: "10:30 PM", screen: "Audi 4 - RealD 3D" },
  ];
  return theatres.map((t, idx) => ({
    _id: `show_${targetId}_${idx + 1}`,
    movieId: { ...movieObj, _id: targetId },
    theatre: t.name,
    screen: t.screen,
    date: new Date().toISOString().split("T")[0],
    time: t.time,
    balconyPrice: 350,
    firstClassPrice: 250,
    secondClassPrice: 180,
    seats: generateSeats(350, 250, 180),
  }));
};

// Helper to release expired holds in memory/db
const purgeExpiredHolds = (show) => {
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

/* ---------- ADD SHOW ---------- */
exports.addShow = async (req, res) => {
  try {
    const {
      movieId,
      theatre,
      screen = "Audi 1 - Laser IMAX",
      date,
      time,
      balconyPrice,
      firstClassPrice,
      secondClassPrice,
    } = req.body;

    const seats = generateSeats(
      balconyPrice,
      firstClassPrice,
      secondClassPrice
    );

    const show = await Show.create({
      movieId,
      theatre,
      screen,
      date,
      time,
      balconyPrice,
      firstClassPrice,
      secondClassPrice,
      seats,
    });

    // Auto create parking if not exists
    const exists = await Parking.findOne({ theatre });
    if (!exists) {
      await Parking.create({
        theatre,
        priceBike: 25,
        priceCar: 60,
      });
    }

    // Audit log
    await AuditLog.create({
      action: "SHOW_CREATED",
      entityType: "Show",
      entityId: show._id.toString(),
      performedBy: req.user?.name || "Admin",
      details: { theatre, screen, date, time, movieId },
      ipAddress: req.ip || "127.0.0.1",
    }).catch(() => {});

    return res.status(201).json(show);
  } catch (err) {
    console.error("Add Show Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ---------- GET SHOW BY ID ---------- */
exports.getShowById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const fallbacks = buildFallbackShows();
      const match = fallbacks.find((s) => s._id === req.params.showId) || fallbacks[0];
      return res.json(match);
    }
    const show = await Show.findById(req.params.showId).populate("movieId").maxTimeMS(2500);
    if (!show) {
      const fallbacks = buildFallbackShows();
      const match = fallbacks.find((s) => s._id === req.params.showId) || fallbacks[0];
      return res.json(match);
    }

    // Purge expired holds so viewer sees live availability
    if (purgeExpiredHolds(show)) {
      await show.save();
    }

    return res.json(show);
  } catch (err) {
    const fallbacks = buildFallbackShows();
    return res.json(fallbacks[0]);
  }
};

/* ---------- GET SHOWS BY MOVIE ---------- */
exports.getShowsByMovie = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(buildFallbackShows(req.params.movieId));
    }
    const shows = await Show.find({
      movieId: req.params.movieId,
    }).maxTimeMS(2500);
    if (!shows || shows.length === 0) {
      return res.json(buildFallbackShows(req.params.movieId));
    }
    return res.json(shows);
  } catch (err) {
    return res.json(buildFallbackShows(req.params.movieId));
  }
};

/* ---------- GET ALL SHOWS ---------- */
exports.getAllShows = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(buildFallbackShows());
    }
    const shows = await Show.find().populate("movieId").maxTimeMS(2500);
    if (!shows || shows.length === 0) {
      return res.json(buildFallbackShows());
    }
    return res.json(shows);
  } catch (err) {
    return res.json(buildFallbackShows());
  }
};

/* ---------- DELETE SHOW ---------- */
exports.deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);

    if (show) {
      await AuditLog.create({
        action: "SHOW_DELETED",
        entityType: "Show",
        entityId: req.params.id,
        performedBy: req.user?.name || "Admin",
        details: { theatre: show.theatre, date: show.date, time: show.time },
        ipAddress: req.ip || "127.0.0.1",
      }).catch(() => {});
    }

    return res.json({ message: "Show Deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ---------- UPDATE SHOW ---------- */
exports.updateShow = async (req, res) => {
  try {
    const updated = await Show.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" }
    );
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
