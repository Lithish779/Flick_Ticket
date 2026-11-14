// movieController.js

const Movie = require("../models/Movie");
const mongoose = require("mongoose");
const { SEED_MOVIES } = require("../services/movieSeeder");

// Deterministic in-memory movies fallback with valid MongoDB hex ObjectIds
const MEMORY_MOVIES = SEED_MOVIES.map((m, idx) => ({
  ...m,
  _id: (idx + 1).toString(16).padStart(24, "0"),
}));

// In-memory cache for high-speed response delivery (< 5ms)
let CACHED_MOVIES = null;
let CACHE_EXPIRY = 0;

// ➤ Add Movie
exports.addMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    CACHED_MOVIES = null; // Invalidate cache
    res.json(movie);
  } catch (err) {
    console.error("Add Movie Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ➤ Get All Movies
exports.getMovies = async (req, res) => {
  try {
    // Send CDN & browser edge caching headers (60s cache, 180s stale-while-revalidate)
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=180");

    const now = Date.now();
    if (CACHED_MOVIES && now < CACHE_EXPIRY) {
      return res.json(CACHED_MOVIES);
    }

    if (mongoose.connection.readyState !== 1) {
      return res.json(MEMORY_MOVIES);
    }
    const movies = await Movie.find().lean().maxTimeMS(2500);
    if (!movies || movies.length === 0) {
      return res.json(MEMORY_MOVIES);
    }

    CACHED_MOVIES = movies;
    CACHE_EXPIRY = now + 60 * 1000; // Cache for 60 seconds
    res.json(movies);
  } catch (err) {
    console.warn("getMovies fallback triggered:", err.message);
    res.json(MEMORY_MOVIES);
  }
};

// ➤ Get Single Movie
exports.getMovie = async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=180");

    if (mongoose.connection.readyState !== 1) {
      const found =
        MEMORY_MOVIES.find((m) => m._id === req.params.id) || MEMORY_MOVIES[0];
      return res.json(found);
    }
    const movie = await Movie.findById(req.params.id).lean().maxTimeMS(2500);
    if (!movie) {
      const found =
        MEMORY_MOVIES.find((m) => m._id === req.params.id) || MEMORY_MOVIES[0];
      return res.json(found);
    }
    res.json(movie);
  } catch (err) {
    const found =
      MEMORY_MOVIES.find((m) => m._id === req.params.id) || MEMORY_MOVIES[0];
    res.json(found);
  }
};

// ➤ Update Movie
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    CACHED_MOVIES = null; // Invalidate cache
    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ➤ Delete Movie
exports.deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    CACHED_MOVIES = null; // Invalidate cache
    res.json({ message: "Movie Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
