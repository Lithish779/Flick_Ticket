const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// ── Connect to MongoDB ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// ── CORS ──────────────────────────────────────────────────────────────────
// Allows localhost in dev + all Vercel and Render deployments
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedExact = [
        "http://localhost:3000",
        "https://movie-booking-system-mern-fawn.vercel.app",
      ];

      // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Allow exact matches or any *.vercel.app or *.onrender.com preview URL
      if (
        allowedExact.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ── Body Parser ───────────────────────────────────────────────────────────
app.use(express.json());

// ── Health Check ─────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "FlickTicket API is running 🎬" });
});

// ── API Routes ────────────────────────────────────────────────────────────
app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/movies",    require("./routes/movieRoutes"));
app.use("/api/shows",     require("./routes/showRoutes"));
app.use("/api/bookings",  require("./routes/bookingRoutes"));
app.use("/api/snacks",    require("./routes/snackRoutes"));
app.use("/api/parking",   require("./routes/parkingRoutes"));
app.use("/api/users",     require("./routes/userRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/reviews",   require("./routes/reviewRoutes"));
app.use("/api/coupons",   require("./routes/couponRoutes"));
app.use("/api/snack-orders", require("./routes/snackOrderRoutes"));

// ── Static Frontend Serving (Production Monorepo Support) ──────────────────
const clientBuildPath = path.join(__dirname, "../client/build");
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// ── 404 Handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// ── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

module.exports = app;
