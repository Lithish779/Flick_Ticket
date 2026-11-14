const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const app = express();

// ── Connect to MongoDB ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// ── Bulletproof CORS Middleware ───────────────────────────────────────────
// Allows all origins (including https://ticket-eta-eight.vercel.app and localhost) with full credentials & preflight support
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.header(
    "Access-Control-Allow-Methods",
    "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Bypass"
  );
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Bypass",
    ],
  })
);

// ── Body Parser ───────────────────────────────────────────────────────────
app.use(express.json());

// ── Health Check ─────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbStatus = dbStates[mongoose.connection.readyState] || "unknown";
  res.json({
    status: "ok",
    message: "FlickTicket API is running 🎬",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// ── Database Availability Guard ───────────────────────────────────────────
app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message:
        "MongoDB is currently connecting or not configured. If running on Render, please make sure the MONGO_URI environment variable is added in Render Dashboard Settings.",
      database: "disconnected",
    });
  }
  next();
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
